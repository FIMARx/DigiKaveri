import campaignConfig from "../data/campaign.json";

export function initCampaignBanner() {
  if (!campaignConfig || !campaignConfig.enabled) return;

  const now = new Date();
  const start = new Date(campaignConfig.startDate);
  const end = new Date(campaignConfig.endDate);

  // Verify date range
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
  if (now < start || now >= end) return;

  // Check if dismissed previously
  const storageKey = `digikaveri_dismissed_campaign_${campaignConfig.id || "default"}`;
  try {
    if (localStorage.getItem(storageKey) === "1") return;
  } catch (_) {}

  // Determine current page language
  const lang = document.documentElement.lang && document.documentElement.lang.startsWith("en") ? "en" : "fi";
  const localized = campaignConfig[lang] || campaignConfig.fi || {};

  // Build the banner DOM
  const banner = document.createElement("aside");
  banner.className = `campaign-banner theme-${campaignConfig.theme || "sunset"}`;
  banner.id = "campaignPromoBanner";
  banner.setAttribute("aria-label", localized.title || "Ajankohtainen kampanja");

  const showCountdown = campaignConfig.showCountdown !== false;

  const ctaLinkHref = (function() {
    const code = campaignConfig.promoCode || "PROMO15";
    const onHomePage = !!document.getElementById("interactive-estimator");
    if (onHomePage) {
      return "#interactive-estimator";
    }
    return lang === "en" 
      ? `/en/?promo=${encodeURIComponent(code)}#interactive-estimator` 
      : `/?promo=${encodeURIComponent(code)}#interactive-estimator`;
  })();

  banner.innerHTML = `
    <div class="campaign-container">
      <div class="campaign-content">
        <div class="campaign-badge">
          <svg class="campaign-sparkle" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M12 0l2.5 7.5L22 10l-7.5 2.5L12 20l-2.5-7.5L2 10l7.5-2.5z"/>
          </svg>
          <span>${localized.badge || "Kampanja"}</span>
        </div>
        <div class="campaign-text-wrap">
          <strong class="campaign-title">${localized.title || ""}</strong>
          ${localized.desc ? `<span class="campaign-desc">${localized.desc}</span>` : ""}
        </div>
      </div>

      ${showCountdown ? `
      <div class="campaign-timer-wrap">
        <span class="timer-label">${localized.countdownLabel || (lang === "en" ? "Offer ends in:" : "Päättyy:")}</span>
        <div class="campaign-timer" id="campaignTimer">
          <div class="timer-unit"><span class="timer-val" id="timerDays">00</span><span class="timer-tag">${lang === "en" ? "d" : "pv"}</span></div>
          <span class="timer-colon">:</span>
          <div class="timer-unit"><span class="timer-val" id="timerHours">00</span><span class="timer-tag">${lang === "en" ? "h" : "t"}</span></div>
          <span class="timer-colon">:</span>
          <div class="timer-unit"><span class="timer-val" id="timerMins">00</span><span class="timer-tag">${lang === "en" ? "m" : "min"}</span></div>
          <span class="timer-colon">:</span>
          <div class="timer-unit"><span class="timer-val" id="timerSecs">00</span><span class="timer-tag">${lang === "en" ? "s" : "s"}</span></div>
        </div>
      </div>
      ` : ""}

      <div class="campaign-actions">
        <a href="${ctaLinkHref}" class="campaign-cta-btn">
          ${localized.ctaText || (lang === "en" ? "Claim Offer" : "Hyödynnä etu")}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
        <div class="campaign-dismiss-group">
          <label class="campaign-dont-show-label" title="${lang === "en" ? "Don't show this announcement on next visits" : "Älä näytä tätä ilmoitusta enää seuraavilla kerroilla"}">
            <input type="checkbox" id="campaignDontShowAgain" class="campaign-dont-show-chk">
            <span>${lang === "en" ? "Don't show again" : "Älä näytä enää"}</span>
          </label>
          <button type="button" class="campaign-dismiss-btn" id="dismissCampaignBtn" aria-label="${lang === "en" ? "Close announcement" : "Sulje ilmoitus"}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Insert banner before main navigation or at top of body
  const nav = document.querySelector(".navbar, nav, header");
  if (nav && nav.parentNode) {
    nav.parentNode.insertBefore(banner, nav);
  } else {
    document.body.prepend(banner);
  }

  document.body.classList.add("has-campaign-banner");

  let timerInterval = null;
  let resizeObserver = null;

  const updateBannerHeight = () => {
    if (!banner || !banner.isConnected || banner.classList.contains("campaign-closing")) return;
    const h = banner.offsetHeight;
    document.documentElement.style.setProperty("--campaign-banner-height", `${h}px`);
  };

  // Observe resize for seamless dynamic height calculations
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(updateBannerHeight);
    resizeObserver.observe(banner);
  } else {
    window.addEventListener("resize", updateBannerHeight);
  }
  updateBannerHeight();

  // Close banner safely and smoothly
  const closeBanner = () => {
    // Clear countdown timer interval immediately to avoid background leaks
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Disconnect resize observer / remove resize listener
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    } else {
      window.removeEventListener("resize", updateBannerHeight);
    }

    banner.classList.add("campaign-closing");
    document.documentElement.style.setProperty("--campaign-banner-height", "0px");
    
    // Save to localStorage ONLY if user checked "Älä näytä enää"
    const dontShowChk = banner.querySelector("#campaignDontShowAgain");
    if (dontShowChk && dontShowChk.checked) {
      try {
        localStorage.setItem(storageKey, "1");
      } catch (_) {}
    }

    setTimeout(() => {
      document.body.classList.remove("has-campaign-banner");
      if (banner && banner.parentNode) {
        banner.remove();
      }
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));
    }, 420);
  };

  // Handle Dismiss Button
  const dismissBtn = banner.querySelector("#dismissCampaignBtn");
  if (dismissBtn) {
    dismissBtn.addEventListener("click", closeBanner);
  }

  // Handle CTA button click - auto apply promo code and scroll to estimator
  const ctaBtn = banner.querySelector(".campaign-cta-btn");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", (e) => {
      const code = campaignConfig.promoCode || "PROMO15";
      if (typeof window.applyEstimatorPromoCode === "function") {
        e.preventDefault();
        window.applyEstimatorPromoCode(code);
      }
    });
  }

  // Handle Countdown Timer
  if (showCountdown) {
    const daysEl = banner.querySelector("#timerDays");
    const hoursEl = banner.querySelector("#timerHours");
    const minsEl = banner.querySelector("#timerMins");
    const secsEl = banner.querySelector("#timerSecs");

    const updateTimer = () => {
      const current = new Date().getTime();
      const difference = end.getTime() - current;

      if (difference <= 0) {
        closeBanner();
        return false;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
      if (minsEl) minsEl.textContent = String(minutes).padStart(2, "0");
      if (secsEl) secsEl.textContent = String(seconds).padStart(2, "0");

      return true;
    };

    if (updateTimer()) {
      timerInterval = setInterval(() => {
        if (!updateTimer()) {
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }
        }
      }, 1000);
    }
  }
}
