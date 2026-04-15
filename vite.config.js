import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';

const fi_data = {
  lang: 'fi',
  base: '/',
  base_fi: '/',
  base_en: '/en/',
  nav_home: 'Etusivu',
  nav_services: 'Palvelut',
  nav_remote: 'Etätuki',
  nav_pricing: 'Hinnasto',
  nav_team: 'Tiimi',
  nav_privacy: 'Tietosuoja',
  nav_terms: 'Käyttöehdot',
  nav_contact: 'Yhteystiedot',
  nav_pc_guide: 'PC-ohjeet',
  nav_mobile_guide: 'Mobiili-ohjeet',
  nav_call: 'Soita meille',
  etätuki_url: 'etayhteys.html',
  privacy_url: 'tietosuoja.html',
  terms_url: 'kayttoehdot.html',
  footer_desc: 'Luotettava kodin ja pienyritysten IT-tuki Uudellamaalla ja etänä koko Suomeen.',
  footer_links_title: 'Pikalinkit',
  footer_contact_title: 'Yhteystiedot',
  footer_rights: 'Kaikki oikeudet pidätetään.',
  modal_closed_title: 'Palvelumme on tällä hetkellä suljettu',
  modal_closed_desc: 'Palvelemme arkisin ja viikonloppuisin klo 09:00–21:00. Voit kuitenkin jättää soittopyynnön, niin otamme sinuun yhteyttä heti huomenna!',
  modal_call_btn: 'Jätä soittopyyntö',
  modal_ok_btn: 'Selvä, ymmärrän'
};

const en_data = {
  lang: 'en',
  base: '../',
  base_fi: '../',
  base_en: './',
  nav_home: 'Home',
  nav_services: 'Services',
  nav_remote: 'Remote Support',
  nav_pricing: 'Pricing',
  nav_team: 'Team',
  nav_privacy: 'Privacy Policy',
  nav_terms: 'Terms of Service',
  nav_contact: 'Contact',
  nav_pc_guide: 'PC Guide',
  nav_mobile_guide: 'Mobile Guide',
  nav_call: 'Call us',
  etätuki_url: 'remote-support.html',
  privacy_url: 'privacy-policy.html',
  terms_url: 'terms-of-service.html',
  footer_desc: 'Reliable IT support for homes and small businesses in Uusimaa and remotely across Finland.',
  footer_links_title: 'Quick Links',
  footer_contact_title: 'Contact Info',
  footer_rights: 'All rights reserved.',
  modal_closed_title: 'Our service is currently closed',
  modal_closed_desc: 'We serve on weekdays and weekends from 09:00 to 21:00. However, you can leave a callback request and we will contact you tomorrow!',
  modal_call_btn: 'Request a callback',
  modal_ok_btn: 'Got it'
};

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src/partials'),
      context(pagePath) {
        const isEn = pagePath.includes('/en/');
        const data = isEn ? { ...en_data } : { ...fi_data };
        
        // Page specific active state
        if (pagePath.endsWith('index.html')) data.active = 'home';
        else if (pagePath.includes('etayhteys.html') || pagePath.includes('remote-support.html')) data.active = 'remote';
        else if (pagePath.includes('tietosuoja.html') || pagePath.includes('privacy-policy.html')) data.active = 'privacy';
        else if (pagePath.includes('kayttoehdot.html') || pagePath.includes('terms-of-service.html')) data.active = 'terms';
        
        // Page paths for lang switcher
        if (pagePath.endsWith('index.html')) {
          data.current_page_fi = 'index.html';
          data.current_page_en = 'index.html';
        } else if (pagePath.includes('etayhteys.html') || pagePath.includes('remote-support.html')) {
          data.current_page_fi = 'etayhteys.html';
          data.current_page_en = 'remote-support.html';
        } else if (pagePath.includes('tietosuoja.html') || pagePath.includes('privacy-policy.html')) {
          data.current_page_fi = 'tietosuoja.html';
          data.current_page_en = 'privacy-policy.html';
        } else if (pagePath.includes('kayttoehdot.html') || pagePath.includes('terms-of-service.html')) {
          data.current_page_fi = 'kayttoehdot.html';
          data.current_page_en = 'terms-of-service.html';
        }

        return data;
      },
      helpers: {
        if_eq: (a, b, options) => {
          if (a === b) return options.fn(this);
          return options.inverse(this);
        }
      }
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        etayhteys: resolve(__dirname, 'etayhteys.html'),
        tietosuoja: resolve(__dirname, 'tietosuoja.html'),
        kayttoehdot: resolve(__dirname, 'kayttoehdot.html'),
        en_index: resolve(__dirname, 'en/index.html'),
        en_remote: resolve(__dirname, 'en/remote-support.html'),
        en_privacy: resolve(__dirname, 'en/privacy-policy.html'),
        en_terms: resolve(__dirname, 'en/terms-of-service.html'),
        error404: resolve(__dirname, '404.html'),
        en_error404: resolve(__dirname, 'en/404.html'),
      }
    }
  }
});
