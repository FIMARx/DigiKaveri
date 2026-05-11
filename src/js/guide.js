/* guide.js - DigiKaveri Remote Support Logic (V2 - Ground Up) */
import "/css/guide.css";
import { createIcons } from "lucide";
import { ICON_SET } from "./icons";

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. State Management Helpers ---
  const setElementActive = (el, active = true) => {
    if (!el) return;
    el.classList.toggle("active", active);
    if (el.tagName === "BUTTON") el.setAttribute("aria-expanded", active);
  };

  const setElementVisible = (el, visible = true) => {
    if (!el) return;
    el.classList.toggle("hidden", !visible);
  };

  const toggleSectionCollapsed = (sectionId, collapsed = true) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.classList.toggle("is-collapsed", collapsed);
  };

  // --- 2. Platform Detection ---
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isWindows = /win/.test(ua);
  const isMac = /mac/.test(ua) && !isIOS;
  const isMobile = isIOS || isAndroid;

  // --- 3. Platform Switcher Logic (Windows/Mac and Android/iOS) ---
  const initSwitcher = (config) => {
    const { buttons, cards, scrollTargetId } = config;

    Object.entries(buttons).forEach(([platform, btnId]) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;

      btn.addEventListener("click", () => {
        // Update Buttons
        Object.values(buttons).forEach((id) => {
          const b = document.getElementById(id);
          if (b) b.classList.toggle("active", id === btnId);
        });

        // Update Cards
        Object.entries(cards).forEach(([p, cardId]) => {
          const c = document.getElementById(cardId);
          if (c) c.classList.toggle("hidden", p !== platform);
        });

        // Refresh Icons
        createIcons({ icons: ICON_SET });

        // Scroll to section on mobile
        if (window.innerWidth < 1024 && scrollTargetId) {
          const target = document.getElementById(scrollTargetId);
          if (target)
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  };

  // PC Switcher
  initSwitcher({
    buttons: { windows: "windows-switch", mac: "mac-switch" },
    cards: { windows: "windows-card-pc", mac: "mac-card-pc" },
    scrollTargetId: "pc-guide",
  });

  // Mobile Switcher
  initSwitcher({
    buttons: { android: "android-switch", ios: "ios-switch" },
    cards: { android: "android-card", ios: "ios-card" },
    scrollTargetId: "mobile-guide",
  });

  // --- 4. Adaptive Section Logic (Auto-Expand/Collapse) ---
  const pcSection = document.getElementById("pc-guide");
  const mobileSection = document.getElementById("mobile-guide");

  if (pcSection && mobileSection) {
    if (isMobile) {
      toggleSectionCollapsed("pc-guide", true);
      toggleSectionCollapsed("mobile-guide", false);
    } else {
      toggleSectionCollapsed("pc-guide", false);
      toggleSectionCollapsed("mobile-guide", true);
    }

    // Add click events to Smart Headers for expansion
    document.querySelectorAll(".guide-smart-header").forEach((header) => {
      header.addEventListener("click", () => {
        const targetId = header.getAttribute("data-target");
        if (targetId) {
          toggleSectionCollapsed(targetId, false);
          // Optionally collapse the other one? User didn't specify, but usually better to stay expanded.
          const otherId = targetId === "pc-guide" ? "mobile-guide" : "pc-guide";
          toggleSectionCollapsed(otherId, true);

          const target = document.getElementById(targetId);
          if (target) {
            setTimeout(() => {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
          }
        }
      });
    });
  }

  // --- 5. Detailed Help & Sub-tabs ---
  // Help Toggles
  document.querySelectorAll(".help-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const target = document.getElementById(targetId);
      if (!target) return;

      const isOpen = target.classList.toggle("active");
      btn.classList.toggle("active", isOpen);
      btn.setAttribute("aria-expanded", isOpen);

      if (isOpen) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 300);
      }
    });
  });

  // Sub-tab Switching
  document.querySelectorAll(".help-tab-btn").forEach((tab) => {
    tab.addEventListener("click", () => {
      const container = tab.closest(".help-content-wrapper");
      if (!container) return;

      const viewId = tab.getAttribute("data-view");

      // Switch tabs
      container
        .querySelectorAll(".help-tab-btn")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Switch views
      container.querySelectorAll(".help-view").forEach((v) => {
        v.classList.toggle("active", v.getAttribute("data-view-id") === viewId);
      });

      createIcons({ icons: ICON_SET });
    });
  });

  // --- 6. Lightbox & Video Helpers ---
  const lightbox = document.getElementById("imageLightbox");
  if (lightbox) {
    const img = lightbox.querySelector("img");
    const close = lightbox.querySelector(".lightbox-close");

    document.querySelectorAll(".v-step-image img").forEach((vImg) => {
      vImg.parentElement.addEventListener("click", () => {
        img.src = vImg.src;
        img.alt = vImg.alt;
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    const hideLightbox = () => {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    };

    close?.addEventListener("click", hideLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) hideLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideLightbox();
    });
  }

  // --- 7. Initial Setup ---
  // Set detected platform badges
  document.querySelectorAll(".guide-detected-badge").forEach((badge) => {
    const card = badge.closest(".platform-card");
    if (!card) return;

    let detected = false;
    const id = card.id;
    if (id === "windows-card-pc" && isWindows) detected = true;
    if (id === "mac-card-pc" && isMac) detected = true;
    if (id === "android-card" && isAndroid) detected = true;
    if (id === "ios-card" && isIOS) detected = true;

    badge.classList.toggle("hidden", !detected);
  });

  // Set initial switcher states based on platform
  if (isMac) document.getElementById("mac-switch")?.click();
  if (isIOS) document.getElementById("ios-switch")?.click();

  createIcons({ icons: ICON_SET });
});
