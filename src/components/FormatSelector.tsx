import type { OutputFormat } from '../types';

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'png',  label: 'PNG – Lossless' },
  { value: 'jpg',  label: 'JPG – Compressed' },
  { value: 'webp', label: 'WEBP – Recommended' },
  { value: 'avif', label: 'AVIF – Next-Gen' },
  { value: 'pdf',  label: 'PDF – Document' },
  { value: 'svg',  label: 'SVG – Vector' },
  { value: 'ico',  label: 'ICO – Icon' },
  { value: 'bmp',  label: 'BMP – Bitmap' },
  { value: 'tiff', label: 'TIFF – Print' },
];

interface FormatSelectorProps {
  value: OutputFormat;
  onChange: (f: OutputFormat) => void;
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {FORMATS.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 uppercase tracking-wide
            ${value === f.value
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-black/10 dark:border-white/10'
            }`}
        >
          {f.value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
