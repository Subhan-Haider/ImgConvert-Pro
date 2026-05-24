import { Link } from 'react-router-dom';
import { Globe, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-surface-900/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Address */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2 font-display font-bold text-lg">
              <img src="/favicon.svg" alt="ImgConvert Pro Logo" className="w-7 h-7 drop-shadow-sm" />
              <span className="gradient-text">ImgConvert Pro</span>
            </div>
            <address className="not-italic text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
              123 Tech Boulevard<br />
              San Francisco, CA 94105, US<br />
              <a href="tel:+15550198" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">+1-555-0198</a>
            </address>
            <a href="https://apps.microsoft.com/detail/9N258RP6WM0Z?hl=en-us&gl=CA&ocid=pdpshare" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform duration-300 inline-block mt-1">
              <img src="https://get.microsoft.com/images/en-us%20dark.svg" alt="Download from Microsoft Store" className="h-10 drop-shadow-sm" />
            </a>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-500">
            {[['/', 'Home'], ['/converter', 'Converter'], ['/pdf-tools', 'PDF Tools'], ['/features', 'Features'], ['/blog', 'Blog'], ['/about', 'About'], ['/contact', 'Contact'], ['/privacy', 'Privacy'], ['/terms', 'Terms']].map(([to, label]) => (
              <Link key={to} to={to} className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">{label}</Link>
            ))}
          </div>

          {/* Credits */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-500">
            <span>Built with</span>
            <Heart size={13} className="text-red-400 fill-red-400" />
            <span>by</span>
            <a
              href="https://github.com/Subhan-Haider"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <Globe size={13} /> Subhan Haider
            </a>
          </div>
        </div>

        {/* Network Links */}
        <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-500">
          <span className="font-semibold text-slate-800 dark:text-slate-300">Our Network:</span>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
            {[
              ['https://www.lootops.me', 'Lootops'],
              ['https://www.lootops.website', 'Lootops Web'],
              ['https://subhan.tech', 'Subhan.tech'],
              ['https://codelens.site', 'CodeLens'],
              ['https://codiner.online', 'Codiner'],
              ['https://blizflow.online', 'BlizFlow']
            ].map(([url, name]) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {name}
              </a>
            ))}
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="mt-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>&copy; {new Date().getFullYear()} ImgConvert Pro. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://github.com/Subhan-Haider" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.15-3.8s-1.18-.38-3.9 1.47a13.38 13.38 0 0 0-7 0C6.27 2.22 5.1 2.6 5.1 2.6a5.5 5.5 0 0 0-.15 3.8A5.5 5.5 0 0 0 3.5 10.24c0 5.22 3 6.42 6 6.76a4.8 4.8 0 0 0-1 3.24v4"/><path d="M8 19c-3 1-4-1-5-1"/></svg> <span className="sr-only">GitHub</span>
            </a>
            <a href="https://instagram.com/subhan_haid" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> <span className="sr-only">Instagram</span>
            </a>
            <a href="https://tiktok.com/@s.subhan.haider" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg> <span className="sr-only">TikTok</span>
            </a>
            <a href="https://www.facebook.com/ImgConvertPro" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> <span className="sr-only">Facebook</span>
            </a>
            <a href="https://www.linkedin.com/company/imgconvertpro" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-700 dark:hover:text-blue-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg> <span className="sr-only">LinkedIn</span>
            </a>
            <a href="https://www.youtube.com/@ImgConvertPro" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-red-600 dark:hover:text-red-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 7.1c.3-1.3 1.2-2.3 2.5-2.6C7.5 4 12 4 12 4s4.5 0 7 .5c1.3.3 2.2 1.3 2.5 2.6.5 1.7.5 4.9.5 4.9s0 3.2-.5 4.9c-.3 1.3-1.2 2.3-2.5-2.6-2.5.5-7 .5-7 .5s-4.5 0-7-.5c-1.3-.3-2.2-1.3-2.5-2.6C2 15.1 2 11.9 2 11.9s0-3.2.5-4.9z"/><path d="m10 15 5-3-5-3v6z"/></svg> <span className="sr-only">YouTube</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

