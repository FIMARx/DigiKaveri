<div align="center">

<img src="public/svg/logo.svg" width="200" alt="DigiKaveri Logo" />

# DigiKaveri

### Premium IT Support for Homes & Small Businesses

**The "Digital Buddy" that speaks human — not tech jargon.**

[![🌐 Live Site](https://img.shields.io/badge/🌐_Live_Site-digikaveri.com-0057D9?style=for-the-badge)](https://digikaveri.com/)
[![🚀 Deployment](https://img.shields.io/badge/🚀_Deployed-GitHub_Pages-222?style=for-the-badge&logo=github)](https://github.com/FIMARx/DigiKaveri/actions)
[![⚡ Build](https://img.shields.io/badge/⚡_Build-Vite_5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![📍 Location](https://img.shields.io/badge/📍_Uusimaa-Finland-0057D9?style=for-the-badge)](https://www.google.com/maps/place/Uusimaa)
[![🇫🇮 FI](https://img.shields.io/badge/Language-FI_%2F_EN-white?style=for-the-badge)](#multilingual)

</div>

---

<div align="center">

## 📸 Preview

<img src="public/images/preview.png" width="100%" alt="DigiKaveri Website Preview" />

</div>

---

## 🧭 Mission

Technology should be a tool, not a barrier. **DigiKaveri** ("Digital Buddy") is a human-first IT support service designed especially for everyday users — seniors, home users, and small business owners.

We don't speak jargon. We **listen, explain, and fix** — whether it's your first tablet purchase, a virus on an old PC, or setting up a home Wi-Fi network.

Based in **Uusimaa, Finland** 🇫🇮 — offering fast remote support across all of Finland and in-person visits locally.

---

## ✨ Key Features

### 🧠 Smart Adaptive Remote Guide
The flagship feature of the site. The guide at `/etayhteys.html` automatically **detects the visitor's device** (Windows, macOS, Android, iOS) and presents only the relevant instructions, making it extremely easy for non-technical users to set up a remote support session.

- **Device Detection** — OS sniffed on page load, correct platform pre-selected
- **"Automaattisesti tunnistettu" Badge** — Visual confirmation shown on the detected platform card only
- **Smart Header Collapse** — On mobile, the PC guide section collapses with a friendly dropdown so mobile users aren't overwhelmed
- **Platform Pill Switcher** — Windows/macOS and Android/iOS toggle buttons for manual override
- **Step-by-step Cards** — Numbered vertical steps with TeamViewer download buttons and safety notes
- **Video Tutorials** — Embedded video guides with custom play overlays for Windows (FI & EN)
- **Expandable Manual** — Detailed visual step manuals with zoomable screenshots inside a collapsible accordion

### 🌐 Bilingual (FI / EN)
Full Finnish and English versions of every page, built cleanly with Vite + Handlebars SSG templating. Language switching is instant and persistent via `localStorage`.

### ⏰ Live Status Beacon
A real-time "Open/Closed" indicator powered by `data/status.json` and Helsinki timezone logic:
- Green pill: **"Palvelemme nyt"** when within business hours (09:00–21:00)
- A polite service-closed modal appears automatically outside hours

### 🍪 GDPR-Compliant Cookie Consent
Built with [Cookie Consent by Orest Bida](https://github.com/orestbida/cookieconsent):
- Google Analytics (`G-XL8DBWDDMD`) is loaded **only after explicit user consent**
- Separate consent categories: Necessary / Analytics
- Finnish and English UI

### 💬 Speed Dial FAB
A floating action button (speed dial) in the bottom-right corner provides instant access to:
- 📞 Call via phone
- 💬 WhatsApp chat

### 🏠 Rich Homepage Sections
| Section | Description |
|---|---|
| **Hero** | Status badge, headline, callback form |
| **Palvelut** | Service cards with remote/on-site icons |
| **Hinnasto** | Pricing tiers with feature lists |
| **Tiimi** | Team member profiles |
| **Kokemukset** | Trustpilot-style review widget |
| **FAQ** | Expandable accordion Q&A |
| **Yhteystiedot** | Contact details + callback form |

---

## 🛠️ Service Offerings

| Service | Remote | On-Site | Description |
|:---|:---:|:---:|:---|
| **Purchase Consulting** | ✅ | ✅ | Choosing the right laptop, tablet, or phone |
| **Antivirus & Security** | ✅ | ✅ | Installing protection, removing malware/ads |
| **PC Repair & Troubleshooting** | ✅ | ✅ | Fixing Windows, Mac, and Android issues |
| **Physical Cleaning** | ❌ | ✅ | Dust removal for improved performance |
| **Network & Wi-Fi** | ✅ | ✅ | Router setup and dead zone fixes |
| **Printer & Peripherals** | ✅ | ✅ | Getting printers, scanners and cameras working |
| **Remote Support (TeamViewer)** | ✅ | ❌ | Screen sharing with step-by-step guide on the site |

---

## 💎 Trust & Guarantee

- **100% Satisfaction Guarantee** — If we can't help, you pay nothing. Zero risk.
- **Kotitalousvähennys −60%** — All home visits qualify for the Finnish household tax deduction.

---

## ⚙️ Tech Stack

### Build System
```
Vite 5 (SSG)  +  vite-plugin-handlebars 2.0.0
```

The site is built as a **Static Site Generator** using Vite and Handlebars. This means:
- Partials (`nav`, `footer`, `header`, `scripts`) are shared across all pages via `.hbs` templates
- Page-specific metadata (title, canonical URL, language data) is injected at **build time**
- The final `dist/` folder contains pure HTML — no runtime JS framework overhead

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5 + Handlebars** | Templated markup, built by Vite |
| **Vanilla CSS** | Custom design system (no Tailwind/Bootstrap) |
| **Vanilla JavaScript** | All interactivity — guide logic, navigation, modals |
| **Lucide Icons** | SVG icon set loaded via CDN |
| **AOS.js** | Scroll-triggered fade/slide animations |
| **Cookie Consent** | GDPR-compliant consent management |

### Hosting & Deployment
| Technology | Purpose |
|---|---|
| **GitHub Pages** | Static hosting |
| **GitHub Actions** | CI/CD pipeline (auto-deploy on push to `main`) |
| **Custom Domain** | `digikaveri.com` via CNAME |

### SEO & Analytics
| Technology | Purpose |
|---|---|
| **Google Analytics 4** | `G-XL8DBWDDMD` — consent-gated |
| **Schema.org JSON-LD** | `ComputerStore` structured data on all pages |
| **Sitemap XML** | All FI & EN pages listed with priorities |
| **Hreflang tags** | FI/EN alternate tags on all pages |
| **Canonical URLs** | Correctly set per page |

---

## 📁 Project Structure

```
DigiKaveri/
├── 📄 index.html               # FI Homepage
├── 📄 etayhteys.html           # FI Remote Support Guide
├── 📄 tietosuoja.html          # FI Privacy Policy
├── 📄 kayttoehdot.html         # FI Terms of Service
├── 📄 404.html                 # Error page
│
├── 📁 en/                      # English versions
│   ├── index.html
│   ├── remote-support.html
│   ├── privacy-policy.html
│   ├── terms-of-service.html
│   └── 404.html
│
├── 📁 src/partials/            # Handlebars partials (Vite SSG)
│   ├── nav.hbs
│   ├── mobile-nav.hbs
│   ├── header.hbs
│   ├── footer.hbs
│   └── scripts.hbs
│
├── 📁 public/                  # Static assets (copied as-is to dist/)
│   ├── 📁 js/                  # All JavaScript
│   │   ├── main.js             # Core site logic, status check, FAB
│   │   ├── guide.js            # Smart Adaptive Guide logic
│   │   ├── accessibility.js    # Accessibility button
│   │   ├── cookieconsent-config.js
│   │   ├── contact.js
│   │   ├── legal.js
│   │   └── status.js
│   ├── 📁 svg/                 # Logo, platform icons
│   ├── 📁 images/              # General images
│   ├── 📁 videos/              # PC guide tutorial videos
│   │   └── pc guide/
│   │       ├── Win guide FI.mp4
│   │       └── Win guide EN.mp4
│   ├── 📁 data/
│   │   └── status.json         # Live status beacon data
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
│
├── 📁 css/                     # Source stylesheets
│   ├── global.css
│   ├── home.css
│   ├── guide.css
│   └── legal.css
│
├── 📁 .github/workflows/
│   └── static.yml              # GitHub Actions deployment
│
├── 📄 vite.config.js           # Vite SSG + Handlebars config
├── 📄 package.json
└── 📄 .gitignore
```

---

## 🚀 Running Locally

### Prerequisites
- [Node.js 20+](https://nodejs.org/)

### Setup
```bash
# 1. Clone the repository
git clone https://github.com/FIMARx/DigiKaveri.git
cd DigiKaveri

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start the dev server
npm run dev
# → Opens at http://localhost:5173
```

### Build for Production
```bash
npm run build
# → Output in dist/
```

---

## 🔄 CI/CD Pipeline

Every push to `main` triggers the GitHub Actions workflow:

```
Push to main
    └── actions/checkout@v6
    └── actions/setup-node@v6  (Node 24)
    └── npm install --legacy-peer-deps
    └── npm run build  →  dist/
    └── actions/upload-pages-artifact@v3
    └── actions/deploy-pages@v5
         └── Live at digikaveri.com ✅
```

---

## 📋 Pages & Routes

| Path | Page | Language |
|---|---|---|
| `/` | Homepage | 🇫🇮 Finnish |
| `/etayhteys.html` | Remote Support Guide | 🇫🇮 Finnish |
| `/tietosuoja.html` | Privacy Policy | 🇫🇮 Finnish |
| `/kayttoehdot.html` | Terms of Service | 🇫🇮 Finnish |
| `/en/` | Homepage | 🇬🇧 English |
| `/en/remote-support.html` | Remote Support Guide | 🇬🇧 English |
| `/en/privacy-policy.html` | Privacy Policy | 🇬🇧 English |
| `/en/terms-of-service.html` | Terms of Service | 🇬🇧 English |
| `/data/status.json` | Live status data | — |
| `/sitemap.xml` | Search engine sitemap | — |
| `/robots.txt` | Crawler directives | — |

---

<div align="center">

---

_Built with ❤️ by [FIMARx](https://github.com/FIMARx)_

_"Making technology accessible, one device at a time."_

</div>
