async function checkStatus() {
  const badge = document.getElementById("serviceStatus");
  const text = document.getElementById("statusText");
  if (!badge || !text) return;
  try {
    const response = await fetch("data/status.json?v=" + Date.now());
    const data = await response.json();
    if (data.isOpen) {
      badge.className = "status-badge open";
      text.textContent = data.messageOpen;
    } else {
      badge.className = "status-badge closed";
      text.textContent = data.messageClosed;
    }
  } catch (error) {
    console.error("Status check error:", error);
    badge.className = "status-badge closed";
    text.textContent = "Palvelu suljettu";
  }
}

document.addEventListener("DOMContentLoaded", () => {
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
  const navLinks = document.querySelectorAll(".nav-link");
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
