async function checkStatus() {
  const badge = document.getElementById("serviceStatus");
  const text = document.getElementById("statusText");
  if (!badge || !text) return;

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

    if (isCurrentlyOpen) {
      badge.className = "status-part open";
      text.textContent = isEn ? "Service Open" : (data.messageOpen || "Palvelemme nyt");
    } else {
      badge.className = "status-part closed";
      text.textContent = isEn ? "Closed for today" : (data.messageClosed || "Palvelu suljettu");
    }
  } catch (error) {
    console.error("Status check error:", error);
    // Fallback to offline auto schedule
    const finlandTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Helsinki"}));
    const hour = finlandTime.getHours();
    if (hour >= 9 && hour < 21) {
      badge.className = "status-part open";
      text.textContent = isEn ? "Service Open" : "Palvelemme nyt";
    } else {
      badge.className = "status-part closed";
      text.textContent = isEn ? "Closed for today" : "Palvelu suljettu";
    }
  }
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
});

function initCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  const acceptBtn = document.getElementById("acceptCookies");

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
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

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
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop - 150) current = section.getAttribute("id");
    });
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`)
        link.classList.add("active");
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
