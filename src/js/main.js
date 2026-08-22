import "aos/dist/aos.css";
import AOS from "aos";
import "/css/variables.css";
import "/css/global.css";
import "/css/home.css";
import { createIcons } from "lucide";
import { ICON_SET } from "./icons";
import { getFinlandHour, triggerAnalyticsExecution, onDOMReady, isEnglish, GA_MEASUREMENT_ID } from "./utils.js";
import "./estimator.js";
import "./quiz.js";
import { initCampaignBanner } from "./campaign.js";

if (typeof window !== "undefined") {
  window.AOS = AOS;
}

let isInitialized = false;
let statusController = null;
let isMobileDropdownsInitialized = false;
let isFAQInitialized = false;
let isFABInitialized = false;

// "Sneaky Mode" Optimization: 
// Wait for user interaction or 3 seconds before loading heavy assets
const lazyLoadAll = () => {
  if (window.isLazyLoaded) return;
  window.isLazyLoaded = true;

  // Remove listeners
  ['mousedown', 'mousemove', 'touchstart', 'scroll', 'keydown'].forEach(e => 
    window.removeEventListener(e, lazyLoadAll)
  );

  // Load non-critical heavy components if any
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

  // Force-reveal ALL [data-aos] elements immediately so pointer-events are
  // never blocked by AOS's initial hidden state. This runs synchronously
  // so no element can block clicks during the current frame.
  document.querySelectorAll('[data-aos]').forEach((el) => {
    el.classList.add('aos-animate');
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
};

function initApp() {
  if (isInitialized) return;
  isInitialized = true;

  // Critical UI (Needs to be instant)
  try { createIcons({ icons: ICON_SET }); } catch (e) { console.warn("Lucide icon init warning:", e); }
  initCountUp();
  initMobileNav();
  initSmoothNav();
  initScrollSpy(); // Start tracking sections immediately
  initAOS(); // Ensure animations initialize instantly
  initOfflineIndicator(); // Initialize offline status banner
  loadAnalytics(); // Initialize Google Analytics & Consent Mode v2 immediately
  initFAQ(); // Immediate FAQ search and accordion responsiveness
  initMobileDropdowns();
  initServicesTabs();
  initFAB();
  initCampaignBanner();
  initHashScrollOnLoad();

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

  // Start status polling immediately
  startPolling();

  // Handle browser back-button/bfcache: Refresh status and restart polling
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) checkStatus();
    startPolling();
  });

  window.addEventListener("pagehide", () => {
    stopPolling();
  });

  // Re-run AOS when window fully loads so late-arriving CDN script
  // doesn't re-hide revealed elements. The guard inside initAOS is safe
  // because we always force-reveal AFTER AOS.init().
  window.addEventListener('load', () => {
    // Re-reveal elements after the AOS CDN script loads and potentially
    // re-applies hidden state. This is the final, authoritative reveal.
    document.querySelectorAll('[data-aos]').forEach((el) => {
      el.classList.add('aos-animate');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
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

  const isEn = isEnglish();
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
  initStatusModal(isOpen);
}

let previouslyFocusedElement = null;

function initStatusModal(isOpen) {
  const modal = document.getElementById("statusModal");
  if (!modal || isOpen) return;
  if (modal.dataset.initialized) return;
  modal.dataset.initialized = "true";

  const isEn = isEnglish();

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

  if (sessionStorage.getItem("closedModalShown") === "true") {
    return;
  }

  setTimeout(() => {
    if (sessionStorage.getItem("closedModalShown") === "true") return;
    previouslyFocusedElement = document.activeElement;
    modal.classList.add("active");
    document.body.classList.add("is-locked");
    modal.setAttribute("tabindex", "-1");
    modal.focus();
  }, 1500);

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



function initTheme() {
  const updateMetaThemeColor = (theme) => {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "dark" ? "#0b0f19" : "#2563eb");
    }
  };

  const savedTheme = localStorage.getItem("theme");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const theme = savedTheme || (mediaQuery.matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
  updateMetaThemeColor(theme);
  
  // Real-time system theme change synchronization (2026 OS-level standard)
  mediaQuery.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      const newSystemTheme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newSystemTheme);
      updateMetaThemeColor(newSystemTheme);
    }
  });
  
  onDOMReady(() => {
    const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
    toggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        const applyTheme = () => {
          document.documentElement.setAttribute("data-theme", newTheme);
          localStorage.setItem("theme", newTheme);
          updateMetaThemeColor(newTheme);
        };

        if (typeof document.startViewTransition === "function") {
          document.startViewTransition(applyTheme);
        } else {
          applyTheme();
        }
      });
    });
  });
}

initTheme();

