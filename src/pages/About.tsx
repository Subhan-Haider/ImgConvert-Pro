import { Globe, Heart, Shield, Zap, Code2, Sparkles, FileText, Cpu, EyeOff, Layout } from 'lucide-react';
import { Card } from '../components/Card';

export default function About() {
  const stats = [
    {
      icon: <Shield className="text-primary-500" size={24} />,
      title: '100% Client-Side Sandbox',
      desc: 'All operations execute in memory within your sandboxed browser tab. Zero network packet uploads.'
    },
    {
      icon: <Cpu className="text-violet-500" size={24} />,
      title: 'WASM & GPU Accelerated',
      desc: 'Leverages WebAssembly compiled binaries and HTML5 Canvas API for massive local core utilization.'
    },
    {
      icon: <EyeOff className="text-emerald-500" size={24} />,
      title: 'GDPR & HIPAA Compliant',
      desc: 'Zero file caching, tracking data, or remote server disk logging, leaving no trace upon tab close.'
    },
    {
      icon: <Layout className="text-amber-500" size={24} />,
      title: 'Bloomberg-Terminal Aesthetic',
      desc: 'Tailored with glassmorphism design parameters, harmonic color HSL scales, and premium hover scales.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 overflow-hidden font-sans relative">
      {/* Background visual graphics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-20 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-bold mb-8">
            <Sparkles size={16} /> Welcome to the Future of Media Processing
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl mb-6 tracking-tight text-slate-900 dark:text-white leading-tight">
            About the <span className="gradient-text">Project</span>
          </h1>
          <p className="text-slate-650 dark:text-slate-400 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            ImgConvert Pro represents a paradigm shift in web architecture. By combining local client-first computation models with optimized visual sandboxes, we deliver lightning-fast batch processing without ever violating document privacy.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Main Mission Card */}
          <Card glow className="lg:col-span-2 p-8 sm:p-12 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity duration-700 group-hover:rotate-12 pointer-events-none">
              <Code2 size={450} />
            </div>
            <div className="relative z-10">
              <h2 className="font-display font-black text-3xl sm:text-4xl mb-6 text-slate-900 dark:text-white">Why We Built This</h2>
              <div className="space-y-6 text-slate-650 dark:text-slate-350 text-base sm:text-lg leading-relaxed">
                <p>
                  Most document converters require uploading your private files—financial charts, scanned credentials, contracts—to foreign remote servers. This introduces network wait times, consumes expensive bandwidth, and exposes sensitive credentials to third-party disk cache compromises.
                </p>
                <p>
                  We designed a better architecture. <strong className="text-slate-900 dark:text-white font-extrabold">ImgConvert Pro</strong> processes everything inside browser-virtualized sandbox memory. Leveraging state-of-the-art C++ libraries compiled to client-side <strong className="text-primary-500 dark:text-primary-400 font-extrabold">WebAssembly</strong> and accelerated GPU HTML5 Canvas rendering pipelines, your pixels are computed entirely on your device's core CPU cores.
                </p>
                <p>
                  Unplug your network cable, load up your PDFs or massive image folders, and watch them split, compress, watermark, or OCR extract instantly. High-fidelity conversion meets uncompromising security.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-bold shadow-sm">
                  <Shield size={18} /> Privacy First
                </span>
                <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold shadow-sm">
                  <Zap size={18} /> Instant Local Core
                </span>
              </div>
            </div>
          </Card>

          {/* Developer Card */}
          <Card glow className="p-8 sm:p-10 flex flex-col items-center text-center justify-between">
            <div className="w-full flex flex-col items-center">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 p-1 mb-6 shadow-2xl shadow-primary-500/30">
                <img 
                  src="https://github.com/Subhan-Haider.png" 
                  alt="Subhan Haider" 
                  className="w-full h-full object-cover rounded-[14px] bg-white dark:bg-surface-900"
                />
              </div>
              <h3 className="font-display font-black text-3xl mb-2 text-slate-900 dark:text-white">Subhan Haider</h3>
              <p className="text-primary-600 dark:text-primary-400 font-bold mb-6 text-xs uppercase tracking-widest">Founder & Lead Developer</p>
              <p className="text-slate-650 dark:text-slate-400 mb-8 leading-relaxed font-medium text-sm sm:text-base">
                Passionate about building advanced local-first web applications, client-side cryptography, and highly aesthetic document workspaces.
              </p>
            </div>
            
            <div className="flex justify-center gap-4 w-full mt-auto">
              <a href="https://github.com/Subhan-Haider" target="_blank" rel="noreferrer" className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:-translate-y-1.5 shadow-lg shadow-transparent hover:shadow-black/5 dark:hover:shadow-white/5 text-slate-700 dark:text-slate-300 transition-all duration-300" title="GitHub">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.15-3.8s-1.18-.38-3.9 1.47a13.38 13.38 0 0 0-7 0C6.27 2.22 5.1 2.6 5.1 2.6a5.5 5.5 0 0 0-.15 3.8A5.5 5.5 0 0 0 3.5 10.24c0 5.22 3 6.42 6 6.76a4.8 4.8 0 0 0-1 3.24v4"/><path d="M8 19c-3 1-4-1-5-1"/></svg>
              </a>
              <a href="https://instagram.com/subhan_haid" target="_blank" rel="noreferrer" className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:-translate-y-1.5 shadow-lg shadow-transparent hover:shadow-black/5 dark:hover:shadow-white/5 text-slate-700 dark:text-slate-300 transition-all duration-300" title="Instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://subhan.tech" target="_blank" rel="noreferrer" className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:-translate-y-1.5 shadow-lg shadow-transparent hover:shadow-black/5 dark:hover:shadow-white/5 text-slate-700 dark:text-slate-300 transition-all duration-300" title="Website">
                <Globe size={22} />
              </a>
            </div>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 border border-slate-200/50 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col items-start hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-white/5 mb-4 shadow-sm">
                {stat.icon}
              </div>
              <h4 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mb-2 leading-tight">
                {stat.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
                {stat.desc}
              </p>
            </Card>
          ))}
        </div>

        {/* Footer Banner */}
        <Card glow className="p-10 sm:p-16 text-center bg-gradient-to-br from-primary-500/5 to-violet-500/5 border border-primary-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Heart className="text-primary-500 fill-primary-500/20" size={36} />
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl mb-6 text-slate-900 dark:text-white">Built with Uncompromising Passion</h2>
            <p className="text-slate-650 dark:text-slate-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed mb-6">
              This application stands as proof that highly premium, feature-dense media tools can execute safely on local hardware inside user browser runtimes. Powered by React, Tailwind CSS, pdf-lib, and WebAssembly.
            </p>
            <div className="flex justify-center items-center gap-2 text-xs text-slate-500 font-semibold">
              <FileText size={16} className="text-primary-500" />
              <span>Version 2.0 (Stable Release) ➔ 100% Client-Side Verified</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
