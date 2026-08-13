import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";
import { triggerAnalyticsExecution } from "./utils.js";

// Make CookieConsent globally available for inline or other module access
if (typeof window !== "undefined") {
  window.CookieConsent = CookieConsent;
}

const runCookieConsent = () => {
  if (!CookieConsent || typeof CookieConsent.run !== "function") return false;

  CookieConsent.run({
    // Handle Global Privacy Control via config rather than hard return
    onConsent: () => {
      const analyticsAccepted = CookieConsent.acceptedCategory("analytics");
      const marketingAccepted = CookieConsent.acceptedCategory("marketing");

      window["ga-disable-G-XL8DBWDDMD"] = !analyticsAccepted;

      if (analyticsAccepted) {
        triggerAnalyticsExecution("analytics");
        if (window.gtag) {
          gtag('consent', 'update', { 'analytics_storage': 'granted' });
        }
      } else {
        if (window.gtag) {
          gtag('consent', 'update', { 'analytics_storage': 'denied' });
        }
      }
      
      if (marketingAccepted) {
        if (window.gtag) {
          gtag('consent', 'update', { 'ad_storage': 'granted' });
        }
      } else {
        if (window.gtag) {
          gtag('consent', 'update', { 'ad_storage': 'denied' });
        }
      }
    },

    onChange: ({ changedCategories }) => {
      if (changedCategories.includes("analytics")) {
        const analyticsAccepted = CookieConsent.acceptedCategory("analytics");
        window["ga-disable-G-XL8DBWDDMD"] = !analyticsAccepted;

        if (analyticsAccepted) {
          if (window.gtag) {
            gtag('consent', 'update', { 'analytics_storage': 'granted' });
            gtag('config', 'G-XL8DBWDDMD', { 'anonymize_ip': true });
          }
          triggerAnalyticsExecution("analytics");
        } else {
          if (window.gtag) {
            gtag('consent', 'update', { 'analytics_storage': 'denied' });
          }
        }
      }

      if (changedCategories.includes("marketing")) {
        const marketingAccepted = CookieConsent.acceptedCategory("marketing");
        if (window.gtag) {
          gtag('consent', 'update', { 'ad_storage': marketingAccepted ? 'granted' : 'denied' });
        }
      }
    },
    guiOptions: {
      consentModal: {
        layout: "box",
        position: "bottom center",
        equalWeightButtons: true,
        flipButtons: false,
      },
      preferencesModal: {
        layout: "box",
        position: "right",
        equalWeightButtons: true,
        flipButtons: false,
      },
    },
    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {
        enabled: false,
      },
      marketing: {
        enabled: false,
      },
    },
    language: {
      default: "fi",
      autoDetect: "document",
      translations: {
        fi: {
          consentModal: {
            title:
              '<div class="cc-banner-title"><svg class="cc-cookie-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg> <span>Kunnioitamme yksityisyyttäsi</span></div>',
            description:
              'Käytämme evästeitä varmistaaksemme sivuston toimivuuden ja parantaaksemme käyttökokemustasi. Voit lukea lisää <a href="/tietosuoja.html" class="cc-link">tietosuojaselosteestamme</a> ja muokata valintojasi milloin vain.',
            acceptAllBtn: "Hyväksy kaikki",
            acceptNecessaryBtn: "Vain välttämättömät",
            showPreferencesBtn: "Muokkaa valintoja",
            footer:
              '<a href="/tietosuoja.html">Tietosuoja</a><a href="/kayttoehdot.html">Käyttöehdot</a>',
          },
          preferencesModal: {
            title:
              '<div class="cc-pm-header-title"><svg class="cc-modal-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>Evästeasetukset</span></div>',
            acceptAllBtn: "Hyväksy kaikki",
            acceptNecessaryBtn: "Vain välttämättömät",
            rejectAllBtn: "Vain välttämättömät",
            savePreferencesBtn: "Tallenna valinnat",
            closeIconLabel: "Sulje",
            sections: [
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> <span>Tietosuoja ja evästeet</span></span>',
                description:
                  "Käytämme evästeitä sivuston perustoimintojen ylläpitoon ja kävijämäärien tilastointiin. Voit valita alta, mitä tietoja saamme käyttää.",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> <span>Välttämättömät evästeet</span></span>',
                description:
                  "Nämä evästeet ovat välttämättömiä sivuston toiminnalle (esimerkiksi ulkoasuteeman muistaminen ja evästevalintasi). Niitä ei voi poistaa käytöstä.",
                linkedCategory: "necessary",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> <span>Kävijätilastot (Analytiikka)</span></span>',
                description:
                  "Analytiikan avulla näemme anonyymisti, millä sivuilla vieraillaan ja miten voimme kehittää palveluamme toimivammaksi.",
                linkedCategory: "analytics",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> <span>Markkinointi</span></span>',
                description:
                  "Markkinointievästeiden avulla voimme kertoa palveluistamme ihmisille, jotka tarvitsevat IT-apua.",
                linkedCategory: "marketing",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> <span>Kysyttävää?</span></span>',
                description:
                  'Jos haluat lisätietoa tietosuojasta, voit aina laittaa meille viestiä osoitteeseen <a href="mailto:info@digikaveri.com" class="cc-link">info@digikaveri.com</a>.',
              },
            ],
          },
        },
        en: {
          consentModal: {
            title:
              '<div class="cc-banner-title"><svg class="cc-cookie-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg> <span>We respect your privacy</span></div>',
            description:
              'We use cookies to keep the website reliable and improve your experience. Learn more in our <a href="/en/privacy-policy.html" class="cc-link">Privacy Policy</a>.',
            acceptAllBtn: "Accept all",
            acceptNecessaryBtn: "Necessary only",
            showPreferencesBtn: "Customize choices",
            footer:
              '<a href="/en/privacy-policy.html">Privacy Policy</a><a href="/en/terms-of-service.html">Terms of Service</a>',
          },
          preferencesModal: {
            title:
              '<div class="cc-pm-header-title"><svg class="cc-modal-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>Cookie Preferences</span></div>',
            acceptAllBtn: "Accept all",
            rejectAllBtn: "Necessary only",
            savePreferencesBtn: "Save preferences",
            closeIconLabel: "Close",
            sections: [
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> <span>Privacy & Cookies</span></span>',
                description:
                  "We use cookies to keep the website running reliably and to see general visitor trends. You can adjust your preferences below.",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> <span>Strictly Necessary Cookies</span></span>',
                description:
                  "These cookies are required for core features like saving your preferences and theme choice. They are always active.",
                linkedCategory: "necessary",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> <span>Analytics</span></span>',
                description:
                  "Helps us anonymously understand which pages are visited most often so we can make our service easier to use.",
                linkedCategory: "analytics",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> <span>Marketing</span></span>',
                description:
                  "Helps us share relevant IT support and device repair help with people looking for assistance.",
                linkedCategory: "marketing",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> <span>Questions?</span></span>',
                description:
                  'If you have any questions about privacy or cookie settings, reach out to us anytime at <a href="mailto:info@digikaveri.com" class="cc-link">info@digikaveri.com</a>.',
              },
            ],
          },
        },
      },
    },
  });

  return true; // successfully initialized
};

// Retry until the CDN library is ready (handles slow CDN / load-order races).
const MAX_WAIT_MS = 3000;
const POLL_INTERVAL_MS = 50;

const initWithRetry = () => {
  if (runCookieConsent()) {
    document.dispatchEvent(new CustomEvent("lcc_initialized"));
    return;
  }

  let elapsed = 0;
  const poll = setInterval(() => {
    elapsed += POLL_INTERVAL_MS;
    if (runCookieConsent()) {
      clearInterval(poll);
      document.dispatchEvent(new CustomEvent("lcc_initialized"));
    } else if (elapsed >= MAX_WAIT_MS) {
      clearInterval(poll);
      console.warn("CookieConsent library did not load within 3 s — banner skipped.");
    }
  }, POLL_INTERVAL_MS);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWithRetry);
} else {
  initWithRetry();
}
