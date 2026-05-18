// ─── Image Types ───────────────────────────────────────────────────────────────
export interface ImageFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  width: number;
  height: number;
  image: HTMLImageElement;
  format: string;
  hasTransparency: boolean;
}

export interface ConvertedImage {
  original: ImageFile;
  blob: Blob;
  name: string;
  size: number;
  format: string;
  width: number;
  height: number;
  url: string;
}

// ─── Conversion Settings ────────────────────────────────────────────────────────
export type OutputFormat = 'png' | 'jpg' | 'webp' | 'avif' | 'svg' | 'bmp' | 'tiff' | 'ico' | 'pdf';
export type ResizeMode   = 'none' | 'fit' | 'fill' | 'stretch' | 'custom' | 'circular';
export type WatermarkPos = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ConversionSettings {
  outputFormat: OutputFormat;
  quality: number;           // 1–100
  resizeMode: ResizeMode;
  resizeWidth?: number;
  resizeHeight?: number;
  keepAspectRatio: boolean;
  // Filters
  brightness: number;        // 0–200 (100 = normal)
  contrast: number;
  saturation: number;
  warmth: number;            // 0–100
  grayscale: boolean;
  sepia: boolean;
  sharpening: number;        // 0–100
  // Watermark
  addWatermark: boolean;
  watermarkText: string;
  watermarkPosition: WatermarkPos;
  watermarkColor: string;
  watermarkOpacity: number;  // 10–100
  // Background
  backgroundColor: string;
  removeMetadata: boolean;
}

export const DEFAULT_SETTINGS: ConversionSettings = {
  outputFormat: 'webp',
  quality: 85,
  resizeMode: 'none',
  keepAspectRatio: true,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  grayscale: false,
  sepia: false,
  sharpening: 0,
  addWatermark: false,
  watermarkText: '© Copyright 2025',
  watermarkPosition: 'bottom-right',
  watermarkColor: '#ffffff',
  watermarkOpacity: 50,
  backgroundColor: 'transparent',
  removeMetadata: true,
};

// ─── Toast ─────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info';
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// ─── Contact Form ───────────────────────────────────────────────────────────────
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}
