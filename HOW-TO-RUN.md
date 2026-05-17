# 🚀 How to Run Image Converter Pro

## ⚠️ Important: This is a WEB APP, NOT a Chrome Extension

This application runs in your web browser, not as a Chrome extension.

## ✅ Method 1: Direct Browser (Easiest)

1. **Navigate to your project folder:**
   ```
   C:\Users\setup\OneDrive\Desktop\Software
   ```

2. **Double-click `index.html`** to open it in your default browser

3. **Start using the app!** Drag and drop images to convert.

## ✅ Method 2: Local Web Server (Best Experience)

### Using Python:
```bash
# Open PowerShell or Command Prompt in the Software folder
cd "C:\Users\setup\OneDrive\Desktop\Software"
python -m http.server 8080
```
Then open: **http://localhost:8080**

### Using Node.js:
```bash
cd "C:\Users\setup\OneDrive\Desktop\Software"
npx http-server . -p 8080 -c-1
```
Then open: **http://localhost:8080**

### Using VS Code:
1. Install "Live Server" extension
2. Right-click `index.html`
3. Click "Open with Live Server"

## ❌ Don't Try This:

- ❌ Don't load it in Chrome Extensions page (chrome://extensions)
- ❌ Don't try to "Load unpacked" extension
- ❌ The manifest.json is for PWA, not Chrome extensions

## ✅ What This App Is:

- ✅ Progressive Web App (PWA)
- ✅ Runs in any modern web browser
- ✅ Works offline after first load
- ✅ Can be installed as a web app on your device
- ✅ 100% client-side (no server needed for basic use)

## 🔍 Quick Test:

1. Open `index.html` in Chrome/Edge/Firefox
2. Drag an image onto the upload area
3. Select a preset (like "Logo Pack")
4. Click "Convert All Images"
5. Download your converted files

**That's it! No installation or extension setup needed.** 🎉

## 📱 Install as Web App (Optional):

After opening in browser:
- **Chrome/Edge**: Click the install icon in address bar
- **Safari (iOS)**: Share → Add to Home Screen

This installs it as a standalone app on your device.

---

**If you specifically need a Chrome Extension version, let me know and I can create that separately!**