function switchServicesTab(targetId) {
  const tabBtns = document.querySelectorAll(".services-tab-btn");
  tabBtns.forEach((b) => {
    const isActive = b.getAttribute("data-target") === targetId;
    b.classList.toggle("active", isActive);
    b.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  document.querySelectorAll(".services-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });

  try {
    const activePanel = document.getElementById(targetId);
    if (activePanel) createIcons({ icons: ICON_SET, root: activePanel });
  } catch (e) {}
}

function initServicesTabs() {
  const tabBtns = document.querySelectorAll(".services-tab-btn");
  if (!tabBtns.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      if (targetId) switchServicesTab(targetId);
    });
  });

  // Also support clicking external triggers (like solution cards)
  document.querySelectorAll("[data-services-tab]").forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("data-services-tab");
      if (targetId) switchServicesTab(targetId);
    });
  });
}

function initMobileDropdowns() {
  if (isMobileDropdownsInitialized) return;
  isMobileDropdownsInitialized = true;
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
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onerror = () => {
      // Silently ignore if blocked by browser ad blocker / privacy extension
    };
    document.head.appendChild(script);

    // Fire config immediately if we already have consent
    if (hasConsent) {
      gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
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
  const isEn = isEnglish();

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

function getStickyHeaderOffset() {
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
  const bannerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--campaign-banner-height')) || 0;
  return navHeight + bannerHeight;
}

function initHashScrollOnLoad() {
  if (!window.location.hash) return;

  const scrollToTarget = () => {
    const id = window.location.hash.substring(1);
    const target = document.getElementById(id);
    if (target) {
      const headerOffset = getStickyHeaderOffset() + 24;
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: targetY,
        behavior: 'auto'
      });

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  };

  // Run immediately and re-run on load event when all assets/fonts have settled
  requestAnimationFrame(scrollToTarget);
  window.addEventListener('load', scrollToTarget, { once: true });
}

function initCountUp() {
  const counterElements = document.querySelectorAll("[data-counter]");
  if (!counterElements.length) return;

  const isReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animateCount = (el) => {
    const targetVal = parseFloat(el.getAttribute("data-counter"));
    if (isNaN(targetVal)) return;

    const decimals =
      parseInt(el.getAttribute("data-decimals"), 10) ||
      (targetVal % 1 !== 0 ? 1 : 0);
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = parseInt(el.getAttribute("data-duration"), 10) || 1200;

    if (isReducedMotion) {
      el.textContent = `${prefix}${targetVal.toFixed(decimals)}${suffix}`;
      return;
    }

    const startTime = performance.now();
    const startVal = 0;

    const updateValue = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = startVal + (targetVal - startVal) * easeOut;

      el.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        el.textContent = `${prefix}${targetVal.toFixed(decimals)}${suffix}`;
      }
    };

    requestAnimationFrame(updateValue);
  };

  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    counterElements.forEach((el) => observer.observe(el));
  } else {
    counterElements.forEach((el) => animateCount(el));
  }
}

function initSmoothNav() {
  const navLinks = document.querySelectorAll('.spy-link, .legal-toc a');
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

          const headerOffset = getStickyHeaderOffset() + 24;
          const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;

          window.scrollTo({
            top: targetY,
            behavior: "smooth",
          });

          navLinks.forEach(l => l.classList.remove("active"));
          link.classList.add("active");

          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }
    });
  });
}

