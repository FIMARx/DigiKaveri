import "/css/variables.css";
import "/css/global.css";
import "/css/home.css";
import { createIcons } from "lucide";
import { ICON_SET } from "./icons";
import { getFinlandHour, triggerAnalyticsExecution } from "./utils.js";

let isInitialized = false;
let statusController = null;

// "Sneaky Mode" Optimization: 
// Wait for user interaction or 3 seconds before loading heavy assets
const lazyLoadAll = () => {
  if (window.isLazyLoaded) return;
  window.isLazyLoaded = true;

  // Remove listeners
  ['mousedown', 'mousemove', 'touchstart', 'scroll', 'keydown'].forEach(e => 
    window.removeEventListener(e, lazyLoadAll)
  );

  // Load non-critical components
  initFAQ();
  initMobileDropdowns();
  initFAB();
  loadAnalytics();
  // checkStatus() is NOT called here intentionally.
  // It is called once immediately in initApp() (covers all pages),
  // and the inline IIFE in index.html also calls it for the homepage.
  // The 30 s throttle inside checkStatus() prevents redundant fetches.

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: true, disable: 'mobile' });
  }
};

function initApp() {
  if (isInitialized) return;
  isInitialized = true;

  // Critical UI (Needs to be instant)
  createIcons({ icons: ICON_SET }); // Render icons immediately
  initLanguageDetection(); // Bug 1 fix: was defined but never called
  initMobileNav();
  initSmoothNav();
  initScrollSpy(); // Start tracking sections immediately

  // Run status check immediately on every page so the closed modal
  // shows promptly — not just on the homepage (which has an inline IIFE)
  // or after the 60 s polling interval fires for the first time.
  checkStatus();

  // Listen for any user interaction
  ["mousedown", "mousemove", "touchstart", "scroll", "keydown"].forEach((e) =>
    window.addEventListener(e, lazyLoadAll, { once: true, passive: true }),
  );

  // Fallback: Load anyway after 3.5 seconds if no interaction
  setTimeout(lazyLoadAll, 3500);

  // Polling optimization: Only check status when tab is visible
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkStatus();
  });

  let statusInterval = null;

  const startPolling = () => {
    if (!statusInterval) {
      statusInterval = setInterval(() => {
        if (document.visibilityState === "visible") checkStatus();
      }, 60000);
    }
  };

  const stopPolling = () => {
    if (statusInterval) {
      clearInterval(statusInterval);
      statusInterval = null;
    }
  };

  // Handle browser back-button/bfcache: Refresh status and restart polling
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) checkStatus();
    startPolling();
  });

  window.addEventListener("pagehide", () => {
    stopPolling();
  });

  window.addEventListener("load", () => {
    if (typeof AOS !== "undefined") {
      AOS.init({
        once: true,
        offset: 50,
        duration: 600,
        easing: "ease-out-cubic",
        disable: window.innerWidth < 768,
      });
    }
  });
}

let lastCheck = 0;
let isFetchingStatus = false;

async function checkStatus() {
  const now = Date.now();
  if (isFetchingStatus || now - lastCheck < 30000) return; // Throttle: 30s

  isFetchingStatus = true;
  lastCheck = now;

  if (!navigator.onLine) {
    isFetchingStatus = false;
    return;
  }

  // Prevent network race conditions
  if (statusController) statusController.abort();
  statusController = new AbortController();

  const isEn = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");
  let data = {};

  try {
    const response = await fetch(`/data/status.json?v=${Date.now()}`, {
      signal: statusController.signal,
    });
    if (!response.ok) throw new Error("Fetch failed");
    const result = await response.json();
    if (result && typeof result === "object") data = result;
  } catch (e) {
    if (e.name === "AbortError") return;
    console.warn("Status check failed. Using time-based fallback.");
  } finally {
    isFetchingStatus = false;
  }

  const hour = getFinlandHour();
  let isOpen = hour >= 9 && hour < 21;

  if (data?.override === "open") isOpen = true;
  if (data?.override === "closed") isOpen = false;

  const badge = document.getElementById("serviceStatus");
  const text = document.getElementById("statusText");

  if (badge && text) {
    badge.className = `status-part ${isOpen ? "open" : "closed"}`;
    text.textContent = isOpen
      ? isEn
        ? data?.messageOpenEn || "Service Open"
        : data?.messageOpen || "Palvelemme nyt"
      : isEn
        ? data?.messageClosedEn || "Closed for today"
        : data?.messageClosed || "Palvelu suljettu";
  }
  if (typeof initStatusModal === "function") initStatusModal(isOpen);
}

