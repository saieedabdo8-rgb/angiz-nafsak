import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitize(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function validatePhone(phone: string): boolean {
  return /^01[0-9]{9}$/.test(phone)
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
  return null
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} ج.م`
}
