# Tech Yuva — Official Web Ecosystem

<p align="center">
  <img src="public/assets/logo.jpg" alt="Tech Yuva Logo" width="120" style="border-radius: 50%; box-shadow: 0 0 24px rgba(231, 76, 60, 0.4);" />
</p>

<p align="center">
  <strong>Where Youth Meet to Build Future Tech</strong><br />
  A modern, high-performance web platform built with Next.js 14, React 18, TypeScript, GSAP, and OGL WebGL.
</p>

<p align="center">
  <a href="https://www.techyuva.org/">Website</a> •
  <a href="https://unstop.com/hackathons/drophack-siec-community-1701822">DropHack'26</a> •
  <a href="https://www.linkedin.com/in/techyuva/">LinkedIn</a> •
  <a href="https://www.instagram.com/techyuva_">Instagram</a> •
  <a href="mailto:techyuva.org@gmail.com">Contact</a>
</p>

---

## 🌟 Overview

**Tech Yuva** is a student-led innovation guild based in New Delhi NCR, empowering the next generation of builders through AI, Web3, production systems, and startup culture. 

Rather than theoretical tutorials, Tech Yuva focuses on **deploying alongside** young engineers:
- **Zero fees:** 100% free access for accepted builder cohorts.
- **Production engineering:** Real systems, scalable architectures, cloud credits, and live deployments.
- **Vibrant builder community:** 500+ active members across hackathons, bootcamps, and incubation pipelines.

This repository contains the complete frontend web application, migrated from a vanilla HTML/CSS/JavaScript codebase into a production-ready, performant **React + Next.js (App Router)** platform.

---

## 🚀 Key Features & Experiences

### 1. 🎬 Cinematic Scroll-Driven Canvas Sequence
- Seamless frame-by-frame animation utilizing **270 high-resolution frames** (`/assets/frames/001.png` - `270.png`).
- Scrubbed via **GSAP ScrollTrigger** across a 450vh container with sticky 100vh canvas.
- Responsive object-fit cover rendering with dynamic device-pixel-ratio scaling for mobile performance.
- 5 synchronized narrative phases with staggered typography transitions.
- Full `prefers-reduced-motion` compliance falling back to static poster view.

### 2. 🌀 3D WebGL Circular Ecosystem Gallery
- Interactive cylindrical carousel built with **OGL** (lightweight WebGL library).
- Custom vertex and fragment shaders for cylindrical bending curvature and rounded SDF corners.
- Interactive mouse drag and touch gestures with inertial physics and infinite circular looping.
- Dynamic text textures rendered directly onto 3D planes.
- Integrated "Reset View" control.

### 3. 🛡️ Glassmorphism Floating Pill Navbar
- Floating navigation bar with dynamic backdrop blur (`blur(28px) saturate(180%)`).
- Real-time scroll state detection (`.scrolled` compression).
- Active section highlighting (scroll spy) matching `#hero`, `#intro`, `#pillars`, `#showcase`, `#hackathon`, `#founder`, and `#join`.
- Mobile drawer menu with body scroll locking and smooth scrolling anchor links.

### 4. ⚡ Interactive 3D Perspective Tilt & Reveal Animations
- Interactive mouse-tracking 3D tilt across the **5 Pillars** cards (`rotateX` / `rotateY` perspective calculations).
- Global `IntersectionObserver` orchestrating staggered `.reveal-up` and `.reveal-text` entrance animations.
- Milestone counter animations with quartic easing (`500+`, `20+`, `80+`, `1000+`).

