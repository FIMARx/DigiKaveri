import "/css/variables.css";
import "/css/global.css";
import "/css/home.css";
import { createIcons } from "lucide";
import { ICON_SET } from "./icons";
import { getFinlandHour, triggerAnalyticsExecution } from "./utils.js";
import "./estimator.js";
import "./quiz.js";

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
  // checkStatus() is called centrally in initApp() for all pages.
  // The 30s throttle inside checkStatus() prevents redundant fetches.

  initAOS();
};

const initAOS = () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      once: true,
      offset: 40,
      duration: 600,
      easing: 'ease-out-cubic',
      disable: false,
    });
  }

  // Safety Fallback Guard: If AOS CDN fails/blocked or elements stay hidden, force reveal after 800ms
  setTimeout(() => {
    document.querySelectorAll('[data-aos]').forEach((el) => {
      if (!el.classList.contains('aos-animate')) {
        el.classList.add('aos-animate');
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }, 800);
};

function initApp() {
  if (isInitialized) return;
  isInitialized = true;

  // Critical UI (Needs to be instant)
  try { createIcons({ icons: ICON_SET }); } catch (e) { console.warn("Lucide icon init warning:", e); }
  initLanguageDetection(); // Bug 1 fix: was defined but never called
  initMobileNav();
  initSmoothNav();
  initScrollSpy(); // Start tracking sections immediately
  initAOS(); // Ensure animations initialize instantly
  initOfflineIndicator(); // Initialize offline status banner
  loadAnalytics(); // Initialize Google Analytics & Consent Mode v2 immediately

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('Service Worker registration failed:', err);
      });
    });
  }

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
    initAOS();
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

let previouslyFocusedElement = null;

function initStatusModal(isOpen) {
  const modal = document.getElementById("statusModal");
  if (!modal || isOpen) return;
  if (modal.dataset.initialized) return;
  modal.dataset.initialized = "true";

  const isEn = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");

  // Accessibility: Focus Trap Logic
  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;

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

  // Close modal on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeStatusModal(modal);
    }
  });

  if (sessionStorage.getItem("closedModalShown") === "true") {
    return;
  }

  setTimeout(() => {
    previouslyFocusedElement = document.activeElement;
    modal.classList.add("active");
    document.body.classList.add("is-locked");
    modal.setAttribute("tabindex", "-1");
    modal.focus();
  }, 1500);

  const understandBtn = document.getElementById("modalUnderstand");
  const callbackBtn = document.getElementById("modalCallback");
  const closeBtn = document.getElementById("modalCloseBtn");

  if (closeBtn) {
    closeBtn.onclick = () => {
      closeStatusModal(modal);
    };
  }

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

  const pill = document.querySelector(".status-schedule-pill");
  if (pill && !pill.dataset.keyBound) {
    pill.dataset.keyBound = "true";
    pill.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pill.click();
      }
    });
  }
}

function closeStatusModal(modal) {
  if (!modal) return;
  modal.classList.remove("active");
  document.body.classList.remove("is-locked");
  sessionStorage.setItem("closedModalShown", "true");

  if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === "function") {
    previouslyFocusedElement.focus();
  }
}

function onDOMReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const theme = savedTheme || (mediaQuery.matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
  
  // Real-time system theme change synchronization (2026 OS-level standard)
  mediaQuery.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
    }
  });
  
  onDOMReady(() => {
    const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
    toggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
      });
    });
  });
}

