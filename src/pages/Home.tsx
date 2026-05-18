import { Link } from 'react-router-dom';
import { ArrowRight, FileImage, FileText, ShieldCheck, Zap, Lock, Sparkles, Wand2, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-200 overflow-hidden font-sans relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 sm:mb-24 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs sm:text-sm font-semibold mb-8 animate-pulse-slow">
            <Sparkles size={16} />
            <span>100% Local Processing. Zero Server Uploads.</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 sm:mb-8 leading-tight">
            The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-violet-400">Document Suite</span>
          </h1>
          
          <p className="text-base sm:text-xl text-slate-400 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
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
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-base sm:text-lg transition-all duration-300 border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-3 group">
                <FileImage size={22} className="group-hover:scale-110 transition-transform" />
                Open Image Converter
              </button>
            </Link>
          </div>
        </div>

        {/* Primary Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-24 sm:mb-32">
          {/* PDF Editor Card */}
          <Link to="/pdf-tools" className="block group">
            <div className="h-full relative p-[2px] rounded-2xl bg-gradient-to-b from-primary-500/30 to-transparent hover:from-primary-500/60 transition-all duration-500">
              <div className="h-full bg-slate-900 rounded-[14px] p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 p-8 opacity-10 group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-500 text-primary-400">
                  <FileText size={200} />
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-6 border border-primary-500/30 text-primary-400">
                  <Wand2 size={24} className="sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Interactive PDF Editor</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
                  Annotate, highlight, draw, and stamp directly onto your PDF pages. Features advanced scan enhancements including auto-rotate, deskew, and high-contrast B&W processing.
                </p>
                <div className="flex items-center text-primary-400 font-semibold group-hover:translate-x-2 transition-transform text-sm sm:text-base">
                  Explore PDF Tools <ArrowRight size={18} className="ml-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Image Converter Card */}
          <Link to="/converter" className="block group">
            <div className="h-full relative p-[2px] rounded-2xl bg-gradient-to-b from-violet-500/30 to-transparent hover:from-violet-500/60 transition-all duration-500">
              <div className="h-full bg-slate-900 rounded-[14px] p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 p-8 opacity-10 group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-500 text-violet-400">
                  <Layers size={200} />
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6 border border-violet-500/30 text-violet-400">
                  <FileImage size={24} className="sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Batch Image Converter</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
                  Convert hundreds of images instantly. Resize, crop, apply professional filters, add watermarks, and compress files with perfect pixel retention across 10+ formats.
                </p>
                <div className="flex items-center text-violet-400 font-semibold group-hover:translate-x-2 transition-transform text-sm sm:text-base">
                  Explore Image Converter <ArrowRight size={18} className="ml-2" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-12 pb-10 border-t border-white/10 pt-16 sm:pt-20">
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-2">Absolute Privacy</h4>
            <p className="text-xs sm:text-sm text-slate-400">Your files never leave your device. All processing is done securely within your browser's local sandbox.</p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-4 text-amber-400">
              <Zap size={24} />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-2">Blazing Fast</h4>
            <p className="text-xs sm:text-sm text-slate-400">Powered by advanced WebAssembly and Canvas APIs, delivering desktop-class performance instantly.</p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 flex items-center justify-center mb-4 text-sky-400">
              <Lock size={24} />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-2">No Account Required</h4>
            <p className="text-xs sm:text-sm text-slate-400">Jump right into editing. No paywalls, no subscriptions, and absolutely no data tracking.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
