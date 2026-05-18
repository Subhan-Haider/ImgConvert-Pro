import { NavLink, Link } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';
import { clsx } from 'clsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/converter', label: 'Converter' },
  { to: '/pdf-tools', label: 'PDF Tools' },
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
];

export function Navbar() {
  const { isDark, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <img src="/favicon.svg" alt="ImgConvert Pro Logo" className="w-8 h-8 drop-shadow-sm" />
            <span className="gradient-text">ImgConvert</span>
            <span className="text-xs bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-300 px-1.5 py-0.5 rounded-md font-semibold">PRO</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5',
                )}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} toggle={toggle} />
            <Link
              to="/converter"
              className="hidden sm:inline-flex items-center gap-2 btn-base bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 text-sm rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all"
            >
              <Zap size={14} /> Convert Now
            </Link>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300"
              onClick={() => setOpen(o => !o)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-black/5 dark:border-white/5 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {NAV_LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => clsx(
                'block px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5',
              )}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
