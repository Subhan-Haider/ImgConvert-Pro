import { useState, useCallback, useRef } from 'react';
import type { ImageFile, ConvertedImage, ConversionSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { loadImageFile, loadPdfPages, convertImage } from '../utils/imageConverter';
import { isValidImageFile, isPdfFile } from '../utils/validators';

interface ProgressMap { [key: string]: number }

export function useImageConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [converted, setConverted] = useState<ConvertedImage[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressMap>({});
  const abortRef = useRef(false);

  // ── Load files ──────────────────────────────────────────────────────────────
  const addFiles = useCallback(async (
    files: File[],
    onNotify?: (msg: string, type?: 'success' | 'error' | 'info') => void,
  ) => {
    let loaded = 0;
    for (const file of files) {
      if (isPdfFile(file)) {
        try {
          onNotify?.(`Parsing PDF: ${file.name}…`, 'info');
          const pages = await loadPdfPages(file);
          setImages(prev => [...prev, ...pages]);
          loaded += pages.length;
        } catch (e: any) {
          onNotify?.(`PDF error: ${e.message}`, 'error');
        }
      } else if (isValidImageFile(file)) {
        try {
          const img = await loadImageFile(file);
          setImages(prev => [...prev, img]);
          loaded++;
        } catch (e: any) {
          onNotify?.(`Could not load ${file.name}`, 'error');
        }
      } else {
        onNotify?.(`Skipped unsupported: ${file.name}`, 'error');
      }
    }
    if (loaded > 0) onNotify?.(`${loaded} file(s) loaded ✓`, 'success');
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setImages([]); setConverted([]); setProgress({});
    converted.forEach(c => URL.revokeObjectURL(c.url));
  }, [converted]);

  // ── Convert all ────────────────────────────────────────────────────────────
  const convertAll = useCallback(async (
    onNotify?: (msg: string, type?: 'success' | 'error' | 'info') => void,
  ) => {
    if (images.length === 0) { onNotify?.('Upload images first', 'error'); return; }
    setIsProcessing(true);
    setConverted([]);
    abortRef.current = false;
    const results: ConvertedImage[] = [];

    for (const img of images) {
      if (abortRef.current) break;
      try {
        const result = await convertImage(img, settings, (p) =>
          setProgress(prev => ({ ...prev, [img.id]: p }))
        );
        results.push(result);
        setConverted(prev => [...prev, result]);
      } catch (e: any) {
        onNotify?.(`Error converting ${img.name}: ${e.message}`, 'error');
      }
    }

    setIsProcessing(false);
    if (results.length > 0) onNotify?.(`${results.length} file(s) converted ✓`, 'success');
  }, [images, settings]);

  const updateSetting = useCallback(<K extends keyof ConversionSettings>(
    key: K, value: ConversionSettings[K],
  ) => setSettings(prev => ({ ...prev, [key]: value })), []);

  return {
    images, converted, settings, isProcessing, progress,
    addFiles, removeImage, clearAll, convertAll, updateSetting, setSettings,
  };
}
