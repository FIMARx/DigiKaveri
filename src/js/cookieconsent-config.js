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
              '<div class="cc-banner-title"><svg class="cc-cookie-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg> <span>Käytämme evästeitä</span><span class="cc-badge"><span class="cc-badge-dot"></span> GDPR 2.0 Suojattu</span></div>',
            description:
              'Käytämme evästeitä ja moderneja verkkoteknologioita varmistaaksemme sivuston turvallisuuden, parantaaksemme käyttökokemustasi ja analysoidaksemme liikennettä. Voit hallita asetuksiasi milloin tahansa. Lue lisää <a href="/tietosuoja.html" class="cc-link">Tietosuojaselosteestamme</a>.',
            acceptAllBtn: "Hyväksy kaikki",
            acceptNecessaryBtn: "Välttämättömät",
            showPreferencesBtn: "Mukauta asetuksia",
            footer:
              '<a href="/tietosuoja.html">Tietosuoja</a><a href="/kayttoehdot.html">Käyttöehdot</a>',
          },
          preferencesModal: {
            title:
              '<div class="cc-pm-header-title"><svg class="cc-modal-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>Evästeasetukset</span></div>',
            acceptAllBtn: "Hyväksy kaikki",
            acceptNecessaryBtn: "Hylkää kaikki",
            rejectAllBtn: "Hylkää kaikki",
            savePreferencesBtn: "Tallenna valinnat",
            closeIconLabel: "Sulje",
            sections: [
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> <span>Tietosuoja & Evästeet</span></span>',
                description:
                  "Käytämme evästeitä varmistaaksemme sivuston luotettavan toiminnan ja tarjotaksemme parhaan mahdollisen käyttökokemuksen. Voit säätää eri evästeluokkia ja muuttaa suostumustasi milloin tahansa.",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> <span>Välttämättömät evästeet</span></span>',
                description:
                  "Välttämättömät evästeet mahdollistavat sivuston perustoiminnot, kuten turvallisen selaamisen, teeman muistamisen (tumma/vaalea tila) ja evästeasetustesi tallentamisen. Ne ovat aina käytössä, jotta palvelu toimii luotettavasti.",
                linkedCategory: "necessary",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> <span>Analytiikkaevästeet</span></span>',
                description:
                  "Analytiikkaevästeet auttavat meitä ymmärtämään, miten kävijät käyttävät sivustoamme (esim. suosituimmat sivut ja latausajat). Kaikki kerätty tieto on täysin anonyymiä ja auttaa meitä kehittämään IT-tukipalvelujamme.",
                linkedCategory: "analytics",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> <span>Markkinointievästeet</span></span>',
                description:
                  "Markkinointievästeiden avulla voimme tarjota osuvampia IT-tuki- ja laitehuoltoaiheisia tietoja palveluistamme sosiaalisessa mediassa ja hakukoneissa. Ne auttavat myös välttämään samojen ilmoitusten toistumista.",
                linkedCategory: "marketing",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> <span>Lisätietoja & Yhteydenotto</span></span>',
                description:
                  'Jos sinulla on kysyttävää evästekäytännöistämme tai tietosuojasta, ota meihin yhteyttä <a href="mailto:info@digikaveri.com" class="cc-link">sähköpostitse</a>.',
              },
            ],
          },
        },
        en: {
          consentModal: {
            title:
              '<div class="cc-banner-title"><svg class="cc-cookie-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg> <span>We value your privacy</span><span class="cc-badge"><span class="cc-badge-dot"></span> GDPR 2.0 Protected</span></div>',
            description:
              'We use cookies and modern Web APIs to ensure security, enhance browsing experience, and analyze performance. You can customize your consent options at any time. Learn more in our <a href="/en/privacy-policy.html" class="cc-link">Privacy Policy</a>.',
            acceptAllBtn: "Accept all",
            acceptNecessaryBtn: "Necessary only",
            showPreferencesBtn: "Customize settings",
            footer:
              '<a href="/en/privacy-policy.html">Privacy Policy</a><a href="/en/terms-of-service.html">Terms of Service</a>',
          },
          preferencesModal: {
            title:
              '<div class="cc-pm-header-title"><svg class="cc-modal-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>Cookie Preferences</span></div>',
            acceptAllBtn: "Accept all",
            rejectAllBtn: "Reject all",
            savePreferencesBtn: "Save preferences",
            closeIconLabel: "Close",
            sections: [
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> <span>Privacy & Cookies</span></span>',
                description:
                  "We use cookies to guarantee core site functions and provide a seamless online experience. You can choose to enable or disable optional categories according to your preferences.",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> <span>Strictly Necessary Cookies</span></span>',
                description:
                  "Necessary cookies enable core functionality such as page navigation, theme selection (dark/light mode), security authentication, and remembering consent choices. They are always active.",
                linkedCategory: "necessary",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> <span>Analytics Cookies</span></span>',
                description:
                  "Analytics cookies help us measure user engagement, top pages, and loading speeds. All data is completely anonymized to optimize IT support service performance.",
                linkedCategory: "analytics",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> <span>Marketing Cookies</span></span>',
                description:
                  "Marketing cookies allow us to present relevant IT support & repair service information across search engines and social platforms, while preventing redundant ad displays.",
                linkedCategory: "marketing",
              },
              {
                title:
                  '<span class="cc-cat-title"><svg class="cc-cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> <span>More Info & Contact</span></span>',
                description:
                  'For questions about our privacy policies or cookie settings, feel free to <a href="mailto:info@digikaveri.com" class="cc-link">contact us</a>.',
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