function initStatusModal(isOpen) {
  const modal = document.getElementById("statusModal");
  if (!modal || isOpen) return;

  const isEn = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");

  // Accessibility: Focus Trap Logic
  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;

    // Optimization: avoid offsetWidth/Height during initialization to prevent reflow
    const focusables = Array.from(
      modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute("disabled"));

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (
        document.activeElement === first ||
        document.activeElement === modal
      ) {
        last.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });

  if (sessionStorage.getItem("closedModalShown") === "true") {
    return;
  }

  setTimeout(() => {
    modal.classList.add("active");
    document.body.classList.add("is-locked");
    modal.setAttribute("tabindex", "-1");
    modal.focus();
  }, 1500);

  const understandBtn = document.getElementById("modalUnderstand");
  const callbackBtn = document.getElementById("modalCallback");

  if (understandBtn) {
    understandBtn.onclick = () => {
      closeStatusModal(modal);
    };
  }

  if (callbackBtn) {
    callbackBtn.onclick = () => {
      closeStatusModal(modal);
      if (callbackBtn.tagName === "BUTTON") {
        const contactForm = document.getElementById("contactForm");
        const targetElement = contactForm
          ? contactForm.closest(".hero-form-card")
          : document.getElementById("contact-detailed") || contactForm;

        if (targetElement) {
          // Use requestAnimationFrame to ensure modal transition finished
          requestAnimationFrame(() => {
            setTimeout(() => {
              targetElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              targetElement.setAttribute("tabindex", "-1");
              targetElement.focus({ preventScroll: true });
            }, 50);
          });
        } else {
          // Redirect to home page with contact hash
          const homeUrl = isEn ? "/en/index.html" : "/index.html";
          window.location.href = `${homeUrl}#contact`;
        }
      }
    };
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeStatusModal(modal);
    }
  });
}

function closeStatusModal(modal) {
  modal.classList.remove("active");
  document.body.classList.remove("is-locked");
  sessionStorage.setItem("closedModalShown", "true");
}

function onDOMReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

onDOMReady(initApp);

function initMobileDropdowns() {
  const triggers = document.querySelectorAll(".mobile-dropdown-trigger");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const parent = trigger.closest(".mobile-nav-item-dropdown");
      if (parent) {
        const isActive = parent.classList.toggle("active");
        trigger.setAttribute("aria-expanded", isActive);
      }
    });
  });
}

function loadAnalytics() {
  if (window.analyticsLoaded) return;
  window.analyticsLoaded = true;

  // Define the gtag helper stub immediately
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    dataLayer.push(arguments);
  };
  gtag("js", new Date());

  // Set default consent to 'denied'
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
  });

  const checkConsentAndLoad = () => {
    const hasConsent =
      typeof CookieConsent !== "undefined" &&
      CookieConsent.acceptedCategory("analytics");
    const type = hasConsent ? "text/javascript" : "text/plain";

    const script = document.createElement("script");
    script.type = type;
    script.setAttribute("data-cookiecategory", "analytics");
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-XL8DBWDDMD";
    document.head.appendChild(script);

    // Fire config immediately if we already have consent
    if (hasConsent) {
      gtag("config", "G-XL8DBWDDMD", { anonymize_ip: true });
    }
  };

  // If CookieConsent isn't ready, wait for it (Custom event from config)
  if (typeof CookieConsent === "undefined") {
    document.addEventListener("lcc_initialized", checkConsentAndLoad, {
      once: true,
    });
  } else {
    checkConsentAndLoad();
  }
}

function initLanguageDetection() {
  const path = window.location.pathname;
  const isEn = path === "/en" || path.startsWith("/en/");

  // Sync HTML lang attribute for SEO/Accessibility
  document.documentElement.lang = isEn ? "en" : "fi";

  if (isEn) {
    localStorage.setItem("userLang", "en");
  } else if (path.length > 1 && !isEn) {
    localStorage.setItem("userLang", "fi");
  }

  if (path === "/" && !localStorage.getItem("userLang")) {
    const isEnBrowser = navigator.language.toLowerCase().startsWith("en");
    if (isEnBrowser) window.location.href = "/en/";
  }
}

function initSmoothNav() {
  const navLinks = document.querySelectorAll('.spy-link');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || !href.includes("#")) return;
      
      const normalize = (p) => p.replace(/\/$/, "").replace(/\/index\.html$/, "") || "/";
      const targetUrl = new URL(href, window.location.href);
      const isSamePage = targetUrl.origin === window.location.origin && normalize(targetUrl.pathname) === normalize(window.location.pathname);

      if (isSamePage) {
        e.preventDefault();
        const id = href.split('#')[1];
        const target = document.getElementById(id);
        
        if (target) {
          const overlay = document.querySelector(".mobile-nav-overlay");
          if (overlay) {
            overlay.classList.remove("active");
            document.body.style.overflow = '';
          }

          const headerHeight = 90;
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - headerHeight,
            behavior: "smooth",
          });

          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }
    });
  });
}

function initFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!questionBtn) return;

    questionBtn.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      faqItems.forEach((i) => {
        i.classList.remove("active");
        const q = i.querySelector(".faq-question");
        if (q) q.setAttribute("aria-expanded", "false");
        const a = i.querySelector(".faq-answer");
        if (a) a.setAttribute("aria-hidden", "true");
      });

      if (!isOpen) {
        item.classList.add("active");
        questionBtn.setAttribute("aria-expanded", "true");
        if (answer) answer.setAttribute("aria-hidden", "false");
      }
    });
  });
}

function updateScrollSpy() {
  const sections = document.querySelectorAll("section[id], header[id]");
  const navLinks = document.querySelectorAll(".spy-link");

  let currentId = "";

  // Detection zone: 1/3 of viewport height (more natural for long content)
  const triggerPoint = window.innerHeight / 3;

  // 1. Check sections in document order
  sections.forEach((s) => {
    const rect = s.getBoundingClientRect();
    if (rect.top <= triggerPoint) {
      currentId = s.id;
    }
  });

  // Update TOC Progress Fill if exists
  const tocFill = document.querySelector(".toc-progress-fill");
  if (tocFill) {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    tocFill.style.width = progress + "%";
  }

  // 2. Special case: If we are at the very top of the page, force "home"
  if (window.scrollY < 100 && sections.length > 0) {
    currentId = sections[0].id;
  }

  // 3. Special case: Bottom of page forces the last section
  const isAtBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 80;
  if (isAtBottom && sections.length > 0) {
    currentId = sections[sections.length - 1].id;
  }

  navLinks.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    if (!href) return;

    const hasHash = href.includes("#");
    const isSectionMatch = currentId && href.endsWith("#" + currentId);

    const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
    const linkPath = href.split("#")[0].replace(/\/$/, "");
    const isPageMatch =
      linkPath &&
      (currentPath === linkPath ||
        currentPath.endsWith("/" + linkPath) ||
        (linkPath === "index.html" && currentPath === "/"));

    if (hasHash) {
      if (isSectionMatch) link.classList.add("active");
    } else {
      if (isPageMatch) link.classList.add("active");
    }
  });

  // Update dropdown triggers based on active children
  const allTriggers = document.querySelectorAll(
    ".dropdown-trigger, .mobile-dropdown-trigger",
  );
  allTriggers.forEach((trigger) => {
    const parent = trigger.closest(
      ".nav-item-dropdown, .mobile-nav-item-dropdown",
    );
    const menu = parent
      ? parent.querySelector(".dropdown-menu, .mobile-dropdown-menu")
      : null;
    if (menu) {
      const hasActiveChild = menu.querySelector("a.active");
      trigger.classList.toggle("active", !!hasActiveChild);
    }
  });
}

function initScrollSpy() {
  window.addEventListener("scroll", updateScrollSpy, { passive: true });
  window.addEventListener("load", updateScrollSpy);
  updateScrollSpy();

  // Unified Scroll Progress Bar
  const progressFill = document.querySelector("#scrollProgressBar");
  if (progressFill) {
    window.addEventListener("scroll", () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressFill.style.width = scrolled + "%";
    }, { passive: true });
  }
}

function initMobileNav() {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const closeBtn = document.querySelector(".mobile-nav-close");
  const overlay = document.querySelector(".mobile-nav-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!menuBtn || !closeBtn || !overlay) return;

  menuBtn.addEventListener(
    "click",
    (e) => {
      // CRITICAL: Since this listener uses stopImmediatePropagation,
      // it prevents the global lazyLoadAll from firing on the first tap.
      // We must manually trigger lazy loading here if it hasn't happened.
      if (typeof lazyLoadAll === "function") {
        lazyLoadAll();
      }

      overlay.classList.add("active");
      document.body.style.overflow = "hidden";

      // Force an update of the scroll spy so links highlight immediately
      if (typeof updateScrollSpy === "function") {
        updateScrollSpy();
      }
    },
    { capture: true },
  ); // 'capture' ensures we catch the click first

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    });
  });
}

function initFAB() {
  const wrapper = document.getElementById("fabWrapper");
  const mainBtn = document.getElementById("fabMain");
  const backdrop = document.getElementById("fabBackdrop");

  if (!wrapper || !mainBtn) return;

  const toggleMenu = (forceClose = null) => {
    const shouldOpen =
      forceClose === null ? !wrapper.classList.contains("active") : !forceClose;
    wrapper.classList.toggle("active", shouldOpen);
    mainBtn.setAttribute("aria-expanded", shouldOpen);

    if (shouldOpen) {
      if (backdrop) backdrop.classList.add("active");
    } else {
      if (backdrop) backdrop.classList.remove("active");
    }
  };

  // Toggle on click
  mainBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close on click outside (including backdrop)
  document.addEventListener("click", (e) => {
    if (wrapper.classList.contains("active") && !wrapper.contains(e.target)) {
      toggleMenu(true);
    }
  });

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      toggleMenu(true);
    });
  }

  const options = wrapper.querySelectorAll(".fab-option");
  options.forEach((option) => {
    option.addEventListener("click", () => {
      toggleMenu(true);
    });
  });
}
