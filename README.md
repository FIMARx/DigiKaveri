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

### 🌐 Bilingual (FI / EN)
Full Finnish and English versions of every page, built with a clean **Handlebars SSG** architecture. Language switching is persistent via `localStorage`.

### ⏰ Live Status Beacon
A real-time "Open/Closed" indicator powered by Helsinki timezone logic:
- **Dynamic Pills**: Visual indicators of technician availability
- **Polite Overlays**: Automatic service-closed modals outside business hours (09:00–21:00)

### 💬 Speed Dial FAB
A floating action button (speed dial) providing instant, thumb-friendly access to WhatsApp and direct calling.

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
├── 📁 en/                      # English Version
├── 📁 src/
│   └── 📁 partials/            # Shared Handlebars Components
├── 📁 public/
│   ├── 📁 js/                  # Vanilla Logic Modules
│   ├── 📁 images/              # Premium Assets & Logo
│   └── 📁 svg/                 # Platform & Technical Icons
├── 📁 css/                     # Design System & Source Styles
├── 📄 vite.config.js           # SSG & Handlebars Configuration
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
