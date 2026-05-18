import type { ImageFile, ConvertedImage, ConversionSettings } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function generateFileName(originalName: string, format: string, suffix = ''): string {
  const base = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const sfx = suffix && suffix !== 'original' ? `_${suffix}` : '';
  return `${base}${sfx}.${format}`;
}

function detectFormat(filename: string, mimeType: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    png:'png', jpg:'jpg', jpeg:'jpeg', webp:'webp',
    bmp:'bmp', gif:'gif', tiff:'tiff', svg:'svg', avif:'avif', heic:'heic',
  };
  return map[ext] || mimeType.split('/')[1] || 'unknown';
}

function checkTransparency(img: HTMLImageElement): boolean {
  try {
    const c = document.createElement('canvas');
    const sz = Math.min(img.width, img.height, 80);
    c.width = sz; c.height = sz;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0, sz, sz);
    const d = ctx.getImageData(0, 0, sz, sz).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 255) return true;
  } catch { /* ignore */ }
  return false;
}

function normalizeFormat(format: string): string {
  const f = format.toLowerCase();
  if (f === 'jpeg') return 'jpg';
  return f;
}

function getMimeType(format: string): string {
  const map: Record<string, string> = {
    png:'image/png', jpg:'image/jpeg', webp:'image/webp',
    svg:'image/svg+xml', bmp:'image/bmp', gif:'image/gif',
    ico:'image/png', avif:'image/avif', tiff:'image/tiff',
    pdf:'application/pdf',
  };
  return map[normalizeFormat(format)] ?? 'image/png';
}

export function dataURLtoBlob(dataurl: string): Blob {
  const [header, data] = dataurl.split(',');
  const mime = header.match(/:(.*?);/)![1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// ─── Load image from File ───────────────────────────────────────────────────────
export function loadImageFile(file: File): Promise<ImageFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () =>
        resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file, name: file.name,
          originalSize: file.size,
          width: img.width, height: img.height,
          image: img,
          format: detectFormat(file.name, file.type),
          hasTransparency: checkTransparency(img),
        });
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = e.target!.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ─── Load PDF pages via PDF.js ──────────────────────────────────────────────────
export async function loadPdfPages(file: File): Promise<ImageFile[]> {
  // @ts-ignore – loaded via CDN fallback or dynamic import
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) throw new Error('PDF.js not available');
  
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: ImageFile[] = [];
  const base = file.name.replace(/\.pdf$/i, '');

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const vp = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width; canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
    const dataUrl = canvas.toDataURL('image/png');
    const blob = dataURLtoBlob(dataUrl);
    const pageName = `${base}_page${p}.png`;
    const img = new Image();
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = dataUrl; });
    pages.push({
      id: `${Date.now()}-p${p}`,
      file: new File([blob], pageName, { type: 'image/png' }),
      name: pageName, originalSize: blob.size,
      width: img.width, height: img.height,
      image: img, format: 'png', hasTransparency: false,
    });
  }
  return pages;
}

