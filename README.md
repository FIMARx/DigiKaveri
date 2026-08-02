# DigiKaveri — Digital Buddy for Everyday IT Support

> **Human-first IT support & computer maintenance designed for seniors, homes, and small businesses.**

[![Live Demo](https://img.shields.io/badge/🌐_Website-digikaveri.com-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white)](https://digikaveri.com/)
[![Deployment](https://img.shields.io/badge/🚀_Status-Deployed_PWA-10B981?style=for-the-badge&logo=githubpages&logoColor=white)](https://digikaveri.com/)
[![Vite](https://img.shields.io/badge/⚡_Engine-Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Locale](https://img.shields.io/badge/🌐_i18n-FI_%7C_EN-3B82F6?style=for-the-badge)](#tech-stack--architecture)
[![Location](https://img.shields.io/badge/📍_Location-Uusimaa%2C_Finland-0057D9?style=for-the-badge)](#about-digikaveri)

---

## About DigiKaveri

Technology should empower people, not confuse them. **DigiKaveri** ("Digital Buddy") bridges the digital divide with clear, jargon-free technical assistance in **Uusimaa, Finland** 🇫🇮 and remote support across all of Finland.

- 🚗 **On-site Home Visits**: Hands-on computer repair, device setup, and home Wi-Fi fixes across Uusimaa.
- ⚡ **Instant Remote Help**: Secure, 1-click TeamViewer remote support nationwide.
- 🏛️ **Tax Savings**: Eligible for Finland's **-60% Kotitalousvähennys** (household tax deduction) on labor.
- 🛡️ **No Fix, No Fee Guarantee**: Zero charges if we cannot solve the technical issue.

---

## Key Features & Experience

### Adaptive OS Auto-Detecting Remote Guide

The remote support hub at [`/etayhteys.html`](https://digikaveri.com/etayhteys.html) (`/en/remote-support.html`) automatically detects the visitor's operating system (Windows, macOS, Android, iOS) on page load and customizes the UI:

- **Smart OS Sniffing**: Displays native TeamViewer download links and OS-specific setup steps automatically.
- **2-Column Mobile Segmented Controls**: Smooth platform switcher designed for touch screens down to 320px width.
- **Interactive Lightbox & Step Media**: Zoomable step-by-step screenshots with keyboard trap accessibility.

### Progressive Web App (PWA) & Offline Cache

- **Instant Service Worker (`sw.js`)**: Caches essential Finnish & English pages, assets, and styling for zero-latency offline browsing.
- **Real-Time Offline Banner**: Floating glass indicator notifies visitors when internet connectivity is dropped or restored.

### Silky Smooth Dark Mode & Native View Transitions

- **View Transitions API**: Seamless, 350ms cross-fade animation when switching between light and dark themes using `document.startViewTransition()`.
- **System Theme Syncing**: Automatically matches visitor OS preferences (`prefers-color-scheme`) with persistent `localStorage` override options.

### Dynamic Price & Distance Estimator

- **Interactive Rate Calculator**: Computes estimated labor costs, tax deduction savings (-60%), and travel fees dynamically.
- **OSRM & Nominatim Distance Routing**: Calculates driving distance and travel costs directly from Espoo coordinates to the visitor's location.

### Real-Time FAQ Search with Live Text Highlighting

- **Instant Search Filter**: Filters questions and answers in real-time as users type.
- **Mark Highlighting**: Highlights matching search queries with `<mark class="faq-highlight">` badges across question titles and answer paragraphs.

### Helsinki Timezone Service Beacon

- **Live Status Indicator**: Dynamically checks Helsinki business hours (09:00–21:00) with fallback polling.
- **Polite Service-Closed Modal**: Accessible focus-trapped dialog alerting visitors outside working hours while offering direct callback scheduling.

---

## Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Engine** | [Vite 6](https://vitejs.dev/) | Lightning-fast static site generation and asset bundling |
| **Templating** | [Handlebars](https://handlebarsjs.com/) | Modular layout architecture with reusable components |
| **Design System** | Vanilla CSS3 | Custom token-based styling system (`variables.css`, `global.css`, `home.css`) |
| **Typography** | Inter & Outfit | Google Fonts imported via `@fontsource` |
| **Icons** | [Lucide Icons](https://lucide.dev/) | Dynamic SVG vector icon system |
| **Privacy & GDPR** | Orest Bida CookieConsent v3 | GDPR Consent Mode v2 compliant cookie manager |

---

## Security, Accessibility & Hardening

- 🔒 **Cloudflare Edge Headers**: `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, and `Permissions-Policy` configured in `public/_headers`.
- ♿ **WCAG 2.1 AA Compliant**: High-contrast focus indicators (`:focus-visible`), skip-to-content links, ARIA roles, and keyboard navigation traps.
- ⚡ **Zero-Lag Preconnections**: Early `preconnect` handshakes with Google Tag Manager, Google Analytics, and Web3Forms APIs.
- 📊 **Structured Data Schema**: Complete `LocalBusiness`, `FAQPage`, and `HowTo` JSON-LD schemas for Search Engine SERP prominence.

---

## Project Structure

```text
DigiKaveri/
├── 📄 index.html               # Finnish Homepage
├── 📄 etayhteys.html           # Finnish Remote Support Hub
├── 📄 tietosuoja.html          # Finnish Privacy Policy
├── 📄 kayttoehdot.html         # Finnish Terms of Service
├── 📄 404.html                 # Finnish 404 Error Page
├── 📁 en/                      # English Pages (index, remote-support, privacy, terms, 404)
├── 📁 src/
│   ├── 📁 partials/            # Shared Handlebars Partials (nav, mobile-nav, header, footer, scripts)
│   ├── 📁 js/                  # Modular Logic (main, contact, estimator, quiz, guide, icons, utils)
│   └── 📁 locales/             # i18n Locales (fi.json, en.json)
├── 📁 css/                     # Tokenized Design System (variables, global, home, guide, legal)
├── 📁 public/                  # Static Assets, Manifest, Service Worker (sw.js), Security Headers (_headers)
├── 📄 vite.config.js           # Handlebars SSG & Build Pipeline Configuration
└── 📄 package.json             # Dependencies & Development Scripts
```

---

## Quick Start & Development

### Prerequisites

- **Node.js 20+** and **npm 10+**

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/FIMARx/DigiKaveri.git
cd DigiKaveri

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open `http://localhost:3000/` in your browser.

### Production Build

```bash
npm run build
```

Generates production-ready static assets in the `dist/` directory.

---

Crafted with ❤️ by **[FIMARx](https://github.com/FIMARx)**

> "Making technology effortless and accessible, one device at a time."
