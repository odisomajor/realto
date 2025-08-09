import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function formatArea(area: number, propertyType?: string): string {
  // For land properties, use acres if area is large enough
  if (propertyType === 'land' || area >= 4047) {
    const acres = area / 4047; // 1 acre = 4047 square metres
    if (acres >= 1) {
      return `${acres.toFixed(acres >= 10 ? 0 : 1)} ${acres === 1 ? 'acre' : 'acres'}`;
    }
  }
  
  // For all other properties or smaller areas, use square metres
  return `${area.toLocaleString()} m²`;
}