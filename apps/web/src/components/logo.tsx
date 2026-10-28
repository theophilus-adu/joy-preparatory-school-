import { cn } from '@/lib/utils'

/** School crest in the school colours. Replace with the official logo when available. */
export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  const outer = inverted ? '#0c0b0a' : '#ffcf1f'
  const inner = inverted ? '#ffcf1f' : '#0c0b0a'
  const mark = inverted ? '#0c0b0a' : '#ffcf1f'
  return (
    <svg viewBox="0 0 40 40" className={cn('shrink-0', className)} aria-hidden="true">
      <path d="M20 1.5 37 7.8v12.4c0 9.9-7.1 16.8-17 18.6C10.1 37 3 30.1 3 20.2V7.8L20 1.5Z" fill={outer} />
      <path d="M20 5 33.6 10v10.2c0 7.9-5.6 13.6-13.6 15.2C12 33.8 6.4 28.1 6.4 20.2V10L20 5Z" fill={inner} />
      {/* open book */}
      <path d="M11.5 16.2c2.9-1.3 5.7-1.3 8.5.2v10.3c-2.8-1.5-5.6-1.5-8.5-.2V16.2Zm17 0c-2.9-1.3-5.7-1.3-8.5.2v10.3c2.8-1.5 5.6-1.5 8.5-.2V16.2Z" fill={mark} />
      {/* star of joy */}
      <path d="m20 8.6 1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3 1-2.1Z" fill={mark} />
    </svg>
  )
}

export function Wordmark({ dark, className }: { dark?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Logo className="h-10 w-10" />
      <div className="leading-tight">
        <p className={cn('font-display text-[15px] font-bold tracking-tight', dark ? 'text-white' : 'text-ink-950')}>Joy Preparatory</p>
        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-gold-400' : 'text-gold-700')}>School</p>
      </div>
    </div>
  )
}
