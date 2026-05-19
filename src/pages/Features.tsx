import { useState } from 'react';
import { 
  Layers, ShieldCheck, FileImage, Download, Type, Edit3, Sparkles, Move, 
  FileText, Languages, Stamp, Scissors, Contrast, 
  RefreshCw, FileDown, Settings, Check, Settings2, 
  ArrowRight, Globe, Lock, Cpu, Crop, Square
} from 'lucide-react';
import { Card } from '../components/Card';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

interface FeatureItem {
  icon: any;
  category: 'pdf' | 'image';
  color: string;
  title: string;
  desc: string;
  details: string[];
}

const ALL_FEATURES: FeatureItem[] = [
  // --- PDF Tools ---
  {
    icon: Edit3,
    category: 'pdf',
    color: 'indigo',
    title: 'Interactive PDF Annotator',
    desc: 'Draw, highlight, erase, and annotate directly on PDF pages in a highly responsive browser workspace.',
    details: ['Freehand brush tools', 'Custom highlighter overlays', 'Erase strokes & shapes', 'Undo / Redo action stacks']
  },
  {
    icon: Move,
    category: 'pdf',
    color: 'emerald',
    title: 'Page Organizer & Sorter',
    desc: 'Rearrange document structure, change page sequence, delete pages, or insert new pages visually.',
    details: ['Drag-and-drop visual page grid', 'Rotate single pages 90° / 180°', 'Delete selective pages', 'Interactive fullscreen magnifier']
  },
  {
    icon: Scissors,
    category: 'pdf',
    color: 'violet',
    title: 'Precise PDF Splitter',
    desc: 'Extract individual pages, split by specified page ranges, or partition standard documents every N pages.',
    details: ['By specific page ranges (e.g. 1-3)', 'Partition every N pages', 'Custom pages extraction lists', 'Instant batch results download']
  },
  {
    icon: Crop,
    category: 'pdf',
    color: 'pink',
    title: 'Crop & Rotate Document',
    desc: 'Correct alignment or trim borders with calculated parameters. Supports fully independent page adjustments.',
    details: ['Mouse-controlled rotation degrees', 'Top, bottom, left, right trimmings', 'Supports custom page sizes', 'Preserves native vector qualities']
  },
  {
    icon: Contrast,
    category: 'pdf',
    color: 'teal',
    title: 'Grayscale B&W Converter',
    desc: 'Convert colored PDFs to grayscale black-and-white documents to save ink and enhance readability.',
    details: ['High-contrast thresholding', 'Preserves text sharpness', 'Reduces background noise', 'GPU-accelerated local filters']
  },
  {
    icon: FileDown,
    category: 'pdf',
    color: 'amber',
    title: 'Smart PDF Compressor',
    desc: 'Significantly reduce document bytes without sacrificing text legibility or image resolution.',
    details: ['Four custom compression levels', 'Lossless background asset scaling', 'Quality tuning indicators', 'Real-time size reduction stats']
  },
  {
    icon: Languages,
    category: 'pdf',
    color: 'sky',
    title: 'Offline OCR Text Extractor',
    desc: 'Extract editable text from scanned PDFs completely offline using browser-virtualized Tesseract engine.',
    details: ['Supports 11+ global languages', 'Secure client-side browser caching', 'Extract all pages or individual page', 'Export output as .txt or copy directly']
  },
  {
    icon: Stamp,
    category: 'pdf',
    color: 'rose',
    title: 'Dynamic PDF Watermarker',
    desc: 'Apply custom watermark stamp overlays to prevent unauthorized copying and protect intellectual property.',
    details: ['Custom size, opacity, and hex color', 'Centered or tiled repeating patterns', 'Dynamic rotation placement', 'Embedded Helvetica standard font']
  },
  {
    icon: Type,
    category: 'pdf',
    color: 'blue',
    title: 'Dynamic Page Numbering',
    desc: 'Instantly stamp clean page numbers across entire documents in multiple styles.',
    details: ['Format options (e.g. "Page 1 of 5", "1/5")', 'Four target location coordinates', 'Adjustable offset margins', 'Custom font sizes']
  },
  {
    icon: Layers,
    category: 'pdf',
    color: 'orange',
    title: 'Forms & Widget Flattener',
    desc: 'Flatten interactive forms, editable widgets, and visual annotations directly into the base document graphics.',
    details: ['Disables fields modifying', 'Fixes print rendering problems', 'Secures annotations from editing', '100% standard compliant']
  },
  {
    icon: Settings,
    category: 'pdf',
    color: 'slate',
    title: 'Document Metadata Editor',
    desc: 'Modify global tags, authorship properties, and administrative fields built into the PDF file.',
    details: ['Configure Title & Author', 'Edit Keywords & Subject tags', 'Update Creator & Producer info', 'Maintains internal indexes']
  },
  {
    icon: FileText,
    category: 'pdf',
    color: 'cyan',
    title: 'Office-to-PDF Conversion',
    desc: 'Convert standard text documents, docx manuscripts, and spreadsheet logs into portable PDFs locally.',
    details: ['High fidelity text alignments', 'Handles table conversions', 'Embedded webfont resolutions', 'Privacy-first offline build']
  },
  {
    icon: FileImage,
    category: 'pdf',
    color: 'purple',
    title: 'PDF to High-Res Images',
    desc: 'Convert PDF document pages to crisp, clear images with full quality optimization sliders.',
    details: ['Exports to PNG, JPEG, WebP, BMP, GIF, TIFF', 'Automatic background multi-page renders', 'Lossless quality preserves', 'Real-time extraction logs']
  },

  // --- Image Tools ---
  {
    icon: Layers,
    category: 'image',
    color: 'violet',
    title: 'Batch Format Conversion',
    desc: 'Convert hundreds of images simultaneously. Optimized for modern format extensions.',
    details: ['Supports PNG, JPEG, WEBP, AVIF', 'Includes legacy SVG, ICO, BMP, TIFF, GIF', 'Performs operations in parallel threads', 'Generates single ZIP archives']
  },
  {
    icon: Settings2,
    category: 'image',
    color: 'amber',
    title: 'Precision Quality Tuning',
    desc: 'Balance image fidelity and file size using lossy scaling encoders optimized for web deployment.',
    details: ['Real-time output byte estimations', 'Lossy/Lossless output options', 'Advanced compression ratios', 'Adjustable quality ranges']
  },
  {
    icon: RefreshCw,
    category: 'image',
    color: 'sky',
    title: 'Dynamic Scaling & Resizing',
    desc: 'Custom-fit your images for target platforms by setting absolute pixel dimensions or aspect ratios.',
    details: ['Aspect-ratio lock controls', 'Width & Height custom presets', 'Auto-sampling filters', 'Instant batch updates']
  },
  {
    icon: Square,
    category: 'image',
    color: 'pink',
    title: 'Padding & Canvas Adjustment',
    desc: 'Add aesthetic spacing borders around your graphics without stretching or cropping active content.',
    details: ['Custom background colors', 'Color picker integrations', 'Equalized margins padding', 'Perfect for social media sizes']
  },
  {
    icon: Sparkles,
    category: 'image',
    color: 'emerald',
    title: 'Transparency & Alpha Control',
    desc: 'Preserve transparency indexes or fill alpha channels with solid color highlights seamlessly.',
    details: ['Lossless WebP/PNG transparencies', 'Color background replacements', 'Optimized web sizes', 'No canvas stretching']
  },
  {
    icon: Download,
    category: 'image',
    color: 'indigo',
    title: 'Instant Batch Exports',
    desc: 'Download all processed images immediately as a single, compressed ZIP package or individual files.',
    details: ['No server wait queues', 'Client-side ZIP generation', 'File count metadata', 'Clean filenames generation']
  }
];

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
  pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
};

