# Image Converter Pro 🎨 & Client-Side PDF Tools 📄

A powerful, privacy-first web application for processing images and PDF documents entirely in your browser. No files are ever uploaded to a server—everything runs locally using modern Web APIs.

## 🌟 Key Features

### 🖼️ Image Processing (Converter)
* **Format Conversion**: Convert between WebP, PNG, JPEG, GIF, BMP, and ICO.
* **Smart Compression**: Compress images with adjustable quality sliders to save space.
* **Resizing Engine**: Precisely resize images by width and height while maintaining aspect ratios.
* **Rounded Corners**: Add beautifully rounded borders and corners to any image before downloading.
* **Batch Support**: Drag and drop multiple images at once.

### 📄 Document Processing (PDF Tools)
* **PDF Organizer**: Visually drag, drop, rotate, and delete pages from multiple PDFs, then compile them into a single merged document.
* **PDF to Images**: Extract pages from your PDF documents into high-resolution (300 DPI) PNG or JPEG images.
* **Images to PDF**: Compile multiple images into a standardized PDF format (A4, Letter, or Fit-to-image).
* **Compress PDF**: Reduce PDF file sizes significantly with Low, Medium, High, or Quality-Preserving compression modes.
* **Native Sharing**: Share compiled documents and extracted images directly to WhatsApp, email, or other apps using the native OS Share Sheet.

## 🔒 100% Privacy Promise
This entire suite of tools is designed to execute locally within the browser's virtualized sandbox via JavaScript/WebAssembly. **No files, images, or metadata ever touch an external server.**

## 🚀 Tech Stack

* **Frontend Framework**: React 18 with TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS with custom Glassmorphism UI
* **Icons**: Lucide React
* **PDF Engine**: `pdf-lib` (manipulation) & `pdf.js` (rendering)
* **Image Engine**: Native HTML5 Canvas API

## 💻 Running Locally

1. Clone the repository:
   ```bash
   git clone git@github.com:Subhan-Haider/Image-or-PDF-tool.git
   cd Image-or-PDF-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
