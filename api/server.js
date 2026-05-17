// Optional Node.js API Server for Image Converter Pro
// Requires: npm install express multer sharp

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads (memory storage - files not saved to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Enable CORS for browser access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Image Converter API is running' });
});

// Single image conversion endpoint
app.post('/api/convert', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const format = req.body.format || 'jpg';
    const quality = parseInt(req.body.quality) || 80;
    const width = req.body.width ? parseInt(req.body.width) : null;
    const height = req.body.height ? parseInt(req.body.height) : null;
    const backgroundColor = req.body.backgroundColor || '#ffffff';

    // Validate format
    const validFormats = ['png', 'jpg', 'jpeg', 'webp'];
    if (!validFormats.includes(format.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid format. Supported: png, jpg, jpeg, webp' });
    }

    let sharpInstance = sharp(req.file.buffer);

    // Handle resize
    if (width || height) {
      const resizeOptions = {};
      if (width) resizeOptions.width = width;
      if (height) resizeOptions.height = height;
      resizeOptions.fit = req.body.fit || 'inside'; // inside, cover, fill, etc.
      
      sharpInstance = sharpInstance.resize(resizeOptions);
    }

    // Handle background for transparent images when converting to JPG
    if ((format === 'jpg' || format === 'jpeg') && req.body.addBackground === 'true') {
      sharpInstance = sharpInstance.flatten({
        background: backgroundColor
      });
    }

    // Convert format and apply quality
    const outputFormat = format === 'jpeg' ? 'jpg' : format;
    const mimeType = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`;

    let buffer;
    if (outputFormat === 'png') {
      buffer = await sharpInstance.png().toBuffer();
    } else if (outputFormat === 'webp') {
      buffer = await sharpInstance.webp({ quality }).toBuffer();
    } else {
      buffer = await sharpInstance.jpeg({ quality }).toBuffer();
    }

    // Set appropriate headers
    const filename = `${path.parse(req.file.originalname).name}_converted.${outputFormat}`;
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length
    });

    res.send(buffer);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ 
      error: 'Image conversion failed', 
      message: error.message 
    });
  }
});

// Batch image conversion endpoint
app.post('/api/convert/batch', upload.array('images', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const format = req.body.format || 'jpg';
    const quality = parseInt(req.body.quality) || 80;
    const zip = req.body.zip === 'true';

    const convertedFiles = [];

    // Convert all images
    for (const file of req.files) {
      try {
        let sharpInstance = sharp(file.buffer);
        const outputFormat = format === 'jpeg' ? 'jpg' : format;

        let buffer;
        if (outputFormat === 'png') {
          buffer = await sharpInstance.png().toBuffer();
        } else if (outputFormat === 'webp') {
          buffer = await sharpInstance.webp({ quality }).toBuffer();
        } else {
          buffer = await sharpInstance.jpeg({ quality }).toBuffer();
        }

        convertedFiles.push({
          name: `${path.parse(file.originalname).name}_converted.${outputFormat}`,
          buffer: buffer,
          mimetype: `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`
        });
      } catch (error) {
        console.error(`Error converting ${file.originalname}:`, error);
        // Continue with other files even if one fails
      }
    }

    if (zip && convertedFiles.length > 1) {
      // Create ZIP file using JSZip (would need to install: npm install jszip)
      // For now, return first file or implement ZIP logic
      res.status(501).json({ 
        error: 'ZIP batch download not yet implemented on server',
        message: 'Use individual downloads or client-side ZIP feature'
      });
    } else if (convertedFiles.length === 1) {
      // Return single file
      const file = convertedFiles[0];
      res.set({
        'Content-Type': file.mimetype,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Length': file.buffer.length
      });
      res.send(file.buffer);
    } else {
      // Return JSON with download links (would need file storage)
      res.status(501).json({ 
        error: 'Multiple file download not yet implemented',
        message: 'Use ZIP option or download files individually'
      });
    }

  } catch (error) {
    console.error('Batch conversion error:', error);
    res.status(500).json({ 
      error: 'Batch conversion failed', 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size: 50MB' });
    }
  }
  res.status(500).json({ error: error.message || 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`🖼️  Image Converter API Server running on http://localhost:${port}`);
  console.log(`📡 Endpoints available:`);
  console.log(`   POST /api/convert - Convert single image`);
  console.log(`   POST /api/convert/batch - Convert multiple images`);
  console.log(`   GET  /api/health - Health check`);
});

module.exports = app;

