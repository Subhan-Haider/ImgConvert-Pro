import { Globe, Heart, Shield, Zap, Code2, Sparkles } from 'lucide-react';
import { Card } from '../components/Card';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-bold mb-8">
          <Sparkles size={16} /> Welcome to the future of image processing
        </div>
        <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl mb-6 tracking-tight text-slate-900 dark:text-white">
          About the <span className="gradient-text">Project</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Built for privacy, speed, and modern web aesthetics. Image Converter Pro represents exactly what is possible when pushing the limits of the browser.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        {/* Main Mission Card */}
        <Card glow className="lg:col-span-2 p-8 sm:p-12 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity duration-700 group-hover:rotate-12 pointer-events-none">
            <Code2 size={450} />
          </div>
          <div className="relative z-10">
            <h2 className="font-display font-bold text-3xl sm:text-4xl mb-8 text-slate-900 dark:text-white">Why we built this</h2>
            <div className="space-y-6 text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
              <p>
                Most image converters on the market require you to upload your personal files to a remote server. Not only is this extremely slow, but it requires a constant internet connection and poses a significant privacy risk.
              </p>
              <p>
                We believed there was a better way. <strong className="text-slate-900 dark:text-white font-semibold">Image Converter Pro</strong> leverages the HTML5 Canvas API and WebAssembly to process every single pixel 100% locally on your device. Your data never leaves your computer, ensuring absolute privacy and lightning-fast processing speeds.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-10">
              <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-bold shadow-sm">
                <Shield size={18} /> Privacy First
              </span>
              <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold shadow-sm">
                <Zap size={18} /> Lightning Fast
              </span>
            </div>
          </div>
        </Card>

        {/* Developer Card */}
        <Card glow className="p-8 sm:p-10 flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 p-1 mb-6 shadow-2xl shadow-primary-500/30">
            <img 
              src="https://github.com/Subhan-Haider.png" 
              alt="Subhan Haider" 
              className="w-full h-full object-cover rounded-[14px] bg-white dark:bg-surface-900"
            />
          </div>
          <h3 className="font-display font-bold text-3xl mb-2 text-slate-900 dark:text-white">Subhan Haider</h3>
          <p className="text-primary-600 dark:text-primary-400 font-bold mb-6 text-xs uppercase tracking-widest">Lead Developer</p>
          <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
            Passionate about building modern, beautiful, and highly functional web applications that put the user first.
          </p>
          <div className="flex justify-center gap-4 w-full mt-auto">
            <a href="https://github.com/Subhan-Haider" target="_blank" rel="noreferrer" className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:-translate-y-1.5 shadow-lg shadow-transparent hover:shadow-black/5 dark:hover:shadow-white/5 text-slate-700 dark:text-slate-300 transition-all duration-300">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.15-3.8s-1.18-.38-3.9 1.47a13.38 13.38 0 0 0-7 0C6.27 2.22 5.1 2.6 5.1 2.6a5.5 5.5 0 0 0-.15 3.8A5.5 5.5 0 0 0 3.5 10.24c0 5.22 3 6.42 6 6.76a4.8 4.8 0 0 0-1 3.24v4"/><path d="M8 19c-3 1-4-1-5-1"/></svg>
            </a>
            <a href="https://instagram.com/subhan_haid" target="_blank" rel="noreferrer" className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:-translate-y-1.5 shadow-lg shadow-transparent hover:shadow-black/5 dark:hover:shadow-white/5 text-slate-700 dark:text-slate-300 transition-all duration-300">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://subhan.tech" target="_blank" rel="noreferrer" className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:-translate-y-1.5 shadow-lg shadow-transparent hover:shadow-black/5 dark:hover:shadow-white/5 text-slate-700 dark:text-slate-300 transition-all duration-300">
              <Globe size={22} />
            </a>
          </div>
        </Card>
      </div>

      {/* Footer Banner */}
      <Card glow className="p-10 sm:p-16 text-center bg-gradient-to-br from-primary-500/5 to-secondary-500/5 border-primary-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.02] pointer-events-none" />
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Heart className="text-primary-500 fill-primary-500/20" size={36} />
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-6 text-slate-900 dark:text-white">Built with passion</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            This project is an open showcase of modern web technologies including React, Tailwind CSS, and Vite. Designed to prove that beautiful interfaces can run entirely on your local machine.
          </p>
        </div>
      </Card>
    </div>
  );
}
