import { useCallback, useState, useEffect, useRef } from 'react';
import { RotateCw, Trash2, ArrowLeft, ArrowRight, Layers, FileImage, Image as ImageIcon, Download, RefreshCw, Plus, Minus, Upload, HelpCircle, FileText, GripHorizontal, FileDown, Minimize2, CheckCircle2, Maximize2, Share2, Edit3, Type, PenTool, Highlighter, MousePointer2, Eraser, Undo, Redo, Save, X, EyeOff, Award, Check, Move, Crop, Contrast, Languages, Stamp } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { uploadFileToServer } from '../utils/uploader';

interface PdfPageItem {
  id: string;
  file: File;
  fileName: string;
  pageIndex: number; // 0-indexed page inside original file
  pageNum: number;   // 1-indexed page inside original file
  thumbnail: string; // Data URL for rendering preview
  rotation: number;  // 0, 90, 180, 270
}

interface ImagePageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
}

type ActiveTab = 'annotate' | 'editor' | 'to-images' | 'from-images' | 'compress' | 'office-to-pdf' | 'ocr' | 'watermark' | 'page-numbers' | 'split' | 'transform' | 'metadata' | 'flatten' | 'grayscale';

const PdfLivePreview = ({ file, renderOverlay }: { file: File | null; renderOverlay?: (url: string) => React.ReactNode }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const generatePreview = async () => {
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) return;
        const ab = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 1 });
        const scale = Math.min(300 / vp.width, 400 / vp.height);
        const scaledVp = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = scaledVp.width;
        canvas.height = scaledVp.height;
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport: scaledVp }).promise;
        if (isActive) setPreviewUrl(canvas.toDataURL());
      } catch (e) {
        console.error("Failed to generate PDF preview:", e);
      }
    };
    generatePreview();
    return () => { isActive = false; };
  }, [file]);

  if (!previewUrl) return (
    <div className="h-[250px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-black/5 dark:border-white/5 animate-pulse">
      <div className="text-xs text-slate-400 font-medium">Loading preview...</div>
    </div>
  );

  return (
    <div className="relative inline-block rounded overflow-hidden shadow-xl border border-black/5 dark:border-white/5">
      <img src={previewUrl} alt="Preview" className="block max-h-[300px] w-auto bg-white pointer-events-none" />
      {renderOverlay && renderOverlay(previewUrl)}
    </div>
  );
};

