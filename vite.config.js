import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fi_data = JSON.parse(readFileSync(resolve(__dirname, 'src/locales/fi.json'), 'utf-8'));
const en_data = JSON.parse(readFileSync(resolve(__dirname, 'src/locales/en.json'), 'utf-8'));

export default defineConfig({
  base: '/',
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
        // Must be a regular function (not arrow) so `this` is the Handlebars template context
        if_eq: function(a, b, options) {
          if (a === b) return options.fn(this);
          return options.inverse(this);
        }
      }
    }),
    {
      name: 'inline-css',
      enforce: 'post',
      generateBundle(options, bundle) {
        const cssAssets = {};
        for (const [key, value] of Object.entries(bundle)) {
          if (key.endsWith('.css')) {
            cssAssets[key] = value.source;
          }
        }

        for (const [key, value] of Object.entries(bundle)) {
          if (key.endsWith('.html')) {
            let html = value.source;
            html = html.replace(/<link rel="stylesheet"([^>]+)href="([^"]+)"([^>]*)>/g, (match, pre, href, post) => {
              // Extract the filename from the href (e.g., /assets/style-hash.css -> style-hash.css)
              const fileName = href.split('/').pop();
              const assetKey = Object.keys(cssAssets).find(k => k.endsWith(fileName));
              
              if (assetKey) {
                return `<style>${cssAssets[assetKey]}</style>`;
              }
              return match;
            });
            value.source = html;
          }
        }

        // Bug 6 fix: Remove orphaned CSS files from the bundle after inlining.
        // Without this, the CSS is both inlined AND emitted as a dead file in dist/assets/.
        for (const key of Object.keys(cssAssets)) {
          delete bundle[key];
        }
      }
    }
  ],
  build: {
    minify: 'esbuild',
    cssCodeSplit: false,
    modulePreload: false,
    emptyOutDir: true,
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
      },
      output: {
        // Bug 1+2 fix: Use [name] so each entry point (main, etayhteys, en_index, etc.) gets
        // its own predictably-named JS file, preventing hash ambiguity across 10 entry points.
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/chunk-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          // 'vendor': all node_modules (lucide icons, fonts) into one cacheable bundle
          if (id.includes('node_modules')) return 'vendor';
          // 'app-core': merge icons.js + utils.js so they don't emit as tiny separate chunks.
          // Name must NOT be 'main' — that collides with the entryFileNames [name] for index.html.
          if (id.includes('src/js/icons') || id.includes('src/js/utils')) return 'app-core';
        }
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
  }
});