initTheme();

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
  if (!faqItems.length) return;

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

  // FAQ Live Search Filter with Yellow Text Highlighting
  const searchInput = document.getElementById("faqSearchInput");
  const searchClear = document.getElementById("faqSearchClear");
  const faqGrid = document.querySelector(".faq-grid");
  if (!searchInput || !faqGrid) return;

  // Cache original text for clean highlight restoration
  faqItems.forEach((item) => {
    const qSpan = item.querySelector(".faq-question span");
    const aP = item.querySelector(".faq-answer p");
    if (qSpan && !qSpan.dataset.originalText) qSpan.dataset.originalText = qSpan.textContent;
    if (aP && !aP.dataset.originalText) aP.dataset.originalText = aP.textContent;
  });

  let noResultsEl = document.querySelector(".faq-no-results");
  const isEn = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");

  const filterFAQ = () => {
    const rawQuery = searchInput.value.trim();
    const query = rawQuery.toLowerCase();

    if (searchClear) {
      searchClear.style.display = rawQuery.length > 0 ? "flex" : "none";
    }

    let matchCount = 0;
    const escapedQuery = rawQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const highlightRegex = rawQuery.length > 0 ? new RegExp(`(${escapedQuery})`, "gi") : null;

    faqItems.forEach((item) => {
      const qSpan = item.querySelector(".faq-question span");
      const aP = item.querySelector(".faq-answer p");
      const origQText = qSpan?.dataset.originalText || "";
      const origAText = aP?.dataset.originalText || "";

      const questionText = origQText.toLowerCase();
      const answerText = origAText.toLowerCase();
      const isMatch = query === "" || questionText.includes(query) || answerText.includes(query);

      if (isMatch) {
        item.style.display = "";
        matchCount++;

        if (query.length > 0) {
          item.classList.add("active");
          const q = item.querySelector(".faq-question");
          if (q) q.setAttribute("aria-expanded", "true");
          const a = item.querySelector(".faq-answer");
          if (a) a.setAttribute("aria-hidden", "false");

          // Apply yellow text highlight
          if (qSpan) qSpan.innerHTML = origQText.replace(highlightRegex, '<mark class="faq-highlight">$1</mark>');
          if (aP) aP.innerHTML = origAText.replace(highlightRegex, '<mark class="faq-highlight">$1</mark>');
        } else {
          item.classList.remove("active");
          if (qSpan) qSpan.textContent = origQText;
          if (aP) aP.textContent = origAText;
        }
      } else {
        item.style.display = "none";
        item.classList.remove("active");
        if (qSpan) qSpan.textContent = origQText;
        if (aP) aP.textContent = origAText;
      }
    });

    if (matchCount === 0 && query.length > 0) {
      if (!noResultsEl) {
        noResultsEl = document.createElement("div");
        noResultsEl.className = "faq-no-results";
        faqGrid.parentNode.insertBefore(noResultsEl, faqGrid.nextSibling);
      }
      noResultsEl.textContent = isEn
        ? `No FAQ items match "${searchInput.value}"`
        : `Ei hakutuloksia hakusanalla "${searchInput.value}"`;
      noResultsEl.style.display = "block";
    } else if (noResultsEl) {
      noResultsEl.style.display = "none";
    }
  };

  searchInput.addEventListener("input", filterFAQ);

  if (searchClear) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      filterFAQ();
      searchInput.focus();
    });
  }
}

function updateScrollSpy() {
  const sections = document.querySelectorAll("section[id], header[id], div[id].legal-section");
  const navLinks = document.querySelectorAll(".spy-link, .legal-toc a");

  if (sections.length === 0) return;

  let currentId = "";
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 88;
  const triggerPoint = navHeight + 92;

  // 1. Check sections in document order
  sections.forEach((s) => {
    const rect = s.getBoundingClientRect();
    if (rect.top <= triggerPoint) {
      currentId = s.id;
    }
  });

  // 2. Special case: If we are at the very top of the page, force first section
  if (window.scrollY < 80) {
    currentId = sections[0].id;
  }

  // 3. Special case: Only force last section if literally scrolled to absolute bottom (within 15px)
  const isAtAbsoluteBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 15;
  if (isAtAbsoluteBottom) {
    currentId = sections[sections.length - 1].id;
  }

  // Update TOC Progress Fill if exists
  const tocFill = document.querySelector(".toc-progress-fill");
  if (tocFill) {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressRatio = totalHeight > 0 ? Math.min(Math.max(window.scrollY / totalHeight, 0), 1) : 0;
    tocFill.style.transform = `scaleX(${progressRatio})`;
  }

  navLinks.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    if (!href) return;

    const hasHash = href.includes("#");
    const targetId = href.split("#")[1];
    const isSectionMatch = currentId && targetId === currentId;

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
    let ticking = false;
    const updateProgress = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progressRatio = height > 0 ? Math.min(Math.max(winScroll / height, 0), 1) : 0;
      progressFill.style.transform = `scaleX(${progressRatio})`;
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener("resize", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    updateProgress();
  }
}

