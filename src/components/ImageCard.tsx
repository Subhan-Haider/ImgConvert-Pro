import type { ImageFile } from '../types';
import { formatFileSize } from '../utils/imageConverter';
import { X } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface ImageCardProps {
  image: ImageFile;
  progress?: number;
  onRemove: (id: string) => void;
}

export function ImageCard({ image, progress, onRemove }: ImageCardProps) {
  return (
    <div className="group glass rounded-xl overflow-hidden transition-all duration-300 hover:border-primary-500/30 hover:-translate-y-1">
      {/* Preview */}
      <div className="relative h-36 bg-black/5 dark:bg-surface-800 overflow-hidden">
        <img
          src={image.image.src}
          alt={image.name}
          className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 hover:bg-red-600 text-slate-900 dark:text-white
                     flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100"
        >
          <X size={13} />
        </button>
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white uppercase">
          {image.format}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-medium text-slate-900 dark:text-white truncate mb-1" title={image.name}>{image.name}</p>
        <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-500">
          <span>{image.width} × {image.height}</span>
          <span>{formatFileSize(image.originalSize)}</span>
        </div>
        {progress !== undefined && progress > 0 && progress < 100 && (
          <div className="mt-2">
            <ProgressBar value={progress} />
          </div>
        )}
      </div>
    </div>
  );
}
