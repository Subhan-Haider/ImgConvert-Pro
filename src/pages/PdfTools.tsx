import { useCallback, useState, useEffect } from 'react';
import { RotateCw, Trash2, ArrowLeft, ArrowRight, Layers, FileImage, Image as ImageIcon, Download, RefreshCw, Plus, HelpCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

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

type ActiveTab = 'editor' | 'to-images' | 'from-images';

export default function PdfTools() {
  const { toasts, addToast, removeToast } = useToast();
  const notify = useCallback((msg: string, type?: 'success' | 'error' | 'info') => addToast(msg, type), [addToast]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- PDF Editor Workspace State ---
  const [pdfPages, setPdfPages] = useState<PdfPageItem[]>([]);
  const [editorMargin, setEditorMargin] = useState<'none' | 'small' | 'standard'>('none');
  const [editorFilename, setEditorFilename] = useState('compiled_document');
  const [editorWatermark, setEditorWatermark] = useState('');

  // --- PDF to Images State ---
  const [pdfToImgFile, setPdfToImgFile] = useState<File | null>(null);
  const [pdfToImgPages, setPdfToImgPages] = useState<{ pageNum: number; thumbnail: string; size: number }[]>([]);
  const [pdfToImgFormat, setPdfToImgFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [pdfToImgQuality, setPdfToImgQuality] = useState(90);

  // --- Images to PDF State ---
  const [imagePages, setImagePages] = useState<ImagePageItem[]>([]);
  const [imagesMargin, setImagesMargin] = useState<'none' | 'small' | 'standard'>('none');
  const [imagesFilename, setImagesFilename] = useState('images_document');

  // --- Common Helpers ---
  const clearWorkspace = () => {
    setPdfPages([]);
    setPdfToImgFile(null);
    setPdfToImgPages([]);
    setImagePages([]);
    notify('Workspace cleared', 'info');
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
      const viewport = page.getViewport({ scale: 0.8 }); // Lower scale for fast thumbnail rendering

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
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
      if (file.type !== 'application/pdf') {
        notify(`"${file.name}" is not a PDF file`, 'error');
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
      notify(`Successfully loaded ${loadedCount} PDF file(s) with ${allNewPages.length} total pages`, 'success');
    }
    setIsProcessing(false);
  };

  const handlePdfToImgUpload = async (file: File) => {
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
        const viewport = page.getViewport({ scale: 1.5 }); // Higher quality for direct conversion

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const thumbnail = canvas.toDataURL(`image/${pdfToImgFormat}`, pdfToImgQuality / 100);
          rendered.push({
            pageNum: i,
            thumbnail,
            size: Math.round((thumbnail.length * 3) / 4) // estimate size in bytes
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
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [activeTab]);

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
      for (const pageItem of pdfPages) {
        const fileBytes = await pageItem.file.arrayBuffer();
        const sourceDoc = await PDFLib.PDFDocument.load(fileBytes);
        const [copiedPage] = await compiledPdf.copyPages(sourceDoc, [pageItem.pageIndex]);

        // Apply visual rotation from editor workspace
        if (pageItem.rotation !== 0) {
          copiedPage.setRotation(PDFLib.degrees(pageItem.rotation));
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

        compiledPdf.addPage(copiedPage);
      }

      const pdfBytes = await compiledPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${editorFilename.replace(/\.pdf$/, '') || 'compiled_document'}.pdf`;
      a.click();

      setTimeout(() => URL.revokeObjectURL(url), 100);
      notify('PDF generated and downloaded ✓', 'success');
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

          const page = doc.addPage([img.width, img.height]);
          
          if (imagesMargin !== 'none') {
            const m = imagesMargin === 'small' ? 20 : 40;
            const pw = img.width - m * 2;
            const ph = img.height - m * 2;
            page.drawImage(img, { x: m, y: m, width: pw, height: ph });
          } else {
            page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
          }
        }
        const bytes = await doc.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${imagesFilename.replace(/\.pdf$/, '') || 'images_document'}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
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

      notify('Images converted to PDF successfully ✓', 'success');
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
        a.click();
      }, idx * 250);
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

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="flex p-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl backdrop-blur-xl">
            {(['editor', 'to-images', 'from-images'] as const).map(tab => {
              const active = activeTab === tab;
              const labels = {
                'editor': { text: 'PDF Organizer / Merger', icon: Layers },
                'to-images': { text: 'PDF to Images', icon: FileImage },
                'from-images': { text: 'Images to PDF', icon: ImageIcon }
              };
              const Icon = labels[tab].icon;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); clearWorkspace(); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    active 
                      ? 'bg-white dark:bg-surface-800 text-slate-900 dark:text-white shadow-md' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{labels[tab].text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main workspace area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Split Page 1: PDF Organizer / Merger */}
            {activeTab === 'editor' && (
              <>
                {pdfPages.length === 0 ? (
                  <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-black/10 dark:border-white/20">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <Layers size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drop your PDFs here</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">
                      Select or paste (Ctrl+V) multiple PDF files to merge, split, rotate, or rearrange pages.
                    </p>
                    <label className="btn-base bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl cursor-pointer">
                      Browse Files
                      <input 
                        type="file" 
                        multiple 
                        accept="application/pdf" 
                        className="hidden" 
                        onChange={e => e.target.files && handlePdfUpload(Array.from(e.target.files))} 
                      />
                    </label>
                  </Card>
                ) : (
                  <Card>
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Document Page Organizer ({pdfPages.length} pages loaded)
                      </h3>
                      <button 
                        onClick={() => handlePdfUpload([])} 
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Clear all
                      </button>
                    </div>

                    {/* Page Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {pdfPages.map((page, i) => (
                        <div 
                          key={page.id} 
                          className="relative rounded-xl border border-black/10 dark:border-white/10 p-2 bg-black/5 dark:bg-white/5 flex flex-col group"
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
                            
                            {/* Hover overlay triggers */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button 
                                onClick={() => rotatePage(page.id)}
                                className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30"
                                title="Rotate Clockwise"
                              >
                                <RotateCw size={14} />
                              </button>
                              <button 
                                onClick={() => deletePage(page.id)}
                                className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500"
                                title="Delete Page"
                              >
                                <Trash2 size={14} />
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
                            <span className="text-[10px] text-slate-600 dark:text-slate-400">Position</span>
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
                        <span className="text-xs text-slate-500">Add PDF</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="application/pdf" 
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
                          <a href={page.thumbnail} download={`page_${page.pageNum}.${pdfToImgFormat}`} className="mt-2">
                            <Button size="sm" className="w-full text-xs py-1.5 flex items-center justify-center gap-1">
                              <Download size={12} /> Download
                            </Button>
                          </a>
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
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Images Workspace ({imagePages.length} images added)
                      </h3>
                      <button 
                        onClick={() => { setImagePages([]); }} 
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePages.map((item, i) => (
                        <div key={item.id} className="relative rounded-xl border border-black/10 dark:border-white/10 p-2 bg-black/5 dark:bg-white/5 flex flex-col group">
                          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-xs font-semibold">
                            Img {i + 1}
                          </div>
                          
                          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/20 relative flex items-center justify-center">
                            <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={() => deleteImagePage(item.id)}
                                className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500"
                              >
                                <Trash2 size={14} />
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
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Order</span>
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

          {/* Sidebar controls area */}
          <div className="lg:col-span-4 space-y-6">
            
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

                  {/* Watermark */}
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
                </div>

                <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-4">
                  <Button 
                    onClick={handleCompilePdf}
                    disabled={pdfPages.length === 0 || isProcessing}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <><RefreshCw size={16} className="animate-spin" /> Compiling…</>
                    ) : (
                      <><Layers size={16} /> Compile & Merge PDF</>
                    )}
                  </Button>
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
                    </select>
                  </div>

                  {/* Quality */}
                  {pdfToImgFormat !== 'png' && (
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
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none" 
                    />
                  </div>

                  {/* Margins */}
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Page Margins</label>
                    <select
                      value={imagesMargin}
                      onChange={e => setImagesMargin(e.target.value as any)}
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="none">Full Bleed (No margins)</option>
                      <option value="small">Thin Margin (20px)</option>
                      <option value="standard">Standard Margin (40px)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-4">
                  <Button 
                    onClick={handleCompileImagesToPdf}
                    disabled={imagePages.length === 0 || isProcessing}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <><RefreshCw size={16} className="animate-spin" /> Compiling…</>
                    ) : (
                      <><Layers size={16} /> Generate PDF</>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Secondary Action: Reset Workspace */}
            {((activeTab === 'editor' && pdfPages.length > 0) || 
              (activeTab === 'to-images' && pdfToImgFile) || 
              (activeTab === 'from-images' && imagePages.length > 0)) && (
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
    </div>
  );
}
