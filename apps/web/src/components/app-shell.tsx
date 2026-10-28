'use client'

import {
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { ROLE_LABELS, useStore } from '@/lib/store'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Logo, Wordmark } from './logo'
import { Avatar } from './ui'

const ALL: Role[] = ['proprietor', 'headteacher', 'teacher', 'accountant']

export const NAV: { href: string; label: string; icon: typeof Users; roles: Role[]; group: string }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ALL, group: 'Overview' },
  { href: '/students', label: 'Students', icon: Users, roles: ALL, group: 'Academics' },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['proprietor', 'headteacher', 'teacher'], group: 'Academics' },
  { href: '/results', label: 'Results', icon: GraduationCap, roles: ['proprietor', 'headteacher', 'teacher'], group: 'Academics' },
  { href: '/fees', label: 'Fees & Payments', icon: Wallet, roles: ['proprietor', 'headteacher', 'accountant'], group: 'Office' },
  { href: '/staff', label: 'Staff', icon: UserCog, roles: ['proprietor', 'headteacher'], group: 'Office' },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['proprietor', 'headteacher'], group: 'Office' },
]

export function canAccess(role: Role, pathname: string) {
  const item = NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))
  return !item || item.roles.includes(role)
}

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, user, logout, data } = useStore()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [ready, user, router, pathname])

  useEffect(() => setMobileOpen(false), [pathname])

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950">
        <Logo className="h-14 w-14 animate-pulse" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400/80">Loading portal</p>
      </div>
    )
  }

  const items = NAV.filter((n) => n.roles.includes(user.role))
  const groups = Array.from(new Set(items.map((i) => i.group)))
  const allowed = canAccess(user.role, pathname)
  const [first, ...rest] = user.name.replace(/^(Mr|Mrs|Ms|Dr)\.?\s+/, '').split(' ')

  const signOut = () => {
    logout()
    router.replace('/login')
  }

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden bg-ink-950 text-ink-300">
      <div className="pointer-events-none absolute -left-10 bottom-24 h-48 w-48 rounded-full bg-gold-400/[0.06] blur-2xl" />
      <div className="px-5 pb-4 pt-6">
        <Link href="/dashboard">
          <Wordmark dark />
        </Link>
      </div>
      <div className="mx-5 mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{data.school.academicYear}</span>
        <span className="rounded-md bg-gold-400 px-1.5 py-0.5 text-[11px] font-bold text-ink-950">{data.school.currentTerm}</span>
      </div>

      <nav className="relative flex-1 overflow-y-auto px-3 py-3">
        {groups.map((g) => (
          <div key={g} className="mb-4">
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500">{g}</p>
            <div className="space-y-0.5">
              {items
                .filter((i) => i.group === g)
                .map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                        active ? 'bg-gold-400 text-ink-950 shadow-[0_6px_20px_-6px_rgba(255,207,31,0.5)]' : 'text-ink-300 hover:bg-white/[0.06] hover:text-white',
                      )}
                    >
                      <Icon className={cn('h-[18px] w-[18px]', active ? 'text-ink-950' : 'text-ink-500 group-hover:text-gold-400')} />
                      {label}
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative m-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <div className="flex items-center gap-3">
          <Avatar first={first} last={rest.join(' ') || first} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-gold-400/90">{ROLE_LABELS[user.role]}</p>
          </div>
          <button onClick={signOut} className="rounded-lg p-2 text-ink-400 transition hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-ink-50">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[264px] lg:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%]">
            {sidebar}
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-6 rounded-lg p-1.5 text-ink-400 hover:text-white" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </aside>
        </div>
      )}

      <div className="lg:pl-[264px] print:pl-0">
        <header className="no-print sticky top-0 z-20 border-b border-ink-200/70 bg-ink-50/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setMobileOpen(true)} className="rounded-xl bg-ink-950 p-2 text-gold-400 lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <Logo className="h-8 w-8 lg:hidden" />
            <form
              className="relative ml-auto w-full max-w-xs sm:ml-0"
              onSubmit={(e) => {
                e.preventDefault()
                router.push(`/students?q=${encodeURIComponent(search.trim())}`)
                setSearch('')
              }}
            >
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a student…"
                className="w-full rounded-full border border-ink-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-ink-400 focus:border-ink-900 focus:outline-none focus:ring-4 focus:ring-gold-300/40"
              />
            </form>
            <div className="ml-auto hidden items-center gap-3 sm:flex">
              <span className="text-sm font-medium text-ink-500">{today}</span>
              <span className="h-5 w-px bg-ink-200" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-950 px-3 py-1 text-xs font-bold text-gold-400">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                {data.school.currentTerm}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9 print:p-0">
          {allowed ? (
            children
          ) : (
            <div className="rounded-3xl border border-ink-200 bg-white p-12 text-center">
              <p className="font-display text-xl font-bold text-ink-950">You don’t have access to this page</p>
              <p className="mt-1 text-sm text-ink-500">Signed in as {ROLE_LABELS[user.role]}.</p>
              <Link href="/dashboard" className="link mt-5 inline-block text-sm">
                Back to dashboard
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