// ─── Core Converter ─────────────────────────────────────────────────────────────
export function convertImage(
  imageData: ImageFile,
  settings: ConversionSettings,
  onProgress?: (p: number) => void,
): Promise<ConvertedImage> {
  const progress = (p: number) => onProgress?.(p);

  return new Promise((resolve, reject) => {
    const {
      outputFormat, quality, resizeMode,
      resizeWidth, resizeHeight,
      brightness, contrast, saturation, grayscale, sepia, sharpening,
      addWatermark, watermarkText, watermarkPosition, watermarkColor, watermarkOpacity,
      backgroundColor,
    } = settings;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // ── Dimensions ──────────────────────────────────────────────────────────────
    let fw = resizeWidth  || imageData.width;
    let fh = resizeHeight || imageData.height;

    if (resizeMode === 'fit' && (resizeWidth || resizeHeight)) {
      const s = Math.min((resizeWidth || Infinity) / imageData.width, (resizeHeight || Infinity) / imageData.height);
      fw = Math.round(imageData.width * s); fh = Math.round(imageData.height * s);
    } else if (resizeMode === 'fill' && (resizeWidth || resizeHeight)) {
      const s = Math.max((resizeWidth || 0) / imageData.width, (resizeHeight || 0) / imageData.height);
      fw = Math.round(imageData.width * s); fh = Math.round(imageData.height * s);
    } else if (resizeMode === 'circular' && resizeWidth && resizeHeight) {
      fw = fh = Math.min(resizeWidth, resizeHeight);
    } else if (resizeMode === 'none') {
      fw = imageData.width; fh = imageData.height;
    }

    canvas.width = fw; canvas.height = fh;

    // ── Background ──────────────────────────────────────────────────────────────
    if (outputFormat === 'jpg' || outputFormat === 'pdf' || backgroundColor !== 'transparent') {
      ctx.fillStyle = (backgroundColor === 'transparent' ? '#ffffff' : backgroundColor) || '#ffffff';
      ctx.fillRect(0, 0, fw, fh);
    }

    // ── CSS Filters ─────────────────────────────────────────────────────────────
    const gs = grayscale ? 100 : 0;
    const sp = sepia     ? 100 : 0;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${gs}%) sepia(${sp}%)`;

    // ── Circular clip ───────────────────────────────────────────────────────────
    if (resizeMode === 'circular') {
      ctx.save(); ctx.beginPath();
      ctx.arc(fw / 2, fh / 2, fw / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    progress(20);

    // ── Draw image ──────────────────────────────────────────────────────────────
    if (resizeMode === 'fill' && (resizeWidth || resizeHeight)) {
      const sa = imageData.width / imageData.height;
      const ta = fw / fh;
      let sx = 0, sy = 0, sw = imageData.width, sh = imageData.height;
      if (sa > ta) { sw = imageData.height * ta; sx = (imageData.width - sw) / 2; }
      else         { sh = imageData.width / ta;  sy = (imageData.height - sh) / 2; }
      ctx.drawImage(imageData.image, sx, sy, sw, sh, 0, 0, fw, fh);
    } else if ((resizeMode === 'stretch' || resizeMode === 'custom') && resizeWidth && resizeHeight) {
      ctx.drawImage(imageData.image, 0, 0, fw, fh);
    } else {
      const s  = Math.min(fw / imageData.width, fh / imageData.height);
      const sw = imageData.width * s, sh = imageData.height * s;
      const dx = (fw - sw) / 2, dy = (fh - sh) / 2;
      ctx.drawImage(imageData.image, dx, dy, sw, sh);
    }

    if (resizeMode === 'circular') ctx.restore();

    ctx.filter = 'none';
    progress(50);

    // ── Sharpening ──────────────────────────────────────────────────────────────
    if (sharpening > 0) {
      const id = ctx.getImageData(0, 0, fw, fh);
      const d = id.data, buf = new Uint8ClampedArray(d), mix = sharpening / 100;
      for (let y = 1; y < fh - 1; y++) {
        for (let x = 1; x < fw - 1; x++) {
          const i = (y * fw + x) * 4;
          for (let c = 0; c < 3; c++) {
            const v = buf[i+c]*5 - buf[((y-1)*fw+x)*4+c] - buf[((y+1)*fw+x)*4+c]
                                  - buf[(y*fw+x-1)*4+c]   - buf[(y*fw+x+1)*4+c];
            d[i+c] = buf[i+c]*(1-mix) + v*mix;
          }
        }
      }
      ctx.putImageData(id, 0, 0);
    }

    // ── Watermark ───────────────────────────────────────────────────────────────
    if (addWatermark && watermarkText) {
      const fs = Math.max(14, Math.floor(fw * 0.04));
      ctx.font = `bold ${fs}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(watermarkText).width;
      const pad = Math.max(20, fw * 0.02);
      let wx: number, wy: number;
      switch (watermarkPosition) {
        case 'top-left':     wx = pad + tw/2;     wy = pad + fs/2; break;
        case 'top-right':    wx = fw-pad-tw/2;    wy = pad + fs/2; break;
        case 'bottom-left':  wx = pad + tw/2;     wy = fh-pad-fs/2; break;
        case 'center':       wx = fw/2;            wy = fh/2; break;
        default:             wx = fw-pad-tw/2;    wy = fh-pad-fs/2;
      }
      ctx.save();
      ctx.globalAlpha = watermarkOpacity / 100;
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4;
      ctx.fillStyle = watermarkColor;
      ctx.fillText(watermarkText, wx, wy);
      ctx.restore();
    }

    progress(70);

    // ── PDF export ──────────────────────────────────────────────────────────────
    if (outputFormat === 'pdf') {
      try {
        const { jsPDF: _J } = (window as any).jspdf || {};
        const J = _J || (window as any).jsPDF;
        if (!J) { reject(new Error('jsPDF not loaded')); return; }
        const imgData = canvas.toDataURL('image/jpeg', quality / 100);
        const a4w = 210, a4h = 297;
        let pw = a4w, ph = (fh / fw) * pw;
        if (ph > a4h) { ph = a4h; pw = (fw / fh) * ph; }
        const doc = new J({ orientation: pw >= ph ? 'l' : 'p', unit: 'mm', format: [pw, ph] });
        doc.addImage(imgData, 'JPEG', 0, 0, pw, ph);
        const blob = doc.output('blob');
        progress(100);
        const name = generateFileName(imageData.name, 'pdf');
        resolve({ original: imageData, blob, name, size: blob.size, format: 'pdf', width: fw, height: fh, url: URL.createObjectURL(blob) });
      } catch (e: any) { reject(new Error('PDF export: ' + e.message)); }
      return;
    }

    // ── SVG export ──────────────────────────────────────────────────────────────
    if (outputFormat === 'svg') {
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Failed to create blob')); return; }
        const fr = new FileReader();
        fr.onload = () => {
          const b64 = fr.result as string;
          const svg = `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${fw}" height="${fh}">\n  <image width="${fw}" height="${fh}" xlink:href="${b64}"/>\n</svg>`;
          const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
          progress(100);
          const name = generateFileName(imageData.name, 'svg');
          resolve({ original: imageData, blob: svgBlob, name, size: svgBlob.size, format: 'svg', width: fw, height: fh, url: URL.createObjectURL(svgBlob) });
        };
        fr.readAsDataURL(blob);
      }, 'image/png', 1.0);
      return;
    }

    // ── Raster export ───────────────────────────────────────────────────────────
    const norm = normalizeFormat(outputFormat);
    const mime = getMimeType(norm);
    const canvasMime = ['png','jpg','webp','avif'].includes(norm) ? mime : 'image/png';

    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Conversion failed')); return; }
      progress(100);
      const name = generateFileName(imageData.name, norm);
      resolve({ original: imageData, blob, name, size: blob.size, format: norm, width: fw, height: fh, url: URL.createObjectURL(blob) });
    }, canvasMime, quality / 100);
  });
}
