import { Layers, ShieldCheck, Cpu, Image, FileImage, Download, Sliders, Droplets, Type, RotateCcw } from 'lucide-react';
import { Card } from '../components/Card';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

const FEATURES = [
  { icon: Layers,      color: 'primary', title: '10+ Export Formats',    desc: 'PNG, JPG, WEBP, AVIF, PDF, SVG, ICO, BMP, TIFF — all conversion paths covered.' },
  { icon: ShieldCheck, color: 'emerald', title: 'Zero-Upload Privacy',    desc: 'Every conversion runs locally in WebAssembly and Canvas API. Nothing touches a server.' },
  { icon: Cpu,         color: 'violet',  title: 'Batch Processing',       desc: 'Convert dozens of images simultaneously with live per-file progress tracking.' },
  { icon: FileImage,   color: 'amber',   title: 'PDF Import & Export',    desc: 'Render PDF pages as high-res images (2× scale) or export images directly to PDF.' },
  { icon: Image,       color: 'sky',     title: 'Resize & Crop',          desc: 'Fit, fill, stretch, circular crop — with pixel or percentage dimensions.' },
  { icon: Sliders,     color: 'primary', title: 'Live Image Filters',     desc: 'Brightness, contrast, saturation, warmth and sharpening with real-time previews.' },
  { icon: Droplets,    color: 'pink',    title: 'Grayscale & Sepia',      desc: 'One-click film-style effects applied directly to any image before export.' },
  { icon: Type,        color: 'orange',  title: 'Watermarking',           desc: 'Custom text watermarks with position, opacity and color controls.' },
  { icon: RotateCcw,   color: 'teal',    title: 'Image Compression',      desc: 'Binary-search quality optimization to hit any target file size.' },
  { icon: Download,    color: 'indigo',  title: 'ZIP Package Download',   desc: 'Batch export everything in a single compressed ZIP archive.' },
];

const colorMap: Record<string, string> = {
  primary: 'bg-primary-500/15 text-primary-600 dark:text-primary-400',
  emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  violet:  'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  amber:   'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  sky:     'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  pink:    'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  orange:  'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  teal:    'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  indigo:  'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
};

export default function Features() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">
          Every Tool You <span className="gradient-text">Need</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Image Converter Pro is packed with professional-grade features — all running
          privately in your browser without any installation.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {FEATURES.map((f, i) => (
          <Card key={i} glow className="hover:-translate-y-1 transition-all duration-300">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${colorMap[f.color]}`}>
              <f.icon size={22} />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">Ready to try it yourself?</p>
        <Link to="/converter">
          <Button size="lg">Open Converter →</Button>
        </Link>
      </div>
    </div>
  );
}
