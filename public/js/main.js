import {
  createIcons,
  ArrowRight, AtSign, Banknote, BookOpen, CalendarX, Check, CheckCircle, ChevronDown, Clock, Cookie, CreditCard, Database, Download, ExternalLink, FileText, Gavel, Globe, Grid, HelpCircle, Home, Info, Key, Laptop, List, Lock, Mail, MapPin, Menu, MessageSquare, Monitor, PenTool, Phone, PhoneCall, Play, PlayCircle, Printer, Rocket, Search, Send, Settings, Share2, ShieldAlert, ShieldCheck, Smartphone, Smile, Star, Tablet, Tag, Tv, User, Users, Video, Wifi, Wrench, X
} from 'lucide';

async function checkStatus() {
  const badge = document.getElementById("serviceStatus");
  const text = document.getElementById("statusText");
  
  const isEn = window.location.pathname.includes("/en/");
  
  try {
    const statusUrl = "/data/status.json?v=" + Date.now();
    const response = await fetch(statusUrl);
    const data = await response.json();

    const finlandTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Helsinki"}));
    const hour = finlandTime.getHours();
    
    let isCurrentlyOpen = (hour >= 9 && hour < 21);

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

    initStatusModal(isCurrentlyOpen);

  } catch (error) {
    console.error("Status check error:", error);
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

  if (isOpen) {
    modal.classList.remove("active");
    return;
  }

  if (sessionStorage.getItem("closedModalShown") === "true") {
    return;
  }

  setTimeout(() => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
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
    };
  }
}

function closeStatusModal(modal) {
  modal.classList.remove("active");
  document.body.style.overflow = "";
  sessionStorage.setItem("closedModalShown", "true");
}

function onDOMReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

onDOMReady(() => {
  initLanguageDetection();
  loadAnalytics();

  createIcons({
    icons: {
      ArrowRight, AtSign, Banknote, BookOpen, CalendarX, Check, CheckCircle, ChevronDown, Clock, Cookie, CreditCard, Database, Download, ExternalLink, FileText, Gavel, Globe, Grid, HelpCircle, Home, Info, Key, Laptop, List, Lock, Mail, MapPin, Menu, MessageSquare, Monitor, PenTool, Phone, PhoneCall, Play, PlayCircle, Printer, Rocket, Search, Send, Settings, Share2, ShieldAlert, ShieldCheck, Smartphone, Smile, Star, Tablet, Tag, Tv, User, Users, Video, Wifi, Wrench, X
    }
  });

  initFAQ();
  initScrollSpy();
  initSmoothNav();
  initMobileNav();
  initMobileDropdowns();
  initFAB();
  
  if (typeof AOS !== 'undefined') {
    window.addEventListener('load', () => {
      AOS.init({
        once: true,           
        offset: 50,           
        duration: 600,        
        easing: 'ease-out-cubic',
        disable: window.innerWidth < 768
      });

      checkStatus();
      setInterval(checkStatus, 60000);
    });
  }
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

function loadAnalytics() {
  if (window.analyticsLoaded) return;
  window.analyticsLoaded = true;

  const script = document.createElement('script');
  script.type = 'text/plain';
  script.setAttribute('data-cookiecategory', 'analytics');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XL8DBWDDMD';
  document.head.appendChild(script);

  const inlineScript = document.createElement('script');
  inlineScript.type = 'text/plain';
  inlineScript.setAttribute('data-cookiecategory', 'analytics');
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XL8DBWDDMD', { 'anonymize_ip': true });
  `;
  document.head.appendChild(inlineScript);
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
        if (current && linkTarget === current) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      } else {
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

    const allTriggers = document.querySelectorAll(".dropdown-trigger, .mobile-dropdown-trigger");
    allTriggers.forEach((trigger) => {
      const parent = trigger.closest(".nav-item-dropdown, .mobile-nav-item-dropdown");
      const menu = parent ? parent.querySelector(".dropdown-menu, .mobile-dropdown-menu") : null;
      
      if (menu) {
        const hasActiveChild = menu.querySelector("a.active");
        if (hasActiveChild) {
          trigger.classList.add("active");
        } else {
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

function initFAB() {
  const wrapper = document.getElementById("fabWrapper");
  const mainBtn = document.getElementById("fabMain");
  const backdrop = document.getElementById("fabBackdrop");
  
  if (!wrapper || !mainBtn) return;
  
  const toggleMenu = (forceClose = null) => {
    const shouldOpen = forceClose === null ? !wrapper.classList.contains("active") : !forceClose;
    if (shouldOpen) {
      wrapper.classList.add("active");
      if (backdrop) backdrop.classList.add("active");
    } else {
      wrapper.classList.remove("active");
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
  options.forEach(option => {
    option.addEventListener("click", () => {
      toggleMenu(true);
    });
  });
}
