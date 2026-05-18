import { useCallback, useState, useEffect } from 'react';
import { RotateCcw, Download, Trash2, RefreshCw, ZapOff } from 'lucide-react';
import JSZip from 'jszip';
import { useImageConverter } from '../hooks/useImageConverter';
import { useToast } from '../hooks/useToast';
import { UploadBox } from '../components/UploadBox';
import { ImageCard } from '../components/ImageCard';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormatSelector } from '../components/FormatSelector';
import { ProgressBar } from '../components/ProgressBar';
import { ToastContainer } from '../components/Toast';
import { formatFileSize } from '../utils/imageConverter';
import type { ConversionSettings } from '../types';

// ── Slider helper ────────────────────────────────────────────────────────────
function Slider({ label, id, min, max, value, onChange, unit = '%' }: {
  label: string; id: string; min: number; max: number; value: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
        <label htmlFor={id}>{label}</label>
        <span className="text-slate-900 dark:text-white font-medium">{value}{unit}</span>
      </div>
      <input id={id} type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-primary-500" />
    </div>
  );
}

// ── Toggle helper ────────────────────────────────────────────────────────────
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 cursor-pointer group focus:outline-none"
    >
      <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-primary-500' : 'bg-slate-200 dark:bg-white/10'}`}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      {label && <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors">{label}</span>}
    </button>
  );
}

