import type { FormErrors, ContactFormData } from '../types';

export function validateContact(data: ContactFormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim() || data.name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters.';
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Please enter a valid email address.';
  if (!data.message.trim() || data.message.trim().length < 10)
    errors.message = 'Message must be at least 10 characters.';
  return errors;
}

export function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/') || file.name.endsWith('.svg') || file.name.endsWith('.heic');
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
