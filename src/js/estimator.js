/* estimator.js - DigiKaveri Dynamic Price Calculator */
import { createIcons } from 'lucide';
import { ICON_SET } from './icons';

const isEn = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/");

const translations = {
  fi: {
    remote: "Etätuki",
    remoteDesc: "Etäyhteysapua tietokoneelle tai puhelimelle",
    homeVisit: "Kotikäynti",
    homeVisitDesc: "Apua paikan päällä kotonasi (Uusimaa)",
    annual: "Vuosihuolto",
    annualDesc: "Tietokoneen täydellinen fyysinen & digitaalinen puhdistus",
    deductionLabel: "Hyödynnä kotitalousvähennys (-60%)",
    deductionNote: "Kotitalousvähennys koskee vain kotikäyntejä ja huoltoja, ei etätukea.",
    invoiceTotal: "Laskun loppusumma:",
    actualCost: "Todellinen hinta vähennyksen jälkeen:",
    savings: "Säästät vähennyksellä:",
    travelFee: "Matkakulut:",
    free: "0 €",
    bookBtn: "Varaa palvelu tästä",
    unitHalfHour: "/ 30 min",
    unitHour: "/ tunti",
    unitFlat: "/ laite",
  },
  en: {
    remote: "Remote Support",
    remoteDesc: "Remote assistance for computer or mobile",
    homeVisit: "Home Visit",
    homeVisitDesc: "Help on-site at your home (Uusimaa area)",
    annual: "Annual Maintenance",
    annualDesc: "Full physical & digital cleanup of your computer",
    deductionLabel: "Apply household tax deduction (-60%)",
    deductionNote: "The household tax deduction applies only to home visits, not remote support.",
    invoiceTotal: "Invoice total:",
    actualCost: "Actual cost after tax deduction:",
    savings: "You save via deduction:",
    travelFee: "Travel costs:",
    free: "0 €",
    bookBtn: "Book Service Now",
    unitHalfHour: "/ 30 min",
    unitHour: "/ hour",
    unitFlat: "/ device",
  }
};

const t = isEn ? translations.en : translations.fi;

const SERVICES = {
  remote: { id: 'remote', basePrice: 29, isEligible: false, step: 1, unit: t.unitHalfHour },
  home: { id: 'home', basePrice: 59, isEligible: true, step: 1, unit: t.unitHour },
  annual: { id: 'annual', basePrice: 89, isEligible: true, step: 1, unit: t.unitFlat }
};

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("interactive-estimator");
  if (!container) return;

  // Build the estimator UI dynamically
  container.innerHTML = `
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
              <button type="button" class="qty-btn minus" data-service="remote">-</button>
              <span class="qty-val" id="qty-val-remote">1</span>
              <button type="button" class="qty-btn plus" data-service="remote">+</button>
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
              <button type="button" class="qty-btn minus" data-service="home">-</button>
              <span class="qty-val" id="qty-val-home">1</span>
              <button type="button" class="qty-btn plus" data-service="home">+</button>
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
              <button type="button" class="qty-btn minus" data-service="annual">-</button>
              <span class="qty-val" id="qty-val-annual">1</span>
              <button type="button" class="qty-btn plus" data-service="annual">+</button>
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
      </div>

      <!-- Right: Summary -->
      <div class="estimator-summary-card">
        <div class="summary-header">
          <h3>Yhteenveto</h3>
          <p>Alustava hinta-arvio valituille palveluille</p>
        </div>
        
        <div class="summary-breakdown">
          <div class="summary-row">
            <span>${t.invoiceTotal}</span>
            <span class="price-val" id="summary-invoice-total">0 €</span>
          </div>
          <div class="summary-row deduction-row" id="summary-savings-row">
            <span>${t.savings}</span>
            <span class="price-val savings-val" id="summary-savings-total">-0 €</span>
          </div>
          <div class="summary-row">
            <span>${t.travelFee}</span>
            <span class="price-val free-val">${t.free}</span>
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
    deduction: true
  };

  const updateCalculator = () => {
    let invoiceTotal = 0;
    let savingsTotal = 0;

    Object.keys(SERVICES).forEach(key => {
      const service = SERVICES[key];
      const userChoice = state[key];

      // Update quantity control visibility
      const qtyCtrl = document.getElementById(`qty-ctrl-${key}`);
      if (qtyCtrl) {
        qtyCtrl.classList.toggle("hidden", !userChoice.checked);
      }

      if (userChoice.checked) {
        const cost = service.basePrice * userChoice.qty;
        invoiceTotal += cost;

        if (service.isEligible && state.deduction) {
          savingsTotal += cost * 0.60;
        }
      }
    });

    const finalTotal = invoiceTotal - savingsTotal;

    // Update DOM
    document.getElementById("summary-invoice-total").textContent = `${invoiceTotal} €`;
    
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

  // Wire events
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

  // Run initial state
  updateCalculator();
  createIcons({ icons: ICON_SET, root: container });
});