export default function Converter() {
  const { images, converted, settings, isProcessing, progress,
          addFiles, removeImage, clearAll, convertAll, updateSetting } = useImageConverter();
  const { toasts, addToast, removeToast } = useToast();

  const [enableFilters, setEnableFilters] = useState(false);

  const handleToggleFilters = (enabled: boolean) => {
    setEnableFilters(enabled);
    if (!enabled) {
      upd('brightness', 100);
      upd('contrast', 100);
      upd('saturation', 100);
      upd('warmth', 0);
      upd('sharpening', 0);
      upd('grayscale', false);
      upd('sepia', false);
    }
  };

  const notify = useCallback((msg: string, type?: 'success'|'error'|'info') => addToast(msg, type), [addToast]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        addFiles(pastedFiles, notify);
        addToast(`Pasted ${pastedFiles.length} file(s) ✓`, 'success');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addFiles, notify, addToast]);

  const handleConvert = () => convertAll(notify);

  const handleDownloadAll = async () => {
    if (converted.length === 0) return;
    const zip = new JSZip();
    for (const c of converted) {
      const blob = await fetch(c.url).then(r => r.blob());
      zip.file(c.name, blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a'); a.href = url;
    a.download = `converted_${Date.now()}.zip`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
    addToast('ZIP downloaded ✓', 'success');
  };

  const handleDownloadIndividual = () => {
    if (converted.length === 0) return;
    converted.forEach((c, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = c.url;
        a.download = c.name;
        a.click();
      }, idx * 250);
    });
    addToast('Downloads started ✓', 'success');
  };

  const upd = <K extends keyof ConversionSettings>(k: K, v: ConversionSettings[K]) => updateSetting(k, v);

  const totalProgress = images.length > 0
    ? Object.values(progress).reduce((a, b) => a + b, 0) / images.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Image Converter</h1>
        <p className="text-slate-600 dark:text-slate-400">Upload images, configure settings, and download converted files.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left: Upload + Gallery ────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Upload */}
          <UploadBox onFiles={f => addFiles(f, notify)} disabled={isProcessing} />

          {/* Image gallery */}
          {images.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Source Gallery <span className="ml-2 px-2 py-0.5 rounded-full bg-primary-500 text-white text-xs">{images.length}</span>
                </h2>
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-400 hover:text-red-300">
                  <Trash2 size={14} /> Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map(img => (
                  <ImageCard key={img.id} image={img} progress={progress[img.id]} onRemove={removeImage} />
                ))}
              </div>
            </Card>
          )}

          {/* Progress */}
          {isProcessing && (
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw size={18} className="text-primary-400 animate-spin" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Processing…</h3>
              </div>
              <ProgressBar value={totalProgress} label="Overall Progress" />
            </Card>
          )}

          {/* Results */}
          {converted.length > 0 && !isProcessing && (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Converted Output <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs">{converted.length}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={handleDownloadIndividual}>
                    <Download size={14} /> Download Individually
                  </Button>
                  <Button size="sm" onClick={handleDownloadAll}>
                    <Download size={14} /> Download All (ZIP)
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {converted.map((c, i) => {
                  const saved = ((c.original.originalSize - c.size) / c.original.originalSize * 100).toFixed(1);
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <img src={c.url} alt={c.name} className="w-12 h-12 rounded-lg object-cover bg-black/5 dark:bg-surface-800 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>{formatFileSize(c.size)}</span>
                          <span>{c.width}×{c.height}</span>
                          {Number(saved) > 0 && (
                            <span className="text-emerald-400 font-semibold">↓{saved}%</span>
                          )}
                        </div>
                      </div>
                      <a href={c.url} download={c.name}>
                        <Button variant="ghost" size="sm"><Download size={14} /></Button>
                      </a>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* ── Right: Settings Panel ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Format */}
          <Card>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Export Format</h3>
            <FormatSelector value={settings.outputFormat} onChange={f => upd('outputFormat', f)} />
          </Card>

          {/* Quality */}
          <Card>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Quality</h3>
            <Slider label="Compression Quality" id="quality" min={1} max={100} value={settings.quality}
              onChange={v => upd('quality', v)} />
          </Card>

          {/* Resize */}
          <Card>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Resize</h3>
            <div className="mb-3">
              <select
                value={settings.resizeMode}
                onChange={e => upd('resizeMode', e.target.value as any)}
                className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="none">Original Size</option>
                <option value="custom">Custom Size (Free Resize)</option>
                <option value="fit">Fit (Maintain Aspect)</option>
                <option value="fill">Fill (Crop)</option>
                <option value="stretch">Stretch / Distort</option>
                <option value="circular">Circular Crop</option>
              </select>
            </div>
            {settings.resizeMode !== 'none' && settings.resizeMode !== 'circular' && (
              <div className="grid grid-cols-2 gap-2">
                {[['Width', 'resizeWidth'], ['Height', 'resizeHeight']].map(([lbl, key]) => (
                  <div key={key}>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">{lbl} (px)</label>
                    <input type="number" placeholder="Auto"
                      value={(settings as any)[key] ?? ''}
                      onChange={e => upd(key as any, e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Filters */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide">Image Filters</h3>
              <Toggle label="" checked={enableFilters} onChange={handleToggleFilters} />
            </div>
            {enableFilters && (
              <div className="space-y-3 pt-2 animate-fade-in">
                <Slider label="Brightness" id="brightness" min={0} max={200} value={settings.brightness} onChange={v => upd('brightness', v)} />
                <Slider label="Contrast"   id="contrast"   min={0} max={200} value={settings.contrast}   onChange={v => upd('contrast', v)} />
                <Slider label="Saturation" id="saturation" min={0} max={200} value={settings.saturation} onChange={v => upd('saturation', v)} />
                <Slider label="Warmth"     id="warmth"     min={0} max={100} value={settings.warmth}     onChange={v => upd('warmth', v)} />
                <Slider label="Sharpening" id="sharpening" min={0} max={100} value={settings.sharpening} onChange={v => upd('sharpening', v)} />
                <div className="grid grid-cols-2 gap-3 mt-4 border-t border-black/5 dark:border-white/5 pt-4">
                  <Toggle label="Grayscale" checked={settings.grayscale} onChange={v => upd('grayscale', v)} />
                  <Toggle label="Sepia"     checked={settings.sepia}     onChange={v => upd('sepia', v)} />
                </div>
              </div>
            )}
          </Card>

          {/* Watermark */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide">Watermark</h3>
              <Toggle label="" checked={settings.addWatermark} onChange={v => upd('addWatermark', v)} />
            </div>
            {settings.addWatermark && (
              <div className="space-y-3">
                <input type="text" value={settings.watermarkText} placeholder="© My Watermark"
                  onChange={e => upd('watermarkText', e.target.value)}
                  className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white" />
                <select value={settings.watermarkPosition} onChange={e => upd('watermarkPosition', e.target.value as any)}
                  className="w-full bg-black/5 dark:bg-surface-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white">
                  {['center','top-left','top-right','bottom-left','bottom-right'].map(p => (
                    <option key={p} value={p}>{p.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}</option>
                  ))}
                </select>
                <Slider label="Opacity" id="wm-opacity" min={10} max={100} value={settings.watermarkOpacity} onChange={v => upd('watermarkOpacity', v)} />
              </div>
            )}
          </Card>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleConvert}
              disabled={images.length === 0 || isProcessing}
              className="w-full py-4 text-base"
            >
              {isProcessing ? (
                <><RefreshCw size={18} className="animate-spin" /> Processing…</>
              ) : (
                <><RotateCcw size={18} /> Convert {images.length > 0 ? `${images.length} File(s)` : ''}</>
              )}
            </Button>

            {converted.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleDownloadIndividual} variant="secondary" className="w-full py-3 text-xs sm:text-sm">
                  <Download size={14} /> Download Files
                </Button>
                <Button onClick={handleDownloadAll} variant="secondary" className="w-full py-3 text-xs sm:text-sm">
                  <Download size={14} /> Download ZIP
                </Button>
              </div>
            )}

            {images.length > 0 && (
              <Button onClick={clearAll} variant="ghost" size="sm" className="w-full text-red-400 hover:text-red-300">
                <ZapOff size={14} /> Clear Workspace
              </Button>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
