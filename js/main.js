async function checkStatus() {
  const badge = document.getElementById("serviceStatus");
  const text = document.getElementById("statusText");
  
  const isEn = window.location.pathname.includes("/en/");
  
  try {
    const statusUrl = (isEn ? "../data/status.json?v=" : "data/status.json?v=") + Date.now();
    const response = await fetch(statusUrl);
    const data = await response.json();

    // Calculate current time in Finland
    const finlandTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Helsinki"}));
    const hour = finlandTime.getHours();
    
    // Auto schedule: 09:00 to 21:00 (hours 9 through 20)
    let isCurrentlyOpen = (hour >= 9 && hour < 21);

    // If json has an explicit manual override, use it instead
    if (data.override === "open") isCurrentlyOpen = true;
    if (data.override === "closed") isCurrentlyOpen = false;

    if (badge && text) {
      if (isCurrentlyOpen) {
        badge.className = "status-part open";
        text.textContent = isEn ? "Service Open" : (data.messageOpen || "Palvelemme nyt");
      } else {
        badge.className = "status-part closed";
        text.textContent = isEn ? "Closed for today" : (data.messageClosed || "Palvelu suljettu");
      }
    }

    // Initialize modal logic
    initStatusModal(isCurrentlyOpen);

  } catch (error) {
    console.error("Status check error:", error);
    // Fallback to offline auto schedule
    const finlandTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Helsinki"}));
    const hour = finlandTime.getHours();
    let isCurrentlyOpenFallback = (hour >= 9 && hour < 21);

    if (badge && text) {
      if (isCurrentlyOpenFallback) {
        badge.className = "status-part open";
        text.textContent = isEn ? "Service Open" : "Palvelemme nyt";
      } else {
        badge.className = "status-part closed";
        text.textContent = isEn ? "Closed for today" : "Palvelu suljettu";
      }
    }

    initStatusModal(isCurrentlyOpenFallback);
  }
}

function initStatusModal(isOpen) {
  const modal = document.getElementById("statusModal");
  if (!modal) return;

  // If service is open, ensure modal is hidden and don't proceed
  if (isOpen) {
    modal.classList.remove("active");
    return;
  }

  // Check if already shown in this session
  if (sessionStorage.getItem("closedModalShown") === "true") {
    return;
  }

  // Show modal with a slight delay for better impact
  setTimeout(() => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }, 1500);

  // Setup button listeners
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
      // If it's a button (index.html), scroll to form
      if (callbackBtn.tagName === "BUTTON") {
        const contactForm = document.getElementById("contactForm");
        const targetElement = contactForm ? contactForm.closest(".hero-form-card") : (document.getElementById("contact-detailed") || contactForm);
        
        if (targetElement) {
          setTimeout(() => {
            targetElement.scrollIntoView({ 
              behavior: "smooth", 
              block: "center" 
            });
          }, 100);
        }
      }
      // If it's a link (guide pages), the <a> href will handle it
    };
  }
}

function closeStatusModal(modal) {
  modal.classList.remove("active");
  document.body.style.overflow = "";
  sessionStorage.setItem("closedModalShown", "true");
}


document.addEventListener("DOMContentLoaded", () => {
  initLanguageDetection();
  initCookieBanner();
  
  if (localStorage.getItem("cookiesAccepted") === "true") {
    loadAnalytics();
  }
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
  checkStatus();
  setInterval(checkStatus, 60000);
  initFAQ();
  initScrollSpy();
  initSmoothNav();
  initMobileNav();
  initMobileDropdowns();
});

function initMobileDropdowns() {
  const triggers = document.querySelectorAll(".mobile-dropdown-trigger");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const parent = trigger.parentElement;
      if (parent) {
        parent.classList.toggle("active");
      }
    });
  });
}

function initCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  const acceptBtn = document.getElementById("acceptCookies");
  const rejectBtn = document.getElementById("rejectCookies");

  if (!banner || !acceptBtn) return;

  if (!localStorage.getItem("cookiesAccepted")) {
    setTimeout(() => {
      banner.classList.add("show");
    }, 1000);
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", "true");
    banner.classList.remove("show");
    loadAnalytics();
  });

  if (rejectBtn) {
    rejectBtn.addEventListener("click", () => {
      localStorage.setItem("cookiesAccepted", "false");
      banner.classList.remove("show");
    });
  }
}

function loadAnalytics() {
  if (window.analyticsLoaded) return;
  window.analyticsLoaded = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XL8DBWDDMD';
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XL8DBWDDMD', { 'anonymize_ip': true });
}

function initLanguageDetection() {
  if (!localStorage.getItem("userLang")) {
    const isEn = navigator.language.toLowerCase().startsWith("en");
    const isCurrentEn = window.location.pathname.includes("/en/");

    if (isEn && !isCurrentEn) {
      window.location.href = "/en/";
    } else if (!isEn && isCurrentEn) {
      window.location.href = "/";
    }
  }
}

function initSmoothNav() {
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

function initFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector(".faq-question");
    questionBtn.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");
      faqItems.forEach((i) => i.classList.remove("active"));
      if (!isOpen) item.classList.add("active");
    });
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll(".section-spy");
  const navLinks = document.querySelectorAll(".nav-menu .nav-link, .mobile-nav-content .mobile-nav-link");
  const dropdownTriggers = document.querySelectorAll(".dropdown-trigger");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop - 150) current = section.getAttribute("id");
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      const isHashLink = href.includes("#");
      const linkTarget = isHashLink ? href.split("#")[1] : "";

      if (isHashLink && linkTarget) {
        // Highlighting for specific section links (PC-ohjeet, Mobiili-ohjeet)
        if (current && linkTarget === current) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      } else {
        // Highlighting for main pages (Etusivu, Palvelut, etc.)
        // Only mark active if we ARE on that page AND no sub-section of that page is currently the 'current' spy target
        // (This prevents parent and child from both being blue if we only want one)
        const isCurrentPage = window.location.pathname.endsWith(href) || 
                            (href === "/index.html" && window.location.pathname === "/") ||
                            (href === "/etayhteys.html" && window.location.pathname.includes("etayhteys.html"));
        
        if (isCurrentPage) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      }
    });

    // Update parent triggers (Desktop & Mobile)
    const allTriggers = document.querySelectorAll(".dropdown-trigger, .mobile-dropdown-trigger");
    allTriggers.forEach((trigger) => {
      const parent = trigger.closest(".nav-item-dropdown, .mobile-nav-item-dropdown");
      const menu = parent ? parent.querySelector(".dropdown-menu, .mobile-dropdown-menu") : null;
      
      if (menu) {
        const hasActiveChild = menu.querySelector("a.active");
        if (hasActiveChild) {
          trigger.classList.add("active");
        } else {
          // If no active child, check if the trigger itself represents the current page
          const triggerHref = trigger.getAttribute("href");
          const isTriggerPage = triggerHref && (window.location.pathname.includes(triggerHref) && !triggerHref.includes("#"));
          
          if (isTriggerPage) {
            trigger.classList.add("active");
          } else {
            trigger.classList.remove("active");
          }
        }
      }
    });
  });
}

function initMobileNav() {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const closeBtn = document.querySelector(".mobile-nav-close");
  const overlay = document.querySelector(".mobile-nav-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!menuBtn || !closeBtn || !overlay) return;

  menuBtn.addEventListener("click", () => {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    });
  });
}
