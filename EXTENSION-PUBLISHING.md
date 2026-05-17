# 🚀 Chrome Extension Publishing Guide

This guide outlines the complete process for preparing, packaging, and publishing the **Image Converter Pro** extension to the Chrome Web Store.

---

## 📋 Prerequisites
- **Chrome Developer Account**: A one-time $5 USD registration fee is required by Google. [Register here](https://chrome.google.com/webstore/devconsole/register).
- **Final Build**: Ensure all files in `chrome-extension/` are tested and functional.

---

## 📦 Step 1: Packaging the Extension
Google requires the extension to be uploaded as a `.zip` file.
1. Navigate to the `chrome-extension/` folder.
2. Select all files inside (including `icons/`, `manifest.json`, etc.).
3. Compress them into a file named `image-converter-pro-v2.zip`.
   - *Note: Do not zip the parent folder itself, only the files within it.*

---

## 🎨 Step 2: Promotional Assets
User-facing visuals are the most important factor for installs. Use the high-fidelity assets located in the `/assets` folder:

| Asset Type | Requirement | Recommended File |
| :--- | :--- | :--- |
| **Small Tile** | 440 x 280 px | `assets/promo_small_tile.png` |
| **Large Tile** | 920 x 680 px | `assets/promo_large_tile.png` |
| **Icon** | 128 x 128 px | `chrome-extension/icons/icon128.png` |
| **Screenshots** | 1280x800 or 640x400 | Take screenshots of the extension dashboard. |

---

## 🔒 Step 3: Privacy & Security Description
When filling out the **Privacy** tab in the Developer Console, use the following descriptions to ensure a fast approval process:

### Permission Justifications
- **`contextMenus`**: Used to provide the "Quick Convert" feature when a user right-clicks an image on any webpage.
- **`storage`**: Used to save user preferences, custom conversion patterns, and history locally. No data is synced to external servers.
- **`notifications`**: Used to alert the user when a large batch process is complete.

### Privacy Policy Summary
> "Image Converter Pro is a privacy-first utility. All image processing is performed locally within the user's browser using client-side JavaScript. Media files are never uploaded to, stored on, or transmitted to any remote servers. We do not collect, track, or sell user data or conversion history."

---

## 📝 Step 4: Store Listing Details

### Title & Description
- **Title**: Image Converter Pro - Batch, Resize & Optimize
- **Short Description**: The ultimate local image powerhouse. Batch convert, resize, and optimize images directly in your browser with zero uploads.
- **Category**: Productivity / Developer Tools

### Search Keywords
`image converter`, `batch resize`, `webp converter`, `avif`, `privacy`, `optimize images`, `png to jpg`.

---

## 🚀 Step 5: Submission Process
1. Log in to the [Chrome Developer Console](https://chrome.google.com/webstore/devconsole).
2. Click **+ New Item**.
3. Upload `image-converter-pro-v2.zip`.
4. Fill in the **Store Listing**, **Privacy**, and **Distribution** tabs.
5. Click **Submit for Review**.
   - *Review usually takes 24-72 hours.*

---

## 💡 Pro Tips for Approval
- **Single Purpose**: Ensure the extension only does image conversion to follow Google's "Single Purpose" policy.
- **Minimal Permissions**: We only use `contextMenus` and `storage`. Do not add `tabs` or `<all_urls>` unless absolutely necessary for new features, as it triggers a stricter review.
- **Clear Icons**: Use high-contrast icons to ensure visibility in both Light and Dark browser themes.

---
*Created by [Subhan Haider](https://github.com/Subhan-Haider)*
