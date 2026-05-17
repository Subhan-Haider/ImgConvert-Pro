# Quick Setup Guide

## ⚠️ Important: This is a WEB APP, Not a Chrome Extension

**This runs in your browser as a web application, NOT as a Chrome extension.**

Do NOT try to load it in `chrome://extensions`. Just open `index.html` in your browser!

## 🚀 Getting Started

### Method 1: Direct Browser Usage (Simplest)

1. Download all files
2. Open `index.html` in any modern web browser
3. Start converting images!

**Note**: Service Worker (offline mode) requires a web server, but basic functionality works without it.

### Method 2: Local Web Server (Recommended for Full Features)

#### Using Python (if installed):
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

#### Using Node.js (if installed):
```bash
# Install http-server globally (one-time)
npm install -g http-server

# Run server
http-server . -p 8080 -c-1

# Or use npx (no installation)
npx http-server . -p 8080 -c-1
```

#### Using PHP (if installed):
```bash
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

### Method 3: Deploy to Web Hosting

Upload all files to:
- GitHub Pages
- Netlify
- Vercel
- Any web hosting service

## 📦 Icon Setup (Optional)

1. Open `generate-icons.html` in your browser
2. Upload a square image (512x512px recommended)
3. Download `icon-192.png` and `icon-512.png`
4. Place both files in the root directory

Or see `ICONS.md` for more options.

## 🔌 API Server Setup (Optional)

If you want server-side API:

```bash
cd api
npm install express multer sharp
node server.js
```

API will run on `http://localhost:3000`

## ✅ Verification

1. Open the app in browser
2. Try dragging an image onto the upload area
3. Configure settings and click "Convert All Images"
4. Download the converted file

If everything works, you're all set! 🎉

## 🐛 Troubleshooting

### Icons not showing
- Icons are optional, app works without them
- See `ICONS.md` for setup instructions

### Service Worker not working
- Must use a web server (not file://)
- Check browser console for errors
- Clear browser cache and reload

### Large files slow or crash
- Process files in smaller batches
- Recommended max: 50MB per file
- For very large files, consider server-side processing

### WebP format not available
- Browser may not support WebP
- App automatically detects and disables unsupported formats

## 📱 PWA Installation

After opening in browser:
- **Chrome/Edge**: Click install icon in address bar
- **Safari iOS**: Share → Add to Home Screen
- **Firefox**: Menu → Install

Now the app works offline! ✨

