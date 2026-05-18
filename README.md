<div align="center">
  
# 🎨 Image Converter Pro & 📄 Client-Side PDF Tools

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PDF-Lib](https://img.shields.io/badge/PDF--Lib-FF4B4B?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://pdf-lib.js.org/)

**A powerful, premium web application for processing images and PDF documents entirely in your browser.**
<br />
*No files are ever uploaded to a server—everything runs locally using modern Web APIs.*

</div>

---

## 🌟 Key Features

### 🖼️ Image Processing (Converter)
* **Format Conversion**: Convert seamlessly between `WebP`, `PNG`, `JPEG`, `GIF`, `BMP`, and `ICO`.
* **Smart Compression**: Compress images with interactive quality sliders to save disk space without noticeable visual loss.
* **Resizing Engine**: Precisely resize images by absolute width and height while preserving original aspect ratios.
* **Rounded Corners**: Add beautifully rounded borders and corners to any image before downloading.
* **Batch Support**: Drag and drop multiple images at once for rapid editing.

### 📄 Document Processing (PDF Tools)
* **Advanced Page Management**: Full control over your document's structure:
  * **Merge PDFs**: Combine multiple documents into one.
  * **Split & Extract**: Pull specific pages out of a PDF into a new document.
  * **Reorder Pages**: Visually drag and drop pages into any order.
  * **Rotate Pages**: Fix upside-down pages with a single click.
  * **Delete Pages**: Remove unwanted pages instantly.
* **Basic Editor (Upcoming)**:
  * **Add text**: Type directly onto the document.
  * **Add images**: Stamp images or logos onto pages.
  * **Draw tool**: Freehand drawing and markup.
  * **Highlight text**: Emphasize important sections.
  * **Add shapes/arrows**: Draw rectangles, circles, and directional arrows.
  * **Add signature**: Sign documents digitally.
  * **Whiteout/erase**: Mask out sensitive content visually.
* **PDF to Images**: Extract pages from your PDF documents into high-resolution (300 DPI equivalent) PNG or JPEG images.
* **Images to PDF**: Compile multiple images into a standardized PDF format (`A4`, `Letter`, or `Fit-to-image`).
* **Compress PDF**: Reduce PDF file sizes significantly with `Low`, `Medium`, `High`, or `Quality-Preserving` compression modes.
* **Native Sharing**: Share compiled documents and extracted images directly to WhatsApp, Gmail, or other OS applications using the native Web Share API.

---

## 🔒 100% Privacy Promise & Architecture
This entire suite of tools is designed to execute completely locally within the browser's virtualized sandbox via JavaScript and WebAssembly. 

* **Zero Uploads**: Unlike traditional converters, no files, images, or metadata ever touch an external server.
* **Zero Tracking**: Completely offline-capable processing after the initial page load.
* **Highly Secure**: Ideal for confidential business documents, personal IDs, and private photography.
* **Blazing Fast**: Because there are no network upload/download bottlenecks, conversions happen instantly using your device's CPU and RAM.

---

## 🚀 Tech Stack & Engines

* **Frontend Framework**: React 18 with TypeScript
* **Build Tool**: Vite (Lightning fast HMR)
* **Styling**: Tailwind CSS with custom Glassmorphism UI elements
* **Icons**: Lucide React
* **PDF Engine**: 
  * `pdf-lib` for reading, writing, and merging raw PDF bytes losslessly.
  * `pdf.js` (Mozilla) for rendering PDF pages to interactive DOM canvases.
* **Image Engine**: Native HTML5 `<canvas>` API for high-performance pixel manipulation and compression.

---

## 📂 Project Structure

```text
Image-or-PDF-tool/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components (Navbar, Footer)
│   ├── pages/              # Main application views
│   │   ├── Converter.tsx   # Image processing engine
│   │   ├── PdfTools.tsx    # PDF processing & organizer engine
│   │   ├── Home.tsx        # Landing page
│   │   └── Features.tsx    # Features overview
│   ├── App.tsx             # Main routing wrapper
│   ├── index.css           # Global Tailwind & Glassmorphism styles
│   └── main.tsx            # React DOM entry point
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind theme configuration
└── vite.config.ts          # Vite build configuration
```

---

## 🗺️ Roadmap & Upcoming Features

- [ ] **Basic PDF Editor (Interactive Canvas)**:
  - [ ] **Add text**: Type directly onto the document.
  - [ ] **Add images**: Stamp images or logos onto pages.
  - [ ] **Draw tool**: Freehand drawing and markup.
  - [ ] **Highlight text**: Emphasize important sections.
  - [ ] **Add shapes/arrows**: Draw rectangles, circles, and directional arrows.
  - [ ] **Add signature**: Sign documents digitally.
  - [ ] **Whiteout/erase**: Mask out sensitive content visually.
- [ ] **Dark Mode Toggle**: Persistent system-preference synchronized theme switcher.
- [ ] **PDF Password Protection**: Encrypt and decrypt PDFs directly in the browser.
- [ ] **OCR (Text Extraction)**: Pull selectable text out of flat images using client-side WebAssembly models.
- [ ] **Bulk Watermarking**: Apply custom image/text watermarks across hundreds of pages instantly.
- [ ] **Image Filters & Effects**: Adjust brightness, contrast, saturation, and apply professional LUT filters locally.
- [ ] **EXIF Metadata Editor**: View, strip, or modify hidden EXIF metadata (GPS, camera info) from images.
- [ ] **AI Background Removal**: Automatically remove image backgrounds using local ONNX machine learning models.
- [ ] **PDF Redaction**: Securely black out sensitive information and burn it into the document so it cannot be recovered.

---

## 💻 Running Locally

To get a local copy up and running, follow these simple steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Subhan-Haider/Image-or-PDF-tool.git
   cd Image-or-PDF-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`.*

4. **Build for production**
   ```bash
   npm run build
   ```
   *The optimized static files will be generated in the `dist` folder.*

---

## 📝 License & Copyright

**Copyright (c) 2024 Subhan Haider. All Rights Reserved.**

This is proprietary software. You may view and fork this repository for personal/educational evaluation, but commercial use, unauthorized distribution, or creating a competing product from this source code is strictly prohibited. See the [LICENSE](LICENSE) file for more details.
