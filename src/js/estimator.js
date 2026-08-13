/* estimator.js - DigiKaveri Dynamic Price Calculator */
import { createIcons } from 'lucide';
import { ICON_SET } from './icons';
import { isEnglish, onDOMReady } from './utils.js';
import campaignConfig from '../data/campaign.json';

const isEn = isEnglish();

const translations = {
  fi: {
    remote: "Etätuki",
    remoteDesc: "Etäyhteysapua tietokoneelle tai puhelimelle",
    homeVisit: "Kotikäynti",
    homeVisitDesc: "Apua paikan päällä kotonasi (Uusimaa)",
    annual: "Vuosihuolto",
    annualDesc: "Tietokoneen perusteellinen puhdistus ja tarkistus",
    deductionLabel: "Hyödynnä kotitalousvähennys (-60%)",
    deductionNote: "Kotitalousvähennys koskee kotikäyntejä ja huoltotöitä, ei etätukea.",
    invoiceTotal: "Laskun loppusumma:",
    actualCost: "Oma osuutesi vähennyksen jälkeen:",
    savings: "Säästösi kotitalousvähennyksellä:",
    travelFee: "Matkakulut:",
    free: "0 €",
    bookBtn: "Varaa palvelu tästä",
    unitHalfHour: "/ 30 min",
    unitHour: "/ tunti",
    unitFlat: "/ laite",
    summaryTitle: "Yhteenveto",
    summaryDesc: "Alustava hinta-arvio valitsemillesi palveluille",
    addressLabel: "Laske matkakulut kotiisi (lähtöpaikka: Espoo)",
    addressPlaceholder: "Kirjoita katuosoite ja kunta...",
    calcBtn: "Laske",
    calculating: "Lasketaan...",
    distLabel: "Etäisyys:",
    routeError: "Osoitetta ei löytynyt tai matkaa ei voitu laskea. Tarkista osoite ja kokeile uudelleen.",
    havePromoCode: "Onko sinulla alennuskoodi?",
    promoPlaceholder: "Syötä koodi (esim. PROMO15)",
    apply: "Käytä",
    promoDiscountLabel: "Alennuskoodi",
  },
  en: {
    remote: "Remote Support",
    remoteDesc: "Remote assistance for your computer or mobile",
    homeVisit: "Home Visit",
    homeVisitDesc: "Help on-site at your home (Uusimaa)",
    annual: "Annual Maintenance",
    annualDesc: "Thorough physical & digital computer tune-up",
    deductionLabel: "Apply household tax deduction (-60%)",
    deductionNote: "The household tax deduction applies to home visits and maintenance, not remote support.",
    invoiceTotal: "Invoice total:",
    actualCost: "Your cost after tax deduction:",
    savings: "Your savings with tax deduction:",
    travelFee: "Travel costs:",
    free: "0 €",
    bookBtn: "Book Service Now",
    unitHalfHour: "/ 30 min",
    unitHour: "/ hour",
    unitFlat: "/ device",
    summaryTitle: "Summary",
    summaryDesc: "Estimated price for selected services",
    addressLabel: "Calculate travel costs to your address (departing from Espoo)",
    addressPlaceholder: "Enter street address and city...",
    calcBtn: "Calculate",
    calculating: "Calculating...",
    distLabel: "Distance:",
    routeError: "Address not found or route could not be calculated. Please check the address and try again.",
    havePromoCode: "Have a promo code?",
    promoPlaceholder: "Enter code (e.g. PROMO15)",
    apply: "Apply",
    promoDiscountLabel: "Promo discount",
  }
};

const t = isEn ? translations.en : translations.fi;

const SERVICES = {
  remote: { id: 'remote', basePrice: 29, isEligible: false, step: 1, unit: t.unitHalfHour },
  home: { id: 'home', basePrice: 59, isEligible: true, step: 1, unit: t.unitHour },
  annual: { id: 'annual', basePrice: 89, isEligible: true, step: 1, unit: t.unitFlat }
};

// Base coordinates for Espoo
const START_LAT = 60.1585;
const START_LON = 24.6468;
const TRAVEL_RATE_PER_KM = 0.90;
const TAX_DEDUCTION_RATE = 0.60;

