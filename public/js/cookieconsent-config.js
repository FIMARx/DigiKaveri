CookieConsent.run({
  guiOptions: {
    consentModal: {
      layout: "box",
      position: "bottom center",
      equalWeightButtons: false,
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
      readOnly: true,
    },
    analytics: {},
    marketing: {},
  },
  language: {
    default: "fi",
    autoDetect: "document",
    translations: {
      fi: {
        consentModal: {
          title: '<svg class="cc-cookie-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg> Käytämme evästeitä',
          description:
            'Käytämme evästeitä parantaaksemme käyttökokemustasi ja analysoidaksemme sivuston liikennettä. Voit lukea lisää <a href="/tietosuoja.html" class="cc-link">Tietosuojaselosteestamme</a>.',
          acceptAllBtn: "Hyväksy",
          acceptNecessaryBtn: "Hylkää",
          showPreferencesBtn: "Asetukset",
          footer: '<a href="/tietosuoja.html">Tietosuoja</a><a href="/kayttoehdot.html">Käyttöehdot</a>',
        },
        preferencesModal: {
          title: "Evästeasetukset",
          acceptAllBtn: "Hyväksy kaikki",
          acceptNecessaryBtn: "Hylkää kaikki",
          savePreferencesBtn: "Tallenna asetukset",
          closeIconLabel: "Sulje",
          sections: [
            {
              title: "Evästeiden käyttö",
              description:
                "Käytämme evästeitä varmistaaksemme sivuston perustoiminnot ja parantaaksemme verkkokokemustasi. Voit valita kunkin kategorian osalta, haluatko hyväksyä evästeet vai et.",
            },
            {
              title: "Välttämättömät evästeet",
              description:
                "Nämä evästeet ovat välttämättömiä sivuston toiminnan kannalta, eikä niitä voi poistaa käytöstä.",
              linkedCategory: "necessary",
            },
            {
              title: "Analytiikka",
              description:
                "Näiden evästeiden avulla voimme laskea käyntikertoja ja liikennelähteitä, jotta voimme mitata ja parantaa sivustomme suorituskykyä.",
              linkedCategory: "analytics",
            },
            {
              title: "Markkinointi",
              description:
                "Näitä evästeitä käytetään mainonnan kohdentamiseen ja niiden avulla voimme tarjota sinulle kiinnostavampaa sisältöä tulevaisuudessa.",
              linkedCategory: "marketing",
            },
            {
              title: "Lisätietoja",
              description:
                'Jos sinulla on kysyttävää evästekäytännöistämme, ota meihin yhteyttä <a href="mailto:info@digikaveri.com" class="cc-link">sähköpostitse</a>.',
            },
          ],
        },
      },
      en: {
        consentModal: {
          title: '<svg class="cc-cookie-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg> Cookie Consent',
          description:
            'This website uses cookies or similar technologies to enhance your browsing experience and provide personalized recommendations. By continuing to use our website, you agree to our <a href="/en/privacy-policy.html" class="cc-link">Privacy Policy</a>.',
          acceptAllBtn: "Accept",
          acceptNecessaryBtn: "Decline",
          showPreferencesBtn: "Settings",
          footer: '<a href="/en/privacy-policy.html">Privacy Policy</a><a href="/en/terms-of-service.html">Terms of Service</a>',
        },
        preferencesModal: {
          title: "Cookie Preferences",
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          savePreferencesBtn: "Save preferences",
          closeIconLabel: "Close",
          sections: [
            {
              title: "Cookie usage",
              description:
                "We use cookies to ensure basic site functionality and enhance your online experience. You can choose for each category to opt-in/out whenever you want.",
            },
            {
              title: "Strictly Necessary cookies",
              description:
                "These cookies are essential for the proper functioning of the website and cannot be disabled.",
              linkedCategory: "necessary",
            },
            {
              title: "Analytics",
              description:
                "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.",
              linkedCategory: "analytics",
            },
            {
              title: "Marketing",
              description:
                "These cookies are used to target advertising and help us provide you with more relevant content in the future.",
              linkedCategory: "marketing",
            },
            {
              title: "More information",
              description:
                'For any queries in relation to our policy on cookies and your choices, please <a href="mailto:info@digikaveri.com" class="cc-link">contact us</a>.',
            },
          ],
        },
      },
    },
  },
});
