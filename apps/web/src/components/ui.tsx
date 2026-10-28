'use client'

import { X } from 'lucide-react'
import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn, initials } from '@/lib/utils'

type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger'

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg' }
>(function Button({ className, variant = 'primary', size = 'md', ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:translate-y-px focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-300/60 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0',
        size === 'sm' && 'px-3 py-1.5 text-[13px]',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-[15px]',
        variant === 'primary' && 'bg-gold-400 text-ink-950 shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)] hover:bg-gold-300',
        variant === 'dark' && 'bg-ink-950 text-white hover:bg-ink-800',
        variant === 'secondary' && 'border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50',
        variant === 'ghost' && 'text-ink-600 hover:bg-ink-100 hover:text-ink-950',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        className,
      )}
      {...props}
    />
  )
})

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-2xl border border-ink-200/70 bg-white shadow-card', className)}>{children}</div>
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3 pt-5">
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-ink-950">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">{eyebrow}</p>}
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-ink-950 sm:text-[32px]">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

const BADGE_TONES = {
  gray: 'bg-ink-100 text-ink-700',
  green: 'bg-emerald-50 text-emerald-800',
  amber: 'bg-gold-100 text-gold-900',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-ink-950 text-gold-300',
  dark: 'bg-ink-950 text-white',
}

export function Badge({ tone = 'gray', children, className, dot }: { tone?: keyof typeof BADGE_TONES; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', BADGE_TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'brand',
  featured,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon: ReactNode
  tone?: 'brand' | 'green' | 'amber' | 'red'
  featured?: boolean
}) {
  const tones = {
    brand: 'bg-ink-950 text-gold-400',
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-gold-100 text-gold-800',
    red: 'bg-red-100 text-red-700',
  }
  if (featured) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-5 text-white shadow-lift">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gold-400/15" />
        <div className="pointer-events-none absolute -right-2 bottom-0 h-16 w-24 bg-stripes from-gold-400/10" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink-300">{label}</p>
            <p className="mt-2 font-display text-[28px] font-bold leading-none tracking-tight text-gold-400">{value}</p>
            {hint && <p className="mt-2 text-xs text-ink-400">{hint}</p>}
          </div>
          <div className="rounded-xl bg-gold-400 p-2.5 text-ink-950">{icon}</div>
        </div>
      </div>
    )
  }
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink-500">{label}</p>
          <p className="mt-2 font-display text-[28px] font-bold leading-none tracking-tight text-ink-950">{value}</p>
          {hint && <p className="mt-2 text-xs text-ink-500">{hint}</p>}
        </div>
        <div className={cn('rounded-xl p-2.5', tones[tone])}>{icon}</div>
      </div>
    </Card>
  )
}

export function Avatar({ first, last, size = 'md' }: { first: string; last: string; size?: 'sm' | 'md' | 'lg' }) {
  const palette = ['bg-gold-400 text-ink-950', 'bg-ink-950 text-gold-400', 'bg-gold-100 text-gold-900', 'bg-ink-200 text-ink-800', 'bg-ink-800 text-white']
  const idx = (first.charCodeAt(0) + last.charCodeAt(0)) % palette.length
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        size === 'sm' && 'h-8 w-8 text-[11px]',
        size === 'md' && 'h-10 w-10 text-[13px]',
        size === 'lg' && 'h-20 w-20 font-display text-2xl ring-4 ring-white',
        palette[idx],
      )}
    >
      {initials(first, last)}
    </span>
  )
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div data-dialog-chrome className="h-1.5 w-full bg-gold-400" />
        <div data-dialog-chrome className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-ink-950">{title}</h3>
            {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-900" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">{children}</div>
        {footer && <div data-dialog-chrome className="flex justify-end gap-2 border-t border-ink-100 bg-ink-50/60 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && <div className="mb-4 rounded-2xl bg-gold-100 p-3.5 text-gold-800">{icon}</div>}
      <p className="font-display text-lg font-bold text-ink-950">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
    </div>
  )
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="label">{label}</span>
      {children}
    </label>
  )
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="inline-flex rounded-xl bg-ink-100 p-1 text-sm font-semibold">
      {options.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn('rounded-lg px-4 py-1.5 transition', value === key ? 'bg-ink-950 text-gold-400 shadow-sm' : 'text-ink-600 hover:text-ink-950')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => done.current(), 2600)
    return () => clearTimeout(t)
  }, [message])
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink-950 py-2.5 pl-3 pr-5 text-sm font-semibold text-white shadow-lift">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-[11px] text-ink-950">✓</span>
      {message}
    </div>
  )
}
