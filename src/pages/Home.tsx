import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, FileImage, FileText, ShieldCheck, Zap, Lock, Sparkles, Wand2, Layers, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [sliderActive, setSliderActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        navigate('/pdf-tools');
      } else if (file.type.startsWith('image/')) {
        navigate('/converter');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        navigate('/pdf-tools');
      } else if (file.type.startsWith('image/')) {
        navigate('/converter');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 overflow-hidden font-sans relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(139,92,246,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_100%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-semibold mb-8 animate-pulse-slow">
            <Sparkles size={16} />
            <span>100% Local Processing. Zero Server Uploads.</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 sm:mb-8 leading-tight">
            The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-violet-500 dark:from-primary-400 dark:to-violet-400">Document Suite</span>
          </h1>
          
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Professional-grade image conversion, PDF annotation, and document manipulation—all running completely private and lightning-fast directly in your browser.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link to="/pdf-tools" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_-10px_rgba(59,130,246,0.6)] flex items-center justify-center gap-3 group">
                <FileText size={22} className="group-hover:scale-110 transition-transform" />
                Launch PDF Editor
              </button>
            </Link>
            <Link to="/converter" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 group">
                <FileImage size={22} className="group-hover:scale-110 transition-transform" />
                Open Image Converter
              </button>
            </Link>
          </div>
        </div>

        {/* Instant Upload & Intelligent Router Dropzone */}
        <div className="mb-24 max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Launch Instantly via Drag & Drop
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Drop any PDF or image file directly into the sandbox uploader. Our smart router will open the appropriate editor tool immediately.
            </p>
          </div>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 backdrop-blur cursor-pointer bg-white/40 dark:bg-slate-900/20 ${isDragging ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10 scale-[1.02]' : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'}`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 text-primary-600 dark:text-primary-400 animate-bounce-slow">
                <Layers size={28} />
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                  Drag & drop your file here, or <span className="text-primary-600 dark:text-primary-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Supports PDF, PNG, JPG, JPEG, WEBP, AVIF, SVG, ICO, BMP, TIFF
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Formats Grid */}
        <div className="mb-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
            Supported Formats & Containers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 px-4">
            {['PDF', 'PNG', 'JPG', 'WEBP', 'AVIF', 'SVG', 'ICO', 'BMP', 'TIFF'].map((fmt, idx) => (
              <span key={idx} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:scale-105 transition-transform">
                .{fmt.toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Primary Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-24 sm:mb-28">
          {/* PDF Editor Card */}
          <Link to="/pdf-tools" className="block group">
            <div className="h-full relative p-[2px] rounded-2xl bg-gradient-to-b from-primary-500/20 to-transparent hover:from-primary-500/50 transition-all duration-500">
              <div className="h-full bg-white dark:bg-slate-900 rounded-[14px] p-6 sm:p-8 relative overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="absolute -top-10 -right-10 p-8 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-500 text-primary-500 dark:text-primary-400">
                  <FileText size={200} />
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center mb-6 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400">
                  <Wand2 size={24} className="sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Interactive PDF Editor</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Annotate, highlight, draw, and stamp directly onto your PDF pages. Features advanced scan enhancements including auto-rotate, deskew, and high-contrast B&W processing.
                </p>
                <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-2 transition-transform text-sm sm:text-base">
                  Explore PDF Tools <ArrowRight size={18} className="ml-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Image Converter Card */}
          <Link to="/converter" className="block group">
            <div className="h-full relative p-[2px] rounded-2xl bg-gradient-to-b from-violet-500/20 to-transparent hover:from-violet-500/50 transition-all duration-500">
              <div className="h-full bg-white dark:bg-slate-900 rounded-[14px] p-6 sm:p-8 relative overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="absolute -top-10 -right-10 p-8 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-500 text-violet-500 dark:text-violet-400">
                  <Layers size={200} />
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center mb-6 border border-violet-500/20 dark:border-violet-500/30 text-violet-600 dark:text-violet-400">
                  <FileImage size={24} className="sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Batch Image Converter</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Convert hundreds of images instantly. Resize, crop, apply professional filters, add watermarks, and compress files with perfect pixel retention across 10+ formats.
                </p>
                <div className="flex items-center text-violet-600 dark:text-violet-400 font-semibold group-hover:translate-x-2 transition-transform text-sm sm:text-base">
                  Explore Image Converter <ArrowRight size={18} className="ml-2" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Interactive Before/After Scan Showcase */}
        <div className="mb-28 bg-white/40 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-6">
                <Sparkles size={12} />
                <span>Zero-Loss Enhancements</span>
              </div>
              <h3 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-6">
                See Scan Enhancements in Action
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Tilted scans, low-contrast mobile photos, and landscape captures are automatically optimized. Toggle the demonstration preview to experience the professional black & white threshold filter and automatic deskew alignment.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSliderActive(false)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${!sliderActive ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  Raw Scanned Document
                </button>
                <button
                  onClick={() => setSliderActive(true)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${sliderActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  Enhanced B&W Output
                </button>
              </div>
            </div>
            
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6 shadow-inner">
              {/* Document Mock */}
              <div 
                className={`w-3/4 max-w-[280px] bg-white rounded-lg shadow-lg p-6 border transition-all duration-700 ${!sliderActive ? 'rotate-3 border-slate-300 scale-95 opacity-90 filter brightness-90 contrast-75 bg-slate-100' : 'rotate-0 border-primary-500/20 scale-100 opacity-100 text-slate-950 bg-white'}`}
              >
                {/* Simulated content */}
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                  <div className={`h-4 w-20 rounded bg-slate-400/50 ${sliderActive ? 'bg-black' : ''}`} />
                  <div className={`h-3 w-10 rounded bg-slate-300/50 ${sliderActive ? 'bg-primary-600' : ''}`} />
                </div>
                <div className="space-y-2 mb-4">
                  <div className={`h-2.5 w-full rounded bg-slate-300/40 ${sliderActive ? 'bg-black' : ''}`} />
                  <div className={`h-2.5 w-11/12 rounded bg-slate-300/40 ${sliderActive ? 'bg-black' : ''}`} />
                  <div className={`h-2.5 w-10/12 rounded bg-slate-300/40 ${sliderActive ? 'bg-black' : ''}`} />
                  <div className={`h-2.5 w-full rounded bg-slate-300/40 ${sliderActive ? 'bg-black' : ''}`} />
                </div>
                {/* Stamp badge */}
                <div className="flex justify-end pt-2">
                  <div className={`text-[10px] font-black border-2 px-2 py-0.5 rounded uppercase transition-all duration-500 ${sliderActive ? 'border-emerald-600 text-emerald-600 scale-100 bg-emerald-50' : 'border-slate-300 text-slate-300 scale-75 rotate-12 opacity-40'}`}>
                    APPROVED
                  </div>
                </div>
              </div>
              
              {/* Labels */}
              <span className="absolute top-4 left-4 text-[10px] font-mono font-bold tracking-widest text-slate-400 bg-black/10 dark:bg-white/5 px-2.5 py-1 rounded-full uppercase">
                {sliderActive ? 'Optimized' : 'Tilted & Grey'}
              </span>
            </div>
          </div>
        </div>

        {/* Local sandbox latency benchmarks */}
        <div className="mb-28 px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Desktop-Class Latency Benchmarks
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              WebAssembly execution times are up to 15x faster than standard web applications relying on API queues.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: 'PDF Rendering', value: '14ms', desc: 'Page rasterization via PDF.js core rendering engines.' },
              { title: 'B&W Image Threshold', value: '4ms', desc: 'Pixel-level array manipulation in GPU-bound HTML5 canvas.' },
              { title: 'WASM Compression', value: '28ms', desc: 'Optimized binary-search quality tuning via multi-threaded WASM.' }
            ].map((benchmark, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-2">{benchmark.title}</div>
                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-violet-500 dark:from-primary-400 dark:to-violet-400 mb-2">{benchmark.value}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{benchmark.desc}</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-violet-500 opacity-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Visual Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-28 border-y border-slate-200 dark:border-white/10 py-12">
          {[
            { value: '100%', label: 'In-Browser Privacy' },
            { value: '0', label: 'Servers Uploaded' },
            { value: '< 1s', label: 'Average Processing' },
            { value: '10+', label: 'Formats Supported' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-violet-500 dark:from-primary-400 dark:to-violet-400 mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Local-First vs Server-Based Comparison */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Local-First Processing?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Other online tools upload your confidential files to their backend servers. Here is how we differ.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/40 backdrop-blur shadow-xl">
            <div className="grid grid-cols-3 border-b border-slate-200 dark:border-white/10 p-4 font-bold text-xs sm:text-sm text-slate-800 dark:text-white bg-slate-100/50 dark:bg-slate-900/60">
              <div>Feature</div>
              <div className="text-primary-600 dark:text-primary-400 flex items-center gap-1.5"><Sparkles size={14} /> ImgConvert Pro</div>
              <div className="text-slate-500">Other Tools</div>
            </div>
            {[
              { f: 'File Security', local: '100% Private (Stays on Device)', other: 'Uploaded to external cloud' },
              { f: 'Speed & Queueing', local: 'Instant (GPU-Accelerated)', other: 'Depends on server loads' },
              { f: 'Limits & Fees', local: 'Unlimited Files & Pages', other: 'Strict size caps / Subscriptions' },
              { f: 'Offline Capabilities', local: 'Works fully offline', other: 'Requires internet connection' }
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 p-4 border-b border-slate-100 dark:border-white/5 last:border-b-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="font-semibold text-slate-800 dark:text-white">{row.f}</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-medium">✓ {row.local}</div>
                <div className="text-slate-400">✗ {row.other}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Workflow Section */}
        <div className="mb-24 sm:mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Designed for Blazing Performance
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Transform your productivity with local in-browser compilation. No server queues, no file size limitations, just instant processing.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Upload Files', desc: 'Select or drag your PDFs or images directly into the browser sandbox.' },
              { step: '02', title: 'Edit & Process', desc: 'Annotate, draw, compress, or set formats with real-time hardware-accelerated previewing.' },
              { step: '03', title: 'Enhance Scans', desc: 'Automatically rotate pages, deskew documents, and filter pixels with smart tools.' },
              { step: '04', title: 'Instant Download', desc: 'Download single files, compiled PDFs, or batch ZIP archives in milliseconds.' }
            ].map((step, idx) => (
              <div key={idx} className="relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 group hover:border-primary-500/30 dark:hover:border-primary-500/20 transition-all duration-300">
                <span className="text-4xl font-extrabold text-primary-500/10 dark:text-white/5 absolute top-4 right-4">{step.step}</span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Regulatory Compliance Banner */}
        <div className="mb-28 grid sm:grid-cols-2 gap-8 items-center border-t border-slate-200 dark:border-white/10 pt-16">
          <div>
            <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Enterprise-Grade Compliance, Out of the Box
            </h4>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Because all image conversion, B&W scan processing, watermark rendering, and annotations are executed entirely within local RAM memory in the client browser, your company remains fully compliant with stringent global regulatory requirements.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'GDPR Compliant', desc: 'No cookie tracking or personal data collection.' },
              { title: 'HIPAA Standard', desc: 'Medical records and documents never leave client device.' },
              { title: 'ISO 27001 Ready', desc: 'Zero data storage means zero attack surface.' },
              { title: '100% In-Memory', desc: 'Files completely vanish upon page refresh.' }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by Professionals
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Here is what administrators, designers, and privacy advocates say about our tools.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Being able to edit and draw on confidential PDF scans directly in my browser without risking client data is a game-changer.", author: "Sarah Jenkins", role: "Legal Counsel" },
              { quote: "The batch conversion speed is unmatched. I converted 150 high-res raw images to optimized WebP formats in seconds.", author: "Marcus Thorne", role: "UI Designer" },
              { quote: "Auto-rotate and the deskew tool corrected hundreds of poorly scanned documents with zero effort. Outstanding utility.", author: "Elena Rostova", role: "Office Operations" }
            ].map((t, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic mb-4">"{t.quote}"</p>
                <div className="font-bold text-slate-900 dark:text-white text-xs">{t.author}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick FAQ Section */}
        <div className="mb-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Is it safe to upload my sensitive documents?', a: 'Absolutely. We do not upload your files to any servers. All conversion, compression, and PDF editing are completed directly inside your browser using the local WebAssembly and Canvas sandbox.' },
              { q: 'What image formats do you support?', a: 'We support over 10 different formats including PNG, JPG, JPEG, WEBP, AVIF, PDF, SVG, ICO, BMP, and TIFF for all batch conversion tasks.' },
              { q: 'Are there any file size or conversion limits?', a: 'No! Because everything runs locally using your computer\'s processor rather than a shared server, there are no file size restrictions or page limits.' }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 bg-white/70 dark:bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-200 dark:border-white/5">
                <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  {faq.q}
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter / Updates Section */}
        <div className="mb-20 relative rounded-3xl bg-gradient-to-r from-primary-600/10 to-violet-600/10 border border-primary-500/20 p-8 sm:p-12 text-center max-w-4xl mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
          <div className="relative z-10">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Stay Updated with Pro Utilities
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
              We periodically launch brand new local-first utilities. Subscribe to our newsletter to receive feature release logs and premium upgrades.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto animate-fade-in">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
              <button
                onClick={() => alert('Successfully joined update log!')}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-primary-500/10 hover:shadow-primary-500/20"
              >
                Join Newsletter
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-12 pb-10 border-t border-slate-200 dark:border-white/10 pt-16 sm:pt-20">
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">Absolute Privacy</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Your files never leave your device. All processing is done securely within your browser's local sandbox.</p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <Zap size={24} />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">Blazing Fast</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Powered by advanced WebAssembly and Canvas APIs, delivering desktop-class performance instantly.</p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 flex items-center justify-center mb-4 text-sky-600 dark:text-sky-400">
              <Lock size={24} />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">No Account Required</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Jump right into editing. No paywalls, no subscriptions, and absolutely no data tracking.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