### 5. 🏆 DropHack'26 Community Hackathon Showcase
- Showcase for DropHack'26 (SIEC × Tech Yuva Community Partner).
- Complete competition metadata: 10 Hours Offline, ₹50,000+ Prize Pool, 2–4 Team Size, 5 Technical Themes (FinTech, AI, Web3, Cybersecurity, Healthcare).
- Direct registration integration with Unstop.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components) |
| **Library** | [React 18](https://react.dev/) + TypeScript |
| **Styling** | Vanilla CSS with Design System Tokens (`app/globals.css`) |
| **Animation Engine** | [GSAP 3](https://greensock.com/gsap/) + [ScrollTrigger](https://greensock.com/scrolltrigger/) |
| **3D & WebGL** | [OGL](https://github.com/oframe/ogl) (Minimal WebGL library) |
| **Typography** | Google Fonts ([Outfit](https://fonts.google.com/specimen/Outfit), [Inter](https://fonts.google.com/specimen/Inter), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)) |
| **Tooling & Build** | Node.js, npm, TypeScript compiler (`tsc`) |

---

## 📂 Project Directory Structure

```text
tech_yuva/
├── app/
│   ├── globals.css         # Complete design system tokens, layout & animations
│   ├── layout.tsx          # Root layout, Google Fonts, and Next.js SEO metadata
│   └── page.tsx            # Main page assembling all ecosystem sections
├── components/
│   ├── CircularGallery.tsx # 3D WebGL cylindrical carousel component (OGL)
│   ├── Cta.tsx             # Community action card & WhatsApp join link
│   ├── Events.tsx          # DropHack'26 hackathon showcase
│   ├── Footer.tsx          # 4-column navigation grid & guild footer
│   ├── Founder.tsx         # Leadership card for founder Lakshay Soni
│   ├── HeroSequence.tsx    # 270-frame canvas scroll sequence with GSAP
│   ├── Impact.tsx          # Viewport-animated milestone statistics
│   ├── Intro.tsx           # Editorial typography & guild overview
│   ├── Navbar.tsx          # Floating glass pill navbar & responsive drawer
│   ├── Pathway.tsx         # 5-step builder journey timeline
│   ├── Pillars.tsx         # 5 ecosystem cards with 3D mouse tilt
│   └── ScrollReveal.tsx    # Viewport IntersectionObserver & smooth scroll
├── public/
│   └── assets/
│       ├── drophack.png
│       ├── flashcard1.png
│       ├── flashcard2.png
│       ├── flashcard3.png
│       ├── founder.jpg
│       ├── logo.jpg
│       └── frames/         # 270 sequence PNG frames (001.png - 270.png)
├── tech_yuva/
│   ├── design.md           # Design system guidance & WCAG AA standards
│   └── skills.md           # Ecosystem skills specification
├── next.config.js          # Next.js build configuration (unoptimized images)
├── package.json            # Project dependencies and script runner
├── tsconfig.json           # TypeScript configuration
├── types.d.ts              # Ambient type declarations for OGL
└── README.md               # Project documentation
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js:** `v18.17.0` or later (tested on Node `v24.x`)
- **npm:** `v9.x` or later (tested on npm `v11.x`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HarryInData/Tech_Yuva.git
   cd Tech_Yuva
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

To create an optimized production build:
```bash
npm run build
```

To run the production server locally:
```bash
npm start
```

---

## 🎨 Design System & Tokens

The platform uses a dark, futuristic aesthetic centered around **Black, Deep Red, Saffron, Green, and Warm White**:

```css
:root {
    --black: #050505;
    --black-warm: #0a0404;
    --black-card: #0f0808;
    --red: #c0392b;
    --red-light: #e74c3c;
    --crimson: #dc143c;
    --white: #f5f0ed;
    --saffron: #FF9933;
    --green: #00c853;
    --font: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Accessibility Standards
- Contrast compliant with **WCAG 2.2 AA**.
- Respects system accessibility setting for `prefers-reduced-motion`.
- Full keyboard navigation and visible focus rings.

---

## 🤝 Community & Connect

- **Official Website:** [https://www.techyuva.org/](https://www.techyuva.org/)
- **Events & Registration:** [DropHack'26 on Unstop](https://unstop.com/hackathons/drophack-siec-community-1701822)
- **LinkedIn:** [Tech Yuva](https://www.linkedin.com/in/techyuva/)
- **Instagram:** [@techyuva_](https://www.instagram.com/techyuva_)
- **Email:** [techyuva.org@gmail.com](mailto:techyuva.org@gmail.com)

---

## 📄 License & Credits

- © 2026 **Tech Yuva** — Guild Council. All rights reserved.
- Built with ❤️ by Harry & the Tech Yuva builder community.
