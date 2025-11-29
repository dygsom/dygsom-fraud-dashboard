/**
 * Class Name Utility
 *
 * Merges Tailwind CSS classes properly, handling conflicts.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution
 *
 * @param inputs - Class names to merge
 * @returns Merged class names
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
