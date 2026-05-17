# Icon Setup Guide

This PWA requires icons for the manifest. Here are options:

## Option 1: Generate Icons Online

Use a free online icon generator:
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload any square image (preferably 512x512px)
3. Download the generated icons
4. Place `icon-192.png` and `icon-512.png` in the root directory

## Option 2: Create Simple Icons Manually

Create two PNG files:
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

You can use any image editor (Photoshop, GIMP, Canva, etc.) to create simple icons with:
- A camera/photo symbol
- Image conversion symbol
- Or any relevant image converter icon

## Option 3: Use the Icon Generator (included)

Open `generate-icons.html` in your browser to generate icons from any image.

## Temporary Solution

If you don't have icons yet, the app will still work, but PWA installation may not show an icon. You can:
1. Use a placeholder service like https://via.placeholder.com/192 or https://via.placeholder.com/512
2. Or remove icon references from `manifest.json` temporarily

The app functionality is not affected by missing icons.

