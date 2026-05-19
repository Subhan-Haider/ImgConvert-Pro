<div align="center">
  
# 🎨 ImgConvert Pro & 📄 Client-Side PDF Tools

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)](https://webassembly.org/)

**A powerful, premium local-first document workspace for processing images and PDFs entirely inside the browser's virtualized sandbox.**
<br />
*No files are ever uploaded to a server—100% processing in client-side RAM memory with GPU-bound canvas acceleration.*

</div>

---

## 🌟 Premium Features Directory

### 🖼️ Universal Batch Image Converter
* **Comprehensive Format Conversions:** Convert simultaneously between `PNG`, `JPG`, `JPEG`, `WEBP`, `AVIF`, `SVG`, `ICO`, `BMP`, `TIFF`, and `GIF`.
* **Lossless Quality Customizer:** Real-time visual compression sliders with calculated output byte indicators.
* **Canvas Border Padding:** Add aesthetic margins and custom backgrounds using color-pickers without stretching base layouts.
* **Pro Resizing & Aspect Lock:** Scale dimensions via custom pixels or default platforms proportions.
* **Transparency (Alpha Channels):** Preserve background transparenties or fill with custom highlights.
* **Instant ZIP Compilation:** Download entire batch operations instantly via local-first ZIP archives.

### 📄 Advanced PDF Tools Suite
* **Interactive PDF Annotator:** Draw, write, erase, highlight, and adjust stroke vectors on an interactive canvas with undo/redo stacks.
* **Visual Page Organizer:** Rearrange pages, delete pages, rotate single pages visually with an interactive zoom viewer.
* **WASM Offline OCR Engine:** Extract selectable text locally from flat scans using Tesseract Web Worker threads supporting 11+ languages.
* **Calculated PDF Splitter:** Partition documents by specific ranges, extract custom individual lists, or split every N pages.
* **Precise Rotator & Cropper:** Align upside-down scans or crop layout margins dynamically.
* **Dynamic Watermarker:** Stamp custom opacity centered text or tiled repeating copyright patterns utilizing native embedded standard fonts.
* **Adaptive Page Numbers:** Stamp formatted labels (e.g., "Page 1 of 5", "1/5") across 4 distinct margin coordinates.
* **Metadata Editor:** Add or modify PDF indexing properties (Title, Author, Subject, Keywords, Creator, Producer).
* **Grayscale Black & White Converter:** Convert documents to grayscale locally to save ink and improve high-contrast readability.
* **Forms & Widget Flattener:** Flatten editable fields and visual annotations to lock down vector layouts.
* **Office-to-PDF Converter:** Convert documents, text files, and spreadsheets locally.
* **PDF to High-Res Images & Images to PDF:** Dynamic bi-directional conversion pipelines.

---

## 🔒 100% Privacy Promise & Local Sandbox
ImgConvert Pro operates strictly under a local-first browser paradigm.

* **Zero Servers Upload:** Your highly confidential files, images, and metadata reside entirely in volatile RAM inside your current tab's sandbox.
* **Zero Tracking:** The entire application runs fully offline once initially loaded.
* **GDPR, HIPAA & ISO Ready:** Zero storage footprint means zero attack surface, satisfying strict international data-privacy policies.
* **GPU-Bound Speed:** WebAssembly core engines and HTML5 Canvas API deliver lightning-fast processing speeds by bypassing internet queue bottlenecks.

---

## 💻 Tech Stack & Engines
* **Framework:** React 18 with strict TypeScript targets
* **Build Engine:** Vite (Lightning fast HMR & build outputs)
* **Styling:** CSS3 & Tailwind CSS with Glassmorphism variables
* **Icons:** Lucide React
* **PDF Libraries:** 
  * `pdf-lib` for raw byte manipulation, page modifications, and font embedding.
  * `pdf.js` (Mozilla Core) for rendering high-fidelity interactive DOM canvases.
* **OCR engine:** WebAssembly Tesseract OCR Core executing on browser background Web Workers.
* **Local Storage CMS:** Blog metadata editor and post compiler.

---

## 📂 Visual Workspace Structure
```text
Image-Converter-website-main/
├── public/                 # Static assets, fonts, cmaps, and local locales
├── src/
│   ├── components/         # Reusable UI widgets (Navbar, Footer, Card, Button)
│   ├── layouts/            # Main site structure wrapper (MainLayout)
│   ├── pages/              # Main app view sandboxes
│   │   ├── Home.tsx        # Hero Router Landing page
│   │   ├── Converter.tsx   # Batch Image converting engine
│   │   ├── PdfTools.tsx    # PDF Suite & interactive editor
│   │   ├── Features.tsx    # Feature breakdown & compliance grids
│   │   ├── Blog.tsx        # Blog center & local CMS modal
│   │   └── About.tsx       # About page
│   ├── App.tsx             # Route registry
│   ├── index.css           # Global layout variables & typography
│   └── main.tsx            # React virtual DOM bootstrap
├── package.json            # System scripts & dependencies
├── tailwind.config.js      # Custom theme color tokens
└── vite.config.ts          # Vite bundler parameters
```

---

## 🚀 Running Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18+ recommended) installed.

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Subhan-Haider/3-img-exp.git
   cd Image-Converter-website-main
   ```

2. **Install node dependencies:**
   ```bash
   npm install
   ```

3. **Start the local hot-reload dev-server:**
   ```bash
   npm run dev
   ```
   *The application will boot at `http://localhost:5173` (or `http://localhost:5175`).*

4. **Verify TypeScript & compile a production-ready package:**
   ```bash
   npm run build
   ```
   *The optimized static assets will be compiled directly in the `dist` directory.*

---

## 📝 License & Copyright

**Copyright (c) 2026 Subhan Haider. All Rights Reserved.**

This is proprietary software. You may view and fork this repository for personal evaluation, but commercial use, unauthorized distribution, or creating a competing product from this source code is strictly prohibited. See the [LICENSE](LICENSE) file for more details.