function initFAQ() {
  if (isFAQInitialized) return;
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;
  isFAQInitialized = true;

  // Store metadata safely in JS memory
  const itemsData = Array.from(faqItems).map((item) => {
    const questionBtn = item.querySelector(".faq-question");
    const qSpan = item.querySelector(".faq-question span");
    const aP = item.querySelector(".faq-answer p");
    const answer = item.querySelector(".faq-answer");
    const origQText = qSpan ? qSpan.textContent.trim() : "";
    const origAText = aP ? aP.textContent.trim() : "";

    if (questionBtn) {
      questionBtn.type = "button";
    }

    return { item, questionBtn, answer, qSpan, aP, origQText, origAText };
  });

  // Accordion Toggle Handlers
  itemsData.forEach(({ item, questionBtn, answer }) => {
    if (!questionBtn) return;

    questionBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = item.classList.contains("active");

      // Close all items
      itemsData.forEach(({ item: i, questionBtn: qBtn, answer: a }) => {
        i.classList.remove("active");
        if (qBtn) qBtn.setAttribute("aria-expanded", "false");
        if (a) a.setAttribute("aria-hidden", "true");
      });

      // Open clicked item if it was closed
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

  let noResultsEl = null;
  const isEn = isEnglish();

  const filterFAQ = () => {
    const rawQuery = (searchInput.value || "").trim();
    const query = rawQuery.toLowerCase();

    if (searchClear) {
      searchClear.classList.toggle("visible", rawQuery.length > 0);
    }

    let matchCount = 0;
    const escapedQuery = rawQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const highlightRegex = rawQuery.length > 0 ? new RegExp(`(${escapedQuery})`, "gi") : null;

    itemsData.forEach(({ item, questionBtn, answer, qSpan, aP, origQText, origAText }) => {
      const qTextLower = origQText.toLowerCase();
      const aTextLower = origAText.toLowerCase();
      const isMatch = query === "" || qTextLower.includes(query) || aTextLower.includes(query);

      if (isMatch) {
        item.style.display = "";
        matchCount++;

        if (query.length > 0) {
          item.classList.add("active");
          if (questionBtn) questionBtn.setAttribute("aria-expanded", "true");
          if (answer) answer.setAttribute("aria-hidden", "false");

          if (qSpan) {
            qSpan.innerHTML = origQText.replace(highlightRegex, '<mark class="faq-highlight">$1</mark>');
          }
          if (aP) {
            aP.innerHTML = origAText.replace(highlightRegex, '<mark class="faq-highlight">$1</mark>');
          }
        } else {
          item.classList.remove("active");
          if (questionBtn) questionBtn.setAttribute("aria-expanded", "false");
          if (answer) answer.setAttribute("aria-hidden", "true");
          if (qSpan) qSpan.textContent = origQText;
          if (aP) aP.textContent = origAText;
        }
      } else {
        item.style.display = "none";
        item.classList.remove("active");
        if (questionBtn) questionBtn.setAttribute("aria-expanded", "false");
        if (answer) answer.setAttribute("aria-hidden", "true");
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
  const sections = document.querySelectorAll("section[id], header[id]");
  const navLinks = document.querySelectorAll(".spy-link, .legal-toc a");

  if (navLinks.length === 0 || sections.length === 0) return;

  const headerOffset = getStickyHeaderOffset();
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  let activeSection = null;

  // 1. Bottom of page: highlight the last section
  if (scrollY >= maxScroll - 30) {
    activeSection = sections[sections.length - 1];
  } else if (scrollY <= headerOffset + 50) {
    // 2. Top of page: highlight first section
    activeSection = sections[0];
  } else {
    // 3. Top-down focal trigger line:
    // A section becomes active as its heading reaches under the sticky header (+ 60px breathing room)
    const triggerPoint = headerOffset + 60;
    activeSection = sections[0];

    for (let i = 0; i < sections.length; i++) {
      const rect = sections[i].getBoundingClientRect();
      if (rect.top <= triggerPoint) {
        activeSection = sections[i];
      }
    }
  }

  if (!activeSection && sections.length > 0) {
    activeSection = sections[0];
  }

  const currentId = activeSection ? activeSection.id : null;

  // Update TOC Progress Fill if exists
  const tocFill = document.querySelector(".toc-progress-fill");
  if (tocFill) {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressRatio = totalHeight > 0 ? Math.min(Math.max(scrollY / totalHeight, 0), 1) : 0;
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
  const progressFill = document.querySelector("#scrollProgressBar");

  const updateProgress = () => {
    if (!progressFill) return;
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progressRatio = height > 0 ? Math.min(Math.max(winScroll / height, 0), 1) : 0;
    progressFill.style.transform = `scaleX(${progressRatio})`;
  };

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollSpy();
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", () => {
    updateScrollSpy();
    updateProgress();
  });

  updateScrollSpy();
  updateProgress();
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

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth >= 1024 && overlay.classList.contains("active")) {
        closeMenu();
      }
    },
    { passive: true }
  );
}

function initFAB() {
  if (isFABInitialized) return;
  const wrapper = document.getElementById("fabWrapper");
  const mainBtn = document.getElementById("fabMain");
  if (!wrapper || !mainBtn) return;
  isFABInitialized = true;
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
  const isEn = isEnglish();
  const msgOffline = isEn
    ? "You are offline (browsing saved version)"
    : "Ei verkkoyhteyttä (selaat tallennettua versiota)";
  const msgOnline = isEn ? "Connection restored" : "Verkkoyhteys palautui";

  const banner = document.createElement("div");
  banner.className = "offline-banner";
  banner.setAttribute("role", "status");
  banner.setAttribute("aria-live", "polite");
  banner.innerHTML = `<span class="offline-banner-dot"></span><span class="offline-banner-text">${msgOffline}</span>`;
  document.body.appendChild(banner);

  let timer = null;
  let isCurrentlyOffline = false;

  const showBanner = (isOffline) => {
    if (isOffline === isCurrentlyOffline && isOffline) return;
    isCurrentlyOffline = isOffline;
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

  const checkConnectivity = async () => {
    if (!navigator.onLine) {
      showBanner(true);
      return;
    }
    // Mobile browsers (iOS Safari, Android Chrome) can have navigator.onLine === true even when data is turned off!
    // Perform a fast HEAD request to check actual connectivity
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('/favicon.ico?_ping=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok || res.type === 'opaque') {
        if (isCurrentlyOffline) showBanner(false);
      } else {
        showBanner(true);
      }
    } catch (err) {
      // If network request failed (e.g. mobile data turned off), trigger offline banner
      showBanner(true);
    }
  };

  window.addEventListener("offline", () => showBanner(true));
  window.addEventListener("online", () => checkConnectivity());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkConnectivity();
  });

  // Check immediately and poll gently only when tab is visible
  checkConnectivity();
  setInterval(() => {
    if (document.visibilityState === "visible") {
      checkConnectivity();
    }
  }, 60000);
}

onDOMReady(initApp);
