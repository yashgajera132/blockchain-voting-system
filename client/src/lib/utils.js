import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Safely merges tailwind class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
} 