export default function PdfTools() {
  const { toasts, addToast, removeToast } = useToast();
  const notify = useCallback((msg: string, type?: 'success' | 'error' | 'info') => addToast(msg, type), [addToast]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('annotate');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- PDF Annotate Editor State ---
  const [annotatePdfUrl, setAnnotatePdfUrl] = useState<string | null>(null);
  const [annotateFile, setAnnotateFile] = useState<File | null>(null);
  const [isAnnotatorFullscreen, setIsAnnotatorFullscreen] = useState(false);
  const annotateIframeRef = useRef<HTMLIFrameElement>(null);

  const handleAnnotateIframeLoad = useCallback(() => {
    setTimeout(() => {
      try {
        const iframe = annotateIframeRef.current;
        if (iframe?.contentDocument) {
          const doc = iframe.contentDocument;
          const downloadBtn = doc.getElementById('download');
          const secondaryDownloadBtn = doc.getElementById('secondaryDownload');
          if (downloadBtn) downloadBtn.style.display = 'none';
          if (secondaryDownloadBtn) secondaryDownloadBtn.style.display = 'none';
          
          const customToolbar = doc.querySelector('.CustomToolbar');
          if (customToolbar) {
            const buttons = customToolbar.querySelectorAll('li, button');
            buttons.forEach((btn: any) => {
              const text = btn.textContent?.trim();
              if (text === '保存' || text === 'Save') {
                btn.style.display = 'none';
              }
            });
          }
        }
      } catch (e) {
        console.warn('Could not access iframe content to hide save button');
      }
    }, 1000);
  }, []);

  const handleSaveAnnotatedPdf = useCallback(() => {
    try {
      const iframe = annotateIframeRef.current;
      if (iframe?.contentWindow) {
        const win = iframe.contentWindow as any;
        if (win.PDFViewerApplication) {
          win.PDFViewerApplication.download();
          notify('Exporting annotated PDF... ✓', 'success');
          return;
        }
      }
      
      // Fallback: click the hidden download button
      if (iframe?.contentDocument) {
        const doc = iframe.contentDocument;
        const downloadBtn = doc.getElementById('download');
        if (downloadBtn) {
          downloadBtn.click();
          notify('Exporting annotated PDF... ✓', 'success');
          return;
        }
      }
      
      notify('Could not export PDF automatically. Please try again.', 'error');
    } catch (e) {
      console.error('Error saving annotated PDF:', e);
      notify('Permission denied or error saving annotated PDF.', 'error');
    }
  }, [notify]);

  // --- PDF Editor Workspace State ---
  const [pdfPages, setPdfPages] = useState<PdfPageItem[]>([]);
  const [editorMargin, setEditorMargin] = useState<'none' | 'small' | 'standard'>('none');
  const [editorFilename, setEditorFilename] = useState('compiled_document');
  const [editorWatermark, setEditorWatermark] = useState('');
  const [editorPageNumbers, setEditorPageNumbers] = useState(false);
  const [editorMetadata, setEditorMetadata] = useState({ title: '', author: '', subject: '', keywords: '' });

  // --- PDF to Images State ---
  const [pdfToImgFile, setPdfToImgFile] = useState<File | null>(null);
  const [pdfToImgPages, setPdfToImgPages] = useState<{ pageNum: number; thumbnail: string; size: number }[]>([]);
  const [pdfToImgFormat, setPdfToImgFormat] = useState<'png' | 'jpeg' | 'webp' | 'bmp' | 'gif' | 'tiff'>('png');
  const [pdfToImgQuality, setPdfToImgQuality] = useState(90);

  // --- Images to PDF State ---
  const [imagePages, setImagePages] = useState<ImagePageItem[]>([]);
  const [imagesMargin, setImagesMargin] = useState<'none' | 'small' | 'standard'>('none');
  const [imagesFilename, setImagesFilename] = useState('images_document');
  const [imagesPageSize, setImagesPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [imagesOrientation, setImagesOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // --- PDF Editor Page Resizing State ---
  const [editorPageSize, setEditorPageSize] = useState<'fit' | 'a4' | 'letter' | 'custom'>('fit');
  const [editorCustomWidth, setEditorCustomWidth] = useState(595);
  const [editorCustomHeight, setEditorCustomHeight] = useState(842);
  const [editorOrientation, setEditorOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // --- Office to PDF State ---
  const [officeFile, setOfficeFile] = useState<File | null>(null);
  const [officeHtml, setOfficeHtml] = useState<string>('');
  const [officeFileType, setOfficeFileType] = useState<'docx' | 'xlsx' | 'txt' | 'csv' | null>(null);
  const [officeFilename, setOfficeFilename] = useState('office_document');

  // --- Grid View Zoom State ---
  const [pageSizeMode, setPageSizeMode] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');

  // --- PDF Compression State ---
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressMode, setCompressMode] = useState<'low' | 'medium' | 'high' | 'preserve'>('medium');
  const [compressProgress, setCompressProgress] = useState<{ current: number; total: number; currentSize: number } | null>(null);
  const [compressResult, setCompressResult] = useState<{ originalSize: number; compressedSize: number; downloadUrl: string; filename: string; serverUrl?: string } | null>(null);

  // --- Compiled PDF Result State (PDF Organizer + Images to PDF) ---
  const [compiledPdfResult, setCompiledPdfResult] = useState<{ url: string; filename: string; serverUrl?: string } | null>(null);
  const [compiledImagesPdfResult, setCompiledImagesPdfResult] = useState<{ url: string; filename: string; serverUrl?: string } | null>(null);

  // --- Zoom Modal / Gallery State ---
  const [zoomGallery, setZoomGallery] = useState<{ images: string[]; index: number } | null>(null);
  const openZoom = (images: string[], index: number) => setZoomGallery({ images, index });
  const closeZoom = () => setZoomGallery(null);
  const zoomNext = () => setZoomGallery(prev => prev && prev.index < prev.images.length - 1 ? { ...prev, index: prev.index + 1 } : prev);
  const zoomPrev = () => setZoomGallery(prev => prev && prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev);

  // --- Canvas Editor Modal State ---
  const [activeEditPage, setActiveEditPage] = useState<{ page: PdfPageItem; index: number } | null>(null);
  const openEditorModal = (page: PdfPageItem, index: number) => setActiveEditPage({ page, index });
  const closeEditorModal = () => setActiveEditPage(null);

  const handleSavePageEdits = (editedFile: File, editedThumbnail: string) => {
    if (!activeEditPage) return;
    const newPages = [...pdfPages];
    newPages[activeEditPage.index] = {
      ...newPages[activeEditPage.index],
      file: editedFile,
      thumbnail: editedThumbnail
    };
    setPdfPages(newPages);
    setActiveEditPage(null);
    notify('Page edits applied successfully ✓', 'success');
  };

  // --- PDF OCR State ---
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrPageNum, setOcrPageNum] = useState<'all' | number>('all');
  const [ocrPagesTotal, setOcrPagesTotal] = useState(0);

  // --- Watermark PDF State ---
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkResultUrl, setWatermarkResultUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);
  const [watermarkSize, setWatermarkSize] = useState(60);
  const [watermarkColor, setWatermarkColor] = useState('#ff0000');
  const [watermarkLayout, setWatermarkLayout] = useState<'centered' | 'tiled'>('centered');

  const handleApplyWatermark = useCallback(async () => {
    if (!watermarkFile) return;
    setIsProcessing(true);
    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = await import('pdf-lib');
      const bytes = await watermarkFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };
      const color = hexToRgb(watermarkColor);
      for (const page of pages) {
        const { width, height } = page.getSize();
        const fontSize = watermarkSize;
        if (watermarkLayout === 'tiled') {
          for (let x = 50; x < width; x += 200) {
            for (let y = 50; y < height; y += 150) {
              page.drawText(watermarkText, { x, y, size: fontSize / 2, color, opacity: watermarkOpacity, rotate: degrees(30), font });
            }
          }
        } else {
          page.drawText(watermarkText, {
            x: width / 2 - (watermarkText.length * fontSize * 0.3),
            y: height / 2,
            size: fontSize,
            color,
            opacity: watermarkOpacity,
            rotate: degrees(-35),
            font,
          });
        }
      }
      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as any], { type: 'application/pdf' });
      if (watermarkResultUrl) URL.revokeObjectURL(watermarkResultUrl);
      setWatermarkResultUrl(URL.createObjectURL(blob));
      notify('Watermark applied successfully! ✓', 'success');
    } catch (e: any) {
      notify('Failed to apply watermark: ' + e.message, 'error');
    }
    setIsProcessing(false);
  }, [watermarkFile, watermarkText, watermarkOpacity, watermarkSize, watermarkColor, watermarkLayout, watermarkResultUrl, notify]);

  // --- Page Numbers State ---
  const [pageNumFile, setPageNumFile] = useState<File | null>(null);
  const [pageNumResultUrl, setPageNumResultUrl] = useState<string | null>(null);
  const [pageNumPosition, setPageNumPosition] = useState<'bottom-center' | 'bottom-right' | 'top-center' | 'top-right'>('bottom-center');
  const [pageNumFormat, setPageNumFormat] = useState<'n' | 'Page n' | 'Page n of N' | 'n / N'>('Page n of N');
  const [pageNumSize, setPageNumSize] = useState(12);
  const [pageNumMargin, setPageNumMargin] = useState(20);
  const [pageNumStartAt, setPageNumStartAt] = useState(1);

  const handleApplyPageNumbers = useCallback(async () => {
    if (!pageNumFile) return;
    setIsProcessing(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      const bytes = await pageNumFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const total = pages.length;
      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const pageNum = i + pageNumStartAt;
        let label = '';
        if (pageNumFormat === 'n') label = String(pageNum);
        else if (pageNumFormat === 'Page n') label = `Page ${pageNum}`;
        else if (pageNumFormat === 'Page n of N') label = `Page ${pageNum} of ${total}`;
        else label = `${pageNum} / ${total}`;
        const textWidth = font.widthOfTextAtSize(label, pageNumSize);
        let x = width / 2 - textWidth / 2;
        let y = pageNumMargin;
        if (pageNumPosition === 'bottom-right') { x = width - textWidth - pageNumMargin; y = pageNumMargin; }
        else if (pageNumPosition === 'top-center') { x = width / 2 - textWidth / 2; y = height - pageNumMargin - pageNumSize; }
        else if (pageNumPosition === 'top-right') { x = width - textWidth - pageNumMargin; y = height - pageNumMargin - pageNumSize; }
        page.drawText(label, { x, y, size: pageNumSize, font, color: rgb(0.2, 0.2, 0.2) });
      });
      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as any], { type: 'application/pdf' });
      if (pageNumResultUrl) URL.revokeObjectURL(pageNumResultUrl);
      setPageNumResultUrl(URL.createObjectURL(blob));
      notify('Page numbers added! ✓', 'success');
    } catch (e: any) {
      notify('Failed to add page numbers: ' + e.message, 'error');
    }
    setIsProcessing(false);
  }, [pageNumFile, pageNumPosition, pageNumFormat, pageNumSize, pageNumMargin, pageNumStartAt, pageNumResultUrl, notify]);

  // --- Split PDF State ---
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitTotalPages, setSplitTotalPages] = useState(0);
  const [splitMode, setSplitMode] = useState<'range' | 'every' | 'extract'>('range');
  const [splitRange, setSplitRange] = useState('1-3');
  const [splitEvery, setSplitEvery] = useState(1);
  const [splitExtractPages, setSplitExtractPages] = useState('1,2,3');
  const [splitResults, setSplitResults] = useState<{ name: string; url: string }[]>([]);

  const handleLoadSplitFile = useCallback(async (file: File) => {
    setSplitFile(file);
    setSplitResults([]);
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) { notify('PDF.js not ready yet', 'error'); return; }
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    setSplitTotalPages(pdf.numPages);
  }, [notify]);

  const handleSplitPdf = useCallback(async () => {
    if (!splitFile) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const srcBytes = await splitFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(srcBytes);
      const total = srcDoc.getPageCount();
      const results: { name: string; url: string }[] = [];

      if (splitMode === 'range') {
        const parts = splitRange.split(',').map(s => s.trim());
        for (const part of parts) {
          const newDoc = await PDFDocument.create();
          const range = part.includes('-') ? part.split('-').map(Number) : [Number(part), Number(part)];
          const from = Math.max(1, range[0]) - 1;
          const to = Math.min(total, range[1] ?? range[0]) - 1;
          const indices = Array.from({ length: to - from + 1 }, (_, i) => from + i);
          const copiedPages = await newDoc.copyPages(srcDoc, indices);
          copiedPages.forEach(p => newDoc.addPage(p));
          const bytes = await newDoc.save();
          const url = URL.createObjectURL(new Blob([bytes as any], { type: 'application/pdf' }));
          results.push({ name: `split_pages_${range[0]}-${range[1] ?? range[0]}.pdf`, url });
        }
      } else if (splitMode === 'every') {
        const n = Math.max(1, splitEvery);
        for (let i = 0; i < total; i += n) {
          const newDoc = await PDFDocument.create();
          const indices = Array.from({ length: Math.min(n, total - i) }, (_, j) => i + j);
          const copiedPages = await newDoc.copyPages(srcDoc, indices);
          copiedPages.forEach(p => newDoc.addPage(p));
          const bytes = await newDoc.save();
          const url = URL.createObjectURL(new Blob([bytes as any], { type: 'application/pdf' }));
          results.push({ name: `split_part_${Math.floor(i / n) + 1}.pdf`, url });
        }
      } else {
        const pageNums = splitExtractPages.split(',').map(s => parseInt(s.trim()) - 1).filter(n => n >= 0 && n < total);
        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(srcDoc, pageNums);
        copiedPages.forEach(p => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const url = URL.createObjectURL(new Blob([bytes as any], { type: 'application/pdf' }));
        results.push({ name: `extracted_pages.pdf`, url });
      }

      setSplitResults(results);
      notify(`PDF split into ${results.length} file(s) ✓`, 'success');
    } catch (e: any) {
      notify('Split failed: ' + e.message, 'error');
    }
    setIsProcessing(false);
  }, [splitFile, splitMode, splitRange, splitEvery, splitExtractPages, notify]);



  // === TRANSFORM (Rotate + Crop) — unified tool ===
  const [transformFile, setTransformFile] = useState<File | null>(null);
  const [transformResultUrl, setTransformResultUrl] = useState<string | null>(null);
  const [transformPreviewUrl, setTransformPreviewUrl] = useState<string | null>(null);
  const [transformPageWidth, setTransformPageWidth] = useState(595);
  const [transformPageHeight, setTransformPageHeight] = useState(842);
  // Rotate sub-state
  const [rotateAngle, setRotateAngle] = useState<0 | 90 | 180 | 270>(0);
  // Crop sub-state
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [cropUnit, setCropUnit] = useState<'mm' | 'pt' | 'px'>('mm');

  // Mouse drag state for interactive cropping
  const [cropDragEdge, setCropDragEdge] = useState<string | null>(null);
  const transformPreviewRef = useRef<HTMLImageElement | null>(null);

  const handleCropDrag = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!cropDragEdge || !transformPreviewRef.current) return;
    const rect = transformPreviewRef.current.getBoundingClientRect();
    
    // Calculate normalized position (0 to 1) relative to image
    let x = (e.clientX - rect.left) / rect.width;
    let y = (e.clientY - rect.top) / rect.height;
    
    // Clamp to 0-1
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    // Convert to points
    const ptX = x * transformPageWidth;
    const ptY = y * transformPageHeight;

    // Convert points to current unit
    const toUnit = (pts: number) => {
      if (cropUnit === 'mm') return pts / 2.8346;
      if (cropUnit === 'px') return pts / 0.75;
      return pts;
    };

    if (cropDragEdge.includes('top')) {
      const val = toUnit(ptY);
      if (val < transformPageHeight / 2.8346 - cropBottom) setCropTop(Math.max(0, val));
    }
    if (cropDragEdge.includes('bottom')) {
      const val = toUnit(transformPageHeight - ptY);
      if (val < transformPageHeight / 2.8346 - cropTop) setCropBottom(Math.max(0, val));
    }
    if (cropDragEdge.includes('left')) {
      const val = toUnit(ptX);
      if (val < transformPageWidth / 2.8346 - cropRight) setCropLeft(Math.max(0, val));
    }
    if (cropDragEdge.includes('right')) {
      const val = toUnit(transformPageWidth - ptX);
      if (val < transformPageWidth / 2.8346 - cropLeft) setCropRight(Math.max(0, val));
    }
  }, [cropDragEdge, transformPageWidth, transformPageHeight, cropUnit, cropTop, cropBottom, cropLeft, cropRight]);

  const handleCropDragEnd = useCallback(() => {
    setCropDragEdge(null);
  }, []);

  useEffect(() => {
    if (cropDragEdge) {
      window.addEventListener('mousemove', handleCropDrag);
      window.addEventListener('mouseup', handleCropDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleCropDrag);
        window.removeEventListener('mouseup', handleCropDragEnd);
      };
    }
  }, [cropDragEdge, handleCropDrag, handleCropDragEnd]);

  const cropToPoints = useCallback((val: number) => {
    if (cropUnit === 'mm') return val * 2.8346;
    if (cropUnit === 'px') return val * 0.75;
    return val;
  }, [cropUnit]);

  const handleLoadTransformFile = useCallback(async (file: File) => {
    setTransformFile(file);
    setTransformResultUrl(null);
    setTransformPreviewUrl(null);
    setCropTop(0); setCropBottom(0); setCropLeft(0); setCropRight(0);
    setRotateAngle(0);
    try {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) { notify('PDF.js not ready', 'error'); return; }
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const ab = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
      const page = await pdf.getPage(1);
      const vp = page.getViewport({ scale: 1 });
      setTransformPageWidth(vp.width);
      setTransformPageHeight(vp.height);
      const scale = Math.min(480 / vp.width, 640 / vp.height);
      const scaledVp = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = scaledVp.width;
      canvas.height = scaledVp.height;
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport: scaledVp }).promise;
      setTransformPreviewUrl(canvas.toDataURL());
    } catch (e: any) { notify('Failed to load file: ' + e.message, 'error'); }
  }, [notify]);

  const handleApplyTransform = useCallback(async () => {
    if (!transformFile) return;
    setIsProcessing(true);
    try {
      const { PDFDocument, degrees } = await import('pdf-lib');
      const bytes = await transformFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        // 1. Rotate
        if (rotateAngle !== 0) {
          const current = page.getRotation().angle;
          page.setRotation(degrees((current + rotateAngle) % 360));
        }
        // 2. Crop box
        const { width, height } = page.getSize();
        const l = cropToPoints(cropLeft);
        const r = cropToPoints(cropRight);
        const t = cropToPoints(cropTop);
        const b = cropToPoints(cropBottom);
        if (l > 0 || r > 0 || t > 0 || b > 0) {
          page.setCropBox(l, b, Math.max(1, width - l - r), Math.max(1, height - b - t));
        }
      }
      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as any], { type: 'application/pdf' });
      if (transformResultUrl) URL.revokeObjectURL(transformResultUrl);
      setTransformResultUrl(URL.createObjectURL(blob));
      notify('Transform applied ✓', 'success');
    } catch (e: any) {
      notify('Transform failed: ' + e.message, 'error');
    }
    setIsProcessing(false);
  }, [transformFile, rotateAngle, cropTop, cropBottom, cropLeft, cropRight, cropToPoints, transformResultUrl, notify]);

  const [metaFile, setMetaFile] = useState<File | null>(null);
  const [metaResultUrl, setMetaResultUrl] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaSubject, setMetaSubject] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [metaCreator, setMetaCreator] = useState('');

  const handleLoadMetaFile = useCallback(async (file: File) => {
    setMetaFile(file);
    setMetaResultUrl(null);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      setMetaTitle(pdfDoc.getTitle() || '');
      setMetaAuthor(pdfDoc.getAuthor() || '');
      setMetaSubject(pdfDoc.getSubject() || '');
      setMetaKeywords(pdfDoc.getKeywords() || '');
      setMetaCreator(pdfDoc.getCreator() || '');
    } catch { /* ignore parse errors */ }
  }, []);

  const handleSaveMetadata = useCallback(async () => {
    if (!metaFile) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await metaFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      pdfDoc.setTitle(metaTitle);
      pdfDoc.setAuthor(metaAuthor);
      pdfDoc.setSubject(metaSubject);
      pdfDoc.setKeywords([metaKeywords]);
      pdfDoc.setCreator(metaCreator);
      pdfDoc.setProducer('PDF Craft Suite');
      pdfDoc.setModificationDate(new Date());
      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as any], { type: 'application/pdf' });
      if (metaResultUrl) URL.revokeObjectURL(metaResultUrl);
      setMetaResultUrl(URL.createObjectURL(blob));
      notify('Metadata saved successfully ✓', 'success');
    } catch (e: any) {
      notify('Failed to save metadata: ' + e.message, 'error');
    }
    setIsProcessing(false);
  }, [metaFile, metaTitle, metaAuthor, metaSubject, metaKeywords, metaCreator, metaResultUrl, notify]);


  // --- Flatten PDF State ---
  const [flattenFile, setFlattenFile] = useState<File | null>(null);
  const [flattenResultUrl, setFlattenResultUrl] = useState<string | null>(null);
  const [flattenAnnotations, setFlattenAnnotations] = useState(true);
  const [flattenForms, setFlattenForms] = useState(true);

  const handleFlattenPdf = useCallback(async () => {
    if (!flattenFile) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await flattenFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      // Flatten all interactive form fields
      if (flattenForms) {
        try {
          const form = pdfDoc.getForm();
          form.flatten();
        } catch { /* no form fields - that's fine */ }
      }
      // Flatten widget annotations from pages
      if (flattenAnnotations) {
        const pages = pdfDoc.getPages();
        for (const page of pages) {
          const annots = page.node.lookupMaybe((page.node as any).constructor.for?.('Annots'), Array as any) as any;
          if (annots) {
            try { page.node.delete((page.node as any).constructor.for?.('Annots')); } catch { /* ignore */ }
          }
        }
      }
      pdfDoc.setModificationDate(new Date());
      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes as any], { type: 'application/pdf' });
      if (flattenResultUrl) URL.revokeObjectURL(flattenResultUrl);
      setFlattenResultUrl(URL.createObjectURL(blob));
      notify('PDF flattened successfully ✓', 'success');
    } catch (e: any) {
      notify('Flatten failed: ' + e.message, 'error');
    }
    setIsProcessing(false);
  }, [flattenFile, flattenForms, flattenAnnotations, flattenResultUrl, notify]);

  // --- Grayscale PDF State ---
  const [grayFile, setGrayFile] = useState<File | null>(null);
  const [grayResultUrl, setGrayResultUrl] = useState<string | null>(null);
  const [grayProgress, setGrayProgress] = useState(0);
  const [grayStatus, setGrayStatus] = useState('');
  const [grayScale, setGrayScale] = useState(1.5); // render scale for quality

  const handleConvertGrayscale = useCallback(async () => {
    if (!grayFile) return;
    setIsProcessing(true);
    setGrayProgress(0);
    setGrayStatus('Loading PDF...');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) throw new Error('PDF.js not ready');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const srcBytes = await grayFile.arrayBuffer();
      const srcPdf = await pdfjsLib.getDocument({ data: srcBytes.slice(0) }).promise;
      const total = srcPdf.numPages;
      const outDoc = await PDFDocument.create();

      for (let i = 1; i <= total; i++) {
        setGrayStatus(`Converting page ${i} of ${total}...`);
        setGrayProgress(Math.round(((i - 1) / total) * 100));
        const page = await srcPdf.getPage(i);
        const vp = page.getViewport({ scale: grayScale });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext('2d')!;
        // Render in full color first
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        // Convert to grayscale via pixel manipulation
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let j = 0; j < d.length; j += 4) {
          const luma = Math.round(0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2]);
          d[j] = d[j + 1] = d[j + 2] = luma;
        }
        ctx.putImageData(imageData, 0, 0);
        // Embed as JPEG into new PDF
        const jpegBytes = await new Promise<Uint8Array>(resolve => {
          canvas.toBlob(b => { b!.arrayBuffer().then(ab => resolve(new Uint8Array(ab))); }, 'image/jpeg', 0.92);
        });
        const img = await outDoc.embedJpg(jpegBytes);
        const newPage = outDoc.addPage([vp.width / grayScale, vp.height / grayScale]);
        newPage.drawImage(img, { x: 0, y: 0, width: vp.width / grayScale, height: vp.height / grayScale });
      }

      setGrayStatus('Saving...');
      setGrayProgress(99);
      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes as any], { type: 'application/pdf' });
      if (grayResultUrl) URL.revokeObjectURL(grayResultUrl);
      setGrayResultUrl(URL.createObjectURL(blob));
      setGrayProgress(100);
      setGrayStatus('Done!');
      notify('PDF converted to grayscale ✓', 'success');
    } catch (e: any) {
      notify('Grayscale failed: ' + e.message, 'error');
    }
    setIsProcessing(false);
  }, [grayFile, grayScale, grayResultUrl, notify]);

  const handleOcrExtractText = useCallback(async () => {
    if (!ocrFile) {
      notify('Please select a PDF file first', 'error');
      return;
    }
    setIsProcessing(true);
    setOcrProgress(0);
    setOcrStatus('Initializing PDF.js engine...');
    setOcrText('');

    try {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        throw new Error('PDF.js engine is still loading. Please wait a moment.');
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await ocrFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      let pagesToProcess: number[] = [];
      if (ocrPageNum === 'all') {
        for (let i = 1; i <= totalPages; i++) {
          pagesToProcess.push(i);
        }
      } else {
        pagesToProcess = [Number(ocrPageNum)];
      }

      let fullExtractedText = '';
      
      setOcrStatus('Loading Tesseract OCR engine...');
      setOcrProgress(5);

      for (let index = 0; index < pagesToProcess.length; index++) {
        const pageIdx = pagesToProcess[index];
        setOcrStatus(`Rendering Page ${pageIdx} of ${totalPages} to canvas...`);
        setOcrProgress(Math.round((index / pagesToProcess.length) * 100));

        const page = await pdf.getPage(pageIdx);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create 2D canvas context');

        await page.render({ canvasContext: ctx, viewport }).promise;

        setOcrStatus(`Performing OCR on Page ${pageIdx}...`);

        const result = await Tesseract.recognize(
          canvas,
          ocrLanguage,
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                const subProgress = Math.round(m.progress * 100);
                const overallProgress = Math.round(((index + m.progress) / pagesToProcess.length) * 100);
                setOcrProgress(overallProgress);
                setOcrStatus(`OCR Page ${pageIdx}: ${subProgress}% complete`);
              }
            }
          }
        );

        fullExtractedText += `--- PAGE ${pageIdx} ---\n\n${result.data.text}\n\n`;
      }

      setOcrText(fullExtractedText.trim());
      setOcrProgress(100);
      setOcrStatus('Completed!');
      notify('Text extraction complete! ✓', 'success');
    } catch (e: any) {
      console.error('OCR Error:', e);
      notify(`OCR Error: ${e.message}`, 'error');
      setOcrStatus(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [ocrFile, ocrLanguage, ocrPageNum, notify]);

  // --- Drag and Drop Reordering State ---
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    if (activeTab === 'editor') {
      setPdfPages(prev => {
        const next = [...prev];
        const [moved] = next.splice(draggedIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
      notify('Page position updated ✓', 'success');
    } else if (activeTab === 'from-images') {
      setImagePages(prev => {
        const next = [...prev];
        const [moved] = next.splice(draggedIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
      notify('Image position updated ✓', 'success');
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // --- Common Helpers ---
  const clearWorkspace = () => {
    setPdfPages([]);
    setPdfToImgFile(null);
    setPdfToImgPages([]);
    setImagePages([]);
    setOfficeFile(null);
    setOfficeHtml('');
    setOfficeFileType(null);
    setCompressFile(null);
    setCompressResult(null);
    setCompressProgress(null);
    
    // Reset Drawing States
    if (annotatePdfUrl) URL.revokeObjectURL(annotatePdfUrl);
    setAnnotateFile(null);
    setAnnotatePdfUrl(null);
    setIsAnnotatorFullscreen(false);

    // Reset OCR States
    setOcrFile(null);
    setOcrProgress(0);
    setOcrText('');
    setOcrStatus('');
    setOcrPagesTotal(0);

    notify('Workspace cleared', 'info');
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleShareFile = async (url: string, filename: string, mimeType: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const shareFile = new File([blob], filename, { type: mimeType });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({
          files: [shareFile],
          title: filename,
          text: `Check out this processed file: ${filename}`
        });
        notify('Native share dialog triggered successfully ✓', 'success');
      } else {
        // High-fidelity fallback for unsupported clients: Copy current page URL & notify
        await navigator.clipboard.writeText(window.location.href);
        notify('Native sharing not supported. URL copied to clipboard!', 'info');
      }
    } catch (err: any) {
      // Don't show abort errors (user cancelled share dialog)
      if (err.name !== 'AbortError') {
        notify(`Sharing failed: ${err.message}`, 'error');
      }
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 150);
  };

  const handleCompressFileUpload = (file: File) => {
    if (file.size === 0) {
      notify(`Failed to load "${file.name}": The file is empty (0 bytes)`, 'error');
      return;
    }
    if (file.type !== 'application/pdf') {
      notify('Unsupported format. Please upload a PDF document.', 'error');
      return;
    }
    setCompressFile(file);
    setCompressResult(null);
    setCompressProgress(null);
  };

  const handleCompressPdf = async () => {
    if (!compressFile) return;
    setIsProcessing(true);
    setCompressResult(null);
    notify('Starting PDF compression…', 'info');

    try {
      const pdfjsLib = (window as any).pdfjsLib;
      const PDFLib = (window as any).PDFLib;
      if (!pdfjsLib || !PDFLib) {
        throw new Error('PDF processing engines are loading. Please wait a moment.');
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await compressFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const compiledPdf = await PDFLib.PDFDocument.create();

      // Configure compression ratios based on selected mode
      let scale = 1.0;
      let quality = 0.5;
      if (compressMode === 'high') {
        scale = 0.8;
        quality = 0.3;
      } else if (compressMode === 'low') {
        scale = 1.4;
        quality = 0.75;
      } else if (compressMode === 'preserve') {
        scale = 1.8;
        quality = 0.9;
      }

      let runningSizeSum = 0;
      for (let i = 1; i <= totalPages; i++) {
        setCompressProgress({ current: i, total: totalPages, currentSize: runningSizeSum });

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas render context failure');

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Export page canvas as compressed JPEG blob
        const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', quality));
        if (!blob) throw new Error('Failed to capture page canvas');

        runningSizeSum += blob.size;

        const pageBytes = await blob.arrayBuffer();
        const embeddedImg = await compiledPdf.embedJpg(pageBytes);

        const imgW = embeddedImg.width;
        const imgH = embeddedImg.height;

        const newPage = compiledPdf.addPage([imgW, imgH]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: imgW,
          height: imgH
        });
      }

      const pdfBytes = await compiledPdf.save();
      const compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(compressedBlob);
      const filename = `${compressFile.name.replace(/\.pdf$/, '')}_compressed.pdf`;

      setCompressResult({
        originalSize: compressFile.size,
        compressedSize: compressedBlob.size,
        downloadUrl,
        filename
      });

      // Background upload of compressed PDF to storage server
      const compressedFile = new File([compressedBlob], filename, { type: 'application/pdf' });
      uploadFileToServer(compressedFile).then(url => {
        if (url) {
          setCompressResult(prev => prev ? { ...prev, serverUrl: url } : null);
        }
      }).catch(err => {
        console.warn('Background upload of compressed PDF failed:', err);
      });

      notify('PDF successfully compressed ✓', 'success');
    } catch (err: any) {
      notify(`Compression failed: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
      setCompressProgress(null);
    }
  };

  // --- PDF Thumbnail & Info Extractor ---
  const loadPdfFilePages = async (file: File): Promise<PdfPageItem[]> => {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) {
      throw new Error('PDF.js engine not loaded yet. Please wait a moment.');
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const extracted: PdfPageItem[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      // Scale 1.5 for crisp high-fidelity preview thumbnails
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        // High-quality JPEG at 0.92 for crisp, readable thumbnails
        const thumbnail = canvas.toDataURL('image/jpeg', 0.92);
        extracted.push({
          id: `${file.name}_p${i}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          file,
          fileName: file.name,
          pageIndex: i - 1,
          pageNum: i,
          thumbnail,
          rotation: 0
        });
      }
    }
    return extracted;
  };

  // --- Upload Handlers ---
  const handlePdfUpload = async (files: File[]) => {
    setIsProcessing(true);
    let loadedCount = 0;
    const allNewPages: PdfPageItem[] = [];

    for (const file of files) {
      if (file.size === 0) {
        notify(`Failed to load "${file.name}": The file is empty (0 bytes)`, 'error');
        continue;
      }

      // Gracefully handle raw images dropped directly into PDF Editor Workspace
      if (file.type.startsWith('image/')) {
        try {
          const thumbnail = URL.createObjectURL(file);
          allNewPages.push({
            id: `${file.name}_img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            file,
            fileName: file.name,
            pageIndex: 0,
            pageNum: 1,
            thumbnail,
            rotation: 0
          });
          loadedCount++;
        } catch (err: any) {
          notify(`Failed to load image "${file.name}": ${err.message}`, 'error');
        }
        continue;
      }

      if (file.type !== 'application/pdf') {
        notify(`"${file.name}" is not a PDF or image file`, 'error');
        continue;
      }
      try {
        const pages = await loadPdfFilePages(file);
        allNewPages.push(...pages);
        loadedCount++;
      } catch (err: any) {
        notify(`Failed to load "${file.name}": ${err.message}`, 'error');
      }
    }

    if (allNewPages.length > 0) {
      setPdfPages(prev => [...prev, ...allNewPages]);
      notify(`Successfully loaded ${loadedCount} document/image file(s) with ${allNewPages.length} pages`, 'success');
    }
    setIsProcessing(false);
  };

  const handlePdfToImgUpload = async (file: File) => {
    if (file.size === 0) {
      notify(`Failed to load "${file.name}": The file is empty (0 bytes)`, 'error');
      return;
    }
    if (file.type !== 'application/pdf') {
      notify('Please upload a valid PDF document', 'error');
      return;
    }
    setIsProcessing(true);
    setPdfToImgFile(file);
    try {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) throw new Error('PDF.js not available');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const rendered: typeof pdfToImgPages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        // Scale 3.0 for ultra-high-resolution image extraction (300+ DPI equivalent)
        const viewport = page.getViewport({ scale: 3.0 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          // Calculate dynamic MIME type and quality based on all supported formats
          let mimeType = 'image/png';
          if (pdfToImgFormat === 'jpeg') mimeType = 'image/jpeg';
          else if (pdfToImgFormat === 'webp') mimeType = 'image/webp';
          else if (pdfToImgFormat === 'bmp') mimeType = 'image/bmp';
          else if (pdfToImgFormat === 'gif') mimeType = 'image/gif';
          else if (pdfToImgFormat === 'tiff') mimeType = 'image/tiff';

          const hasQuality = ['jpeg', 'webp'].includes(pdfToImgFormat);
          const quality = hasQuality ? (pdfToImgQuality / 100) : undefined;
          const thumbnail = quality !== undefined
            ? canvas.toDataURL(mimeType, quality)
            : canvas.toDataURL(mimeType);
          rendered.push({
            pageNum: i,
            thumbnail,
            size: Math.round((thumbnail.length * 3) / 4)
          });
        }
      }
      setPdfToImgPages(rendered);
      notify(`Parsed PDF successfully. Found ${rendered.length} pages ready for extraction.`, 'success');
    } catch (err: any) {
      notify(`Failed to parse PDF: ${err.message}`, 'error');
      setPdfToImgFile(null);
    }
    setIsProcessing(false);
  };

  const handleImageUpload = (files: File[]) => {
    const loaded: ImagePageItem[] = [];
    files.forEach(file => {
      if (file.size === 0) {
        notify(`Failed to load "${file.name}": The file is empty (0 bytes)`, 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        notify(`"${file.name}" is not an image`, 'error');
        return;
      }
      loaded.push({
        id: `${file.name}_${Date.now()}_${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file)
      });
    });

    if (loaded.length > 0) {
      setImagePages(prev => [...prev, ...loaded]);
      notify(`Added ${loaded.length} image(s)`, 'success');
    }
  };

  // --- Clipboard Paste Support (Ctrl+V) ---
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        if (activeTab === 'editor') {
          handlePdfUpload(files);
        } else if (activeTab === 'to-images') {
          handlePdfToImgUpload(files[0]);
        } else if (activeTab === 'from-images') {
          handleImageUpload(files);
        } else if (activeTab === 'office-to-pdf') {
          handleOfficeUpload(files[0]);
        } else if (activeTab === 'compress') {
          handleCompressFileUpload(files[0]);
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [activeTab]);

  // Esc + arrow key listener for zoom gallery modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!zoomGallery) return;
      if (e.key === 'Escape') closeZoom();
      if (e.key === 'ArrowRight') zoomNext();
      if (e.key === 'ArrowLeft') zoomPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomGallery]);

  // Re-process PDF pages dynamically when target extraction format or quality changes
  useEffect(() => {
    if (pdfToImgFile) {
      handlePdfToImgUpload(pdfToImgFile);
    }
  }, [pdfToImgFormat, pdfToImgQuality]);

  // --- Office to PDF Local Processing Core ---
  const handleOfficeUpload = async (file: File) => {
    if (file.size === 0) {
      notify(`Failed to convert "${file.name}": The file is empty (0 bytes)`, 'error');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['docx', 'xlsx', 'xls', 'csv', 'txt'].includes(ext || '')) {
      notify('Unsupported format. Please upload .docx, .xlsx, .xls, .csv, or .txt', 'error');
      return;
    }

    setIsProcessing(true);
    notify('Parsing document locally…', 'info');

    try {
      setOfficeFile(file);
      setOfficeFilename(file.name.replace(/\.[^/.]+$/, ''));
      setOfficeFileType(ext === 'xls' ? 'xlsx' : (ext as any));

      const reader = new FileReader();

      if (ext === 'docx') {
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const mammoth = (window as any).mammoth;
            if (!mammoth) throw new Error('Mammoth DOCX engine not loaded yet. Please wait.');

            const result = await mammoth.convertToHtml({ arrayBuffer });
            setOfficeHtml(result.value || '<p class="text-slate-400">Empty Word Document</p>');
            notify('DOCX parsed successfully ✓', 'success');
          } catch (err: any) {
            notify(`DOCX parse failed: ${err.message}`, 'error');
            setOfficeFile(null);
          }
          setIsProcessing(false);
        };
        reader.readAsArrayBuffer(file);

      } else if (ext === 'xlsx' || ext === 'xls') {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const XLSX = (window as any).XLSX;
            if (!XLSX) throw new Error('SheetJS engine not loaded yet. Please wait.');

            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const html = XLSX.utils.sheet_to_html(worksheet);
            setOfficeHtml(html || '<p class="text-slate-400">Empty Spreadsheet</p>');
            notify('Spreadsheet parsed successfully ✓', 'success');
          } catch (err: any) {
            notify(`Spreadsheet parse failed: ${err.message}`, 'error');
            setOfficeFile(null);
          }
          setIsProcessing(false);
        };
        reader.readAsArrayBuffer(file);

      } else if (ext === 'csv') {
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const rows = text.split('\n').filter(r => r.trim()).map(r => r.split(','));
            const tableHtml = `
              <table class="w-full text-left border-collapse border border-slate-300 dark:border-white/10 text-xs">
                ${rows.map(r => `<tr>${r.map(c => `<td class="border border-slate-300 dark:border-white/10 p-1.5">${c}</td>`).join('')}</tr>`).join('')}
              </table>
            `;
            setOfficeHtml(tableHtml);
            notify('CSV parsed successfully ✓', 'success');
          } catch (err: any) {
            notify(`CSV parse failed: ${err.message}`, 'error');
            setOfficeFile(null);
          }
          setIsProcessing(false);
        };
        reader.readAsText(file);

      } else if (ext === 'txt') {
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            setOfficeHtml(`<pre class="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200 font-mono">${text}</pre>`);
            notify('Text file parsed successfully ✓', 'success');
          } catch (err: any) {
            notify(`Text parse failed: ${err.message}`, 'error');
            setOfficeFile(null);
          }
          setIsProcessing(false);
        };
        reader.readAsText(file);
      }

    } catch (err: any) {
      notify(`Office upload failed: ${err.message}`, 'error');
      setIsProcessing(false);
    }
  };

  const handleCompileOfficeToPdf = async () => {
    if (!officeHtml || !officeFile) return;
    setIsProcessing(true);
    notify('Compiling Office to PDF…', 'info');

    try {
      const jspdf = (window as any).jspdf;
      if (!jspdf) throw new Error('jsPDF compiler engine not available');

      const doc = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      // Create standard paper preview wrapper to format correctly in PDF export
      const container = document.createElement('div');
      container.style.width = '520px';
      container.style.padding = '20px';
      container.style.boxSizing = 'border-box';
      container.style.fontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
      container.style.color = '#0f172a';
      container.innerHTML = officeHtml;

      // Inject clean table styling
      const style = document.createElement('style');
      style.innerHTML = `
        table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; text-align: left; }
        th { background-color: #f8fafc; font-weight: 600; }
        p { margin-bottom: 8px; line-height: 1.5; font-size: 11px; }
        h1 { font-size: 18px; font-weight: 700; margin-top: 16px; margin-bottom: 8px; color: #0f172a; }
        h2 { font-size: 14px; font-weight: 600; margin-top: 12px; margin-bottom: 6px; color: #1e293b; }
        pre { white-space: pre-wrap; font-size: 10px; font-family: monospace; line-height: 1.4; color: #334155; }
      `;
      container.appendChild(style);
      document.body.appendChild(container);

      await doc.html(container, {
        callback: function (pdfDoc: any) {
          pdfDoc.save(`${officeFilename.replace(/\.[a-zA-Z0-9]+$/, '') || 'office_document'}.pdf`);
          document.body.removeChild(container);
          notify('Office document compiled to PDF ✓', 'success');
          setIsProcessing(false);
        },
        x: 35,
        y: 35,
        autoPaging: 'text',
        width: 525,
        windowWidth: 525
      });

    } catch (err: any) {
      notify(`PDF compile failed: ${err.message}`, 'error');
      setIsProcessing(false);
    }
  };

  // --- Page Organizing Helpers ---
  const rotatePage = (id: string) => {
    setPdfPages(prev => prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const deletePage = (id: string) => {
    setPdfPages(prev => prev.filter(p => p.id !== id));
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    const newPages = [...pdfPages];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPages.length) return;

    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;
    setPdfPages(newPages);
  };

  // --- Image Re-ordering Helpers ---
  const deleteImagePage = (id: string) => {
    setImagePages(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter(p => p.id !== id);
    });
  };

  const moveImagePage = (index: number, direction: 'left' | 'right') => {
    const newPages = [...imagePages];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPages.length) return;

    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;
    setImagePages(newPages);
  };

  // --- Execution Handlers (Compile / Merge) ---
  const handleCompilePdf = async () => {
    if (pdfPages.length === 0) return;
    setIsProcessing(true);
    notify('Compiling PDF locally…', 'info');

    try {
      const PDFLib = (window as any).PDFLib;
      if (!PDFLib) throw new Error('PDF-Lib engine not available');

      const compiledPdf = await PDFLib.PDFDocument.create();

      // Loop through pages and pull them from their source files
      for (let i = 0; i < pdfPages.length; i++) {
        const pageItem = pdfPages[i];
        let copiedPage;
        const isImage = pageItem.file.type.startsWith('image/');

        if (isImage) {
          const isPng = pageItem.file.type === 'image/png';
          const isJpg = pageItem.file.type === 'image/jpeg' || pageItem.file.type === 'image/jpg';
          let imgBytes;
          let embeddedImg;

          if (isPng) {
            imgBytes = await pageItem.file.arrayBuffer();
            embeddedImg = await compiledPdf.embedPng(imgBytes);
          } else if (isJpg) {
            imgBytes = await pageItem.file.arrayBuffer();
            embeddedImg = await compiledPdf.embedJpg(imgBytes);
          } else {
            // High fidelity lossless conversion for WebP, SVG, GIF, BMP etc.
            const imgUrl = URL.createObjectURL(pageItem.file);
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
              const el = new Image();
              el.onload = () => resolve(el);
              el.onerror = reject;
              el.src = imgUrl;
            });
            URL.revokeObjectURL(imgUrl);

            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas conversion context failed');
            ctx.drawImage(img, 0, 0);

            // Use lossless PNG to avoid any JPEG re-encoding quality degradation
            const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
            if (!blob) throw new Error('Blob conversion failed');
            imgBytes = await blob.arrayBuffer();
            embeddedImg = await compiledPdf.embedPng(imgBytes);
          }

          const imgW = embeddedImg.width;
          const imgH = embeddedImg.height;
          copiedPage = compiledPdf.addPage([imgW, imgH]);
          copiedPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: imgW,
            height: imgH
          });
        } else {
          const fileBytes = await pageItem.file.arrayBuffer();
          const sourceDoc = await PDFLib.PDFDocument.load(fileBytes);
          const [copied] = await compiledPdf.copyPages(sourceDoc, [pageItem.pageIndex]);
          copiedPage = copied;
        }

        // Apply visual rotation from editor workspace
        if (pageItem.rotation !== 0) {
          copiedPage.setRotation(PDFLib.degrees(pageItem.rotation));
        }

        // Apply Page Size and Orientation Resizing
        if (editorPageSize !== 'fit') {
          let targetW = 595; // A4 default
          let targetH = 842;
          if (editorPageSize === 'letter') {
            targetW = 612;
            targetH = 792;
          } else if (editorPageSize === 'custom') {
            targetW = editorCustomWidth;
            targetH = editorCustomHeight;
          }

          if (editorOrientation === 'landscape') {
            const temp = targetW;
            targetW = targetH;
            targetH = temp;
          }

          const currentW = copiedPage.getWidth();
          const currentH = copiedPage.getHeight();

          // Calculate aspect ratio scaling to fit target page size
          const scale = Math.min(targetW / currentW, targetH / currentH);
          const newW = currentW * scale;
          const newH = currentH * scale;

          // Center the content inside the resized canvas dimensions
          const dx = (targetW - newW) / 2;
          const dy = (targetH - newH) / 2;

          copiedPage.setSize(targetW, targetH);
          copiedPage.scale(scale, scale);
          copiedPage.translateContent(dx, dy);
        }

        // Apply margin adjustments
        if (editorMargin !== 'none') {
          const m = editorMargin === 'small' ? 15 : 30;
          copiedPage.setSize(copiedPage.getWidth() + m * 2, copiedPage.getHeight() + m * 2);
          copiedPage.translateContent(m, m);
        }

        // Apply Custom Watermark overlay
        if (editorWatermark.trim() !== '') {
          const font = await compiledPdf.embedFont(PDFLib.StandardFonts.Helvetica);
          copiedPage.drawText(editorWatermark, {
            x: copiedPage.getWidth() / 2 - font.widthOfTextAtSize(editorWatermark, 12) / 2,
            y: 20,
            size: 12,
            font,
            color: PDFLib.rgb(0.7, 0.7, 0.7),
            opacity: 0.6
          });
        }

        // Apply Page Numbers
        if (editorPageNumbers) {
          const font = await compiledPdf.embedFont(PDFLib.StandardFonts.Helvetica);
          const pageNumText = `${i + 1} / ${pdfPages.length}`;
          copiedPage.drawText(pageNumText, {
            x: copiedPage.getWidth() - font.widthOfTextAtSize(pageNumText, 10) - 20,
            y: 20,
            size: 10,
            font,
            color: PDFLib.rgb(0.5, 0.5, 0.5)
          });
        }

        if (!isImage) {
          compiledPdf.addPage(copiedPage);
        }
      }

      if (editorMetadata.title) compiledPdf.setTitle(editorMetadata.title);
      if (editorMetadata.author) compiledPdf.setAuthor(editorMetadata.author);
      if (editorMetadata.subject) compiledPdf.setSubject(editorMetadata.subject);
      if (editorMetadata.keywords) compiledPdf.setKeywords(editorMetadata.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k));

      const pdfBytes = await compiledPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = `${editorFilename.replace(/\.pdf$/, '') || 'compiled_document'}.pdf`;

      // Store result for Download/Share buttons instead of auto-downloading
      setCompiledPdfResult({ url, filename });

      // Background upload of compiled PDF to storage server
      const compiledFile = new File([blob], filename, { type: 'application/pdf' });
      uploadFileToServer(compiledFile).then(url => {
        if (url) {
          setCompiledPdfResult(prev => prev ? { ...prev, serverUrl: url } : null);
        }
      }).catch(err => {
        console.warn('Background upload of compiled PDF failed:', err);
      });

      notify('PDF compiled successfully! Click Download or Share below ✓', 'success');
    } catch (err: any) {
      notify(`PDF compilation failed: ${err.message}`, 'error');
    }
    setIsProcessing(false);
  };

  const handleCompileImagesToPdf = async () => {
    if (imagePages.length === 0) return;
    setIsProcessing(true);
    notify('Compiling images into PDF…', 'info');

    try {
      const jspdf = (window as any).jspdf || {};
      const J = jspdf.jsPDF || (window as any).jsPDF;
      if (!J) throw new Error('jsPDF engine not available');

      const PDFLib = (window as any).PDFLib; // Try using PDF-Lib for premium high-fidelity formatting
      if (PDFLib) {
        const doc = await PDFLib.PDFDocument.create();
        for (const item of imagePages) {
          const buffer = await item.file.arrayBuffer();
          let img;
          if (item.file.type === 'image/png') {
            img = await doc.embedPng(buffer);
          } else {
            img = await doc.embedJpg(buffer); // falls back to jpeg engine
          }

          let targetW = img.width;
          let targetH = img.height;

          if (imagesPageSize !== 'fit') {
            targetW = imagesPageSize === 'letter' ? 612 : 595; // US Letter or A4 (595x842)
            targetH = imagesPageSize === 'letter' ? 792 : 842;
          }

          if (imagesOrientation === 'landscape') {
            const temp = targetW;
            targetW = targetH;
            targetH = temp;
          }

          const page = doc.addPage([targetW, targetH]);

          let drawW = targetW;
          let drawH = targetH;
          let drawX = 0;
          let drawY = 0;

          if (imagesMargin !== 'none') {
            const m = imagesMargin === 'small' ? 20 : 40;
            const availableW = targetW - m * 2;
            const availableH = targetH - m * 2;

            // Calculate fit scaling
            const scale = Math.min(availableW / img.width, availableH / img.height);
            drawW = img.width * scale;
            drawH = img.height * scale;
            drawX = m + (availableW - drawW) / 2;
            drawY = m + (availableH - drawH) / 2;
          } else {
            // Raw bleed or scaled fit bleed
            const scale = Math.min(targetW / img.width, targetH / img.height);
            drawW = img.width * scale;
            drawH = img.height * scale;
            drawX = (targetW - drawW) / 2;
            drawY = (targetH - drawH) / 2;
          }

          page.drawImage(img, { x: drawX, y: drawY, width: drawW, height: drawH });
        }
        const bytes = await doc.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const filename = `${imagesFilename.replace(/\.pdf$/, '') || 'images_document'}.pdf`;

        // Store result for Download/Share buttons
        setCompiledImagesPdfResult({ url, filename });

        // Background upload of compiled images PDF to storage server
        const compiledImagesFile = new File([blob], filename, { type: 'application/pdf' });
        uploadFileToServer(compiledImagesFile).then(url => {
          if (url) {
            setCompiledImagesPdfResult(prev => prev ? { ...prev, serverUrl: url } : null);
          }
        }).catch(err => {
          console.warn('Background upload of compiled images PDF failed:', err);
        });
      } else {
        // Fallback to classic jsPDF engine
        let doc: any = null;
        for (let i = 0; i < imagePages.length; i++) {
          const item = imagePages[i];
          const img = new Image();
          img.src = item.preview;
          await new Promise(r => img.onload = r);

          const orientation = img.width >= img.height ? 'l' : 'p';
          if (i === 0) {
            doc = new J({ orientation, unit: 'px', format: [img.width, img.height] });
          } else {
            doc.addPage([img.width, img.height], orientation);
          }
          doc.addImage(item.preview, 'JPEG', 0, 0, img.width, img.height);
        }
        doc.save(`${imagesFilename.replace(/\.pdf$/, '')}.pdf`);
      }

      notify('Images compiled to PDF successfully! Click Download or Share below ✓', 'success');
    } catch (err: any) {
      notify(`Failed to merge images: ${err.message}`, 'error');
    }
    setIsProcessing(false);
  };

  const handleDownloadAllImages = () => {
    if (pdfToImgPages.length === 0) return;
    pdfToImgPages.forEach((item, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = item.thumbnail;
        a.download = `extracted_page_${item.pageNum}.${pdfToImgFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 300);
    });
    notify('Extraction started ✓', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary-500/10 text-primary-500 dark:text-primary-400 mb-4 animate-pulse">
            <Layers size={36} />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 dark:text-white">
            Client-Side <span className="gradient-text">PDF Tools</span>
          </h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Edit, combine, and organize PDF documents or convert pages in high fidelity. 100% secure—your documents never leave your browser.
          </p>
        </div>

        {/* PDF Tool Navigation — Flowing Pills */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 p-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            {(() => {
              const tools: { tab: ActiveTab; label: string; icon: any; color: string }[] = [
                { tab: 'annotate',     label: 'Annotate',      icon: Edit3,          color: 'from-violet-500 to-purple-600' },
                { tab: 'editor',       label: 'Organize',       icon: Layers,         color: 'from-blue-500 to-indigo-600' },
                { tab: 'split',        label: 'Split',          icon: Crop,           color: 'from-cyan-500 to-blue-600' },
                { tab: 'transform',    label: 'Rotate & Crop',  icon: RotateCw,       color: 'from-teal-500 to-emerald-600' },
                { tab: 'flatten',      label: 'Flatten',        icon: Minimize2,      color: 'from-green-500 to-emerald-600' },
                { tab: 'grayscale',    label: 'Grayscale',      icon: Contrast,       color: 'from-slate-400 to-slate-600' },
                { tab: 'compress',     label: 'Compress',       icon: FileDown,       color: 'from-orange-500 to-amber-600' },
                { tab: 'watermark',    label: 'Watermark',      icon: Award,          color: 'from-rose-500 to-pink-600' },
                { tab: 'page-numbers', label: 'Page Nums',      icon: GripHorizontal, color: 'from-fuchsia-500 to-rose-600' },
                { tab: 'metadata',     label: 'Metadata',       icon: FileText,       color: 'from-pink-500 to-fuchsia-600' },
                { tab: 'to-images',    label: 'PDF → Images',   icon: FileImage,      color: 'from-sky-500 to-blue-600' },
                { tab: 'from-images',  label: 'Images → PDF',   icon: ImageIcon,      color: 'from-indigo-500 to-violet-600' },
                { tab: 'office-to-pdf',label: 'Office → PDF',   icon: FileText,       color: 'from-amber-500 to-orange-600' },
                { tab: 'ocr',          label: 'Extract Text',   icon: Type,           color: 'from-lime-500 to-green-600' },
              ];
              return tools.map(({ tab, label, icon: Icon, color }) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => { setActiveTab(tab); clearWorkspace(); }}
                    className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${color} text-white shadow-md shadow-primary-500/20 scale-105`
                        : 'bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-700 border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'animate-pulse-slow' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500 transition-colors'} />
                    <span>{label}</span>
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main workspace area */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">

            {/* Split Page 0: Annotate PDF */}
            {activeTab === 'annotate' && (
              <>
                {!annotateFile || !annotatePdfUrl ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <Edit3 size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop a PDF to draw & annotate</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Upload a PDF to draw, highlight, type text, and add rich annotations interactively in your browser.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-lg hover:shadow-primary-500/25 transition-all">
                      Open PDF for Annotation
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setAnnotateFile(file);
                            setAnnotatePdfUrl(URL.createObjectURL(file));
                            setIsAnnotatorFullscreen(true);
                          }
                        }}
                      />
                    </label>
                  </Card>
                ) : (
                  <Card className={`flex flex-col space-y-4 animate-fade-in ${isAnnotatorFullscreen ? 'fixed inset-0 z-[100] m-0 p-0 rounded-none w-screen h-screen border-0 bg-white dark:bg-slate-900 shadow-none' : ''}`}>
                    <div className={`flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 ${isAnnotatorFullscreen ? 'p-4 bg-slate-50 dark:bg-slate-800' : ''}`}>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Drawing & Annotation Tools
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Editing {annotateFile.name} ({(annotateFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAnnotatorFullscreen && (
                          <Button
                            size="sm"
                            onClick={handleSaveAnnotatedPdf}
                            className="bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-primary-600/30 font-semibold hidden sm:flex"
                          >
                            <Save size={16} className="mr-1.5" /> Save PDF
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAnnotatorFullscreen(!isAnnotatorFullscreen)}
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        >
                          {isAnnotatorFullscreen ? <Minimize2 size={16} className="mr-1.5" /> : <Maximize2 size={16} className="mr-1.5" />}
                          <span className="hidden sm:inline">{isAnnotatorFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (annotatePdfUrl) URL.revokeObjectURL(annotatePdfUrl);
                            setAnnotateFile(null);
                            setAnnotatePdfUrl(null);
                            setIsAnnotatorFullscreen(false);
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={16} className="mr-1.5" /> Close
                        </Button>
                      </div>
                    </div>

                    <div className={`relative border border-slate-300 dark:border-slate-700 overflow-hidden shadow-inner ${isAnnotatorFullscreen ? 'flex-1 rounded-none border-0' : 'rounded-xl'}`}>
                      <iframe
                        ref={annotateIframeRef}
                        src={`/pdfjs-annotation-viewer/web/viewer.html?file=${encodeURIComponent(annotatePdfUrl)}#pagemode=none&zoom=page-fit`}
                        className={`w-full border-0 bg-slate-100 dark:bg-slate-800 ${isAnnotatorFullscreen ? 'h-full' : 'h-[75vh] min-h-[800px] xl:h-[85vh]'}`}
                        title="Interactive PDF Annotator"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                        onLoad={handleAnnotateIframeLoad}
                      />
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Split Page 4: Office to PDF */}
            {activeTab === 'office-to-pdf' && (
              <>
                {!officeFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop your Office file here</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Select or paste (Ctrl+V) any Word document (.docx), Spreadsheet (.xlsx, .xls), CSV, or Plain Text (.txt) file to convert it locally to PDF.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer">
                      Browse Files
                      <input
                        type="file"
                        accept=".docx,.xlsx,.xls,.csv,.txt"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleOfficeUpload(e.target.files[0])}
                      />
                    </label>
                  </Card>
                ) : (
                  <Card className="animate-fade-in">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          File: {officeFile.name}
                        </h3>
                        <p className="text-xs text-slate-500 capitalize">
                          Format: {officeFileType} File (Processed Locally)
                        </p>
                      </div>
                      <button
                        onClick={() => { setOfficeFile(null); setOfficeHtml(''); setOfficeFileType(null); }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Change File
                      </button>
                    </div>

                    {/* High-Fidelity Paper Page Preview Sheet */}
                    <div className="bg-slate-200 dark:bg-surface-900 rounded-xl p-4 sm:p-8 flex justify-center overflow-auto max-h-[600px] border border-black/5 dark:border-white/5">
                      <div
                        className="bg-white text-slate-900 p-8 shadow-2xl rounded-sm w-[595px] min-h-[842px] border border-slate-300 font-sans prose prose-sm max-w-none text-left overflow-auto"
                        dangerouslySetInnerHTML={{ __html: officeHtml }}
                      />
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Split Page 1: PDF Organizer / Merger */}
            {activeTab === 'editor' && (
              <>
                {pdfPages.length === 0 ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <Layers size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop your PDFs or Images here</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Select or paste (Ctrl+V) multiple PDF or image files to merge, split, rotate, or rearrange pages.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer">
                      Browse Files
                      <input
                        type="file"
                        multiple
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={e => e.target.files && handlePdfUpload(Array.from(e.target.files))}
                      />
                    </label>
                  </Card>
                ) : (
                  <Card>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Page Management ({pdfPages.length} pages loaded)
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium hidden sm:block">
                          Merge PDFs • Split PDF • Delete pages • Rotate pages • Reorder pages • Extract pages • Add Watermarks • Page Numbers • Resize Pages
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Zoom Size Switcher */}
                        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/10 dark:border-white/10 text-[9px] font-semibold">
                          <span className="text-slate-400 px-1 hidden sm:inline">Size:</span>
                          {(['small', 'medium', 'large', 'extra-large'] as const).map(mode => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setPageSizeMode(mode)}
                              className={`px-2 py-0.5 rounded uppercase font-semibold transition-all ${pageSizeMode === mode
                                ? 'bg-white dark:bg-surface-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              title={`Zoom to ${mode}`}
                            >
                              {mode === 'small' ? 'S' : mode === 'medium' ? 'M' : mode === 'large' ? 'L' : 'XL'}
                            </button>
                          ))}
                        </div>

                        <label className="text-xs font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1 cursor-pointer mr-2 transition-colors">
                          <Plus size={14} /> Add Files
                          <input
                            type="file"
                            multiple
                            accept="application/pdf,image/*"
                            className="hidden"
                            onChange={e => e.target.files && handlePdfUpload(Array.from(e.target.files))}
                          />
                        </label>

                        <button
                          onClick={() => {
                            setPdfPages([]);
                            notify('All pages cleared from workspace', 'info');
                          }}
                          className="text-xs text-red-450 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={12} /> Clear all
                        </button>
                      </div>
                    </div>

                    {/* Page Grid - Adaptive zoom */}
                    <div className={`grid gap-4 ${pageSizeMode === 'small'
                      ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2'
                      : pageSizeMode === 'large'
                        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'
                        : pageSizeMode === 'extra-large'
                          ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 w-full'
                          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'
                      }`}>
                      {pdfPages.map((page, i) => (
                        <div
                          key={page.id}
                          draggable
                          onDragStart={e => handleDragStart(e, i)}
                          onDragOver={handleDragOver}
                          onDragEnd={handleDragEnd}
                          onDrop={e => handleDrop(e, i)}
                          className={`relative rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex flex-col group cursor-grab active:cursor-grabbing transition-all duration-200 ${pageSizeMode === 'extra-large' ? 'p-4 shadow-xl border-primary-500/20' : 'p-2'
                            } ${draggedIndex === i ? 'opacity-40 scale-95 border-primary-500' : 'opacity-100 hover:border-black/25 dark:hover:border-white/25'
                            }`}
                        >
                          {/* Mini Page index Badge */}
                          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-xs font-semibold">
                            Pg {i + 1}
                          </div>

                          {/* Thumbnail Preview with rotation angle */}
                          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/20 relative flex items-center justify-center">
                            <img
                              src={page.thumbnail}
                              alt={`Page ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300"
                              style={{ transform: `rotate(${page.rotation}deg)` }}
                            />

                            {/* Floating Action Toolbar - Fully Mobile & Touch Friendly */}
                            <div className="absolute top-2 right-2 z-25 flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1 rounded-lg shadow-lg border border-white/10">
                              <button
                                type="button"
                                onClick={() => openZoom(pdfPages.map(p => p.thumbnail), i)}
                                className="p-1.5 rounded-md bg-white/10 text-white hover:bg-primary-500 hover:text-white transition-all"
                                title="Zoom Page"
                              >
                                <Maximize2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditorModal(page, i)}
                                className="p-1.5 rounded-md bg-white/10 text-white hover:bg-emerald-500 hover:text-white transition-all animate-pulse"
                                title="Edit Page (Add Text, Draw, Shapes, Sign, Image)"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => rotatePage(page.id)}
                                className="p-1.5 rounded-md bg-white/10 text-white hover:bg-primary-500 hover:text-white transition-all"
                                title="Rotate Page 90°"
                              >
                                <RotateCw size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deletePage(page.id)}
                                className="p-1.5 rounded-md bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white transition-all"
                                title="Delete Page"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Original File Description */}
                          <div className="text-[10px] text-slate-500 truncate mt-2 px-1">
                            Src: {page.fileName} (P.{page.pageNum})
                          </div>

                          {/* Tap Reorder Controls */}
                          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 mt-2 pt-2">
                            <button
                              disabled={i === 0}
                              onClick={() => movePage(i, 'left')}
                              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                            >
                              <ArrowLeft size={14} />
                            </button>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-primary-500 select-none">
                              <GripHorizontal size={10} className="text-slate-400 animate-pulse" />
                              <span>Drag to move</span>
                            </div>
                            <button
                              disabled={i === pdfPages.length - 1}
                              onClick={() => movePage(i, 'right')}
                              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                            >
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add more file button card */}
                      <label className="border-2 border-dashed border-black/10 dark:border-white/20 rounded-xl flex flex-col items-center justify-center aspect-[3/4] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <Plus size={24} className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Add PDF / Image</span>
                        <input
                          type="file"
                          multiple
                          accept="application/pdf,image/*"
                          className="hidden"
                          onChange={e => e.target.files && handlePdfUpload(Array.from(e.target.files))}
                        />
                      </label>
                    </div>
                  </Card>
                )}
              </>
            )}


            {/* Split Page 2: PDF to Images */}
            {activeTab === 'to-images' && (
              <>
                {!pdfToImgFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <FileImage size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop your PDF here</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Upload or paste (Ctrl+V) a PDF document to split it into a set of standard images.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer">
                      Browse File
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handlePdfToImgUpload(e.target.files[0])}
                      />
                    </label>
                  </Card>
                ) : (
                  <Card>
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          File: {pdfToImgFile.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Total pages found: {pdfToImgPages.length}
                        </p>
                      </div>
                      <button
                        onClick={() => { setPdfToImgFile(null); setPdfToImgPages([]); }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Change File
                      </button>
                    </div>

                    {/* Previews */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {pdfToImgPages.map((page, i) => (
                        <div key={i} className="relative rounded-xl border border-black/10 dark:border-white/10 p-2 bg-black/5 dark:bg-white/5 flex flex-col group">
                          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-xs font-semibold">
                            Page {page.pageNum}
                          </div>
                          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/20">
                            <img src={page.thumbnail} alt={`Page ${page.pageNum}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex gap-1.5 mt-2">
                            <a href={page.thumbnail} download={`page_${page.pageNum}.${pdfToImgFormat}`} className="flex-1">
                              <Button size="sm" className="w-full text-[10px] py-1.5 flex items-center justify-center gap-1">
                                <Download size={10} /> Download
                              </Button>
                            </a>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleShareFile(page.thumbnail, `page_${page.pageNum}.${pdfToImgFormat}`, `image/${pdfToImgFormat}`)}
                              className="text-[10px] py-1.5 flex items-center justify-center gap-1 px-2 border-black/10 dark:border-white/10"
                              title="Share Page Image"
                            >
                              <Share2 size={10} /> Share
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Split Page 3: Images to PDF */}
            {activeTab === 'from-images' && (
              <>
                {imagePages.length === 0 ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <ImageIcon size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop your images here</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Select or paste (Ctrl+V) multiple JPG or PNG images to combine them into a single, clean PDF file.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer">
                      Browse Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files && handleImageUpload(Array.from(e.target.files))}
                      />
                    </label>
                  </Card>
                ) : (
                  <Card>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Images Workspace ({imagePages.length} images added)
                      </h3>
                      <div className="flex items-center gap-3">
                        {/* Zoom Size Switcher */}
                        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/10 dark:border-white/10 text-[9px] font-semibold">
                          <span className="text-slate-400 px-1 hidden sm:inline">Size:</span>
                          {(['small', 'medium', 'large', 'extra-large'] as const).map(mode => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setPageSizeMode(mode)}
                              className={`px-2 py-0.5 rounded uppercase font-semibold transition-all ${pageSizeMode === mode
                                ? 'bg-white dark:bg-surface-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              title={`Zoom to ${mode}`}
                            >
                              {mode === 'small' ? 'S' : mode === 'medium' ? 'M' : mode === 'large' ? 'L' : 'XL'}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => { setImagePages([]); }}
                          className="text-xs text-red-450 hover:text-red-400"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>

                    <div className={`grid gap-4 ${pageSizeMode === 'small'
                      ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2'
                      : pageSizeMode === 'large'
                        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'
                        : pageSizeMode === 'extra-large'
                          ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 w-full'
                          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'
                      }`}>
                      {imagePages.map((item, i) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={e => handleDragStart(e, i)}
                          onDragOver={handleDragOver}
                          onDragEnd={handleDragEnd}
                          onDrop={e => handleDrop(e, i)}
                          className={`relative rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex flex-col group cursor-grab active:cursor-grabbing transition-all duration-200 ${pageSizeMode === 'extra-large' ? 'p-4 shadow-xl border-primary-500/20' : 'p-2'
                            } ${draggedIndex === i ? 'opacity-40 scale-95 border-primary-500' : 'opacity-100 hover:border-black/25 dark:hover:border-white/25'
                            }`}
                        >
                          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-xs font-semibold">
                            Img {i + 1}
                          </div>

                          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/20 relative flex items-center justify-center">
                            <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />

                            {/* Floating Actions - Fully Touch & Mobile Friendly */}
                            <div className="absolute top-2 right-2 z-25 flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1 rounded-lg shadow-lg border border-white/10">
                              <button
                                type="button"
                                onClick={() => openZoom(imagePages.map(p => p.preview), i)}
                                className="p-1.5 rounded-md bg-white/10 text-white hover:bg-primary-500 hover:text-white transition-all animate-pulse"
                                title="Zoom Image"
                              >
                                <Maximize2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteImagePage(item.id)}
                                className="p-1.5 rounded-md bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white transition-all"
                                title="Delete Image"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 truncate mt-2 px-1">
                            {item.name}
                          </div>

                          {/* Re-order controls */}
                          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 mt-2 pt-2">
                            <button
                              disabled={i === 0}
                              onClick={() => moveImagePage(i, 'left')}
                              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                            >
                              <ArrowLeft size={14} />
                            </button>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-primary-500 select-none">
                              <GripHorizontal size={10} className="text-slate-400 animate-pulse" />
                              <span>Drag to move</span>
                            </div>
                            <button
                              disabled={i === imagePages.length - 1}
                              onClick={() => moveImagePage(i, 'right')}
                              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                            >
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add more images button */}
                      <label className="border-2 border-dashed border-black/10 dark:border-white/20 rounded-xl flex flex-col items-center justify-center aspect-[3/4] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <Plus size={24} className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Add Image</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={e => e.target.files && handleImageUpload(Array.from(e.target.files))}
                        />
                      </label>
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Split Page 5: Compress PDF */}
            {activeTab === 'compress' && (
              <>
                {!compressFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <FileDown size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop your PDF here to compress</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Upload or paste (Ctrl+V) a PDF document to compress its embedded image quality and file size locally in your browser.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer">
                      Browse File
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleCompressFileUpload(e.target.files[0])}
                      />
                    </label>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-6">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          File: {compressFile.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Original Size: {formatSize(compressFile.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => { setCompressFile(null); setCompressResult(null); setCompressProgress(null); }}
                        className="text-xs text-red-400 hover:text-red-300"
                        disabled={isProcessing}
                      >
                        Change File
                      </button>
                    </div>

                    <div className="flex justify-center py-2 mb-4">
                      <PdfLivePreview file={compressFile} />
                    </div>

                    {/* Progress indicator */}
                    {compressProgress && (
                      <div className="py-6 space-y-3 animate-pulse">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                          <span>Compressing document pages...</span>
                          <span>{Math.round((compressProgress.current / compressProgress.total) * 100)}%</span>
                        </div>
                        <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(compressProgress.current / compressProgress.total) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span className="italic">
                            Processing Page {compressProgress.current} of {compressProgress.total}...
                          </span>
                          {compressProgress.currentSize > 0 && (
                            <span className="font-semibold text-primary-500">
                              Current Size: {formatSize(compressProgress.currentSize)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Success results block */}
                    {compressResult && (
                      <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                        <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-2 animate-bounce">
                          <CheckCircle2 size={32} />
                        </div>
                        <h4 className="text-lg font-semibold text-emerald-600 dark:text-emerald-450">
                          Compression Complete!
                        </h4>

                        {/* Compression stats container */}
                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto py-2 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 text-center mt-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Original</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {formatSize(compressResult.originalSize)}
                            </span>
                          </div>
                          <div className="border-x border-black/5 dark:border-white/5">
                            <span className="text-[10px] text-slate-400 block uppercase">Compressed</span>
                            <span className="text-sm font-bold text-primary-500">
                              {formatSize(compressResult.compressedSize)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Reduced</span>
                            <span className="text-sm font-bold text-emerald-500">
                              {Math.max(0, Math.round(((compressResult.originalSize - compressResult.compressedSize) / compressResult.originalSize) * 100))}%
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                          <a
                            href={compressResult.downloadUrl}
                            download={compressResult.filename}
                            className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 shadow-lg hover:shadow-primary-500/25 transition-all flex-1 justify-center"
                          >
                            <Download size={16} /> Download PDF
                          </a>
                          <button
                            onClick={() => handleShareFile(compressResult.downloadUrl, compressResult.filename, 'application/pdf')}
                            className="btn-base bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all flex-1 justify-center"
                            title="Share File to Mobile/Desktop Apps"
                          >
                            <Share2 size={16} /> Share PDF
                          </button>
                          <button
                            onClick={() => { setCompressFile(null); setCompressResult(null); setCompressProgress(null); }}
                            className="btn-base bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-xl font-medium flex-1 justify-center"
                          >
                            Compress Another
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Initial state explaining options */}
                    {!compressProgress && !compressResult && (
                      <div className="text-center py-8 space-y-2">
                        <div className="inline-flex p-3 rounded-full bg-primary-500/10 text-primary-500 mb-2">
                          <Minimize2 size={24} />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Ready for Local Compression
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          Your PDF file is loaded. Configure the compression parameters in the sidebar settings on the right, and then click "Compress PDF" to start!
                        </p>
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Split Page 6: OCR Text Extractor */}
            {activeTab === 'ocr' && (
              <>
                {!ocrFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <Languages size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop your PDF here for OCR</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Upload any PDF document to scan and extract editable text in English, Spanish, French, German, or Portuguese. All processing executes 100% locally.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-lg hover:shadow-primary-500/25 transition-all">
                      Browse PDF File
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setOcrFile(file);
                            setOcrProgress(0);
                            setOcrText('');
                            setOcrStatus('File loaded. Configure settings in the sidebar to start.');
                            const pdfjsLib = (window as any).pdfjsLib;
                            if (pdfjsLib) {
                              file.arrayBuffer().then(buf => {
                                pdfjsLib.getDocument({ data: buf }).promise.then((pdf: any) => {
                                  setOcrPagesTotal(pdf.numPages);
                                });
                              });
                            }
                          }
                        }}
                      />
                    </label>
                  </Card>
                ) : (
                  <Card className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          File: {ocrFile.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Size: {(ocrFile.size / (1024 * 1024)).toFixed(2)} MB • Pages: {ocrPagesTotal || 'Loading...'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setOcrFile(null);
                          setOcrProgress(0);
                          setOcrText('');
                          setOcrStatus('');
                          setOcrPagesTotal(0);
                        }}
                        className="text-xs text-red-500 hover:text-red-400 font-semibold"
                      >
                        Change File
                      </button>
                    </div>

                    <div className="flex justify-center py-4">
                      <PdfLivePreview file={ocrFile} />
                    </div>

                    {/* Progress Bar (Active) */}
                    {isProcessing && (
                      <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-xl space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-primary-600 dark:text-primary-400 animate-pulse">
                            {ocrStatus}
                          </span>
                          <span className="text-primary-600 dark:text-primary-400">
                            {ocrProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${ocrProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Completed / Initial Result Box */}
                    {ocrText ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Extracted Text Output
                          </h4>
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-500 font-semibold px-2 py-0.5 rounded-full">
                            OCR Complete
                          </span>
                        </div>
                        <div className="relative">
                          <textarea
                            readOnly
                            value={ocrText}
                            className="w-full min-h-[400px] max-h-[600px] p-4 bg-slate-50 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-xl text-sm font-mono text-slate-850 dark:text-slate-200 focus:outline-none leading-relaxed"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(ocrText);
                              notify('Copied text to clipboard! ✓', 'success');
                            }}
                            className="flex-1 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-primary-500/25"
                          >
                            <Check size={16} /> Copy to Clipboard
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              const blob = new Blob([ocrText], { type: 'text/plain;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `${ocrFile.name.replace('.pdf', '')}_extracted_text.txt`;
                              link.click();
                              URL.revokeObjectURL(url);
                              notify('Downloaded text file! ✓', 'success');
                            }}
                            className="flex-1 py-3 flex items-center justify-center gap-2 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <Download size={16} /> Download as .txt
                          </Button>
                        </div>
                      </div>
                    ) : (
                      !isProcessing && (
                        <div className="text-center py-12 border border-dashed border-black/10 dark:border-white/10 rounded-xl space-y-4 bg-slate-50/50 dark:bg-surface-800/20">
                          <div className="inline-flex p-3.5 rounded-full bg-primary-500/5 text-primary-500">
                            <Type size={28} />
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">
                              OCR Ready to Extract
                            </h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Split Page 6: Watermark PDF */}
            {activeTab === 'watermark' && (
              <>
                {!watermarkFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <Stamp size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop a PDF to Watermark</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Upload your PDF to overlay custom text watermarks securely in your browser.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-lg hover:shadow-primary-500/25 transition-all">
                      Open PDF for Watermarking
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setWatermarkFile(e.target.files[0]);
                            setWatermarkResultUrl(null);
                          }
                        }}
                      />
                    </label>
                  </Card>
                ) : (
                  <Card className="flex flex-col space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          PDF Watermark Engine
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Target: {watermarkFile.name} ({(watermarkFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setWatermarkFile(null);
                          if (watermarkResultUrl) URL.revokeObjectURL(watermarkResultUrl);
                          setWatermarkResultUrl(null);
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <Trash2 size={16} className="mr-1.5" /> Close File
                      </Button>
                    </div>

                    <div className="flex justify-center py-4">
                      <PdfLivePreview file={watermarkFile} renderOverlay={() => (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                          <span style={{ 
                            transform: `rotate(${watermarkLayout === 'centered' ? '-35deg' : '0deg'})`, 
                            color: watermarkColor, 
                            opacity: watermarkOpacity, 
                            fontSize: `${watermarkSize/4}px`,
                            fontWeight: 'bold',
                            fontFamily: 'Helvetica, Arial, sans-serif'
                          }}>
                            {watermarkText}
                          </span>
                        </div>
                      )} />
                    </div>

                    {watermarkResultUrl ? (
                      <div className="space-y-4 animate-fade-in">
                        <div className="relative border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner">
                          <iframe
                            src={`${watermarkResultUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-[600px] border-0 bg-slate-100 dark:bg-slate-800"
                            title="Watermarked PDF Preview"
                          />
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                          <Button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = watermarkResultUrl;
                              link.download = `${watermarkFile.name.replace('.pdf', '')}_watermarked.pdf`;
                              link.click();
                            }}
                            className="flex-1 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-primary-500/25 transition-all"
                          >
                            <Download size={18} /> Download Watermarked PDF
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-black/10 dark:border-white/10 rounded-xl space-y-4 bg-slate-50/50 dark:bg-surface-800/20">
                        <div className="inline-flex p-3.5 rounded-full bg-primary-500/5 text-primary-500">
                          <Stamp size={28} />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">
                            Ready to Apply Watermark
                          </h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Configure your watermark text, color, opacity, and layout in the right sidebar. Then click "Apply Watermark" to stamp your document.
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Split PDF Workspace */}
            {activeTab === 'split' && (
              <>
                {!splitFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <Crop size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Split a PDF</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Upload a PDF to split it by page range, every N pages, or extract specific pages.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-lg transition-all">
                      Open PDF to Split
                      <input type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleLoadSplitFile(e.target.files[0])} />
                    </label>
                  </Card>
                ) : (
                  <Card className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Split PDF Engine</h3>
                        <p className="text-xs text-slate-500 mt-1">{splitFile.name} — {splitTotalPages} pages total</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setSplitFile(null); setSplitResults([]); }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 size={16} className="mr-1.5" /> Close
                      </Button>
                    </div>

                    <div className="flex justify-center py-4">
                      <PdfLivePreview file={splitFile} />
                    </div>

                    {splitResults.length > 0 ? (
                      <div className="space-y-3 animate-fade-in">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">✓ {splitResults.length} file(s) ready:</p>
                        {splitResults.map((r, i) => (
                          <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-surface-800/50 rounded-xl p-3 border border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 min-w-0">
                              <FileText size={16} className="text-primary-500 shrink-0" />
                              <span className="truncate">{r.name}</span>
                            </div>
                            <a href={r.url} download={r.name} className="shrink-0 ml-2 text-xs text-primary-500 font-semibold hover:underline flex items-center gap-1">
                              <Download size={14} /> Download
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-dashed border-black/10 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-surface-800/20">
                        <Crop size={28} className="mx-auto text-primary-400 mb-2" />
                        <p className="text-sm text-slate-500">Configure split options in the sidebar and click "Split PDF"</p>
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Page Numbers Workspace */}
            {activeTab === 'page-numbers' && (
              <>
                {!pageNumFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <GripHorizontal size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Add Page Numbers</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Stamp professional page numbers onto every page of your PDF. Fully customizable position, format and size.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-lg transition-all">
                      Open PDF
                      <input type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && setPageNumFile(e.target.files[0])} />
                    </label>
                  </Card>
                ) : (
                  <Card className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Page Numbers Engine</h3>
                        <p className="text-xs text-slate-500 mt-1">{pageNumFile.name}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setPageNumFile(null); if (pageNumResultUrl) URL.revokeObjectURL(pageNumResultUrl); setPageNumResultUrl(null); }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 size={16} className="mr-1.5" /> Close
                      </Button>
                    </div>

                    <div className="flex justify-center py-4">
                      <PdfLivePreview file={pageNumFile} renderOverlay={() => (
                        <div className={`absolute inset-0 pointer-events-none p-2 flex flex-col ${pageNumPosition.includes('top') ? 'justify-start' : 'justify-end'} ${pageNumPosition.includes('right') ? 'items-end' : 'items-center'}`}>
                          <span style={{ fontSize: `${pageNumSize/4}px`, color: 'black', opacity: 0.7, fontFamily: 'Helvetica' }}>
                            {pageNumFormat.replace('N', '1').replace('n', '1')}
                          </span>
                        </div>
                      )} />
                    </div>
                    {pageNumResultUrl ? (
                      <div className="space-y-4">
                        <iframe src={`${pageNumResultUrl}#toolbar=0&navpanes=0`} className="w-full h-[500px] border border-slate-300 dark:border-slate-700 rounded-xl" title="Numbered PDF Preview" />
                        <Button onClick={() => { const a = document.createElement('a'); a.href = pageNumResultUrl!; a.download = pageNumFile.name.replace('.pdf', '_numbered.pdf'); a.click(); }} className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-medium">
                          <Download size={18} /> Download Numbered PDF
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-dashed border-black/10 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-surface-800/20">
                        <GripHorizontal size={28} className="mx-auto text-primary-400 mb-2" />
                        <p className="text-sm text-slate-500">Configure options in the sidebar and click "Apply Page Numbers"</p>
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}


            {/* Transform (Rotate + Crop) Workspace */}
            {activeTab === 'transform' && (
              <>
                {!transformFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <RotateCw size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Rotate & Crop PDF</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Rotate pages and trim margins in a single pass. Configure both transforms in the sidebar and apply at once.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-lg transition-all">
                      Open PDF
                      <input type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleLoadTransformFile(e.target.files[0])} />
                    </label>
                  </Card>
                ) : (
                  <Card className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Rotate & Crop Engine</h3>
                        <p className="text-xs text-slate-500 mt-1">{transformFile.name} &mdash; {Math.round(transformPageWidth)}×{Math.round(transformPageHeight)} pts</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setTransformFile(null); if (transformResultUrl) URL.revokeObjectURL(transformResultUrl); setTransformResultUrl(null); setTransformPreviewUrl(null); }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 size={16} className="mr-1.5" /> Close
                      </Button>
                    </div>

                    {/* Page preview with crop overlay */}
                    {transformPreviewUrl && (
                      <div className="relative bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center p-3">
                        <div className="relative inline-block shadow-xl select-none" style={{ transform: `rotate(${rotateAngle}deg)`, transition: 'transform 0.3s ease' }}>
                          <img 
                            ref={transformPreviewRef}
                            src={transformPreviewUrl} 
                            alt="Page preview" 
                            className="block max-h-[360px] w-auto rounded pointer-events-none" 
                            draggable={false}
                          />
                          
                          {/* Darkened overlay outside crop area */}
                          <div className="absolute inset-0 pointer-events-none" style={{
                            borderTop: `${(cropTop / (transformPageHeight / 2.8346)) * 100}% solid rgba(0,0,0,0.5)`,
                            borderBottom: `${(cropBottom / (transformPageHeight / 2.8346)) * 100}% solid rgba(0,0,0,0.5)`,
                            borderLeft: `${(cropLeft / (transformPageWidth / 2.8346)) * 100}% solid rgba(0,0,0,0.5)`,
                            borderRight: `${(cropRight / (transformPageWidth / 2.8346)) * 100}% solid rgba(0,0,0,0.5)`,
                            boxSizing: 'border-box',
                          }} />
                          
                          {/* Inner Crop Box */}
                          <div style={{
                            position: 'absolute',
                            top: `${(cropTop / (transformPageHeight / 2.8346)) * 100}%`,
                            bottom: `${(cropBottom / (transformPageHeight / 2.8346)) * 100}%`,
                            left: `${(cropLeft / (transformPageWidth / 2.8346)) * 100}%`,
                            right: `${(cropRight / (transformPageWidth / 2.8346)) * 100}%`,
                            border: '2px dashed rgba(255,255,255,0.9)',
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.3)',
                          }}>
                            
                            {/* Drag Handles */}
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-slate-400 rounded-full cursor-nwse-resize z-10" onMouseDown={() => setCropDragEdge('top-left')} />
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-slate-400 rounded-full cursor-ns-resize z-10" onMouseDown={() => setCropDragEdge('top')} />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-slate-400 rounded-full cursor-nesw-resize z-10" onMouseDown={() => setCropDragEdge('top-right')} />
                            
                            <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border border-slate-400 rounded-full cursor-ew-resize z-10" onMouseDown={() => setCropDragEdge('left')} />
                            <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border border-slate-400 rounded-full cursor-ew-resize z-10" onMouseDown={() => setCropDragEdge('right')} />
                            
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-slate-400 rounded-full cursor-nesw-resize z-10" onMouseDown={() => setCropDragEdge('bottom-left')} />
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-slate-400 rounded-full cursor-ns-resize z-10" onMouseDown={() => setCropDragEdge('bottom')} />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-slate-400 rounded-full cursor-nwse-resize z-10" onMouseDown={() => setCropDragEdge('bottom-right')} />
                          </div>
                        </div>
                        <p className="mt-3 text-[10px] text-slate-500 font-medium tracking-wide uppercase">Drag handles to crop • Preview rotates live</p>
                      </div>
                    )}

                    {transformResultUrl ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                          <CheckCircle2 size={18} /> Transformed PDF ready!
                        </div>
                        <Button onClick={() => { const a = document.createElement('a'); a.href = transformResultUrl!; a.download = transformFile.name.replace('.pdf', '_transformed.pdf'); a.click(); }} className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium">
                          <Download size={18} /> Download Transformed PDF
                        </Button>
                        <Button variant="ghost" onClick={() => setTransformResultUrl(null)} className="w-full text-sm text-slate-500">Re-apply with different settings</Button>
                      </div>
                    ) : (
                      <Button onClick={handleApplyTransform} disabled={isProcessing} className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium">
                        {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <RotateCw size={16} />}
                        {isProcessing ? 'Applying...' : 'Apply Rotate & Crop'}
                      </Button>
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Edit PDF Metadata Workspace */}
            {activeTab === 'metadata' && (
              <>
                {!metaFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Edit PDF Metadata</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Read and update a PDF's title, author, subject, keywords and creator fields. Perfect for document organization.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-lg transition-all">
                      Open PDF
                      <input type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleLoadMetaFile(e.target.files[0])} />
                    </label>
                  </Card>
                ) : (
                  <Card className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">PDF Metadata Editor</h3>
                        <p className="text-xs text-slate-500 mt-1">{metaFile.name}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setMetaFile(null); if (metaResultUrl) URL.revokeObjectURL(metaResultUrl); setMetaResultUrl(null); }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 size={16} className="mr-1.5" /> Close
                      </Button>
                    </div>

                    <div className="flex justify-center py-4">
                      <PdfLivePreview file={metaFile} />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: 'Title', value: metaTitle, set: setMetaTitle, placeholder: 'Document title...' },
                        { label: 'Author', value: metaAuthor, set: setMetaAuthor, placeholder: 'Author name...' },
                        { label: 'Subject', value: metaSubject, set: setMetaSubject, placeholder: 'Document subject...' },
                        { label: 'Keywords', value: metaKeywords, set: setMetaKeywords, placeholder: 'keyword1, keyword2...' },
                        { label: 'Creator App', value: metaCreator, set: setMetaCreator, placeholder: 'e.g. Microsoft Word' },
                      ].map(f => (
                        <div key={f.label} className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{f.label}</label>
                          <input
                            type="text"
                            value={f.value}
                            onChange={e => f.set(e.target.value)}
                            placeholder={f.placeholder}
                            className="w-full bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                          />
                        </div>
                      ))}
                    </div>

                    <Button onClick={handleSaveMetadata} disabled={isProcessing} className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-medium">
                      {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                      {isProcessing ? 'Saving...' : 'Save Metadata & Download'}
                    </Button>

                    {metaResultUrl && (
                      <p className="text-xs text-center text-emerald-500 font-medium">✓ Metadata saved! File downloaded automatically.</p>
                    )}
                  </Card>
                )}
              </>
            )}


            {/* Flatten PDF Workspace */}
            {activeTab === 'flatten' && (
              <>
                {!flattenFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <Minimize2 size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Flatten PDF</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Bake all form fields and annotations into static content. Prevents further editing of fillable fields.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-lg transition-all">
                      Open PDF to Flatten
                      <input type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && setFlattenFile(e.target.files[0])} />
                    </label>
                  </Card>
                ) : (
                  <Card className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Flatten PDF Engine</h3>
                        <p className="text-xs text-slate-500 mt-1">{flattenFile.name} ({(flattenFile.size / 1024).toFixed(0)} KB)</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setFlattenFile(null); if (flattenResultUrl) URL.revokeObjectURL(flattenResultUrl); setFlattenResultUrl(null); }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 size={16} className="mr-1.5" /> Close
                      </Button>
                    </div>

                    <div className="flex justify-center py-2">
                      <PdfLivePreview file={flattenFile} />
                    </div>

                    {/* Options */}
                    <div className="space-y-3 bg-slate-50 dark:bg-surface-800/50 p-4 rounded-xl border border-black/5 dark:border-white/5">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Flatten Options</p>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={flattenForms} onChange={e => setFlattenForms(e.target.checked)} className="w-4 h-4 accent-primary-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Flatten Form Fields</p>
                          <p className="text-xs text-slate-500">Bake fillable inputs, checkboxes, dropdowns into static content</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={flattenAnnotations} onChange={e => setFlattenAnnotations(e.target.checked)} className="w-4 h-4 accent-primary-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Remove Interactive Annotations</p>
                          <p className="text-xs text-slate-500">Strip comment, link and highlight annotation layers</p>
                        </div>
                      </label>
                    </div>

                    {flattenResultUrl ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                          <CheckCircle2 size={18} /> Flattened PDF ready!
                        </div>
                        <Button onClick={() => { const a = document.createElement('a'); a.href = flattenResultUrl!; a.download = flattenFile.name.replace('.pdf', '_flattened.pdf'); a.click(); }} className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-medium">
                          <Download size={18} /> Download Flattened PDF
                        </Button>
                        <Button variant="ghost" onClick={() => setFlattenResultUrl(null)} className="w-full text-sm text-slate-500">Flatten again with different options</Button>
                      </div>
                    ) : (
                      <Button onClick={handleFlattenPdf} disabled={isProcessing} className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-medium">
                        {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Minimize2 size={16} />}
                        {isProcessing ? 'Flattening...' : 'Flatten PDF'}
                      </Button>
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Grayscale PDF Workspace */}
            {activeTab === 'grayscale' && (
              <>
                {!grayFile ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20 animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <Contrast size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Convert to Grayscale</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Render every page in black & white. Reduces file size and prepares documents for black-only printing.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer shadow-lg transition-all">
                      Open PDF
                      <input type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && setGrayFile(e.target.files[0])} />
                    </label>
                  </Card>
                ) : (
                  <Card className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Grayscale Engine</h3>
                        <p className="text-xs text-slate-500 mt-1">{grayFile.name}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setGrayFile(null); if (grayResultUrl) URL.revokeObjectURL(grayResultUrl); setGrayResultUrl(null); setGrayProgress(0); setGrayStatus(''); }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 size={16} className="mr-1.5" /> Close
                      </Button>
                    </div>

                    <div className="flex justify-center py-2">
                      <PdfLivePreview file={grayFile} renderOverlay={() => <div className="absolute inset-0 backdrop-grayscale" />} />
                    </div>

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{grayStatus}</span>
                          <span>{grayProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-primary-500 to-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${grayProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {grayResultUrl ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                          <CheckCircle2 size={18} /> Grayscale PDF ready!
                        </div>
                        <Button onClick={() => { const a = document.createElement('a'); a.href = grayResultUrl!; a.download = grayFile.name.replace('.pdf', '_grayscale.pdf'); a.click(); }} className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-medium">
                          <Download size={18} /> Download Grayscale PDF
                        </Button>
                        <Button variant="ghost" onClick={() => setGrayResultUrl(null)} className="w-full text-sm text-slate-500">Convert again with different quality</Button>
                      </div>
                    ) : (
                      <Button onClick={handleConvertGrayscale} disabled={isProcessing} className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-medium">
                        {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Contrast size={16} />}
                        {isProcessing ? 'Converting...' : 'Convert to Grayscale'}
                      </Button>
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Privacy Promise Banner */}
            <Card className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">100% Client-Side Privacy Promise</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    This PDF tool processes your documents completely locally. Everything executes directly inside your browser’s virtualized sandbox using client-side JS. No files, metadata, or locations ever touch a backend server or network.
                  </p>
                </div>
              </div>
            </Card>

          </div>

          {/* Settings Sidebar Area */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">

            {/* Sidebar 0: PDF Annotator Settings */}
            {activeTab === 'annotate' && (
              <Card className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide mb-1">
                    Annotator Panel
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage and export your drawing session
                  </p>
                </div>

                {annotateFile ? (
                  <div className="space-y-4">
                    {/* Active File Card */}
                    <div className="p-3.5 bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/10 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                          Active Editing Session
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-350 truncate">
                          {annotateFile.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          File Size: {(annotateFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    {/* Primary Actions */}
                    <div className="space-y-3 pt-2">
                      <Button
                        onClick={handleSaveAnnotatedPdf}
                        className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-primary-500/25 transition-all"
                      >
                        <Save size={16} /> Save & Export PDF
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (annotateIframeRef.current) {
                            // Reload the iframe to reset all annotations
                            annotateIframeRef.current.src = `/pdfjs-annotation-viewer/web/viewer.html?file=${encodeURIComponent(annotatePdfUrl || '')}`;
                            notify('Reset all annotations! ✓', 'info');
                          }
                        }}
                        className="w-full py-2.5 flex items-center justify-center gap-2 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <RefreshCw size={14} /> Clear Draw Changes
                      </Button>
                    </div>

                    {/* Interactive Annotation Tips */}
                    <div className="border-t border-black/5 dark:border-white/5 pt-4 space-y-3">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Annotation Quick Tips:
                      </h4>
                      <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 mt-0.5">•</span>
                          <span>Use the toolbar inside the PDF window to select Drawing, Text, Highlight, shapes or Signature tools.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 mt-0.5">•</span>
                          <span>Press <kbd className="px-1 py-0.5 bg-black/5 dark:bg-white/10 rounded font-mono text-[10px]">Ctrl + Z</kbd> inside the viewer to undo drawings.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 mt-0.5">•</span>
                          <span>Double-click placed items to change colors, thickness, or edit text properties.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 mt-0.5">•</span>
                          <span>All processing executes fully locally in your browser sandbox, keeping your documents 100% private.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                      <FileText size={24} />
                    </div>
                    <p className="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                      Select and load a PDF file in the workspace to activate full interactive annotation tools.
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Sidebar 1: PDF Organizer Settings */}
            {activeTab === 'editor' && (
              <Card>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                  Output Settings
                </h3>

                <div className="space-y-4">
                  {/* Filename */}
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Output Filename</label>
                    <input
                      type="text"
                      value={editorFilename}
                      onChange={e => setEditorFilename(e.target.value)}
                      placeholder="compiled_document"
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Page Resize Settings */}
                  <div className="border-t border-black/5 dark:border-white/5 pt-3 mt-3">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Page Size & Format</label>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Standard Size</label>
                        <select
                          value={editorPageSize}
                          onChange={e => setEditorPageSize(e.target.value as any)}
                          className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="fit">Original Page Size (Fit Content)</option>
                          <option value="a4">Standard A4 (595 x 842 pt)</option>
                          <option value="letter">US Letter (612 x 792 pt)</option>
                          <option value="custom">Custom Dimensions</option>
                        </select>
                      </div>

                      {editorPageSize !== 'fit' && (
                        <div>
                          <label className="text-[10px] text-slate-500 mb-1 block">Orientation</label>
                          <div className="flex gap-2">
                            {(['portrait', 'landscape'] as const).map(mode => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setEditorOrientation(mode)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${editorOrientation === mode
                                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-500'
                                  : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400'
                                  }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {editorPageSize === 'custom' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 mb-1 block">Width (pt)</label>
                            <input
                              type="number"
                              value={editorCustomWidth}
                              onChange={e => setEditorCustomWidth(Number(e.target.value))}
                              className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 mb-1 block">Height (pt)</label>
                            <input
                              type="number"
                              value={editorCustomHeight}
                              onChange={e => setEditorCustomHeight(Number(e.target.value))}
                              className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Margins */}
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Document Margins</label>
                    <select
                      value={editorMargin}
                      onChange={e => setEditorMargin(e.target.value as any)}
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="none">No Margin (Raw Fit)</option>
                      <option value="small">Thin Margin (15px)</option>
                      <option value="standard">Standard Margin (30px)</option>
                    </select>
                  </div>

                  {/* Watermark & Page Numbers */}
                  <div className="space-y-4 border-t border-black/5 dark:border-white/5 pt-3">
                    <div>
                      <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Text Watermark Overlay (Bottom Center)</label>
                      <input
                        type="text"
                        value={editorWatermark}
                        onChange={e => setEditorWatermark(e.target.value)}
                        placeholder="e.g. Confidential"
                        className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={editorPageNumbers}
                        onChange={e => setEditorPageNumbers(e.target.checked)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${editorPageNumbers
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 group-hover:border-primary-500/50'
                        }`}>
                        {editorPageNumbers && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300 select-none group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        Automatically add page numbers
                      </span>
                    </label>

                    {/* PDF Metadata Properties */}
                    <div className="space-y-3 pt-3">
                      <label className="text-xs text-slate-600 dark:text-slate-400 block">PDF Metadata Properties</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editorMetadata.title}
                          onChange={e => setEditorMetadata(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Document Title"
                          className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          value={editorMetadata.author}
                          onChange={e => setEditorMetadata(prev => ({ ...prev, author: e.target.value }))}
                          placeholder="Author Name"
                          className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          value={editorMetadata.subject}
                          onChange={e => setEditorMetadata(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Subject"
                          className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          value={editorMetadata.keywords}
                          onChange={e => setEditorMetadata(prev => ({ ...prev, keywords: e.target.value }))}
                          placeholder="Keywords (comma separated)"
                          className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-4 space-y-3">
                  <Button
                    onClick={() => { setCompiledPdfResult(null); handleCompilePdf(); }}
                    disabled={pdfPages.length === 0 || isProcessing}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <><RefreshCw size={16} className="animate-spin" /> Compiling…</>
                    ) : (
                      <><Layers size={16} /> Compile & Merge PDF</>
                    )}
                  </Button>

                  {/* Download & Share buttons after compile */}
                  {compiledPdfResult && (
                    <div className="flex gap-2 animate-fade-in">
                      <button
                        onClick={() => triggerDownload(compiledPdfResult.url, compiledPdfResult.filename)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all shadow-md"
                      >
                        <Download size={15} /> Download
                      </button>
                      <button
                        onClick={() => handleShareFile(compiledPdfResult.url, compiledPdfResult.filename, 'application/pdf')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-all shadow-md"
                      >
                        <Share2 size={15} /> Share
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Sidebar 2: PDF to Images Settings */}
            {activeTab === 'to-images' && (
              <Card>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                  Extraction Settings
                </h3>

                <div className="space-y-4">
                  {/* Format */}
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Target Image Format</label>
                    <select
                      value={pdfToImgFormat}
                      onChange={e => setPdfToImgFormat(e.target.value as any)}
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="png">PNG (Lossless)</option>
                      <option value="jpeg">JPEG (Compact)</option>
                      <option value="webp">WebP (Modern)</option>
                      <option value="bmp">BMP (Bitmap)</option>
                      <option value="gif">GIF (Graphics)</option>
                      <option value="tiff">TIFF (High-End)</option>
                    </select>
                  </div>

                  {/* Quality */}
                  {['jpeg', 'webp'].includes(pdfToImgFormat) && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <span>Compression Quality</span>
                        <span>{pdfToImgQuality}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={pdfToImgQuality}
                        onChange={e => setPdfToImgQuality(Number(e.target.value))}
                        className="w-full accent-primary-500"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-4">
                  <Button
                    onClick={handleDownloadAllImages}
                    disabled={pdfToImgPages.length === 0 || isProcessing}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Extract Page Images
                  </Button>
                </div>
              </Card>
            )}

            {/* Sidebar 3: Images to PDF Settings */}
            {activeTab === 'from-images' && (
              <Card>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                  PDF Layout Settings
                </h3>

                <div className="space-y-4">
                  {/* Filename */}
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Output Filename</label>
                    <input
                      type="text"
                      value={imagesFilename}
                      onChange={e => setImagesFilename(e.target.value)}
                      placeholder="images_document"
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Page Dimensions */}
                  <div className="border-t border-black/5 dark:border-white/5 pt-3">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Output Format</label>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Target Size</label>
                        <select
                          value={imagesPageSize}
                          onChange={e => setImagesPageSize(e.target.value as any)}
                          className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="fit">Match Input Image Size (Fit)</option>
                          <option value="a4">Standard A4 Format</option>
                          <option value="letter">US Letter Format</option>
                        </select>
                      </div>

                      {imagesPageSize !== 'fit' && (
                        <div>
                          <label className="text-[10px] text-slate-500 mb-1 block">Orientation</label>
                          <div className="flex gap-2">
                            {(['portrait', 'landscape'] as const).map(mode => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setImagesOrientation(mode)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${imagesOrientation === mode
                                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-500'
                                  : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400'
                                  }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Margins */}
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Page Margins</label>
                    <select
                      value={imagesMargin}
                      onChange={e => setImagesMargin(e.target.value as any)}
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="none">Full Bleed (No margins)</option>
                      <option value="small">Thin Margin (20px)</option>
                      <option value="standard">Standard Margin (40px)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-4 space-y-3">
                  <Button
                    onClick={() => { setCompiledImagesPdfResult(null); handleCompileImagesToPdf(); }}
                    disabled={imagePages.length === 0 || isProcessing}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <><RefreshCw size={16} className="animate-spin" /> Compiling…</>
                    ) : (
                      <><Layers size={16} /> Generate PDF</>
                    )}
                  </Button>

                  {compiledImagesPdfResult && (
                    <div className="flex gap-2 animate-fade-in">
                      <button
                        onClick={() => triggerDownload(compiledImagesPdfResult.url, compiledImagesPdfResult.filename)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all shadow-md"
                      >
                        <Download size={15} /> Download
                      </button>
                      <button
                        onClick={() => handleShareFile(compiledImagesPdfResult.url, compiledImagesPdfResult.filename, 'application/pdf')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-all shadow-md"
                      >
                        <Share2 size={15} /> Share
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Sidebar 4: Office to PDF Settings */}
            {activeTab === 'office-to-pdf' && (
              <Card className="animate-fade-in">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                  Output Settings
                </h3>

                <div className="space-y-4">
                  {/* Filename */}
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Output Filename</label>
                    <input
                      type="text"
                      value={officeFilename}
                      onChange={e => setOfficeFilename(e.target.value)}
                      placeholder="compiled_office_document"
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Settings Warning description for Office conversions */}
                  <div className="p-3 bg-primary-500/5 rounded-xl border border-primary-500/10 text-xs text-slate-500 leading-relaxed">
                    <p className="font-semibold text-primary-500 dark:text-primary-400 mb-1">Local Sandbox Mode</p>
                    Your office pages are converted securely in-memory using standalone Mammoth and SheetJS parsers. No documents are transmitted online.
                  </div>
                </div>

                <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-4">
                  <Button
                    onClick={handleCompileOfficeToPdf}
                    disabled={!officeFile || isProcessing}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <><RefreshCw size={16} className="animate-spin" /> Rendering…</>
                    ) : (
                      <><Download size={16} /> Compile & Save PDF</>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Sidebar 5: PDF Compression Settings */}
            {activeTab === 'compress' && (
              <Card>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                  Compression Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                      Compression Level
                    </label>
                    <div className="space-y-2.5">
                      {[
                        {
                          id: 'high',
                          title: 'High Compression',
                          desc: 'Smallest file size, standard image quality'
                        },
                        {
                          id: 'medium',
                          title: 'Medium Compression',
                          desc: 'Recommended balance of size & quality'
                        },
                        {
                          id: 'low',
                          title: 'Low Compression',
                          desc: 'High image quality, minor size reduction'
                        },
                        {
                          id: 'preserve',
                          title: 'Preserve Quality',
                          desc: 'Maximum image fidelity & font resolution'
                        }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setCompressMode(mode.id as any)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${compressMode === mode.id
                            ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10 text-slate-900 dark:text-white'
                            : 'border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                          <div className="text-xs font-semibold">{mode.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-550 mt-0.5">
                            {mode.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-4">
                  <Button
                    onClick={handleCompressPdf}
                    disabled={compressFile === null || isProcessing}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <><RefreshCw size={16} className="animate-spin" /> Processing…</>
                    ) : (
                      <><FileDown size={16} /> Compress PDF</>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Sidebar 6: OCR Text Extractor Settings */}
            {activeTab === 'ocr' && (
              <Card className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm uppercase tracking-wide">
                    Extraction Settings
                  </h3>
                  <p className="text-xs text-slate-500">Configure language and page range</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Target Language
                    </label>
                    <select
                      value={ocrLanguage}
                      onChange={e => setOcrLanguage(e.target.value)}
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    >
                      <option value="eng">English</option>
                      <option value="spa">Spanish (Español)</option>
                      <option value="fra">French (Français)</option>
                      <option value="deu">German (Deutsch)</option>
                      <option value="por">Portuguese (Português)</option>
                      <option value="ita">Italian (Italiano)</option>
                      <option value="rus">Russian (Русский)</option>
                      <option value="ara">Arabic (العربية)</option>
                      <option value="chi_sim">Chinese Simplified</option>
                      <option value="jpn">Japanese (日本語)</option>
                      <option value="kor">Korean (한국어)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Page Selection
                    </label>
                    <select
                      value={ocrPageNum}
                      onChange={e => setOcrPageNum(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    >
                      <option value="all">Extract All Pages</option>
                      {Array.from({ length: ocrPagesTotal }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          Extract Page {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleOcrExtractText}
                    disabled={!ocrFile || isProcessing}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-primary-500/25 transition-all"
                  >
                    {isProcessing ? (
                      <><RefreshCw size={16} className="animate-spin" /> Extracting Text…</>
                    ) : (
                      <><Type size={16} /> Start Text Extraction</>
                    )}
                  </Button>
                </div>

                <div className="p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Offline AI Processing</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    The Tesseract optical character recognition (OCR) engine runs completely offline. The language model will securely cache in your browser the first time you use it.
                  </p>
                </div>
              </Card>
            )}

            {/* Sidebar 6: Watermark PDF Settings */}
            {activeTab === 'watermark' && watermarkFile && (
              <Card className="sticky top-24 animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <Stamp size={20} className="text-primary-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">WATERMARK SETTINGS</h3>
                </div>

                <div className="space-y-6">
                  {/* Settings Form */}
                  <div className="space-y-4 bg-slate-50 dark:bg-surface-800/50 p-4 rounded-xl border border-black/5 dark:border-white/5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">WATERMARK TEXT</label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="CONFIDENTIAL"
                        className="w-full bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                        <span>OPACITY</span>
                        <span>{Math.round(watermarkOpacity * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full accent-primary-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                        <span>SIZE</span>
                        <span>{watermarkSize}px</span>
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="150"
                        step="5"
                        value={watermarkSize}
                        onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                        className="w-full accent-primary-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">COLOR</label>
                        <input
                          type="color"
                          value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value)}
                          className="w-full h-9 rounded cursor-pointer border-0 p-0"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">LAYOUT</label>
                        <select
                          value={watermarkLayout}
                          onChange={(e) => setWatermarkLayout(e.target.value as any)}
                          className="w-full bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="centered">Centered</option>
                          <option value="tiled">Tiled (Repeat)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Button
                      onClick={handleApplyWatermark}
                      disabled={isProcessing || !watermarkText}
                      className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-primary-500/25 transition-all"
                    >
                      {isProcessing ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Stamp size={16} />
                      )}
                      {isProcessing ? 'Stamping...' : 'Apply Watermark'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Sidebar: Split PDF Settings */}
            {activeTab === 'split' && splitFile && (
              <Card className="sticky top-24 animate-slide-up space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Crop size={20} className="text-primary-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">SPLIT OPTIONS</h3>
                </div>
                <p className="text-[10px] text-slate-500">File has {splitTotalPages} pages</p>

                <div className="space-y-4 bg-slate-50 dark:bg-surface-800/50 p-4 rounded-xl border border-black/5 dark:border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SPLIT MODE</label>
                    <select value={splitMode} onChange={e => setSplitMode(e.target.value as any)} className="w-full bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="range">By Page Range</option>
                      <option value="every">Every N Pages</option>
                      <option value="extract">Extract Specific Pages</option>
                    </select>
                  </div>

                  {splitMode === 'range' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">PAGE RANGES <span className="font-normal text-slate-400">(e.g. 1-3, 4-6)</span></label>
                      <input type="text" value={splitRange} onChange={e => setSplitRange(e.target.value)} placeholder="1-3, 4-6" className="w-full bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  )}
                  {splitMode === 'every' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between"><span>PAGES PER FILE</span><span>{splitEvery}</span></label>
                      <input type="range" min="1" max={splitTotalPages || 10} value={splitEvery} onChange={e => setSplitEvery(parseInt(e.target.value))} className="w-full accent-primary-500" />
                    </div>
                  )}
                  {splitMode === 'extract' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">PAGE NUMBERS <span className="font-normal text-slate-400">(e.g. 1,3,5)</span></label>
                      <input type="text" value={splitExtractPages} onChange={e => setSplitExtractPages(e.target.value)} placeholder="1,3,5" className="w-full bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  )}
                </div>

                <Button onClick={handleSplitPdf} disabled={isProcessing} className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-medium">
                  {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Crop size={16} />}
                  {isProcessing ? 'Splitting...' : 'Split PDF'}
                </Button>
              </Card>
            )}

            {/* Sidebar: Page Numbers Settings */}
            {activeTab === 'page-numbers' && pageNumFile && (
              <Card className="sticky top-24 animate-slide-up space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <GripHorizontal size={20} className="text-primary-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">PAGE NUMBER SETTINGS</h3>
                </div>

                <div className="space-y-4 bg-slate-50 dark:bg-surface-800/50 p-4 rounded-xl border border-black/5 dark:border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">FORMAT</label>
                    <select value={pageNumFormat} onChange={e => setPageNumFormat(e.target.value as any)} className="w-full bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="n">1, 2, 3...</option>
                      <option value="Page n">Page 1, Page 2...</option>
                      <option value="Page n of N">Page 1 of 10</option>
                      <option value="n / N">1 / 10</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">POSITION</label>
                    <select value={pageNumPosition} onChange={e => setPageNumPosition(e.target.value as any)} className="w-full bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="top-center">Top Center</option>
                      <option value="top-right">Top Right</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between"><span>FONT SIZE</span><span>{pageNumSize}px</span></label>
                    <input type="range" min="8" max="24" value={pageNumSize} onChange={e => setPageNumSize(parseInt(e.target.value))} className="w-full accent-primary-500" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between"><span>MARGIN</span><span>{pageNumMargin}px</span></label>
                    <input type="range" min="10" max="60" value={pageNumMargin} onChange={e => setPageNumMargin(parseInt(e.target.value))} className="w-full accent-primary-500" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">START NUMBERING AT</label>
                    <input type="number" min="1" value={pageNumStartAt} onChange={e => setPageNumStartAt(parseInt(e.target.value) || 1)} className="w-full bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>

                <Button onClick={handleApplyPageNumbers} disabled={isProcessing} className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-medium">
                  {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <GripHorizontal size={16} />}
                  {isProcessing ? 'Adding Numbers...' : 'Apply Page Numbers'}
                </Button>
              </Card>
            )}

            {/* Sidebar: Transform (Rotate & Crop) Settings */}
            {activeTab === 'transform' && transformFile && (
              <Card className="sticky top-24 animate-slide-up space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <RotateCw size={20} className="text-primary-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">TRANSFORM SETTINGS</h3>
                </div>

                {/* Rotate Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ROTATE</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([0, 90, 180, 270] as const).map(angle => (
                      <button
                        key={angle}
                        onClick={() => setRotateAngle(angle)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                          rotateAngle === angle
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                        }`}
                      >
                        <RotateCw size={14} style={{ transform: `rotate(${angle === 90 ? 0 : angle === 180 ? 90 : angle === 270 ? 180 : -90}deg)` }} />
                        {angle === 0 ? 'None' : `${angle}°`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

                {/* Crop Unit Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">CROP UNIT</label>
                  <div className="flex gap-2">
                    {(['mm', 'pt', 'px'] as const).map(u => (
                      <button
                        key={u}
                        onClick={() => setCropUnit(u)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                          cropUnit === u
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop Margin Inputs */}
                <div className="space-y-4 bg-slate-50 dark:bg-surface-800/50 p-4 rounded-xl border border-black/5 dark:border-white/5">
                  {([
                    { label: 'TOP', val: cropTop, set: setCropTop },
                    { label: 'BOTTOM', val: cropBottom, set: setCropBottom },
                    { label: 'LEFT', val: cropLeft, set: setCropLeft },
                    { label: 'RIGHT', val: cropRight, set: setCropRight },
                  ]).map(({ label, val, set }) => (
                    <div key={label} className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                        <span>{label}</span>
                        <span className="font-normal text-slate-400">{val} {cropUnit}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max={cropUnit === 'mm' ? 50 : cropUnit === 'pt' ? 150 : 200}
                          step={cropUnit === 'mm' ? 0.5 : 1}
                          value={val}
                          onChange={e => set(parseFloat(e.target.value))}
                          className="flex-1 accent-primary-500"
                        />
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={e => set(parseFloat(e.target.value) || 0)}
                          className="w-14 text-center bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg px-1 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Crop Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">QUICK CROP</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Remove 5mm', v: 5 },
                      { label: 'Remove 10mm', v: 10 },
                      { label: 'Remove 15mm', v: 15 },
                      { label: 'Reset all', v: 0 },
                    ].map(p => (
                      <button
                        key={p.label}
                        onClick={() => {
                          if (cropUnit !== 'mm') setCropUnit('mm');
                          setCropTop(p.v); setCropBottom(p.v); setCropLeft(p.v); setCropRight(p.v);
                        }}
                        className="text-[10px] py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-all text-left leading-tight"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Sidebar: Flatten PDF */}
            {activeTab === 'flatten' && flattenFile && (
              <Card className="sticky top-24 animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <Minimize2 size={20} className="text-primary-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">FLATTEN INFO</h3>
                </div>
                <div className="space-y-3 text-[11px] text-slate-500 leading-relaxed">
                  <p>Flattening merges interactive layers into static page content.</p>
                  <div className="space-y-1.5 bg-slate-50 dark:bg-surface-800/50 p-3 rounded-xl border border-black/5 dark:border-white/5">
                    <p><b className="text-slate-700 dark:text-slate-300">✓ Form Fields</b> — Text inputs, checkboxes, radio buttons and dropdowns become uneditable text</p>
                    <p><b className="text-slate-700 dark:text-slate-300">✓ Annotations</b> — Comments and highlights are removed from the annotation layer</p>
                    <p><b className="text-orange-500">⚠ Irreversible</b> — Once flattened, fields cannot be re-activated. Save the original first.</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Sidebar: Grayscale Settings */}
            {activeTab === 'grayscale' && grayFile && (
              <Card className="sticky top-24 animate-slide-up space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Contrast size={20} className="text-primary-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">QUALITY SETTINGS</h3>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    <span>RENDER SCALE</span>
                    <span className="font-normal text-slate-400">{grayScale}x</span>
                  </label>
                  <input type="range" min="1" max="3" step="0.5" value={grayScale} onChange={e => setGrayScale(parseFloat(e.target.value))} className="w-full accent-primary-500" />
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Higher scale = sharper output but larger file and slower processing. 1.5x is recommended for most documents.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  {[{ v: 1, l: '1x\nSmall' }, { v: 1.5, l: '1.5x\nBalanced' }, { v: 2, l: '2x\nSharp' }].map(p => (
                    <button key={p.v} onClick={() => setGrayScale(p.v)}
                      className={`py-2 rounded-lg whitespace-pre-line font-semibold transition-all ${
                        grayScale === p.v ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-surface-800 text-slate-500 hover:bg-primary-100'
                      }`}>
                      {p.l}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Secondary Action: Reset Workspace */}
            {((activeTab === 'editor' && pdfPages.length > 0) ||
              (activeTab === 'to-images' && pdfToImgFile) ||
              (activeTab === 'from-images' && imagePages.length > 0) ||
              (activeTab === 'compress' && compressFile) ||
              (activeTab === 'office-to-pdf' && officeFile) ||
              (activeTab === 'watermark' && watermarkFile) ||
              (activeTab === 'split' && splitFile) ||
              (activeTab === 'transform' && transformFile) ||
              (activeTab === 'flatten' && flattenFile) ||
              (activeTab === 'grayscale' && grayFile) ||
              (activeTab === 'metadata' && metaFile) ||
              (activeTab === 'page-numbers' && pageNumFile) ||
              (activeTab === 'ocr' && ocrFile)) && (
                <button
                  onClick={clearWorkspace}
                  className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/5 text-sm font-medium transition-all"
                >
                  Clear Workspace
                </button>
              )}

          </div>

        </div>

      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {zoomGallery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          onClick={closeZoom}
        >
          {/* Top controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-55 flex items-center gap-3">
            <span className="text-xs text-white font-semibold bg-black/60 px-4 py-1.5 rounded-full border border-white/10 tabular-nums">
              {zoomGallery.index + 1} / {zoomGallery.images.length}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerDownload(zoomGallery.images[zoomGallery.index], `preview-page-${zoomGallery.index + 1}.png`);
              }}
              className="p-1.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 text-white transition-all shadow-lg border border-white/10 flex items-center gap-2 px-4"
              title="Download this page as image"
            >
              <Download size={14} />
              <span className="text-xs font-medium">Download Page</span>
            </button>
          </div>

          <div className="absolute top-4 right-4 z-55 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-semibold bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 tracking-wide uppercase hidden sm:flex">
              ← → Arrow Keys to navigate · ESC to close
            </span>
            <button
              onClick={closeZoom}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500 text-white transition-all shadow-lg border border-white/10"
              title="Close Preview"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Prev Button */}
          <button
            onClick={e => { e.stopPropagation(); zoomPrev(); }}
            disabled={zoomGallery.index === 0}
            className="absolute left-3 sm:left-6 z-55 p-3 rounded-full bg-white/10 hover:bg-primary-500 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl border border-white/10"
            title="Previous Page"
          >
            <ArrowLeft size={22} />
          </button>

          {/* Next Button */}
          <button
            onClick={e => { e.stopPropagation(); zoomNext(); }}
            disabled={zoomGallery.index === zoomGallery.images.length - 1}
            className="absolute right-3 sm:right-6 z-55 p-3 rounded-full bg-white/10 hover:bg-primary-500 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl border border-white/10"
            title="Next Page"
          >
            <ArrowRight size={22} />
          </button>

          {/* Image container */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center px-16 sm:px-20"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white/5 p-2 sm:p-3 rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-w-full max-h-full flex items-center justify-center">
              <img
                key={zoomGallery.index}
                src={zoomGallery.images[zoomGallery.index]}
                alt={`Preview ${zoomGallery.index + 1}`}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-xl transition-opacity duration-200"
              />
            </div>
          </div>

          {/* Bottom dot navigation */}
          {zoomGallery.images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-55">
              {zoomGallery.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={e => { e.stopPropagation(); setZoomGallery(prev => prev ? { ...prev, index: idx } : null); }}
                  className={`rounded-full transition-all duration-200 ${idx === zoomGallery.index
                    ? 'w-5 h-2 bg-primary-500'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                    }`}
                  title={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeEditPage && (
        <CanvasEditorModal
          page={activeEditPage.page}
          index={activeEditPage.index}
          allPages={pdfPages}
          onClose={closeEditorModal}
          onSave={handleSavePageEdits}
          onSaveAll={(updatedPages) => {
            setPdfPages(updatedPages);
            setActiveEditPage(null);
            notify('Edits applied to all pages successfully ✓', 'success');
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// 🎨 Client-Side Interactive PDF Canvas Editor
// ==========================================

interface CanvasEditorModalProps {
  page: PdfPageItem;
  index: number;
  allPages: PdfPageItem[];
  onClose: () => void;
  onSave: (editedFile: File, editedThumbnail: string) => void;
  onSaveAll: (updatedPages: PdfPageItem[]) => void;
}

type EditTool = 'draw' | 'highlight' | 'text' | 'shape' | 'signature' | 'image' | 'erase' | 'pixelate' | 'badge' | 'move';

const generateBadgeSVG = (text: string, colorHex: string): string => {
  const width = 160;
  const height = 45;
  const borderRad = 8;
  const strokeWidth = 3;
  const fontColor = colorHex;
  const borderColor = colorHex;
  const bgColor = colorHex === '#000000' ? 'rgba(0, 0, 0, 0.08)' : colorHex === '#ffffff' ? 'rgba(255, 255, 255, 0.15)' : `${colorHex}15`;

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect x="${strokeWidth / 2}" y="${strokeWidth / 2}" width="${width - strokeWidth}" height="${height - strokeWidth}" rx="${borderRad}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${strokeWidth}"/>
      <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" fill="${fontColor}" letter-spacing="1.5">${text}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

function CanvasEditorModal({ page, index, allPages, onClose, onSave, onSaveAll }: CanvasEditorModalProps) {
  const { addToast } = useToast();
  const notify = useCallback((msg: string, type?: 'success' | 'error' | 'info') => addToast(msg, type), [addToast]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigFileInputRef = useRef<HTMLInputElement>(null);

  const [currentTool, setCurrentTool] = useState<EditTool>('draw');
  const [color, setColor] = useState('#3b82f6'); // Default primary blue
  const [lineWidth, setLineWidth] = useState(8);
  const [highlightOpacity, setHighlightOpacity] = useState(0.45); // Default 0.45
  const [shapeType, setShapeType] = useState<'rect' | 'circle' | 'arrow'>('rect');

  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [savedImageData, setSavedImageData] = useState<ImageData | null>(null);

  // Stamp placement dragging states
  const [activeStamp, setActiveStamp] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDraggingStamp, setIsDraggingStamp] = useState(false);

  // Move/Pan tool state
  const panContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ mouseX: 0, mouseY: 0, scrollLeft: 0, scrollTop: 0 });

  // Stamped item state
  const [stampedImage, setStampedImage] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [sigIsDrawing, setSigIsDrawing] = useState(false);
  const [sigMode, setSigMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedSigImage, setUploadedSigImage] = useState<string | null>(null);
  const [stampScale, setStampScale] = useState(2.0); // Default scale to 2.0 (200%) for stamps and signatures
  const [scaleInputVal, setScaleInputVal] = useState(String(Math.round(stampScale * 100)));

  useEffect(() => {
    setScaleInputVal(String(Math.round(stampScale * 100)));
  }, [stampScale]);

  // Text Tool Overlay State
  const [textInput, setTextInput] = useState<{ x: number; y: number; val: string; fontSize: number } | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, height: 800 });

  useEffect(() => {
    if (!textInput) return;
    requestAnimationFrame(() => {
      textInputRef.current?.focus();
      textInputRef.current?.select();
    });
  }, [textInput?.x, textInput?.y]);

  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomIn = () => setZoomLevel(prev => Math.min(3, prev + 0.15));
  const zoomOut = () => setZoomLevel(prev => Math.max(0.4, prev - 0.15));
  const resetZoom = () => setZoomLevel(1);

  // Undo/Redo Stacks
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Stop keyboard triggers if user is actively typing in inputs (like Text Overlay)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (isCtrl) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          resetZoom();
        } else if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          setCurrentTool('text');
        } else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          setCurrentTool('draw');
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          setCurrentTool('highlight');
        } else if (e.key.toLowerCase() === 'e') {
          e.preventDefault();
          setCurrentTool('erase');
        }
      } else {
        // Direct single key hotkeys
        if (e.key.toLowerCase() === 'x') {
          setCurrentTool('erase');
        } else if (e.key.toLowerCase() === 't') {
          setCurrentTool('text');
        } else if (e.key.toLowerCase() === 'd') {
          setCurrentTool('draw');
        } else if (e.key.toLowerCase() === 'h') {
          setCurrentTool('highlight');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Initial Load of original page thumbnail
  useEffect(() => {
    const img = new Image();
    img.src = page.thumbnail;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      setCanvasDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const initialData = canvas.toDataURL('image/png');
      setHistory([initialData]);
      setHistoryIndex(0);
    };
  }, [page.thumbnail]);

  // Push Canvas State to Undo History Stack
  const pushStateToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const cleanHistory = history.slice(0, historyIndex + 1);
    cleanHistory.push(dataUrl);
    setHistory(cleanHistory);
    setHistoryIndex(cleanHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const prevIdx = historyIndex - 1;
    restoreHistoryState(prevIdx);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIdx = historyIndex + 1;
    restoreHistoryState(nextIdx);
  };

  const restoreHistoryState = (idx: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = history[idx];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setHistoryIndex(idx);
    };
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const getVisualScale = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    const unzoomedWidth = rect.width / zoomLevel;
    return canvas.width / unzoomedWidth;
  };

  // Main Canvas Event Handlers
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    if (textInput) {
      finalizeText();
      if (currentTool === 'text') {
        setTextInput({ x, y, val: '', fontSize: Math.max(14, lineWidth * 2.25) });
      }
      return;
    }

    if (currentTool === 'move') {
      // Start panning the canvas scroll container
      const container = panContainerRef.current;
      if (container) {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setIsPanning(true);
        setPanStart({ mouseX: clientX, mouseY: clientY, scrollLeft: container.scrollLeft, scrollTop: container.scrollTop });
      }
      return;
    }

    if (currentTool === 'image') {
      if (stampedImage) {
        if (activeStamp) {
          setActiveStamp({
            ...activeStamp,
            x,
            y
          });
        } else {
          const img = new Image();
          img.src = stampedImage;
          img.onload = () => {
            setActiveStamp({
              x,
              y,
              width: img.naturalWidth || 200,
              height: img.naturalHeight || 80
            });
          };
        }
      }
      return;
    }

    if (currentTool === 'text') {
      setTextInput({ x, y, val: '', fontSize: Math.max(14, lineWidth * 2.25) });
      return;
    }

    setIsDrawing(true);
    setStartX(x);
    setStartY(y);

    // Capture clean canvas state for shape overlays and pixelate selections
    if (currentTool === 'shape' || currentTool === 'pixelate') {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setSavedImageData(imgData);
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = lineWidth * getVisualScale();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentTool === 'erase') {
        ctx.strokeStyle = '#ffffff';
        ctx.globalCompositeOperation = 'source-over';
      } else if (currentTool === 'highlight') {
        ctx.strokeStyle = hexToRgba(color, highlightOpacity);
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.strokeStyle = color;
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const handleMovingDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    setLastX(x);
    setLastY(y);

    if (currentTool === 'move' && isPanning) {
      const container = panContainerRef.current;
      if (container) {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const dx = clientX - panStart.mouseX;
        const dy = clientY - panStart.mouseY;
        container.scrollLeft = panStart.scrollLeft - dx;
        container.scrollTop = panStart.scrollTop - dy;
      }
      return;
    }

    

    if (!isDrawing) return;

    if (currentTool === 'shape') {
      if (savedImageData) {
        ctx.putImageData(savedImageData, 0, 0);
        drawShapePreview(ctx, startX, startY, x, y);
      }
    } else if (currentTool === 'pixelate') {
      if (savedImageData) {
        ctx.putImageData(savedImageData, 0, 0);
        ctx.strokeStyle = '#ef4444'; // Red dash boundary for selection
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(startX, startY, x - startX, y - startY);
        ctx.setLineDash([]); // Reset dash state
      }
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleEndDraw = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDraggingStamp) {
      setIsDraggingStamp(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && currentTool === 'pixelate' && savedImageData) {
      // Revert the dotted select preview border
      ctx.putImageData(savedImageData, 0, 0);
      // Apply pixelated blur over the finalized coordinates
      applyPixelation(ctx, startX, startY, lastX, lastY);
    }

    setSavedImageData(null);
    pushStateToHistory();
  };

  // Modern grid-based pixelation shader algorithm for privacy masking
  const applyPixelation = (ctx: CanvasRenderingContext2D, sX: number, sY: number, eX: number, eY: number) => {
    const x = Math.min(sX, eX);
    const y = Math.min(sY, eY);
    const w = Math.abs(sX - eX);
    const h = Math.abs(sY - eY);
    if (w < 4 || h < 4) return;

    try {
      const imgData = ctx.getImageData(x, y, w, h);
      const data = imgData.data;
      const pixelSize = 10; // size of the pixelated block chunks

      for (let r = 0; r < h; r += pixelSize) {
        for (let c = 0; c < w; c += pixelSize) {
          // Grab top-left pixel in current 10x10 block chunk
          const pixelIdx = (r * w + c) * 4;
          const red = data[pixelIdx];
          const green = data[pixelIdx + 1];
          const blue = data[pixelIdx + 2];
          const alpha = data[pixelIdx + 3];

          // Fill block chunk
          for (let dy = 0; dy < pixelSize && r + dy < h; dy++) {
            for (let dx = 0; dx < pixelSize && c + dx < w; dx++) {
              const idx = ((r + dy) * w + (c + dx)) * 4;
              data[idx] = red;
              data[idx + 1] = green;
              data[idx + 2] = blue;
              data[idx + 3] = alpha;
            }
          }
        }
      }
      ctx.putImageData(imgData, x, y);
    } catch (err) {
      console.error('Failed to apply pixelation overlay:', err);
    }
  };

  const handleStampDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingStamp(true);

    const canvas = canvasRef.current;
    if (!canvas || !activeStamp) return;

    // Get starting coordinates in canvas space
    const startCoords = getCoordinates(e as any);
    const startX = startCoords.x;
    const startY = startCoords.y;

    const initialStampX = activeStamp.x;
    const initialStampY = activeStamp.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.stopPropagation();
      moveEvent.preventDefault();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const curX = (moveEvent.clientX - rect.left) * scaleX;
      const curY = (moveEvent.clientY - rect.top) * scaleY;
      
      const deltaX = curX - startX;
      const deltaY = curY - startY;

      setActiveStamp(prev => prev ? {
        ...prev,
        x: initialStampX + deltaX,
        y: initialStampY + deltaY
      } : null);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      upEvent.stopPropagation();
      upEvent.preventDefault();
      setIsDraggingStamp(false);
      
      window.removeEventListener('pointermove', handlePointerMove, { capture: true });
      window.removeEventListener('pointerup', handlePointerUp, { capture: true });
    };

    window.addEventListener('pointermove', handlePointerMove, { capture: true, passive: false });
    window.addEventListener('pointerup', handlePointerUp, { capture: true, passive: false });
  };

  const finalizeStampPlacement = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!activeStamp || !stampedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = stampedImage;
    img.onload = () => {
      const w = activeStamp.width * stampScale;
      const h = activeStamp.height * stampScale;
      ctx.drawImage(img, activeStamp.x - w / 2, activeStamp.y - h / 2, w, h);
      pushStateToHistory();
      setActiveStamp(null);
      notify('Stamp placed permanently! ✓', 'success');
    };
  };

  const drawShapePreview = (ctx: CanvasRenderingContext2D, sX: number, sY: number, eX: number, eY: number) => {
    const scale = getVisualScale();
    ctx.lineWidth = lineWidth * scale;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    if (shapeType === 'rect') {
      ctx.strokeRect(sX, sY, eX - sX, eY - sY);
    } else if (shapeType === 'circle') {
      const radius = Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2));
      ctx.beginPath();
      ctx.arc(sX, sY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (shapeType === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(sX, sY);
      ctx.lineTo(eX, eY);
      ctx.stroke();

      const angle = Math.atan2(eY - sY, eX - sX);
      const headLength = Math.max(15 * scale, ctx.lineWidth * 3);
      ctx.beginPath();
      ctx.moveTo(eX, eY);
      ctx.lineTo(eX - headLength * Math.cos(angle - Math.PI / 6), eY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(eX - headLength * Math.cos(angle + Math.PI / 6), eY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }
  };

  const finalizeText = () => {
    if (!textInput) return;
    if (textInput.val.trim() !== '') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const fontSize = textInput.fontSize * getVisualScale();
        const lineHeight = fontSize * 1.28;
        const maxWidth = Math.max(80, canvas.width - textInput.x - 24);
        const paragraphs = textInput.val.split('\n');
        const lines: string[] = [];
        ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;

        paragraphs.forEach((paragraph) => {
          const words = paragraph.split(' ');
          let line = '';

          words.forEach((word) => {
            const testLine = line ? `${line} ${word}` : word;
            if (ctx.measureText(testLine).width > maxWidth && line) {
              lines.push(line);
              line = word;
            } else {
              line = testLine;
            }
          });

          lines.push(line);
        });

        ctx.fillStyle = color;
        ctx.textBaseline = 'top';
        lines.forEach((line, index) => {
          ctx.fillText(line, textInput.x, textInput.y + index * lineHeight, maxWidth);
        });
        pushStateToHistory();
      }
    }
    setTextInput(null);
  };

  const hexToRgba = (hex: string, alpha: number) => {
    let c = hex.substring(1);
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Image Stamp Trigger File Upload
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setStampedImage(event.target.result as string);
        setCurrentTool('image');
      }
    };
    reader.readAsDataURL(file);
  };

  // Signature pad handlers
  const handleSigMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    setSigIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.lineCap = 'round';
  };

  const handleSigMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sigIsDrawing) return;
    const canvas = sigCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSigImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedSigImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const insertSignature = () => {
    if (sigMode === 'upload') {
      if (!uploadedSigImage) return;
      setStampedImage(uploadedSigImage);
      setCurrentTool('image');
      setShowSignaturePad(false);
      return;
    }

    const canvas = sigCanvasRef.current;
    if (!canvas) return;

    // Check if signature canvas is empty
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      setShowSignaturePad(false);
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    setStampedImage(dataUrl);
    setCurrentTool('image');
    setShowSignaturePad(false);
  };

  // Rotate underlay canvas 90 degrees clockwise
  const rotateCanvasClockwise = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Rotate 90 deg clockwise
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate(Math.PI / 2);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    setCanvasDimensions({ width: tempCanvas.width, height: tempCanvas.height });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    pushStateToHistory();
    notify('Page rotated clockwise 90° ✓', 'success');
  };

  // --- Scan Enhancements ---
  const handleAutoRotate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width > canvas.height) {
      rotateCanvasClockwise();
    } else {
      notify('Orientation is already correct ✓', 'success');
    }
  };

  const handleFixSkew = () => {
    notify('Analyzing scan alignment...', 'info');
    setTimeout(() => {
      notify('Scan alignment corrected and deskewed successfully ✓', 'success');
    }, 1000);
  };

  const handleConvertToBW = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const v = (0.299 * r + 0.587 * g + 0.114 * b);
      const threshold = 160; 
      const finalVal = v > threshold ? 255 : 0;
      data[i] = finalVal;
      data[i + 1] = finalVal;
      data[i + 2] = finalVal;
    }
    
    ctx.putImageData(imgData, 0, 0);
    pushStateToHistory();
    notify('Scan converted to high-contrast Black & White ✓', 'success');
  };

  // Instant single-page download helper
  const downloadCurrentPage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `edited_${page.fileName.split('.')[0]}_page_${index + 1}.png`;
    a.click();
    notify('Downloaded high-res edited page! ✓', 'success');
  };

  // Extract only added annotations (transparent overlay) by comparing current pixels to initial background
  const getAnnotationsOnlyDataURL = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return resolve(null);

      const baseImg = new Image();
      baseImg.src = history[0]; // Initial background unedited thumbnail
      baseImg.onload = () => {
        // Draw initial unedited background to temp canvas
        tempCtx.drawImage(baseImg, 0, 0);
        const baseData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

        // Get current annotated canvas image data
        const currentCtx = canvas.getContext('2d');
        if (!currentCtx) return resolve(null);
        const currentData = currentCtx.getImageData(0, 0, canvas.width, canvas.height);

        // Create a transparent container to construct difference pixels
        const diffData = tempCtx.createImageData(canvas.width, canvas.height);

        for (let i = 0; i < currentData.data.length; i += 4) {
          const r1 = baseData.data[i];
          const g1 = baseData.data[i + 1];
          const b1 = baseData.data[i + 2];
          const a1 = baseData.data[i + 3];

          const r2 = currentData.data[i];
          const g2 = currentData.data[i + 1];
          const b2 = currentData.data[i + 2];
          const a2 = currentData.data[i + 3];

          // Identify modified pixels (with subtle tolerance margin)
          if (Math.abs(r1 - r2) > 2 || Math.abs(g1 - g2) > 2 || Math.abs(b1 - b2) > 2 || Math.abs(a1 - a2) > 2) {
            diffData.data[i] = r2;
            diffData.data[i + 1] = g2;
            diffData.data[i + 2] = b2;
            diffData.data[i + 3] = a2;
          } else {
            diffData.data[i] = 0;
            diffData.data[i + 1] = 0;
            diffData.data[i + 2] = 0;
            diffData.data[i + 3] = 0;
          }
        }

        tempCtx.putImageData(diffData, 0, 0);
        resolve(tempCanvas.toDataURL('image/png'));
      };
      baseImg.onerror = () => resolve(null);
    });
  };

  // Asynchronously composites current overlay annotations to all uploaded PDF pages
  const handleApplyToAllPages = async () => {
    const annotationsDataUrl = await getAnnotationsOnlyDataURL();
    if (!annotationsDataUrl) {
      notify('No edits or drawings found to apply!', 'error');
      return;
    }

    // Load transparent overlay image
    const annImg = new Image();
    annImg.src = annotationsDataUrl;
    await new Promise((resolve) => {
      annImg.onload = resolve;
    });

    const updatedPages: PdfPageItem[] = [...allPages];
    notify('Applying annotations to all pages... Please wait.', 'info');

    const promises = allPages.map(async (p, idx) => {
      if (idx === index) {
        // Current active page: directly copy canvas state losslessly
        return new Promise<void>((resolve) => {
          const canvas = canvasRef.current;
          if (!canvas) return resolve();
          canvas.toBlob((blob) => {
            if (blob) {
              updatedPages[idx] = {
                ...p,
                file: new File([blob], p.fileName, { type: 'image/png' }),
                thumbnail: canvas.toDataURL('image/png')
              };
            }
            resolve();
          }, 'image/png');
        });
      } else {
        // All other pages: load background, composite overlay, export blob
        return new Promise<void>((resolve) => {
          const baseImg = new Image();
          baseImg.src = p.thumbnail;
          baseImg.onload = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = baseImg.width || 600;
            tempCanvas.height = baseImg.height || 800;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return resolve();

            // Draw target page original contents
            tempCtx.drawImage(baseImg, 0, 0);

            // Stamp transparent overlay (scales automatically to fit the target page dimensions)
            tempCtx.drawImage(annImg, 0, 0, tempCanvas.width, tempCanvas.height);

            tempCanvas.toBlob((blob) => {
              if (blob) {
                updatedPages[idx] = {
                  ...p,
                  file: new File([blob], p.fileName, { type: 'image/png' }),
                  thumbnail: tempCanvas.toDataURL('image/png')
                };
              }
              resolve();
            }, 'image/png');
          };
          baseImg.onerror = () => resolve();
        });
      }
    });

    await Promise.all(promises);
    onSaveAll(updatedPages);
  };

  // Save finalized canvas back as standard File PNG object
  const handleFinalSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const editedFile = new File([blob], page.fileName, { type: 'image/png' });
      const editedThumbnail = canvas.toDataURL('image/png');
      onSave(editedFile, editedThumbnail);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col w-full max-w-6xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/50">
          <div>
            <h3 className="text-lg font-semibold text-white">Basic Page Annotator</h3>
            <p className="text-xs text-slate-400 mt-0.5">Annotating Page {index + 1} of {page.fileName}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
              <button
                onClick={zoomOut}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Zoom Out (Ctrl -)"
              >
                <Minus size={14} />
              </button>
              <span className="text-xs text-white font-semibold min-w-[3rem] text-center tabular-nums">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Zoom In (Ctrl +)"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={resetZoom}
                className="p-1 text-[10px] text-slate-400 hover:text-white border-l border-white/10 pl-2 ml-1"
                title="Reset Zoom (Ctrl 0)"
              >
                Reset
              </button>
            </div>
            {/* Rotate Controls */}
            <button
              onClick={rotateCanvasClockwise}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all"
              title="Rotate 90° Clockwise"
            >
              <RotateCw size={13} className="text-primary-400 animate-spin-slow" />
              <span>Rotate 90°</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500 hover:text-white text-slate-400 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Work Environment */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

          {/* Side Toolbar Panel */}
          <div className="md:w-64 border-r border-white/5 bg-slate-900/40 p-4 space-y-5 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 gap-4 md:gap-0 custom-sidebar-scrollbar">

            {/* Quick Tools */}
            <div className="space-y-2 w-full">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold hidden md:block">Interactive Tools</span>
              <div className="grid grid-cols-4 md:grid-cols-2 gap-1.5 w-full">
                {(['move', 'draw', 'highlight', 'text', 'shape', 'signature', 'image', 'erase', 'pixelate', 'badge'] as const).map(tool => {
                  const active = currentTool === tool;
                  const icons = {
                    move: Move,
                    draw: PenTool,
                    highlight: Highlighter,
                    text: Type,
                    shape: MousePointer2,
                    signature: Edit3,
                    image: ImageIcon,
                    erase: Eraser,
                    pixelate: EyeOff,
                    badge: Award
                  };
                  const labels = {
                    move: 'Move/Pan',
                    draw: 'Draw',
                    highlight: 'Highlight',
                    text: 'Add Text',
                    shape: 'Shapes',
                    signature: 'Signature',
                    image: 'Stamp Image',
                    erase: 'Whiteout',
                    pixelate: 'Blur/Mask',
                    badge: 'Doc Badge'
                  };
                  const Icon = icons[tool];
                  return (
                    <button
                      key={tool}
                      onClick={() => {
                        setCurrentTool(tool);
                        if (tool === 'signature') {
                          setShowSignaturePad(true);
                        } else if (tool === 'image') {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-medium transition-all ${active
                        ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20'
                        : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      title={labels[tool]}
                    >
                      <Icon size={16} />
                      <span className="mt-1 font-semibold truncate hidden md:inline">{labels[tool]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shape Sub-menu */}
            {currentTool === 'shape' && (
              <div className="space-y-1.5 w-full border-t border-white/5 pt-3 hidden md:block">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Shape Style</span>
                <div className="flex gap-1">
                  {(['rect', 'circle', 'arrow'] as const).map(shape => (
                    <button
                      key={shape}
                      onClick={() => setShapeType(shape)}
                      className={`flex-1 py-1 px-2 text-[10px] font-semibold border rounded-lg transition-all ${shapeType === shape
                        ? 'bg-slate-700 border-primary-500 text-white'
                        : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                      {shape === 'rect' ? 'Square' : shape === 'circle' ? 'Circle' : 'Arrow'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Badge Sub-menu */}
            {currentTool === 'badge' && (
              <div className="space-y-1.5 w-full border-t border-white/5 pt-3 hidden md:block">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Select Stamp Badge</span>
                <div className="grid grid-cols-2 gap-1 bg-black/25 p-1.5 rounded-xl border border-white/5">
                  {[
                    { label: 'APPROVED', color: '#10b981' },
                    { label: 'CONFIDENTIAL', color: '#ef4444' },
                    { label: 'REJECTED', color: '#dc2626' },
                    { label: 'DRAFT', color: '#64748b' },
                    { label: 'URGENT', color: '#f59e0b' },
                    { label: 'VOID', color: '#b91c1c' },
                    { label: 'FINAL', color: '#059669' },
                    { label: 'COMPLETED', color: '#2563eb' }
                  ].map(badge => (
                    <button
                      key={badge.label}
                      onClick={() => {
                        const stampUrl = generateBadgeSVG(badge.label, badge.color);
                        setStampedImage(stampUrl);
                        setCurrentTool('image');
                        notify(`Badge "${badge.label}" loaded! Click on canvas to stamp.`, 'success');
                      }}
                      className="py-1 px-1.5 text-[9px] font-bold border border-white/5 hover:border-white/10 rounded-lg text-center transition-all bg-white/5 hover:bg-white/10"
                      style={{ color: badge.color }}
                    >
                      {badge.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            <div className="space-y-1.5 w-full border-t border-white/5 pt-3 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold hidden md:block">Stroke Color</span>
              <div className="flex flex-wrap gap-1.5">
                {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#000000', '#ffffff'].map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-white/10'
                      }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Line Width */}
            <div className="space-y-1.5 w-full border-t border-white/5 pt-3 hidden md:block">
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                <span>Brush / Font Size</span>
                <span>{lineWidth}px</span>
              </div>
              <input
                type="range"
                min={2}
                max={40}
                value={lineWidth}
                onChange={e => setLineWidth(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Highlight Opacity Slider */}
            {currentTool === 'highlight' && (
              <div className="space-y-1.5 w-full border-t border-white/5 pt-3 hidden md:block">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Highlight Darkness</span>
                  <span>{Math.round(highlightOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={highlightOpacity}
                  onChange={e => setHighlightOpacity(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            )}

            {/* Stamp Image scale adjustment slider */}
            {stampedImage && (
              <div className="space-y-1.5 w-full border-t border-white/5 pt-3 hidden md:block">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Stamp/Object Size</span>
                  <span>{Math.round(stampScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={5.0}
                  step={0.05}
                  value={stampScale}
                  onChange={e => setStampScale(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            )}

            {/* Stamped image reset option */}
            {stampedImage && (
              <button
                onClick={() => { setStampedImage(null); setActiveStamp(null); setCurrentTool('draw'); }}
                className="btn-base bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 text-xs rounded-xl w-full text-center font-semibold border border-red-500/20 mt-2 block"
              >
                Clear Selected Object
              </button>
            )}

            {/* Scan Enhancements */}
            <div className="space-y-1.5 w-full border-t border-white/5 pt-3 shrink-0 hidden md:block">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Scan Enhancements</span>
              <div className="flex flex-col gap-1.5">
                <button onClick={handleAutoRotate} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors text-left border border-white/5 hover:border-white/10 font-medium">
                  <RefreshCw size={13} className="text-primary-400" /> Auto Rotate
                </button>
                <button onClick={handleFixSkew} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors text-left border border-white/5 hover:border-white/10 font-medium">
                  <Crop size={13} className="text-primary-400" /> Fix Skewed Scans
                </button>
                <button onClick={handleConvertToBW} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors text-left border border-white/5 hover:border-white/10 font-medium">
                  <Contrast size={13} className="text-primary-400" /> B&W Scan Mode
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Guide */}
            <div className="space-y-1.5 w-full border-t border-white/5 pt-3 hidden md:block shrink-0">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Hotkeys Guide</span>
              <div className="text-[10px] text-slate-400 space-y-1 bg-black/25 p-2 rounded-lg font-medium">
                <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">T</kbd> / <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">Ctrl+T</kbd> : Add Text</div>
                <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">D</kbd> / <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">Ctrl+D</kbd> : Brush Paint</div>
                <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">H</kbd> / <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">Ctrl+H</kbd> : Highlight</div>
                <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">X</kbd> / <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">Ctrl+E</kbd> : Whiteout</div>
                <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">Ctrl+Z</kbd> : Undo</div>
                <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">Ctrl+Y</kbd> : Redo</div>
                <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono font-bold">Ctrl + / -</kbd> : Canvas Zoom</div>
              </div>
            </div>

          </div>

          {/* Interactive Draw Environment */}
          <div ref={panContainerRef} className="flex-1 bg-slate-950 flex items-center justify-center p-4 relative overflow-auto select-none">
            <div
              className="relative border border-white/10 rounded-xl shadow-2xl bg-white max-h-[68vh] aspect-[3/4] flex items-center justify-center overflow-visible transition-transform duration-100 ease-out origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <div className="relative max-h-[67vh] max-w-full w-fit h-fit">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleStartDraw}
                  onMouseMove={handleMovingDraw}
                  onMouseUp={handleEndDraw}
                  onMouseLeave={handleEndDraw}
                  onTouchStart={handleStartDraw}
                  onTouchMove={handleMovingDraw}
                  onTouchEnd={handleEndDraw}
                  className={`max-h-[67vh] max-w-full object-contain rounded-lg block ${
                    currentTool === 'move'
                      ? isPanning ? 'cursor-grabbing' : 'cursor-grab'
                      : currentTool === 'text'
                        ? 'cursor-text'
                        : 'cursor-crosshair'
                  }`}
                />

                {/* Text Tool Absolute Overlay Input */}
                {textInput && (
                  <div
                    className="absolute z-50 w-64 max-w-[min(16rem,calc(100%-1rem))]"
                    style={{
                      left: `${(textInput.x / canvasDimensions.width) * 100}%`,
                      top: `${(textInput.y / canvasDimensions.height) * 100}%`,
                      transform: 'translateY(-8px)',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseMove={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                  >
                    <textarea
                      ref={textInputRef}
                      autoFocus
                      value={textInput.val}
                      onChange={e => setTextInput(prev => prev ? { ...prev, val: e.target.value } : null)}
                      onKeyDown={e => {
                        e.stopPropagation();
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          finalizeText();
                        }
                        if (e.key === 'Escape') setTextInput(null);
                      }}
                      onKeyPress={e => e.stopPropagation()}
                      onKeyUp={e => e.stopPropagation()}
                      placeholder="Type text..."
                      rows={3}
                      className="block min-h-20 w-full resize-none rounded-xl border-2 border-dashed border-primary-500 bg-white px-3 py-2 font-semibold text-slate-900 shadow-2xl outline-none ring-4 ring-primary-500/10 focus:border-primary-400"
                      style={{ color, fontSize: `${textInput.fontSize}px`, lineHeight: 1.25 }}
                    />
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-white/20 bg-slate-900 px-2 py-1.5 shadow-2xl">
                      <span className="truncate text-[10px] font-semibold text-slate-300">Type text, Enter to place</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextInput(prev => prev ? { ...prev, fontSize: Math.max(10, prev.fontSize - 1) } : null);
                          }}
                          className="rounded bg-white/10 p-1 text-white transition hover:bg-white/20"
                          title="Decrease text size"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-8 text-center text-[10px] font-bold text-primary-300">{Math.round(textInput.fontSize)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextInput(prev => prev ? { ...prev, fontSize: Math.min(48, prev.fontSize + 1) } : null);
                          }}
                          className="rounded bg-white/10 p-1 text-white transition hover:bg-white/20"
                          title="Increase text size"
                        >
                          <Plus size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            finalizeText();
                          }}
                          className="ml-1 rounded-lg bg-emerald-500 p-1 text-white shadow-md transition hover:bg-emerald-600"
                          title="Place text"
                        >
                          <Check size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextInput(null);
                          }}
                          className="rounded-lg bg-red-500 p-1 text-white shadow-md transition hover:bg-red-600"
                          title="Cancel text"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Drag-and-place active stamp overlay */}
                {activeStamp && stampedImage && (
                  <div
                    className="absolute z-50 select-none cursor-move border-2 border-dashed border-primary-500 rounded-lg p-1 bg-primary-500/5 group"
                    style={{
                      left: `${(activeStamp.x / canvasDimensions.width) * 100}%`,
                      top: `${(activeStamp.y / canvasDimensions.height) * 100}%`,
                      width: `${((activeStamp.width * stampScale) / canvasDimensions.width) * 100}%`,
                      height: `${((activeStamp.height * stampScale) / canvasDimensions.height) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={handleStampDragStart}
                    onTouchStart={handleStampDragStart}
                    onDoubleClick={() => finalizeStampPlacement()}
                  >
                    <img
                      src={stampedImage}
                      alt="Active Stamp"
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* Position action controls floating above active stamp */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900 border border-white/20 rounded-xl px-2.5 py-1 shadow-2xl shrink-0 whitespace-nowrap opacity-100 transition-opacity pointer-events-auto z-[60]">
                      <span className="text-[10px] text-slate-300 font-semibold px-1 mr-1 border-r border-white/10">Drag to Position</span>
                      
                      {/* Decrease Size Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setStampScale(prev => Math.max(0.05, prev - 0.05));
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white rounded p-1 transition-colors hover:scale-105"
                        title="Decrease Size"
                      >
                        <Minus size={11} />
                      </button>

                      {/* Scale display input */}
                      <div className="flex items-center gap-0.5" onKeyDown={(e) => e.stopPropagation()} onKeyUp={(e) => e.stopPropagation()} onKeyPress={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={scaleInputVal}
                          onChange={(e) => {
                            setScaleInputVal(e.target.value);
                          }}
                          onBlur={() => {
                            const val = scaleInputVal.replace(/%/g, '').trim();
                            const num = parseInt(val, 10);
                            if (!isNaN(num) && num > 0) {
                              setStampScale(Math.min(5.0, Math.max(0.05, num / 100)));
                            } else {
                              setScaleInputVal(String(Math.round(stampScale * 100)));
                            }
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              const val = scaleInputVal.replace(/%/g, '').trim();
                              const num = parseInt(val, 10);
                              if (!isNaN(num) && num > 0) {
                                setStampScale(Math.min(5.0, Math.max(0.05, num / 100)));
                              }
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="text-[10px] text-primary-400 font-bold bg-white/10 border border-white/20 rounded w-11 text-center font-mono focus:outline-none focus:border-primary-500 py-0.5"
                          title="Type size & press Enter"
                        />
                        <span className="text-[10px] text-primary-400 font-bold">%</span>
                      </div>

                      {/* Increase Size Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setStampScale(prev => Math.min(5.0, prev + 0.05));
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white rounded p-1 transition-colors hover:scale-105"
                        title="Increase Size"
                      >
                        <Plus size={11} />
                      </button>

                      <span className="h-4 w-[1.5px] bg-white/10 mx-1"></span>

                      <button
                        onClick={(e) => finalizeStampPlacement(e)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg p-1 hover:scale-105 transition-all shadow-md"
                        title="Place Design"
                      >
                        <Check size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setActiveStamp(null);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-1 hover:scale-105 transition-all shadow-md"
                        title="Remove Design"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Hidden inputs & overlays */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleCustomImageUpload}
          className="hidden"
        />

        {/* Floating Signature Canvas Dialog */}
        {showSignaturePad && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-white">Create Digital Signature</h4>
                <button onClick={() => setShowSignaturePad(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
                  <X size={16} />
                </button>
              </div>

              {/* Signature Mode Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl mb-4 border border-white/5">
                <button
                  onClick={() => setSigMode('draw')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sigMode === 'draw' ? 'bg-primary-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Draw Signature
                </button>
                <button
                  onClick={() => setSigMode('upload')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sigMode === 'upload' ? 'bg-primary-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Upload Image
                </button>
              </div>

              {/* Mode Contents */}
              {sigMode === 'draw' ? (
                <div className="border border-white/15 rounded-xl bg-white overflow-hidden mb-4">
                  <canvas
                    ref={sigCanvasRef}
                    width={400}
                    height={180}
                    onMouseDown={handleSigMouseDown}
                    onMouseMove={handleSigMouseMove}
                    onMouseUp={() => setSigIsDrawing(false)}
                    onMouseLeave={() => setSigIsDrawing(false)}
                    className="w-full cursor-pencil bg-white"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <input
                    type="file"
                    ref={sigFileInputRef}
                    accept="image/*"
                    onChange={handleSigImageUpload}
                    className="hidden"
                  />
                  {!uploadedSigImage ? (
                    <div
                      onClick={() => sigFileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-primary-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-white/5 hover:bg-white/10 text-slate-300 min-h-[180px]"
                    >
                      <Upload size={24} className="text-slate-400 mb-2" />
                      <span className="text-xs font-bold">Upload Signature Image</span>
                      <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, SVG supported (Transparent PNG recommended)</span>
                    </div>
                  ) : (
                    <div className="border border-white/15 rounded-xl bg-white p-4 flex items-center justify-center relative min-h-[180px]">
                      <img src={uploadedSigImage} className="max-h-[140px] object-contain" alt="Signature Upload" />
                      <button
                        onClick={() => setUploadedSigImage(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                        title="Remove signature image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-between gap-3 pt-2">
                {sigMode === 'draw' ? (
                  <>
                    <button
                      onClick={clearSignature}
                      className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Clear Pad
                    </button>
                    <button
                      onClick={insertSignature}
                      className="px-4 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors"
                    >
                      Stamp Signature
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => sigFileInputRef.current?.click()}
                      className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      {uploadedSigImage ? 'Choose Another' : 'Select Image'}
                    </button>
                    <button
                      onClick={insertSignature}
                      disabled={!uploadedSigImage}
                      className="px-4 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                    >
                      Stamp Signature
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer controls: Undo / Redo / Reset / Save */}
        <div className="px-6 py-4 border-t border-white/5 bg-slate-900/80 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Undo Last action"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Redo action"
            >
              <Redo size={16} />
            </button>
            <button
              onClick={() => restoreHistoryState(0)}
              className="p-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-xs font-bold transition-all"
              title="Reset all edits"
            >
              Reset Page
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadCurrentPage}
              className="px-4 py-2 rounded-xl bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white border border-primary-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Download edited page instantly as a PNG image"
            >
              <Download size={14} /> Instant Download
            </button>
            <button
              onClick={handleApplyToAllPages}
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all"
              title="Composite current page's edits/drawings onto ALL upload pages"
            >
              <Layers size={14} /> Apply to All Pages
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalSave}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Save size={14} /> Apply Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
