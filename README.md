# 🐈 Mexican Cat — 3D Web Experiment

<div align="center">

**A small interactive 3D web experiment built around a rigged dancing cat.**

[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![model-viewer](https://img.shields.io/badge/%40google%2Fmodel--viewer-4.x-4285F4?logo=google&logoColor=white)](https://github.com/google/model-viewer)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=111111)](https://developer.mozilla.org/docs/Web/JavaScript)

</div>

---

## 🎯 About

**Mexican Cat** is a fun/experimental web project created to explore the presentation of a 3D animated character directly in the browser.

The experience is intentionally simple: the user presses **Play**, the 3D cat appears, its animation starts, the camera performs a programmed sequence of movements, and background audio plays alongside it.

The project is more of a creative technical experiment than a production application.

> 🐱 The cat model was provided as an existing 3D asset. The hat and maracas were sourced from external asset-store content. The character was rigged and animated for this experiment, and the audio was integrated as part of the final presentation.

---

## ✨ Features

- 🐈 3D cat displayed in the browser with `<model-viewer>`.
- 🎬 Playback of an animation embedded in the GLB model.
- 🎥 Programmatic camera choreography:
  - Initial camera framing.
  - Smooth zoom-in.
  - Two full rotations.
  - Additional controlled camera jitter for an intentionally erratic movement.
- 🔊 Background audio synchronized with the Play interaction.
- ⚡ Lazy loading of the 3D model after user interaction.
- 🖥️ Full-screen presentation with a minimal overlay and Play button.
- 📱 Responsive viewport configuration for browser-based viewing.

---

## 🧩 Technical implementation

The interaction is handled in vanilla JavaScript using the `@google/model-viewer` web component.

The main animation sequence is implemented in `src/main.js` using `requestAnimationFrame`, easing functions, camera orbit manipulation, and procedural sinusoidal motion.

### Camera sequence

```text
Play
  │
  ├── Load GLB
  │
  ├── Set initial camera
  │
  ├── 0s → 2s  ── Smooth zoom
  │
  ├── 3s → 6s  ── 2× rotation + procedural jitter
  │
  ├── Play GLB animation
  │
  └── Play background audio
```

The erratic camera movement does not require an external animation library. It is generated with combinations of sine waves to create smooth, controllable variation in camera target, radius, and roll.

---

## 🛠️ Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Application shell and UI overlay |
| **CSS** | Full-screen presentation and interaction states |
| **JavaScript** | Playback logic, camera choreography and events |
| **Vite 7** | Development server and production build |
| **`@google/model-viewer` 4** | Browser-based GLB rendering and animation playback |
| **GLB** | 3D character asset and animation |
| **MP3** | Background audio |

---

## 📁 Project structure

```text
Mexican_Cat/
├── public/
│   └── assets/
│       ├── mexicancat2.glb
│       └── mexican_cat.mp3
├── src/
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
├── package-lock.json
└── .gitignore
```

### Main files

- `index.html` — Defines the `<model-viewer>`, Play overlay and audio element.
- `src/main.js` — Controls model loading, animation playback, camera movement and audio.
- `src/style.css` — Visual styles for the experience.
- `public/assets/` — Local 3D and audio assets used by the experience.

---

## 🚀 Run locally

From the `Mexican_Cat` directory:

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

### Production build

```bash
npm run build
npm run preview
```

---

## 🎨 Project scope

This project was created as a **creative/experimental exercise** rather than as a commercial product. Its value is mainly in the implementation of a small interactive 3D experience in the browser and the experimentation with animation, camera control, assets and audio.

It is intentionally kept lightweight: there is no backend, database, authentication or complex application architecture.

---

## 👤 Author

**Gael Jiménez**

- GitHub: [@GaelJimenezn](https://github.com/GaelJimenezn)
- Portfolio: coming soon
