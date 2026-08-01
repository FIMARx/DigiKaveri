<div align="center">

<img src="public/images/logo.png" width="220" alt="DigiKaveri Logo" />

# DigiKaveri

### Premium IT Support for Homes & Small Businesses

**The "Digital Buddy" that speaks human — not tech jargon.**

[![🌐 Live Site](https://img.shields.io/badge/🌐_Live_Site-digikaveri.com-0057D9?style=for-the-badge)](https://digikaveri.com/)
[![🚀 Deployment](https://img.shields.io/badge/🚀_Deployed-GitHub_Pages-222?style=for-the-badge&logo=github)](https://github.com/FIMARx/DigiKaveri/actions)
[![⚡ Build](https://img.shields.io/badge/⚡_Build-Vite_6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![📍 Location](https://img.shields.io/badge/📍_Uusimaa-Finland-0057D9?style=for-the-badge)](https://www.google.com/maps/place/Uusimaa)
[![🇫🇮 FI](https://img.shields.io/badge/Language-FI_%2F_EN-white?style=for-the-badge)](#-bilingual-fi--en)

</div>



## 🧭 Mission

Technology should be a tool, not a barrier. **DigiKaveri** ("Digital Buddy") is a human-first IT support service designed especially for everyday users — seniors, home users, and small business owners.

We don't speak jargon. We **listen, explain, and fix** — whether it's your first tablet purchase, a virus on an old PC, or setting up a home Wi-Fi network.

Based in **Uusimaa, Finland** 🇫🇮 — offering fast remote support across all of Finland and in-person visits locally.

---

## ✨ Core Features

### 🧠 Smart Adaptive Remote Guide
The flagship feature of the platform. The guide at `/etayhteys.html` automatically **detects the visitor's device** (Windows, macOS, Android, iOS) and presents only the relevant instructions.

- **OS Auto-Detection** — Platform sniffed on page load for instant guidance
- **Smart Header Collapse** — Tailored UI that hides irrelevant platform data on mobile
- **Step-by-step Visuals** — Numbered vertical steps with zoomable screenshots
- **Safety First** — Built-in security notes about TeamViewer session encryption

### 📲 Progressive Web App (PWA)
Full PWA capabilities enabling users to install the website as a native application on Android, iOS, and desktop:
- **Offline Caching** — Caches core pages (FI & EN) so they load instantly even without an active internet connection.
- **Immediate Activation** — Service worker utilizes `skipWaiting` and `clients.claim` lifecycles to deploy hotfixes instantly to all tabs.
- **Brand Aligned Manifest** — Seamlessly integrates with mobile operating systems using maskable launcher icons and theme-matched startup screens.

### ✍️ Resilient troubleshooter form
- **Form Persistence** — Employs `sessionStorage` to preserve troubleshooter selection choices so users don't lose progress on reload.
- **Noscript Fallback** — Progressive enhancement styling displays all steps at once when JavaScript is inactive, enabling full access.

### 🎨 Themed Layouts & Dynamic Color Syncing
- **Real-Time OS Theme Syncing** — Watches system-level preferences and changes dynamically (e.g., auto dark-mode schedules) unless manually overridden.
- **Visual Color Highlights** — Color-codes solution grids and process steps using vibrant, accessible color schemes.

### 🌐 Bilingual (FI / EN)
Full Finnish and English versions of every page, built with a clean **Handlebars SSG** architecture. Language switching is persistent via `localStorage`.

### ⏰ Live Status Beacon
A real-time "Open/Closed" indicator powered by Helsinki timezone logic:
- **Dynamic Pills**: Visual indicators of technician availability
- **Polite Overlays**: Automatic service-closed modals outside business hours (09:00–21:00)

### 🔍 Live FAQ Search & Yellow Text Highlighting
- **Real-Time Text Matching** — Live search bar filters questions and answers as users type.
- **Yellow Highlight Badges** — Wraps matching query words in `<mark class="faq-highlight">` yellow highlights in both questions and expanded answers.
- **Auto-Expansion** — Matching FAQ items automatically expand so users instantly view relevant answers.

### 📱 2-Column Mobile Segmented Controls
- Native-style 2-column Segmented Controls for platform switchers (`Windows` | `macOS` and `Android` | `iOS`) that fit screens down to 320px (iPhone SE) without layout wrapping or vertical distortion.

### 📡 Offline Status Banner Indicator
- Non-intrusive floating glass status pill (`"Olet offline-tilassa — selaat välimuistiversiota"`) alerting users when connection drops or restores.

### 💬 Speed Dial FAB
A floating action button (speed dial) providing instant, thumb-friendly access to WhatsApp and direct calling with staggered popout animations and WCAG keyboard accessibility.

---

## 💎 Titanium Hardening & Engineering

The platform has been "Titanium-Hardened" to meet production-grade standards for performance, privacy, accessibility, and security.

- **Advanced Network Resilience**: Implemented `isFetchingStatus` locks and `AbortController` integration to prevent race conditions and redundant network polling.
- **Early-Handshake Preconnections**: Upgraded connections to Web3Forms, Google Tag Manager, and Google Analytics to `preconnect` with `crossorigin`, eliminating DNS/TCP/TLS handshake lag.
- **Cloudflare Edge Security Headers**: Configured `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, and `Permissions-Policy` in `public/_headers`.
- **Google Search Rich Snippets**: Integrated structured `FAQPage`, `HowTo`, and `LocalBusiness` JSON-LD schemas across FI & EN pages for Google Search SERP prominence.
- **Instant GA4 & Consent Mode v2**: Instant initialization of `window.gtag` and `window.dataLayer` with default `denied` consent states, updating dynamically upon GDPR consent acceptance.
- **Ultra-Mobile Responsiveness (200px – 320px)**: Dedicated `@media` layout scaling for small screens with isolated table scroll containers.
- **Cache Invalidation & SW Safeguards**: 
  - Integrated automated cache purging during the Service Worker activation phase to delete old caches.
  - Implemented `Cache-Control: no-cache, no-store, must-revalidate` header rules for `sw.js` in Cloudflare headers.
- **Universal Accessibility (WCAG)**:
  - High-precision focus traps and `:focus-visible` ring outlines.
  - Dynamic `aria-expanded`, `aria-current`, and `aria-hidden` synchronization across all UI components.
- **Performance Engineering**:
  - Sub-2 second production builds.
  - 30-second throttled polling to preserve user battery.
  - Visibility-aware status checks (stops polling when tab is inactive).

---

## 🛠️ Service Portfolio

| Service | Remote | On-Site | Description |
|:---|:---:|:---:|:---|
| **Purchase Consulting** | ✅ | ✅ | Choosing the right laptop, tablet, or phone |
| **Antivirus & Security** | ✅ | ✅ | Installing protection, removing malware/ads |
| **PC Repair & Troubleshooting** | ✅ | ✅ | Fixing Windows, Mac, and Android issues |
| **Physical Cleaning** | ❌ | ✅ | Dust removal and thermal paste maintenance |
| **Network & Wi-Fi** | ✅ | ✅ | Router setup and dead zone fixes |
| **Remote Support** | ✅ | ❌ | Instant screen sharing via TeamViewer |

---

## ⚙️ Tech Stack

### Architecture
- **Engine**: [Vite 6](https://vitejs.dev/) (Static Site Generation)
- **Templating**: [Handlebars](https://handlebarsjs.com/) with shared partials
- **Styling**: Vanilla CSS with a custom-built Design System
- **Performance**: Optimized asset pipeline with sub-2s build times

### Frontend Excellence
- **Typography**: Inter & Outfit via `@fontsource`
- **Icons**: [Lucide Icons](https://lucide.dev/) (Dynamic SVG injection)
- **Animations**: [AOS.js](https://michalsnik.github.io/aos/) (Scroll-triggered transitions)
- **Compliance**: GDPR-compliant Cookie Consent (Orest Bida)

---

## 📁 Directory Structure

```text
DigiKaveri/
├── 📄 index.html               # FI Homepage
├── 📄 etayhteys.html           # FI Remote Support Guide
├── 📄 kayttoehdot.html         # FI Terms of Service
├── 📄 tietosuoja.html          # FI Privacy Policy
├── 📄 404.html                 # FI 404 Page
├── 📁 en/                      # English Pages (index, remote-support, legal, 404)
├── 📁 src/
│   ├── 📁 partials/            # Shared Handlebars Components (nav, mobile-nav, header, footer, scripts)
│   ├── 📁 js/                  # Vanilla Logic Modules (main, contact, estimator, quiz, cookieconsent)
│   └── 📁 locales/             # i18n Data Maps (fi.json, en.json)
├── 📁 public/
│   ├── 📄 _headers             # Cloudflare Pages Edge Security & Cache Headers
│   ├── 📄 sw.js                # Service Worker for PWA Offline Caching
│   ├── 📁 images/              # Premium Assets & Logo
│   └── 📁 svg/                 # Platform & Technical Icons
├── 📁 css/                     # Design System & Source Styles (global, home, guide, legal, variables)
├── 📄 vite.config.js           # SSG & Handlebars Build Configuration
└── 📄 package.json             # Modern Dependency Management
```

---

## 🚀 Development Workflow

### Prerequisites
- [Node.js 22+](https://nodejs.org/)

### Quick Start
```bash
# 1. Clone & Enter
git clone https://github.com/FIMARx/DigiKaveri.git && cd DigiKaveri

# 2. Install
npm install

# 3. Launch
npm run dev
```

### Production Build
```bash
npm run build
# Output ready in /dist
```

---

<div align="center">

_Built with ❤️ by [FIMARx](https://github.com/FIMARx)_

_"Making technology accessible, one device at a time."_

</div>