function initMobileNav() {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const closeBtn = document.querySelector(".mobile-nav-close");
  const overlay = document.querySelector(".mobile-nav-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!menuBtn || !closeBtn || !overlay) return;

  const preventTouchScroll = (e) => {
    if (overlay.contains(e.target)) return;
    e.preventDefault();
  };

  const closeMenu = () => {
    overlay.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("menu-open");
    document.body.classList.remove("menu-open");
    document.removeEventListener("touchmove", preventTouchScroll);
    menuBtn.focus();
  };

  const openMenu = () => {
    if (typeof lazyLoadAll === "function") lazyLoadAll();
    overlay.classList.add("active");
    menuBtn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("menu-open");
    document.body.classList.add("menu-open");
    document.addEventListener("touchmove", preventTouchScroll, { passive: false });

    if (typeof updateScrollSpy === "function") updateScrollSpy();
    closeBtn.focus();
  };

  menuBtn.addEventListener(
    "click",
    () => {
      if (overlay.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    },
    { capture: true }
  );

  closeBtn.addEventListener("click", closeMenu);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Focus trap & Escape key listener for Mobile Nav
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      return;
    }

    if (e.key !== "Tab") return;

    const focusables = Array.from(
      overlay.querySelectorAll("a[href], button:not([disabled]), input, select, textarea")
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeMenu();
    }
  });
}

function initFAB() {
  const wrapper = document.getElementById("fabWrapper");
  const mainBtn = document.getElementById("fabMain");
  const backdrop = document.getElementById("fabBackdrop");

  const options = wrapper.querySelectorAll(".fab-option");
  const optionsContainer = wrapper.querySelector(".fab-options");

  const updateTabIndices = (isOpen) => {
    options.forEach((opt) => opt.setAttribute("tabindex", isOpen ? "0" : "-1"));
    if (optionsContainer) optionsContainer.setAttribute("aria-hidden", isOpen ? "false" : "true");
  };

  // Initialize closed state accessibility attributes
  updateTabIndices(false);

  const toggleMenu = (forceClose = null) => {
    const shouldOpen =
      forceClose === null ? !wrapper.classList.contains("active") : !forceClose;
    wrapper.classList.toggle("active", shouldOpen);
    mainBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    updateTabIndices(shouldOpen);

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

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && wrapper.classList.contains("active")) {
      toggleMenu(true);
      mainBtn.focus();
    }
  });

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      toggleMenu(true);
    });
  }

  options.forEach((option) => {
    option.addEventListener("click", () => {
      toggleMenu(true);
    });
  });
}

function initOfflineIndicator() {
  const isEn = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");
  const msgOffline = isEn
    ? "You are offline — browsing cached version"
    : "Olet offline-tilassa — selaat välimuistiversiota";
  const msgOnline = isEn ? "Connection restored" : "Yhteys palautunut";

  const banner = document.createElement("div");
  banner.className = "offline-banner";
  banner.setAttribute("role", "status");
  banner.setAttribute("aria-live", "polite");
  banner.innerHTML = `<span class="offline-banner-dot"></span><span class="offline-banner-text">${msgOffline}</span>`;
  document.body.appendChild(banner);

  let timer = null;

  const showBanner = (isOffline) => {
    if (timer) clearTimeout(timer);
    const textEl = banner.querySelector(".offline-banner-text");

    if (isOffline) {
      banner.classList.remove("online-restored");
      if (textEl) textEl.textContent = msgOffline;
      banner.classList.add("active");
    } else {
      banner.classList.add("online-restored");
      if (textEl) textEl.textContent = msgOnline;
      banner.classList.add("active");
      timer = setTimeout(() => {
        banner.classList.remove("active");
      }, 3200);
    }
  };

  window.addEventListener("offline", () => showBanner(true));
  window.addEventListener("online", () => showBanner(false));

  if (!navigator.onLine) {
    showBanner(true);
  }
}
