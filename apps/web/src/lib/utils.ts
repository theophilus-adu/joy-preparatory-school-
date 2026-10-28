import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Invoice, Payment, Score } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(iso: string) {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO() {
  return toISODate(new Date())
}

/** Most recent weekdays, newest first, including today if it is a weekday. */
export function recentSchoolDays(count: number, from = new Date()) {
  const days: string[] = []
  const d = new Date(from)
  while (days.length < count) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) days.push(toISODate(d))
    d.setDate(d.getDate() - 1)
  }
  return days
}

export function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 10)
}

export function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

export function ageFrom(dob: string) {
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export const GRADE_SCALE = [
  { min: 80, grade: 'A', remark: 'Excellent' },
  { min: 70, grade: 'B', remark: 'Very Good' },
  { min: 60, grade: 'C', remark: 'Good' },
  { min: 50, grade: 'D', remark: 'Credit' },
  { min: 40, grade: 'E', remark: 'Pass' },
  { min: 0, grade: 'F', remark: 'Fail' },
] as const

export function gradeFor(total: number) {
  return GRADE_SCALE.find((g) => total >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1]
}

export function scoreTotal(s: Pick<Score, 'classScore' | 'examScore'>) {
  return s.classScore + s.examScore
}

export function invoicePaid(invoice: Invoice, payments: Payment[]) {
  return payments.filter((p) => p.invoiceId === invoice.id).reduce((sum, p) => sum + p.amount, 0)
}

export function invoiceStatus(invoice: Invoice, payments: Payment[]) {
  const paid = invoicePaid(invoice, payments)
  if (paid >= invoice.amount) return 'paid' as const
  if (paid > 0) return 'partial' as const
  if (invoice.dueDate < todayISO()) return 'overdue' as const
  return 'unpaid' as const
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