onDOMReady(() => {
  const container = document.getElementById("interactive-estimator");
  if (!container) return;

  // Build the estimator UI dynamically
  container.innerHTML = `
    <div class="estimator-quick-rates">
      <div class="quick-rate-chip" data-chip="remote" role="button" tabindex="0" aria-label="Valitse Etätuki">
        <span class="chip-label">⚡ ${t.remote}</span>
        <span class="chip-price">29€ ${t.unitHalfHour}</span>
      </div>
      <div class="quick-rate-chip" data-chip="home" role="button" tabindex="0" aria-label="Valitse Kotikäynti">
        <span class="chip-label">🚗 ${t.homeVisit}</span>
        <span class="chip-price">59€ ${t.unitHour}</span>
      </div>
      <div class="quick-rate-chip" data-chip="annual" role="button" tabindex="0" aria-label="Valitse Vuosihuolto">
        <span class="chip-label">🛡️ ${t.annual}</span>
        <span class="chip-price">89€ ${t.unitFlat}</span>
      </div>
    </div>

    <div class="estimator-layout" data-aos="fade-up">
      <!-- Left: Choices -->
      <div class="estimator-choices">
        <div class="estimator-service-item" data-service="remote">
          <div class="service-checkbox-wrapper">
            <input type="checkbox" id="est-remote" class="est-checkbox">
            <label for="est-remote">
              <span class="service-title">${t.remote}</span>
              <span class="service-desc">${t.remoteDesc}</span>
            </label>
          </div>
          <div class="service-pricing-control">
            <span class="service-price-rate">29€ ${t.unitHalfHour}</span>
            <div class="quantity-control hidden" id="qty-ctrl-remote">
              <button type="button" class="qty-btn minus" data-service="remote" aria-label="Vähennä määrää">-</button>
              <span class="qty-val" id="qty-val-remote">1</span>
              <button type="button" class="qty-btn plus" data-service="remote" aria-label="Lisää määrää">+</button>
            </div>
          </div>
        </div>

        <div class="estimator-service-item" data-service="home">
          <div class="service-checkbox-wrapper">
            <input type="checkbox" id="est-home" class="est-checkbox" checked>
            <label for="est-home">
              <span class="service-title">${t.homeVisit}</span>
              <span class="service-desc">${t.homeVisitDesc}</span>
            </label>
          </div>
          <div class="service-pricing-control">
            <span class="service-price-rate">59€ ${t.unitHour}</span>
            <div class="quantity-control" id="qty-ctrl-home">
              <button type="button" class="qty-btn minus" data-service="home" aria-label="Vähennä määrää">-</button>
              <span class="qty-val" id="qty-val-home">1</span>
              <button type="button" class="qty-btn plus" data-service="home" aria-label="Lisää määrää">+</button>
            </div>
          </div>
        </div>

        <div class="estimator-service-item" data-service="annual">
          <div class="service-checkbox-wrapper">
            <input type="checkbox" id="est-annual" class="est-checkbox">
            <label for="est-annual">
              <span class="service-title">${t.annual}</span>
              <span class="service-desc">${t.annualDesc}</span>
            </label>
          </div>
          <div class="service-pricing-control">
            <span class="service-price-rate">89€ ${t.unitFlat}</span>
            <div class="quantity-control hidden" id="qty-ctrl-annual">
              <button type="button" class="qty-btn minus" data-service="annual" aria-label="Vähennä määrää">-</button>
              <span class="qty-val" id="qty-val-annual">1</span>
              <button type="button" class="qty-btn plus" data-service="annual" aria-label="Lisää määrää">+</button>
            </div>
          </div>
        </div>

        <div class="estimator-deduction-toggle">
          <div class="toggle-switch-wrapper">
            <input type="checkbox" id="est-deduction" checked>
            <label for="est-deduction" class="toggle-label">
              <span class="toggle-text">${t.deductionLabel}</span>
            </label>
          </div>
          <p class="deduction-hint"><i data-lucide="info"></i> ${t.deductionNote}</p>
        </div>

        <!-- Location Calculator -->
        <div class="estimator-address-group" id="est-address-group">
          <label for="est-address" class="address-label">${t.addressLabel}</label>
          <div class="address-input-wrapper">
            <input type="text" id="est-address" placeholder="${t.addressPlaceholder}" class="address-input">
            <button type="button" id="est-calc-btn" class="btn-address-calc">${t.calcBtn}</button>
          </div>
          <p id="est-dist-feedback" class="dist-feedback hidden"></p>
        </div>

        <!-- Promo Code Section -->
        <div class="estimator-promo-group" id="est-promo-group">
          <button type="button" class="promo-toggle-btn" id="promo-toggle-btn">
            <i data-lucide="tag" aria-hidden="true"></i>
            <span>${t.havePromoCode}</span>
          </button>
          <div class="promo-input-wrapper hidden" id="promo-input-wrapper">
            <input type="text" id="est-promo-input" placeholder="${t.promoPlaceholder}" class="promo-input" maxlength="24">
            <button type="button" id="est-promo-apply-btn" class="btn-promo-apply">${t.apply}</button>
          </div>
          <p id="est-promo-feedback" class="promo-feedback hidden"></p>
        </div>
      </div>

      <!-- Right: Summary -->
      <div class="estimator-summary-card">
        <div class="summary-header">
          <h3>${t.summaryTitle}</h3>
          <p>${t.summaryDesc}</p>
        </div>
        
        <div class="summary-breakdown">
          <div class="summary-row">
            <span>${t.invoiceTotal}</span>
            <span class="price-val" id="summary-invoice-total">0 €</span>
          </div>
          <div class="summary-row promo-row" id="summary-promo-row" style="display: none;">
            <span id="summary-promo-label">${t.promoDiscountLabel}:</span>
            <span class="price-val promo-val" id="summary-promo-total">-0 €</span>
          </div>
          <div class="summary-row deduction-row" id="summary-savings-row">
            <span>${t.savings}</span>
            <span class="price-val savings-val" id="summary-savings-total">-0 €</span>
          </div>
          <div class="summary-row">
            <span>${t.travelFee}</span>
            <span class="price-val" id="summary-travel-total">${t.free}</span>
          </div>
          <hr class="summary-divider">
          <div class="summary-row total-row">
            <span id="label-final-price">${t.actualCost}</span>
            <span class="price-val final-val" id="summary-final-total">0 €</span>
          </div>
        </div>

        <a href="#contact-detailed" class="btn-estimator-cta">
          ${t.bookBtn} <i data-lucide="arrow-right"></i>
        </a>
      </div>
    </div>
  `;

  // State
  const state = {
    remote: { checked: false, qty: 1 },
    home: { checked: true, qty: 1 },
    annual: { checked: false, qty: 1 },
    deduction: true,
    address: "",
    distanceKm: 0,
    travelCost: 0,
    promoCode: "",
    discountPercent: 0
  };

  const updateCalculator = () => {
    let rawServiceTotal = 0;
    let rawEligibleTotal = 0;

    const requiresHomeVisit = state.home.checked || state.annual.checked;

    // Toggle address calculator visibility based on home visits selected
    const addressGroup = document.getElementById("est-address-group");
    if (addressGroup) {
      addressGroup.classList.toggle("hidden", !requiresHomeVisit);
    }

    Object.keys(SERVICES).forEach(key => {
      const service = SERVICES[key];
      const userChoice = state[key];

      // Update quantity control visibility & quick rate chip highlighting
      const qtyCtrl = document.getElementById(`qty-ctrl-${key}`);
      if (qtyCtrl) {
        qtyCtrl.classList.toggle("hidden", !userChoice.checked);
      }

      const rateChip = container.querySelector(`.quick-rate-chip[data-chip="${key}"]`);
      if (rateChip) {
        rateChip.classList.toggle("highlighted", userChoice.checked);
      }

      if (userChoice.checked) {
        const cost = service.basePrice * userChoice.qty;
        rawServiceTotal += cost;

        if (service.isEligible) {
          rawEligibleTotal += cost;
        }
      }
    });

    // Compute Promo discount
    const promoDiscountAmount = state.discountPercent > 0 
      ? (rawServiceTotal * (state.discountPercent / 100)) 
      : 0;

    const discountedEligibleTotal = state.discountPercent > 0
      ? (rawEligibleTotal * (1 - (state.discountPercent / 100)))
      : rawEligibleTotal;

    const savingsTotal = state.deduction 
      ? (discountedEligibleTotal * TAX_DEDUCTION_RATE)
      : 0;

    // Reset travel cost if no home visit is required
    const currentTravelCost = requiresHomeVisit ? state.travelCost : 0;
    const finalTotal = (rawServiceTotal - promoDiscountAmount) + currentTravelCost - savingsTotal;

    // Update DOM
    document.getElementById("summary-invoice-total").textContent = `${rawServiceTotal} €`;
    
    // Promo Row
    const promoRow = document.getElementById("summary-promo-row");
    const promoLabel = document.getElementById("summary-promo-label");
    const promoVal = document.getElementById("summary-promo-total");
    if (promoRow && promoDiscountAmount > 0) {
      promoRow.style.display = "flex";
      if (promoLabel) promoLabel.textContent = `${t.promoDiscountLabel} (${state.promoCode}):`;
      if (promoVal) promoVal.textContent = `-${Math.round(promoDiscountAmount)} €`;
    } else if (promoRow) {
      promoRow.style.display = "none";
    }

    // Update Travel cost line
    const travelTotalEl = document.getElementById("summary-travel-total");
    if (requiresHomeVisit && currentTravelCost > 0) {
      travelTotalEl.textContent = `${currentTravelCost.toFixed(2)} €`;
      travelTotalEl.classList.remove("free-val");
    } else {
      travelTotalEl.textContent = t.free;
      travelTotalEl.classList.add("free-val");
    }

    const savingsRow = document.getElementById("summary-savings-row");
    const savingsVal = document.getElementById("summary-savings-total");
    if (state.deduction && savingsTotal > 0) {
      savingsRow.style.display = "flex";
      savingsVal.textContent = `-${Math.round(savingsTotal)} €`;
      document.getElementById("label-final-price").textContent = t.actualCost;
    } else {
      savingsRow.style.display = "none";
      document.getElementById("label-final-price").textContent = t.invoiceTotal;
    }

    document.getElementById("summary-final-total").textContent = `${Math.round(finalTotal)} €`;
  };

  // Wire quick rate chip click shortcuts
  container.querySelectorAll(".quick-rate-chip").forEach(chip => {
    const serviceKey = chip.getAttribute("data-chip");
    const chk = document.getElementById(`est-${serviceKey}`);

    chip.addEventListener("click", () => {
      if (chk) {
        chk.checked = !chk.checked;
        state[serviceKey].checked = chk.checked;
        updateCalculator();
      }
    });

    chip.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        chip.click();
      }
    });
  });

  // Wire checkbox events
  container.querySelectorAll(".est-checkbox").forEach(chk => {
    chk.addEventListener("change", (e) => {
      const serviceKey = e.target.id.replace("est-", "");
      state[serviceKey].checked = e.target.checked;
      updateCalculator();
    });
  });

  const deductionToggle = document.getElementById("est-deduction");
  if (deductionToggle) {
    deductionToggle.addEventListener("change", (e) => {
      state.deduction = e.target.checked;
      updateCalculator();
    });
  }

  container.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const serviceKey = btn.getAttribute("data-service");
      const isPlus = btn.classList.contains("plus");
      
      let currentVal = state[serviceKey].qty;
      if (isPlus) {
        currentVal += 1;
      } else {
        if (currentVal > 1) currentVal -= 1;
      }

      state[serviceKey].qty = currentVal;
      document.getElementById(`qty-val-${serviceKey}`).textContent = currentVal;
      updateCalculator();
    });
  });

  // Calculate Travel Costs via Nominatim + OSRM
  const addressInput = document.getElementById("est-address");
  const calcBtn = document.getElementById("est-calc-btn");
  const feedbackEl = document.getElementById("est-dist-feedback");

  if (calcBtn && addressInput) {
    addressInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        calcBtn.click();
      }
    });

    calcBtn.addEventListener("click", async () => {
      const query = addressInput.value.trim();
      if (!query) return;

      calcBtn.textContent = t.calculating;
      calcBtn.disabled = true;
      feedbackEl.classList.add("hidden");

      try {
        // Geocode user input address via Nominatim OpenStreetMap (restricted to Finland)
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}+Finland`;
        const geoRes = await fetch(geoUrl, {
          headers: { 'User-Agent': 'DigiKaveri-Distance-Estimator' }
        });
        const geoData = await geoRes.json();

        if (!geoData || geoData.length === 0) {
          throw new Error("Address not geocoded");
        }

        const userLat = parseFloat(geoData[0].lat);
        const userLon = parseFloat(geoData[0].lon);

        // Fetch routing driving distance via OpenSourceRoutingMachine (OSRM)
        const routeUrl = `https://router.project-osrm.org/route/v1/driving/${START_LON},${START_LAT};${userLon},${userLat}?overview=false`;
        const routeRes = await fetch(routeUrl);
        const routeData = await routeRes.json();

        if (!routeData || !routeData.routes || routeData.routes.length === 0) {
          throw new Error("Route not found");
        }

        const distanceKm = routeData.routes[0].distance / 1000;
        const totalTravelCost = distanceKm * TRAVEL_RATE_PER_KM;

        state.address = query;
        state.distanceKm = distanceKm;
        state.travelCost = totalTravelCost;

        feedbackEl.textContent = `${t.distLabel} ${distanceKm.toFixed(1)} km`;
        feedbackEl.classList.remove("hidden");
      } catch (err) {
        console.error(err);
        feedbackEl.textContent = t.routeError;
        feedbackEl.classList.remove("hidden");
        state.address = "";
        state.distanceKm = 0;
        state.travelCost = 0;
      } finally {
        calcBtn.textContent = t.calcBtn;
        calcBtn.disabled = false;
        updateCalculator();
      }
    });
  }

  // Promo code interaction
  const promoToggleBtn = document.getElementById("promo-toggle-btn");
  const promoInputWrapper = document.getElementById("promo-input-wrapper");
  const promoInput = document.getElementById("est-promo-input");
  const promoApplyBtn = document.getElementById("est-promo-apply-btn");
  const promoFeedbackEl = document.getElementById("est-promo-feedback");

  if (promoToggleBtn && promoInputWrapper) {
    promoToggleBtn.addEventListener("click", () => {
      const isHidden = promoInputWrapper.classList.contains("hidden");
      promoInputWrapper.classList.toggle("hidden", !isHidden);
      promoToggleBtn.classList.toggle("active", isHidden);
      if (isHidden && promoInput) {
        promoInput.focus();
      }
    });
  }

  const applyPromo = (codeToApply) => {
    const rawCode = (codeToApply || (promoInput ? promoInput.value : "")).trim();
    if (!rawCode) {
      state.promoCode = "";
      state.discountPercent = 0;
      if (promoFeedbackEl) {
        promoFeedbackEl.textContent = "";
        promoFeedbackEl.className = "promo-feedback hidden";
      }
      updateCalculator();
      return;
    }

    const configCode = (campaignConfig.promoCode || "PROMO15").trim().toUpperCase();
    const enteredCode = rawCode.toUpperCase();

    // Validate code against active campaign or general codes
    if (enteredCode === configCode || enteredCode === "PROMO15" || enteredCode === "SENIORI15" || enteredCode === "OPISKELIJA15") {
      const discount = campaignConfig.discountPercent || 15;
      state.promoCode = enteredCode;
      state.discountPercent = discount;
      
      if (promoFeedbackEl) {
        promoFeedbackEl.textContent = isEn 
          ? `✓ Code "${enteredCode}" applied (-${discount}%)!` 
          : `✓ Koodi "${enteredCode}" aktivoitu (-${discount}%)!`;
        promoFeedbackEl.className = "promo-feedback success";
      }
      if (promoInput) promoInput.value = enteredCode;
      if (promoInputWrapper) promoInputWrapper.classList.remove("hidden");
      if (promoToggleBtn) promoToggleBtn.classList.add("active");
    } else {
      state.promoCode = "";
      state.discountPercent = 0;
      if (promoFeedbackEl) {
        promoFeedbackEl.textContent = isEn 
          ? "✗ Invalid or expired promo code" 
          : "✗ Virheellinen tai vanhentunut alennuskoodi";
        promoFeedbackEl.className = "promo-feedback error";
      }
    }
    updateCalculator();
  };

  if (promoApplyBtn) {
    promoApplyBtn.addEventListener("click", () => applyPromo());
  }

  if (promoInput) {
    promoInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyPromo();
      }
    });
  }

  // Global helper to trigger promo code from banner or outside
  window.applyEstimatorPromoCode = (code) => {
    applyPromo(code);
    const estEl = document.getElementById("pricing") || document.getElementById("interactive-estimator");
    if (estEl) {
      estEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const summaryCard = container.querySelector(".estimator-summary-card");
    if (summaryCard) {
      summaryCard.classList.add("promo-highlight-pulse");
      setTimeout(() => summaryCard.classList.remove("promo-highlight-pulse"), 1600);
    }
  };

  // Pre-fill calculated distance & promo inside final contact textarea on click
  const ctaBtn = container.querySelector(".btn-estimator-cta");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", () => {
      const messageField = document.getElementById("d-message");
      if (!messageField) return;

      let rawServiceCost = 0;
      let rawEligibleCost = 0;

      Object.keys(SERVICES).forEach(k => {
        if (state[k].checked) {
          const c = SERVICES[k].basePrice * state[k].qty;
          rawServiceCost += c;
          if (SERVICES[k].isEligible) rawEligibleCost += c;
        }
      });

      const promoDiscount = state.discountPercent > 0 
        ? (rawServiceCost * (state.discountPercent / 100)) 
        : 0;

      const discountedEligible = state.discountPercent > 0
        ? (rawEligibleCost * (1 - (state.discountPercent / 100)))
        : rawEligibleCost;

      const savings = state.deduction ? (discountedEligible * TAX_DEDUCTION_RATE) : 0;
      const currentTravelCost = (state.home.checked || state.annual.checked) ? state.travelCost : 0;
      const finalTotal = (rawServiceCost - promoDiscount) + currentTravelCost - savings;

      let msg = "";
      if (isEn) {
        msg = `Hello, I would like to request a booking for the following services:\n`;
        
        if (state.remote.checked) {
          msg += `- Remote Support (${state.remote.qty}x 30 min)\n`;
        }
        if (state.home.checked) {
          msg += `- Home Visit (${state.home.qty}x hour)\n`;
        }
        if (state.annual.checked) {
          msg += `- Annual Maintenance (${state.annual.qty}x device)\n`;
        }

        if (state.promoCode && promoDiscount > 0) {
          msg += `\nPromo Code: ${state.promoCode} (-${state.discountPercent}% / -${promoDiscount.toFixed(2)} €)\n`;
        }

        msg += `Tax Deduction: ${state.deduction ? 'Yes (-60% on labor)' : 'No'}\n`;
        
        if (state.home.checked || state.annual.checked) {
          msg += `\nTravel Details:\n`;
          msg += `- Address: ${state.address || 'Not calculated'}\n`;
          msg += `- Distance from Saunalahti, Espoo: ${state.distanceKm ? state.distanceKm.toFixed(1) + ' km' : 'N/A'}\n`;
          msg += `- Travel Fee (${TRAVEL_RATE_PER_KM.toFixed(2)} €/km): ${state.travelCost ? state.travelCost.toFixed(2) + ' €' : '0.00 €'}\n`;
        }

        msg += `\nPrice Estimate:\n`;
        msg += `- Invoice Total: ${(rawServiceCost - promoDiscount).toFixed(2)} €\n`;
        if (savings > 0) {
          msg += `- Actual Cost (after tax deduction): ~${finalTotal.toFixed(2)} €\n`;
        }
      } else {
        msg = `Hei, haluaisin tilailla seuraavat palvelut:\n`;
        
        if (state.remote.checked) {
          msg += `- Etätuki (${state.remote.qty}x 30 min)\n`;
        }
        if (state.home.checked) {
          msg += `- Kotikäynti (${state.home.qty}x tunti)\n`;
        }
        if (state.annual.checked) {
          msg += `- Vuosihuolto (${state.annual.qty}x laite)\n`;
        }

        if (state.promoCode && promoDiscount > 0) {
          msg += `\nAlennuskoodi: ${state.promoCode} (-${state.discountPercent}% / -${promoDiscount.toFixed(2)} €)\n`;
        }

        msg += `Kotitalousvähennys: ${state.deduction ? 'Kyllä (-60% työn osuudesta)' : 'Ei'}\n`;
        
        if (state.home.checked || state.annual.checked) {
          msg += `\nSijainti & Matkakulut:\n`;
          msg += `- Osoite: ${state.address || 'Ei laskettu'}\n`;
          msg += `- Arvioitu ajomatka Saunalahdesta, Espoosta: ${state.distanceKm ? state.distanceKm.toFixed(1) + ' km' : 'N/A'}\n`;
          msg += `- Matkakulut (${TRAVEL_RATE_PER_KM.toFixed(2)} €/km): ${state.travelCost ? state.travelCost.toFixed(2) + ' €' : '0.00 €'}\n`;
        }

        msg += `\nHinta-arvio:\n`;
        msg += `- Laskun loppusumma: ${(rawServiceCost - promoDiscount).toFixed(2)} €\n`;
        if (savings > 0) {
          msg += `- Todellinen hinta vähennyksen jälkeen: ~${finalTotal.toFixed(2)} €\n`;
        }
      }
      
      messageField.value = msg;
    });
  }

  // Run initial state
  updateCalculator();
  try { createIcons({ icons: ICON_SET, root: container }); } catch (e) { console.warn("Lucide icon init warning:", e); }
});
