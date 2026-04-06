import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'XOF') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(role: 'admin' | 'supplier' | 'dropshipper') {
  const prefix = role === 'admin' ? 'ADM' : role === 'supplier' ? 'SUP' : 'DSP';
  const random = Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0');
  return `${prefix}-${random}`;
}
