import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Layers, Download, ArrowRight, Image, FileImage, Cpu, UploadCloud, Sliders, DownloadCloud, ServerOff, Lock, Clock } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const FEATURES = [
  { icon: Layers,      title: '10+ Formats',      desc: 'PNG, JPG, WEBP, AVIF, PDF, SVG, ICO, BMP, TIFF and more.' },
  { icon: ShieldCheck, title: 'Privacy First',     desc: '100% local processing. No upload, no server, no data leak.' },
  { icon: Cpu,         title: 'Batch Convert',     desc: 'Process dozens of images at once with one click.' },
  { icon: Image,       title: 'Image Filters',     desc: 'Brightness, contrast, saturation, warmth, sharpening.' },
  { icon: FileImage,   title: 'PDF Support',       desc: 'Import PDFs as images or export images directly to PDF.' },
  { icon: Download,    title: 'ZIP Download',       desc: 'Package all results in a single ZIP for easy download.' },
];

const FORMATS = ['PNG', 'JPG', 'WEBP', 'AVIF', 'PDF', 'SVG', 'ICO', 'BMP', 'TIFF'];

const FAQS = [
  {
    q: "Is it really 100% private?",
    a: "Yes! All processing happens directly inside your browser using WebAssembly and HTML5 Canvas. Your images are never uploaded to any server, making it impossible for us or anyone else to access your files."
  },
  {
    q: "Do I need to pay or create an account?",
    a: "No, Image Converter Pro is completely free to use and requires no account creation or login."
  },
  {
    q: "Is there a limit on file size or number of images?",
    a: "Because processing happens on your device, the only limits are your computer's memory and processing power. You can safely batch convert dozens of high-resolution images at once."
  },
  {
    q: "Which browsers are supported?",
    a: "We support all modern web browsers including Chrome, Firefox, Safari, and Edge. For the best performance during heavy batch conversions, we recommend Chrome or Edge."
  }
];

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-32 px-4">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-secondary-500/8 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-600 dark:text-primary-300 text-sm font-medium mb-8">
            <Zap size={14} className="text-primary-500 dark:text-primary-400" />
            Studio-grade conversion · 100% in your browser
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
            Convert Images
            <br />
            <span className="gradient-text">Instantly & Privately</span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Batch convert, compress, and edit images right in your browser.
            No uploads, no accounts — your files never leave your device.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/converter">
              <Button size="lg" className="group">
                Start Converting
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="secondary">Explore Features</Button>
            </Link>
          </div>

          {/* Format pills */}
          <div className="mt-14 flex flex-wrap justify-center gap-2">
            {FORMATS.map(f => (
              <span key={f} className="px-3 py-1 rounded-full text-xs font-semibold bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-black/[0.02] dark:bg-white/[0.02] border-y border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl mb-4 text-slate-900 dark:text-white">Convert in 3 Simple Steps</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">
              No complex settings or account required. Just drop your files and go.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent -translate-y-1/2 z-0" />
            
            {[
              { icon: UploadCloud, title: '1. Select Files', desc: 'Drag and drop your images or PDFs directly into the browser window.' },
              { icon: Sliders, title: '2. Choose Format', desc: 'Select your desired output format, quality, and any image filters.' },
              { icon: DownloadCloud, title: '3. Download', desc: 'Get your converted files instantly. Batch downloads come neatly zipped.' }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-surface-900 shadow-xl shadow-black/5 dark:shadow-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center mb-6">
                  <step.icon className="text-primary-600 dark:text-primary-400" size={28} />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl mb-4">Everything You Need</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Professional-grade tools that run entirely in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Card key={i} glow className="hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-primary-500/15 flex items-center justify-center mb-4">
                  <f.icon size={22} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Local Matters ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-6">
                <ShieldCheck size={16} /> 100% Client-Side
              </div>
              <h2 className="font-display font-bold text-4xl sm:text-5xl leading-tight mb-6 text-slate-900 dark:text-white">
                Your files stay <br/> on your device.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Traditional converters upload your personal photos to remote servers, process them in a queue, and send them back. This wastes data, costs time, and exposes your private files.
              </p>
              <div className="space-y-6">
                {[
                  { icon: ServerOff, title: 'Zero Server Uploads', desc: 'Processing happens entirely within your web browser using HTML5 APIs.' },
                  { icon: Lock, title: 'Absolute Privacy', desc: 'No one, not even us, can see the images you convert. They never leave your machine.' },
                  { icon: Clock, title: 'Instant Processing', desc: 'No waiting in server queues or uploading massive files over slow internet connections.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <item.icon className="text-primary-600 dark:text-primary-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{item.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 blur-3xl rounded-full" />
              <Card glow className="relative p-2 overflow-hidden h-full">
                 <div className="aspect-square rounded-[20px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
                    <img 
                      src="/local-processing.png" 
                      alt="Local Processing Illustration" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-black/[0.02] dark:bg-white/[0.02] border-y border-black/5 dark:border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl mb-4 text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Everything you need to know about the product.
            </p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <Card key={i} glow className="p-6 sm:p-8">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">{faq.q}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="text-center py-16 border-primary-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/5 pointer-events-none" />
            <h2 className="font-display font-bold text-4xl mb-4 relative">Ready to Convert?</h2>
            <p className="text-slate-400 mb-8 relative">Drop your images, pick a format, and download. Simple as that.</p>
            <Link to="/converter">
              <Button size="lg" className="relative group">
                Open Converter <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
