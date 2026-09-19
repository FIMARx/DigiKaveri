/* estimator.js - DigiKaveri Dynamic Price Calculator */
import { createIcons } from 'lucide';
import { ICON_SET } from './icons';
import { isEnglish, onDOMReady } from './utils.js';
import campaignConfig from '../data/campaign.json';
import { validatePromoCode, validatePromoCodeAsync, markPromoCodeRedeemed } from './promo-validator.js';

const isEn = isEnglish();

const translations = {
  fi: {
    remote: "Etätuki",
    remoteDesc: "Etäyhteysapua laitteelle (29 € / 30 min, lisäaika 14 € / 15 min)",
    homeVisit: "Kotikäynti",
    homeVisitDesc: "Apua paikan päällä kotonasi (59 € / 1. tunti, lisäaika 15 € / 15 min)",
    annual: "Vuosihuolto",
    annualDesc: "Tietokoneen perusteellinen puhdistus ja tarkistus",
    deductionLabel: "Hyödynnä kotitalousvähennys (-35%)",
    deductionNote: "Kotitalousvähennys koskee kotikäyntejä ja huoltotöitä, ei etätukea.",
    invoiceTotal: "Laskun loppusumma:",
    actualCost: "Oma osuutesi vähennyksen jälkeen:",
    savings: "Säästösi kotitalousvähennyksellä:",
    travelFee: "Matkakulut:",
    free: "0 €",
    bookBtn: "Varaa tällä arviolla",
    transferredToast: "Palveluvalintasi ja hinta-arvio siirretty lomakkeelle!",
    deductionBadge: "-35% Kotitalousvähennys",
    unitHalfHour: "/ 30 min",
    unitHour: "/ tunti",
    unitFlat: "/ laite",
    chipDeductionHome: "Vain n. 38 € vähennyksellä",
    chipDeductionAnnual: "Vain n. 58 € vähennyksellä",
    summaryTitle: "Yhteenveto",
    summaryDesc: "Alustava hinta-arvio valitsemillesi palveluille",
    addressLabel: "Laske matkakulut kotiisi (lähtöpaikka: Espoo)",
    addressPlaceholder: "Kirjoita katuosoite ja kunta...",
    calcBtn: "Laske",
    calculating: "Lasketaan...",
    distLabel: "Etäisyys:",
    routeError: "Osoitetta ei löytynyt tai matkaa ei voitu laskea. Tarkista osoite ja kokeile uudelleen.",
    havePromoCode: "Onko sinulla alennuskoodi?",
    promoPlaceholder: "Syötä alennuskoodi...",
    apply: "Käytä",
    promoDiscountLabel: "Alennuskoodi",
    printBtn: "Tulosta / Tallenna arvio (PDF)",
    printDocTitle: "HINTA-ARVIO",
    printDocSubtitle: "Alustava kustannusarvio valituille palveluille",
    printDate: "Päivämäärä:",
    printEstimateRef: "Arvio:",
    printVatNote: "Kaikki hinnat sisältävät ALV 25,5 %",
    printLocTitle: "Palvelupaikka & matka:",
    printServiceCol: "Palvelu & Kuvaus",
    printQtyCol: "Määrä",
    printUnitCol: "Hinta",
    printTotalCol: "Yhteensä",
    printTravelLabel: "Matkakulut kohteeseen (Espoon Saunalahdesta)",
    printPromoLabel: "Alennuskoodi",
    printDeductionBoxTitle: "Kotitalousvähennys (-35 % työn osuudesta)",
    printDeductionBoxDesc: "DigiKaverin kotikäynnit ja laitehuollot ovat kotitalousvähennyskelpoisia työn osalta (vähennys 35 % vuonna 2026, omavastuu 150 €/v). Ilmoita vähennys helposti OmaVerossa (vero.fi) DigiKaverin Y-tunnuksella 3418585-6 työn valmistuttua.",
    printGuaranteeBoxTitle: "Tyytyväisyystakuu: Ei ratkaisua, ei laskua",
    printGuaranteeBoxDesc: "Maksat vain onnistuneesta IT-tuesta. Mikäli emme kykene ratkaisemaan laitteesi tai verkkosi ongelmaa, emme laskuta palvelusta mitään.",
    printFinalShare: "Oma osuutesi vähennyksen jälkeen:",
    printFinalInvoice: "Laskun loppusumma:",
    printValidUntil: "Voimassaolo: 30 päivää",
    printStepsTitle: "Näin palvelu etenee:",
    printStep1Title: "1. Ajanvaraus",
    printStep1Desc: "Ota yhteyttä puhelimitse (045 7833 8105) tai verkkolomakkeella.",
    printStep2Title: "2. IT-tuki & Huolto",
    printStep2Desc: "Tulemme sovittuna aikana kotiisi tai autamme suojatulla etäyhteydellä.",
    printStep3Title: "3. Takuu & Kotitalousvähennys",
    printStep3Desc: "Maksat vain onnistuneesta työstä. Saat selkeän laskun OmaVeroa varten.",
    printFooterContact: "Ajanvaraus & tiedustelut: Puh. 045 7833 8105 | info@digikaveri.com | www.digikaveri.com",
    printFooterDisclaimer: "Tämä tuloste on verkkosivustolla laadittu alustava hinta-arvio valituilla palveluilla ja määrillä. Lopullinen lasku määräytyy toteutuneen työn mukaan.",
  },
  en: {
    remote: "Remote Support",
    remoteDesc: "Remote assistance for your device (€29 / 30 min, extra time €14 / 15 min)",
    homeVisit: "Home Visit",
    homeVisitDesc: "Help on-site at your home (€59 / 1st hour, extra time €15 / 15 min)",
    annual: "Annual Maintenance",
    annualDesc: "Thorough physical & digital computer tune-up",
    deductionLabel: "Apply household tax deduction (-35%)",
    deductionNote: "The household tax deduction applies to home visits and maintenance, not remote support.",
    invoiceTotal: "Invoice total:",
    actualCost: "Your cost after tax deduction:",
    savings: "Your savings with tax deduction:",
    travelFee: "Travel costs:",
    free: "0 €",
    bookBtn: "Book with this estimate",
    transferredToast: "Your estimated services have been pre-filled below!",
    deductionBadge: "-35% Tax deduction",
    unitHalfHour: "/ 30 min",
    unitHour: "/ hour",
    unitFlat: "/ device",
    chipDeductionHome: "Only ~38 € with tax credit",
    chipDeductionAnnual: "Only ~58 € with tax credit",
    summaryTitle: "Summary",
    summaryDesc: "Estimated price for selected services",
    addressLabel: "Calculate travel costs to your address (departing from Espoo)",
    addressPlaceholder: "Enter street address and city...",
    calcBtn: "Calculate",
    calculating: "Calculating...",
    distLabel: "Distance:",
    routeError: "Address not found or route could not be calculated. Please check the address and try again.",
    havePromoCode: "Have a promo code?",
    promoPlaceholder: "Enter promo code...",
    apply: "Apply",
    promoDiscountLabel: "Promo discount",
    printBtn: "Print / Save estimate (PDF)",
    printDocTitle: "PRICE ESTIMATE",
    printDocSubtitle: "Preliminary cost estimate for selected services",
    printDate: "Date:",
    printEstimateRef: "Estimate:",
    printVatNote: "All prices include VAT 25.5%",
    printLocTitle: "Service Location & Travel:",
    printServiceCol: "Service & Description",
    printQtyCol: "Qty",
    printUnitCol: "Price",
    printTotalCol: "Total",
    printTravelLabel: "Travel expenses (from Saunalahti, Espoo)",
    printPromoLabel: "Promo discount",
    printDeductionBoxTitle: "Household Tax Deduction (-35% on labor)",
    printDeductionBoxDesc: "DigiKaveri home visits and hardware maintenance are eligible for the Finnish household tax deduction (35% on labor in 2026, deductible €150/year). You can easily claim this via OmaVero (vero.fi) using our Business ID 3418585-6 after the service is completed.",
    printGuaranteeBoxTitle: "Satisfaction Guarantee: No solution, no bill",
    printGuaranteeBoxDesc: "You only pay for successful IT support. If we cannot solve your device or network problem, you will not be charged for the service.",
    printFinalShare: "Your cost after tax deduction:",
    printFinalInvoice: "Invoice total:",
    printValidUntil: "Validity: 30 days",
    printStepsTitle: "How to proceed with your booking:",
    printStep1Title: "1. Contact & Booking",
    printStep1Desc: "Contact us by phone (045 7833 8105) or submit our web form.",
    printStep2Title: "2. IT Support & Service",
    printStep2Desc: "We visit your home at the agreed time or solve issues via secure remote support.",
    printStep3Title: "3. Guarantee & Tax Credit",
    printStep3Desc: "Pay only for solved issues. We provide an itemized invoice for your tax deduction.",
    printFooterContact: "Bookings & Inquiries: Tel. 045 7833 8105 | info@digikaveri.com | www.digikaveri.com",
    printFooterDisclaimer: "This document is an indicative price estimate generated on our website. The final invoice will be based on actual services performed and confirmed work.",
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
const TAX_DEDUCTION_RATE = 0.35;

const MUNICIPALITY_PRESETS = {
  "espoo": { lat: 60.2055, lon: 24.6559, defaultKm: 5 },
  "helsinki": { lat: 60.1699, lon: 24.9384, defaultKm: 18 },
  "vantaa": { lat: 60.2934, lon: 25.0378, defaultKm: 25 },
  "kauniainen": { lat: 60.2096, lon: 24.7275, defaultKm: 7 },
  "kirkkonummi": { lat: 60.1238, lon: 24.4385, defaultKm: 22 },
  "kerava": { lat: 60.4034, lon: 25.1050, defaultKm: 38 },
  "tuusula": { lat: 60.4033, lon: 25.0298, defaultKm: 35 },
  "jarvenpaa": { lat: 60.4735, lon: 25.0886, defaultKm: 44 },
  "järvenpää": { lat: 60.4735, lon: 25.0886, defaultKm: 44 },
  "sipoo": { lat: 60.3768, lon: 25.2676, defaultKm: 45 }
};

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1.25; // Typical road network tortuosity
}

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
        <span class="chip-deduction">${t.chipDeductionHome}</span>
      </div>
      <div class="quick-rate-chip" data-chip="annual" role="button" tabindex="0" aria-label="Valitse Vuosihuolto">
        <span class="chip-label">🛡️ ${t.annual}</span>
        <span class="chip-price">89€ ${t.unitFlat}</span>
        <span class="chip-deduction">${t.chipDeductionAnnual}</span>
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
          <button type="button" class="promo-toggle-btn" id="promo-toggle-btn" aria-expanded="false">
            <div class="promo-toggle-left">
              <i data-lucide="tag" aria-hidden="true"></i>
              <span>${t.havePromoCode}</span>
            </div>
            <i data-lucide="chevron-down" class="promo-chevron" aria-hidden="true"></i>
          </button>
          <div class="promo-input-wrapper hidden" id="promo-input-wrapper">
            <input type="text" id="est-promo-input" placeholder="${t.promoPlaceholder}" class="promo-input" maxlength="24" autocomplete="off" spellcheck="false">
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
            <div class="total-label-wrap">
              <span id="label-final-price">${t.actualCost}</span>
              <span class="est-deduction-badge" id="est-deduction-badge" style="display: none;">${t.deductionBadge}</span>
            </div>
            <div class="final-price-wrap">
              <span class="price-val original-strike" id="summary-original-strike" style="display: none;">0 €</span>
              <span class="price-val final-val" id="summary-final-total">0 €</span>
            </div>
          </div>
        </div>

        <a href="#contact-detailed" class="btn-estimator-cta" id="est-book-btn">
          ${t.bookBtn} <i data-lucide="arrow-right"></i>
        </a>
        <button type="button" class="btn-estimator-print" id="est-print-btn">
          <i data-lucide="printer"></i> ${t.printBtn}
        </button>
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
    const origStrikeEl = document.getElementById("summary-original-strike");
    const deductionBadgeEl = document.getElementById("est-deduction-badge");
    const beforeDeductionTotal = (rawServiceTotal - promoDiscountAmount) + currentTravelCost;

    if (state.deduction && savingsTotal > 0) {
      savingsRow.style.display = "flex";
      savingsVal.textContent = `-${Math.round(savingsTotal)} €`;
      document.getElementById("label-final-price").textContent = t.actualCost;
      if (origStrikeEl) {
        origStrikeEl.textContent = `${Math.round(beforeDeductionTotal)} €`;
        origStrikeEl.style.display = "inline";
      }
      if (deductionBadgeEl) {
        deductionBadgeEl.style.display = "inline-flex";
      }
    } else {
      savingsRow.style.display = "none";
      document.getElementById("label-final-price").textContent = t.invoiceTotal;
      if (origStrikeEl) {
        origStrikeEl.style.display = "none";
      }
      if (deductionBadgeEl) {
        deductionBadgeEl.style.display = "none";
      }
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

  // Calculate Travel Costs via Nominatim + OSRM (with in-memory cache)
  const addressInput = document.getElementById("est-address");
  const calcBtn = document.getElementById("est-calc-btn");
  const feedbackEl = document.getElementById("est-dist-feedback");
  const routeCache = new Map();

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

      const cacheKey = query.toLowerCase();
      if (routeCache.has(cacheKey)) {
        const cached = routeCache.get(cacheKey);
        state.address = query;
        state.distanceKm = cached.distanceKm;
        state.travelCost = cached.travelCost;
        feedbackEl.textContent = `${t.distLabel} ${cached.distanceKm.toFixed(1)} km`;
        feedbackEl.classList.remove("hidden");
        updateCalculator();
        return;
      }

      calcBtn.textContent = t.calculating;
      calcBtn.disabled = true;
      feedbackEl.classList.add("hidden");

      try {
        let userLat = null;
        let userLon = null;
        let distanceKm = null;

        // Check local municipality presets or postal codes first for instant resolution
        const cleanLower = query.toLowerCase();
        let matchedMuniName = "";
        for (const [muni, data] of Object.entries(MUNICIPALITY_PRESETS)) {
          if (cleanLower === muni || cleanLower.includes(muni)) {
            userLat = data.lat;
            userLon = data.lon;
            distanceKm = data.defaultKm;
            matchedMuniName = muni.charAt(0).toUpperCase() + muni.slice(1);
            break;
          }
        }

        // Postal code regex check (e.g. 02320, 00100, 01300, 04200)
        if (!userLat || !userLon) {
          const postalMatch = query.match(/\b(0\d{4})\b/);
          if (postalMatch) {
            const pCode = postalMatch[1];
            const pPrefix = pCode.substring(0, 2);
            if (pPrefix === "02") {
              if (pCode.startsWith("027")) {
                userLat = 60.2096; userLon = 24.7275; distanceKm = 7; matchedMuniName = "Kauniainen";
              } else if (pCode.startsWith("024") || pCode.startsWith("025")) {
                userLat = 60.1238; userLon = 24.4385; distanceKm = 22; matchedMuniName = "Kirkkonummi";
              } else {
                userLat = 60.2055; userLon = 24.6559; distanceKm = 5; matchedMuniName = "Espoo";
              }
            } else if (pPrefix === "00") {
              userLat = 60.1699; userLon = 24.9384; distanceKm = 18; matchedMuniName = "Helsinki";
            } else if (pPrefix === "01") {
              userLat = 60.2934; userLon = 25.0378; distanceKm = 25; matchedMuniName = "Vantaa";
            } else if (pPrefix === "04") {
              userLat = 60.4034; userLon = 25.1050; distanceKm = 38; matchedMuniName = "Keski-Uusimaa";
            }
          }
        }

        // If not a simple municipality preset, geocode via Nominatim
        if (!userLat || !userLon) {
          try {
            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}+Finland`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              userLat = parseFloat(geoData[0].lat);
              userLon = parseFloat(geoData[0].lon);
            }
          } catch (geoErr) {
            console.warn("Nominatim geocoding error:", geoErr);
          }
        }

        if (!userLat || !userLon) {
          throw new Error("Address not found");
        }

        // Try route distance via OSRM, with fallback to Haversine
        try {
          const routeUrl = `https://router.project-osrm.org/route/v1/driving/${START_LON},${START_LAT};${userLon},${userLat}?overview=false`;
          const routeRes = await fetch(routeUrl);
          const routeData = await routeRes.json();
          if (routeData && routeData.routes && routeData.routes.length > 0) {
            distanceKm = routeData.routes[0].distance / 1000;
          }
        } catch (routeErr) {
          console.warn("OSRM routing error, using Haversine calculation:", routeErr);
        }

        // If distanceKm still not calculated, use straight-line road estimate
        if (!distanceKm) {
          distanceKm = calculateHaversineKm(START_LAT, START_LON, userLat, userLon);
        }

        const totalTravelCost = distanceKm * TRAVEL_RATE_PER_KM;

        // Save to cache
        routeCache.set(cacheKey, { distanceKm, travelCost: totalTravelCost });

        state.address = query;
        state.distanceKm = distanceKm;
        state.travelCost = totalTravelCost;

        const muniSuffix = matchedMuniName ? ` (${matchedMuniName})` : "";
        feedbackEl.textContent = `${t.distLabel} ${distanceKm.toFixed(1)} km${muniSuffix}`;
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

  const applyPromo = async (codeToApply) => {
    const rawCode = (codeToApply || (promoInput ? promoInput.value : "")).trim();
    if (!rawCode) {
      state.promoCode = "";
      state.discountPercent = 0;
      state.isUniqueCode = false;
      if (promoFeedbackEl) {
        promoFeedbackEl.textContent = "";
        promoFeedbackEl.className = "promo-feedback hidden";
      }
      updateCalculator();
      return;
    }

    if (promoFeedbackEl) {
      promoFeedbackEl.textContent = isEn ? "Validating code..." : "Tarkistetaan koodia...";
      promoFeedbackEl.className = "promo-feedback success";
      promoFeedbackEl.classList.remove("hidden");
    }

    const result = await validatePromoCodeAsync(rawCode, campaignConfig, isEn ? "en" : "fi");

    if (result.valid) {
      state.promoCode = result.code;
      state.discountPercent = result.discount;
      state.isUniqueCode = result.isUniqueCode;
      if (result.isUniqueCode) {
        try { sessionStorage.setItem("active_unique_promo", result.code); } catch (_) {}
      } else {
        try { sessionStorage.removeItem("active_unique_promo"); } catch (_) {}
      }
      
      if (promoFeedbackEl) {
        promoFeedbackEl.textContent = result.message;
        promoFeedbackEl.className = "promo-feedback success";
      }
      if (promoInput) promoInput.value = result.code;
      if (promoInputWrapper) promoInputWrapper.classList.remove("hidden");
      if (promoToggleBtn) promoToggleBtn.classList.add("active");
    } else {
      state.promoCode = "";
      state.discountPercent = 0;
      state.isUniqueCode = false;
      try { sessionStorage.removeItem("active_unique_promo"); } catch (_) {}
      if (promoFeedbackEl) {
        promoFeedbackEl.textContent = result.message || (isEn 
          ? "✗ Invalid or expired promo code" 
          : "✗ Virheellinen tai vanhentunut alennuskoodi");
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
      summaryCard.classList.remove("promo-highlight-pulse");
      void summaryCard.offsetWidth; // Force reflow
      summaryCard.classList.add("promo-highlight-pulse");
    }
  };

  // Auto-apply promo code from URL query parameters (e.g. ?promo=PROMO15)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const queryPromo = urlParams.get("promo") || urlParams.get("code");
    if (queryPromo) {
      applyPromo(queryPromo);
    }
  } catch (_) {}

  // Wire booking button to prefill contact textarea
  // Wire booking button to prefill contact form, scroll and notify
  const bookBtn = document.getElementById("est-book-btn") || container.querySelector(".btn-estimator-cta");
  if (bookBtn) {
    bookBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const rawServiceCost = (state.remote.checked ? 29 * state.remote.qty : 0) +
        (state.home.checked ? 59 * state.home.qty : 0) +
        (state.annual.checked ? 89 * state.annual.qty : 0);

      const rawEligibleCost = (state.home.checked ? 59 * state.home.qty : 0) +
        (state.annual.checked ? 89 * state.annual.qty : 0);

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
          msg += `\nPromo Code: ${state.promoCode} (-${state.discountPercent}% / -${promoDiscount.toFixed(2)} €)${state.isUniqueCode ? ' [Special 1-time client code]' : ''}\n`;
        }

        msg += `Tax Deduction: ${state.deduction ? 'Yes (-35% on labor)' : 'No'}\n`;
        
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
          msg += `\nAlennuskoodi: ${state.promoCode} (-${state.discountPercent}% / -${promoDiscount.toFixed(2)} €)${state.isUniqueCode ? ' [Uniikki asiakasetu]' : ''}\n`;
        }

        msg += `Kotitalousvähennys: ${state.deduction ? 'Kyllä (-35% työn osuudesta)' : 'Ei'}\n`;
        
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
      
      const messageField = document.getElementById("d-message") || 
                           document.getElementById("message") || 
                           document.querySelector("textarea[name='message']");
      if (messageField) {
        messageField.value = msg;
        messageField.dispatchEvent(new Event('input', { bubbles: true }));
        messageField.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Auto-select subject in detailed form if present
      const subjectSelect = document.getElementById("d-subject");
      if (subjectSelect && subjectSelect.options.length > 1) {
        subjectSelect.selectedIndex = 1;
        subjectSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Target form element to scroll to
      const targetSection = document.getElementById("contact-detailed") || 
                            document.getElementById("contact") || 
                            document.querySelector(".contact-section");

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          const nameInput = document.getElementById("d-name") || document.getElementById("c-name");
          if (nameInput) {
            nameInput.focus({ preventScroll: true });
          }
        }, 500);
      }

      // Show toast
      if (typeof window.showToast === "function") {
        window.showToast(t.transferredToast, true);
      }
    });
  }

  // Generate clean, dedicated print quotation receipt
  const renderPrintReceipt = () => {
    let receiptEl = document.getElementById("digikaveri-print-receipt");
    if (!receiptEl) {
      receiptEl = document.createElement("div");
      receiptEl.id = "digikaveri-print-receipt";
      document.body.appendChild(receiptEl);
    }

    const rawServiceCost = (state.remote.checked ? 29 * state.remote.qty : 0) +
      (state.home.checked ? 59 * state.home.qty : 0) +
      (state.annual.checked ? 89 * state.annual.qty : 0);

    const rawEligibleCost = (state.home.checked ? 59 * state.home.qty : 0) +
      (state.annual.checked ? 89 * state.annual.qty : 0);

    const promoDiscount = state.discountPercent > 0 
      ? (rawServiceCost * (state.discountPercent / 100)) 
      : 0;

    const discountedEligible = state.discountPercent > 0
      ? (rawEligibleCost * (1 - (state.discountPercent / 100)))
      : rawEligibleCost;

    const savings = state.deduction ? (discountedEligible * TAX_DEDUCTION_RATE) : 0;
    const requiresHomeVisit = state.home.checked || state.annual.checked;
    const currentTravelCost = requiresHomeVisit ? state.travelCost : 0;
    const beforeDeductionTotal = (rawServiceCost - promoDiscount) + currentTravelCost;
    const finalTotal = beforeDeductionTotal - savings;

    const now = new Date();
    const dateStr = now.toLocaleDateString(isEn ? "en-GB" : "fi-FI", {
      day: "numeric",
      month: "numeric",
      year: "numeric"
    });
    const estimateNumber = `DK-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let rowsHtml = "";

    if (state.remote.checked) {
      const itemTotal = 29 * state.remote.qty;
      rowsHtml += `
        <tr>
          <td>
            <span class="dk-print-service-title">${t.remote}</span>
            <span class="dk-print-service-desc">${t.remoteDesc}</span>
          </td>
          <td class="text-right">${state.remote.qty} × 30 min</td>
          <td class="text-right">29,00 €</td>
          <td class="text-right"><strong>${itemTotal.toFixed(2).replace('.', ',')} €</strong></td>
        </tr>
      `;
    }

    if (state.home.checked) {
      const itemTotal = 59 * state.home.qty;
      const homeUnitStr = isEn ? `${state.home.qty} × hr` : `${state.home.qty} × ${state.home.qty > 1 ? "tuntia" : "tunti"}`;
      rowsHtml += `
        <tr>
          <td>
            <span class="dk-print-service-title">${t.homeVisit}</span>
            <span class="dk-print-service-desc">${t.homeVisitDesc}</span>
          </td>
          <td class="text-right">${homeUnitStr}</td>
          <td class="text-right">59,00 €</td>
          <td class="text-right"><strong>${itemTotal.toFixed(2).replace('.', ',')} €</strong></td>
        </tr>
      `;
    }

    if (state.annual.checked) {
      const itemTotal = 89 * state.annual.qty;
      const annualUnitStr = isEn ? `${state.annual.qty} × device` : `${state.annual.qty} × ${state.annual.qty > 1 ? "laitetta" : "laite"}`;
      rowsHtml += `
        <tr>
          <td>
            <span class="dk-print-service-title">${t.annual}</span>
            <span class="dk-print-service-desc">${t.annualDesc}</span>
          </td>
          <td class="text-right">${annualUnitStr}</td>
          <td class="text-right">89,00 €</td>
          <td class="text-right"><strong>${itemTotal.toFixed(2).replace('.', ',')} €</strong></td>
        </tr>
      `;
    }

    if (requiresHomeVisit && currentTravelCost > 0) {
      rowsHtml += `
        <tr>
          <td>
            <span class="dk-print-service-title">${t.printTravelLabel}</span>
            <span class="dk-print-service-desc">${state.address ? state.address + ' • ' : ''}${state.distanceKm.toFixed(1)} km</span>
          </td>
          <td class="text-right">${state.distanceKm > 0 ? state.distanceKm.toFixed(1) + ' km' : '1 × matka'}</td>
          <td class="text-right">${TRAVEL_RATE_PER_KM.toFixed(2).replace('.', ',')} €/km</td>
          <td class="text-right"><strong>${currentTravelCost.toFixed(2).replace('.', ',')} €</strong></td>
        </tr>
      `;
    }

    if (state.promoCode && promoDiscount > 0) {
      rowsHtml += `
        <tr class="dk-print-promo-row">
          <td>
            <span class="dk-print-service-title">🏷️ ${t.printPromoLabel}: ${state.promoCode} (-${state.discountPercent}%)</span>
            <span class="dk-print-service-desc">${isEn ? "Applied promo discount" : "Arvioon myönnetty alennusetu"}</span>
          </td>
          <td class="text-right">1</td>
          <td class="text-right">-${promoDiscount.toFixed(2).replace('.', ',')} €</td>
          <td class="text-right"><strong>-${promoDiscount.toFixed(2).replace('.', ',')} €</strong></td>
        </tr>
      `;
    }

    if (!rowsHtml) {
      rowsHtml = `
        <tr>
          <td colspan="4" style="text-align: center; color: #64748b; padding: 20px;">
            ${isEn ? "No services selected." : "Ei valittuja palveluita."}
          </td>
        </tr>
      `;
    }

    const locCardHtml = (requiresHomeVisit && (state.address || state.distanceKm > 0)) ? `
      <div class="dk-print-loc-card">
        <div>
          <strong>${t.printLocTitle}</strong> ${state.address || (isEn ? "Uusimaa region" : "Uusimaa")}
        </div>
        <div>
          ${state.distanceKm > 0 ? `<span>${t.distLabel} ${state.distanceKm.toFixed(1)} km</span> • ` : ''}
          <span>${t.travelFee} ${currentTravelCost > 0 ? currentTravelCost.toFixed(2).replace('.', ',') + ' €' : t.free}</span>
        </div>
      </div>
    ` : '';

    receiptEl.innerHTML = `
      <div class="dk-print-main-content">
        <div class="dk-print-header">
          <div class="dk-print-brand">
            <h1>Digi<span class="dk-print-brand-blue">Kaveri</span></h1>
            <p class="dk-print-tagline">${isEn ? "Reliable IT Support & Computer Care" : "Luotettava IT-tuki & Tietokonehuolto • Uusimaa"}</p>
            <p class="dk-print-meta-sub">Espoo • Helsinki • Vantaa • Kauniainen • Kirkkonummi</p>
            <p class="dk-print-meta-sub">DigiKaveri / FIMARx • Y-tunnus: 3418585-6 • ALV-rekisteröity yritys</p>
          </div>
          <div class="dk-print-doc-meta">
            <h2>${t.printDocTitle}</h2>
            <div class="dk-print-meta-grid">
              <p class="dk-print-doc-row"><strong>${t.printDate}</strong> ${dateStr}</p>
              <p class="dk-print-doc-row"><strong>${t.printEstimateRef}</strong> #${estimateNumber}</p>
              <p class="dk-print-doc-row"><strong>${t.printValidUntil}</strong></p>
            </div>
            <div class="dk-print-vat-badge">${t.printVatNote}</div>
          </div>
        </div>

        ${locCardHtml}

        <table class="dk-print-table">
          <thead>
            <tr>
              <th>${t.printServiceCol}</th>
              <th class="text-right">${t.printQtyCol}</th>
              <th class="text-right">${t.printUnitCol}</th>
              <th class="text-right">${t.printTotalCol}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="dk-print-bottom-grid">
          <div class="dk-print-info-col">
            <div class="dk-print-info-card">
              <div class="dk-print-card-header">
                <span class="dk-print-card-icon">🛡️</span>
                <strong>${t.printGuaranteeBoxTitle}</strong>
              </div>
              <p>${t.printGuaranteeBoxDesc}</p>
            </div>
            ${state.deduction && savings > 0 ? `
              <div class="dk-print-info-card dk-print-tax-card">
                <div class="dk-print-card-header">
                  <span class="dk-print-card-icon">📋</span>
                  <strong>${t.printDeductionBoxTitle}</strong>
                </div>
                <p>${t.printDeductionBoxDesc}</p>
              </div>
            ` : ''}
          </div>

          <div class="dk-print-totals-col">
            <div class="dk-print-totals-card">
              <div class="dk-print-total-row">
                <span>${t.invoiceTotal}</span>
                <strong>${Math.round(beforeDeductionTotal)} €</strong>
              </div>
              ${state.promoCode && promoDiscount > 0 ? `
                <div class="dk-print-total-row highlight-savings">
                  <span>${t.printPromoLabel} (${state.promoCode}):</span>
                  <strong>-${Math.round(promoDiscount)} €</strong>
                </div>
              ` : ''}
              ${requiresHomeVisit && currentTravelCost > 0 ? `
                <div class="dk-print-total-row">
                  <span>${t.travelFee}</span>
                  <strong>${currentTravelCost.toFixed(2).replace('.', ',')} €</strong>
                </div>
              ` : ''}
              ${state.deduction && savings > 0 ? `
                <div class="dk-print-total-row highlight-savings">
                  <span>${t.savings}</span>
                  <strong>-${Math.round(savings)} €</strong>
                </div>
              ` : ''}
              <hr class="dk-print-total-divider">
              <div class="dk-print-final-box">
                <span class="dk-print-final-label">${state.deduction && savings > 0 ? t.printFinalShare : t.printFinalInvoice}</span>
                <span class="dk-print-final-amount">${Math.round(finalTotal)} €</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dk-print-steps-section">
          <h3 class="dk-print-steps-heading">${t.printStepsTitle}</h3>
          <div class="dk-print-steps-grid">
            <div class="dk-print-step-item">
              <strong>${t.printStep1Title}</strong>
              <p>${t.printStep1Desc}</p>
            </div>
            <div class="dk-print-step-item">
              <strong>${t.printStep2Title}</strong>
              <p>${t.printStep2Desc}</p>
            </div>
            <div class="dk-print-step-item">
              <strong>${t.printStep3Title}</strong>
              <p>${t.printStep3Desc}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="dk-print-footer">
        <p class="dk-print-footer-contacts">${t.printFooterContact}</p>
        <p class="dk-print-footer-legal">DigiKaveri • FIMARx • Y-tunnus 3418585-6 • Espoo, Uusimaa • Hinnat sisältävät ALV 25,5 %</p>
        <p class="dk-print-footer-disclaimer">${t.printFooterDisclaimer}</p>
      </div>
    `;
  };

  // Professional print handler with clean default PDF filename
  const triggerPrintReceipt = () => {
    renderPrintReceipt();
    const originalTitle = document.title;
    const cleanFileName = isEn ? "DigiKaveri-Price-Estimate" : "DigiKaveri-Hinta-arvio";
    document.title = cleanFileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  window.addEventListener("beforeprint", () => {
    renderPrintReceipt();
  });

  // Wire print button
  const printBtn = document.getElementById("est-print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", triggerPrintReceipt);
  }

  // Run initial state
  updateCalculator();
  try { createIcons({ icons: ICON_SET, root: container }); } catch (e) { console.warn("Lucide icon init warning:", e); }
});
