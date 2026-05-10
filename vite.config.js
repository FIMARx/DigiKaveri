import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readdirSync, statSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fi_data = JSON.parse(readFileSync(resolve(__dirname, 'src/locales/fi.json'), 'utf-8'));
const en_data = JSON.parse(readFileSync(resolve(__dirname, 'src/locales/en.json'), 'utf-8'));

/**
 * Bulletproof helper: Automatically finds all HTML files in the project
 * so you never have to manually add them to the config again.
 */
function getHtmlEntries(dir, fileList = {}) {
  const items = readdirSync(dir);
  items.forEach(item => {
    const fullPath = resolve(dir, item);
    if (statSync(fullPath).isDirectory()) {
      // Skip system/build folders
      if (item !== 'node_modules' && item !== 'dist' && item !== 'src' && item !== 'public' && !item.startsWith('.')) {
        getHtmlEntries(fullPath, fileList);
      }
    } else if (item.endsWith('.html')) {
      // Create a unique key for Rollup (e.g., 'en_index' for 'en/index.html')
      const relativePath = fullPath.replace(__dirname, '').replace(/^[\\\/]/, '').replace(/\\/g, '/');
      const name = relativePath.replace(/\.html$/, '').replace(/\//g, '_');
      fileList[name || 'main'] = fullPath;
    }
  });
  return fileList;
}

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
        if_eq: function(a, b, options) {
          if (a === b) return options.fn(this);
          return options.inverse(this);
        }
      }
    }),
    /**
     * Bulletproof Plugin: Chunk Recovery
     * Detects when a script fails to load (404) and automatically reloads the page.
     * This fixes the "out of sync" error when a new version is deployed.
     */
    {
      name: 'chunk-recovery',
      transformIndexHtml(html) {
        return html.replace(
          '</head>',
          `  <script>
    window.addEventListener('vite:preloadError', (event) => {
      console.warn('Chunk load failed! Attempting recovery refresh...', event.payload);
      window.location.reload();
    });
  </script>
</head>`
        );
      }
    },
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

        // Remove CSS files from dist/assets after inlining
        for (const key of Object.keys(cssAssets)) {
          delete bundle[key];
        }
      }
    }
  ],
  build: {
    minify: 'esbuild',
    cssCodeSplit: false,
    modulePreload: true,
    emptyOutDir: true,
    // Enable manifest for better asset tracking and debugging
    manifest: true,
    rollupOptions: {
      input: {
        // Automatically find all HTML files
        ...getHtmlEntries(__dirname),
        
        // Core JS Entry Points (Named for predictability)
        main_app: resolve(__dirname, 'src/js/main.js'),
        contact_app: resolve(__dirname, 'src/js/contact.js'),
        accessibility_app: resolve(__dirname, 'src/js/accessibility.js'),
        cookie_app: resolve(__dirname, 'src/js/cookieconsent-config.js'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
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
