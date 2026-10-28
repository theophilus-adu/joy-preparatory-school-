'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo, Wordmark } from '@/components/logo'
import { Button } from '@/components/ui'
import { DEMO_ACCOUNTS, ROLE_LABELS, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const { ready, user, login } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const goNext = () => {
    const next = new URLSearchParams(window.location.search).get('next')
    router.replace(next && next.startsWith('/') ? next : '/dashboard')
  }

  useEffect(() => {
    if (ready && user) goNext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    // Small delay so the button state is visible; replace with the API call later.
    setTimeout(() => {
      if (!login(email, password)) {
        setError('That email and password don’t match a school account.')
        setSubmitting(false)
      }
    }, 300)
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div className="pointer-events-none absolute inset-0 bg-dots [background-size:22px_22px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[480px] w-[480px] rounded-full bg-gold-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-full bg-stripes from-gold-400/10" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/">
            <Wordmark dark />
          </Link>
          <div className="max-w-md">
            <Logo className="mb-10 h-24 w-24" />
            <p className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white">
              Knowledge, <br />
              Discipline <br />
              <span className="text-gold-400">and Joy.</span>
            </p>
            <p className="mt-6 text-ink-300">Welcome back. Sign in to take registers, enter results and manage the school office.</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Adenta · Accra</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Wordmark />
          </div>
          <Link href="/" className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-950">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <span className="mb-5 block h-1.5 w-12 rounded-full bg-gold-400" />
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink-950">Sign in</h1>
          <p className="mt-2 text-ink-500">Use your Joy Prep school account.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</div>}
            <label className="block">
              <span className="label">Email</span>
              <input type="email" className="input py-3" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@joyprep.edu.gh" autoComplete="email" required />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input type="password" className="input py-3" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
            </label>
            <Button type="submit" size="lg" variant="dark" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : (
                <>
                  Sign in <ArrowRight className="h-4 w-4 text-gold-400" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">Demo accounts</span>
              <span className="h-px flex-1 bg-ink-200" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => {
                const selected = email === a.email
                return (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => {
                      setEmail(a.email)
                      setPassword(a.password)
                      setError('')
                    }}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left transition',
                      selected ? 'border-ink-950 bg-gold-400' : 'border-ink-200 hover:border-ink-950',
                    )}
                  >
                    <p className="text-sm font-bold text-ink-950">{ROLE_LABELS[a.role]}</p>
                    <p className={cn('truncate text-xs', selected ? 'text-ink-800' : 'text-ink-500')}>{a.email}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