export default function Features() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'pdf' | 'image' | 'security'>('all');

  const filteredFeatures = ALL_FEATURES.filter(f => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'pdf') return f.category === 'pdf';
    if (activeCategory === 'image') return f.category === 'image';
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 overflow-hidden font-sans relative">
      {/* Background Visual Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles size={14} />
            <span>Studio-Grade Client Sandbox</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-slate-900 dark:text-white mb-6">
            Comprehensive <span className="gradient-text">Feature Directory</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            ImgConvert Pro combines two complete desktop-grade packages into a single secure browser workspace. Every conversion, compress, edit, and filter executes instantly inside your local hardware.
          </p>
        </div>

        {/* Categories Tab Switcher */}
        <div className="flex justify-center mb-12 animate-fade-in">
          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-md backdrop-blur-xl">
            {[
              { id: 'all', label: 'All Utilities', icon: Layers },
              { id: 'pdf', label: 'PDF Suite', icon: FileText },
              { id: 'image', label: 'Image Converter', icon: FileImage },
              { id: 'security', label: 'Privacy & Security', icon: ShieldCheck },
            ].map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Category Views */}
        {activeCategory !== 'security' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 animate-slide-up">
            {filteredFeatures.map((f, i) => (
              <Card key={i} glow className="hover:-translate-y-1 transition-all duration-300 border border-slate-200/50 dark:border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[f.color] || colorMap.indigo}`}>
                      <f.icon size={22} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                      {f.category === 'pdf' ? 'PDF Tool' : 'Image Tool'}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-slate-650 dark:text-slate-450 text-xs sm:text-sm leading-relaxed mb-6">{f.desc}</p>
                </div>

                <div className="border-t border-black/5 dark:border-white/5 pt-4 mt-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {f.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <Check size={10} className="text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-slide-up mb-20">
            {/* Privacy Section Details */}
            <div className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-8 sm:p-12 shadow-sm">
              <div>
                <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-500/20">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Privacy-First Philosophy
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Unlike traditional platforms that route files to remote servers (leaving digital footprints), ImgConvert Pro operates fully within your local RAM memory sandbox.
                </p>
                <div className="space-y-3">
                  {[
                    'Confidential documents never leave your browser',
                    'Zero uploads means no data storage or leakage risks',
                    'Fully GDPR, HIPAA, and ISO 27001 compliant',
                    'Perfect for corporate, legal, and financial sectors'
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-350">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px]">✓</div>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Cpu, title: 'WebAssembly Processing', desc: 'Runs core binary utilities directly inside the browser environment for desktop-grade performance.' },
                  { icon: Lock, title: 'Local Sandbox Memory', desc: 'Your files reside strictly in temporary volatile RAM and vanish instantly upon page refresh or tab close.' },
                  { icon: Globe, title: 'Offline Capabilities', desc: 'No internet connection? No problem. The entire application runs smoothly 100% offline once cached.' }
                ].map((sec, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0 border border-primary-500/25">
                      <sec.icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1">{sec.title}</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{sec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global Security Comparison Table */}
        {activeCategory !== 'security' && (
          <div className="mb-20 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                How We Differ From Server-Based Platforms
              </h2>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-lg backdrop-blur">
              <div className="grid grid-cols-3 border-b border-slate-200 dark:border-white/10 p-4 font-bold text-xs sm:text-sm text-slate-800 dark:text-white bg-slate-100/50 dark:bg-slate-900/60">
                <div>Metric</div>
                <div className="text-primary-600 dark:text-primary-400 flex items-center gap-1.5"><Sparkles size={14} /> ImgConvert Pro</div>
                <div className="text-slate-500">Standard Web Apps</div>
              </div>
              {[
                { m: 'Data Protection', local: '100% Private (No uploads)', other: 'Requires cloud upload' },
                { m: 'Processing Speeds', local: 'Instant (GPU-Accelerated)', other: 'Subject to API wait queues' },
                { m: 'Size Constraints', local: 'Unlimited Files & pages', other: 'Strict caps or paywalls' },
                { m: 'Offline Workflows', local: 'Works completely offline', other: 'Terminates without internet' }
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 p-4 border-b border-slate-100 dark:border-white/5 last:border-b-0 text-xs sm:text-sm text-slate-600 dark:text-slate-350">
                  <div className="font-semibold text-slate-800 dark:text-white">{row.m}</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-medium">✓ {row.local}</div>
                  <div className="text-slate-400">✗ {row.other}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Conversion Workflow CTA */}
        <div className="relative rounded-3xl bg-gradient-to-r from-primary-600/10 to-violet-600/10 border border-primary-500/20 p-8 sm:p-12 text-center max-w-4xl mx-auto overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Experience the Desktop-Class Performance
            </h3>
            <p className="text-sm sm:text-base text-slate-650 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Launch our secure sandboxes instantly. No subscriptions, no registration required, just clean in-browser document processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/converter">
                <Button size="lg" className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2">
                  <FileImage size={18} /> Open Image Converter
                </Button>
              </Link>
              <Link to="/pdf-tools">
                <Button size="lg" variant="ghost" className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-white/5">
                  <FileText size={18} /> Launch PDF Editor <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
