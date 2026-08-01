/* guide.js - DigiKaveri Remote Support Logic (V2 - Ground Up) */
import "/css/guide.css";
import { createIcons } from "lucide";
import { ICON_SET } from "./icons";

function onDOMReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

onDOMReady(() => {
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
    if (!collapsed) {
      section.querySelectorAll("[data-aos]").forEach((el) => {
        el.classList.add("aos-animate");
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      if (typeof AOS !== "undefined") {
        AOS.refresh();
      }
    }
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
          if (c) {
            const isTarget = p === platform;
            c.classList.toggle("hidden", !isTarget);
            if (isTarget) {
              c.querySelectorAll("[data-aos]").forEach((el) => {
                el.classList.add("aos-animate");
                el.style.opacity = "1";
                el.style.transform = "none";
              });
            }
          }
        });

        // Refresh Icons inside active section
        const activeCard = document.getElementById(cards[platform]);
        if (activeCard) {
          try { createIcons({ icons: ICON_SET, root: activeCard }); } catch (e) {}
        }
        if (typeof AOS !== "undefined") {
          AOS.refresh();
        }

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
    const hash = window.location.hash.toLowerCase();
    const isMobileHash = hash === "#android" || hash === "#ios" || hash === "#iphone" || hash === "#ipad" || hash === "#mobile-guide";
    const isPcHash = hash === "#mac" || hash === "#macos" || hash === "#windows" || hash === "#win" || hash === "#pc-guide";

    if (isMobileHash || (isMobile && !isPcHash)) {
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

      // Pause any playing video when the section is collapsed
      if (!isOpen) {
        target.querySelectorAll("video").forEach((v) => {
          if (!v.paused) v.pause();
        });
      }

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

      // Pause any playing video before switching away from the video view
      const activeVideoView = container.querySelector(".help-view.active[data-view-id='video']");
      if (activeVideoView && viewId !== "video") {
        activeVideoView.querySelectorAll("video").forEach((v) => {
          if (!v.paused) v.pause();
        });
      }

      // Switch tabs
      container
        .querySelectorAll(".help-tab-btn")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Switch views
      container.querySelectorAll(".help-view").forEach((v) => {
        v.classList.toggle("active", v.getAttribute("data-view-id") === viewId);
      });

      try { createIcons({ icons: ICON_SET, root: container }); } catch (e) {}
    });
  });

  // --- 6. Lightbox & Video Helpers ---
  // Video Overlay Play Listeners
  document.querySelectorAll(".video-overlay").forEach((overlay) => {
    overlay.addEventListener("click", () => {
      overlay.classList.add("hidden");
      const video = overlay.nextElementSibling;
      if (video && video.tagName === "VIDEO") {
        video.setAttribute("controls", "true");
        video.play();
      }
    });
  });

  const lightbox = document.getElementById("imageLightbox");
  if (lightbox) {
    const img = lightbox.querySelector("img");
    const close = lightbox.querySelector(".lightbox-close");
    let lastActiveElement = null;

    document.querySelectorAll(".v-step-image img").forEach((vImg) => {
      const parent = vImg.parentElement;
      if (parent) {
        parent.setAttribute("role", "button");
        parent.setAttribute("tabindex", "0");
        parent.setAttribute("aria-label", vImg.alt || "Suurenna kuva");

        const openLightbox = () => {
          lastActiveElement = document.activeElement;
          img.src = vImg.src;
          img.alt = vImg.alt;
          lightbox.classList.add("active");
          document.body.style.overflow = "hidden";
          if (close) close.focus();
        };

        parent.addEventListener("click", openLightbox);
        parent.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox();
          }
        });
      }
    });

    const hideLightbox = () => {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
      if (lastActiveElement && typeof lastActiveElement.focus === "function") {
        lastActiveElement.focus();
      }
    };

    close?.addEventListener("click", hideLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) hideLightbox();
    });

    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        hideLightbox();
        return;
      }
      if (e.key === "Tab") {
        const focusables = Array.from(
          lightbox.querySelectorAll("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
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
      }
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

  // Check URL hash fragment or User-Agent for initial platform tab selection
  const hash = window.location.hash.toLowerCase();
  if (hash === "#mac" || hash === "#macos") {
    document.getElementById("mac-switch")?.click();
  } else if (hash === "#windows" || hash === "#win") {
    document.getElementById("windows-switch")?.click();
  } else if (hash === "#android") {
    document.getElementById("android-switch")?.click();
  } else if (hash === "#ios" || hash === "#iphone" || hash === "#ipad") {
    document.getElementById("ios-switch")?.click();
  } else {
    if (isMac) document.getElementById("mac-switch")?.click();
    if (isIOS) document.getElementById("ios-switch")?.click();
  }

  try { createIcons({ icons: ICON_SET }); } catch (e) {}
});
