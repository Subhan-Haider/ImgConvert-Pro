import { useCallback, useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadBoxProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadBox({ onFiles, disabled }: UploadBoxProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    onFiles(Array.from(files));
  }, [onFiles]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={clsx(
        'relative flex flex-col items-center justify-center gap-4 p-12',
        'rounded-2xl border-2 border-dashed cursor-pointer',
        'transition-all duration-300',
        dragging
          ? 'border-primary-500 bg-primary-500/10 scale-[1.02]'
          : 'border-black/10 dark:border-white/20 hover:border-primary-500/60 hover:bg-primary-500/5',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {/* Subtle glow */}
      {dragging && (
        <div className="absolute inset-0 rounded-2xl bg-primary-500/10 blur-xl pointer-events-none" />
      )}

      <div className={clsx(
        'flex items-center justify-center w-16 h-16 rounded-2xl transition-colors duration-300',
        dragging ? 'bg-primary-500/30 text-primary-300' : 'bg-black/5 dark:bg-white/10 text-primary-400',
      )}>
        <UploadCloud size={32} />
      </div>

      <div className="text-center">
        <p className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
          {dragging ? 'Release to upload' : 'Drop files or paste (Ctrl+V)'}
        </p>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          or <span className="text-primary-400 font-medium">browse files</span>
        </p>
      </div>

      <div className="px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-white/10 text-xs text-slate-600 dark:text-slate-400">
        PNG · JPG · WEBP · AVIF · PDF · SVG · BMP · TIFF
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        hidden
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}
