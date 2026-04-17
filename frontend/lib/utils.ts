import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Whether the code is running in a browser environment (not SSR). */
export const IS_BROWSER = typeof window !== 'undefined';
