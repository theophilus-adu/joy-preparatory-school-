import { ArrowRight, BookOpen, CalendarCheck, GraduationCap, ShieldCheck, Users, Wallet } from 'lucide-react'
import Link from 'next/link'
import { Logo, Wordmark } from '@/components/logo'

const FEATURES = [
  { icon: Users, title: 'Student records', text: 'Admissions, class lists, guardians and full profiles in one place.' },
  { icon: CalendarCheck, title: 'Daily attendance', text: 'Mark a register in seconds and catch absence patterns early.' },
  { icon: GraduationCap, title: 'Results & report cards', text: 'Enter class and exam scores, auto-grade, rank and print.' },
  { icon: Wallet, title: 'Fees & payments', text: 'Invoices, Mobile Money, cash and bank receipts, with arrears at a glance.' },
  { icon: BookOpen, title: 'Staff & classes', text: 'Teacher records and class assignments for every term.' },
  { icon: ShieldCheck, title: 'Role-based access', text: 'Proprietor, head, teachers and accounts each see only what they need.' },
]

const LEVELS = ['Creche', 'Nursery', 'Kindergarten', 'Primary', 'JHS']

export default function Home() {
  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-dots [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-gold-400/20 blur-3xl" />

        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <Wordmark dark />
          <Link href="/login" className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-gold-400 hover:text-gold-400">
            Staff sign in
          </Link>
        </header>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:pb-32 lg:pt-20">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" /> School management portal
            </p>
            <h1 className="font-display text-[44px] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Every child.
              <br />
              Every day.
              <br />
              <span className="relative inline-block text-ink-950">
                <span className="absolute inset-x-[-0.15em] inset-y-[0.08em] -skew-x-6 rounded-md bg-gold-400" />
                <span className="relative">One portal.</span>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-300">
              Students, attendance, results and fees for Joy Preparatory School, from Creche to JHS 3, in one simple place.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3.5 text-[15px] font-bold text-ink-950 shadow-[0_10px_30px_-10px_rgba(255,207,31,0.7)] transition hover:bg-gold-300"
              >
                Sign in to the portal <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a href="#features" className="inline-flex items-center rounded-xl px-6 py-3.5 text-[15px] font-semibold text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/5">
                What’s inside
              </a>
            </div>
          </div>

          {/* Crest feature */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-sm lg:block">
            <div className="absolute inset-0 rotate-6 rounded-[48px] bg-gold-400" />
            <div className="absolute inset-0 overflow-hidden rounded-[48px] border border-white/10 bg-ink-900">
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-stripes from-gold-400/15" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
              <Logo className="h-40 w-40 drop-shadow-[0_20px_40px_rgba(255,207,31,0.25)]" />
              <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold-400">Knowledge · Discipline · Joy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Levels strip */}
      <section className="border-y-4 border-ink-950 bg-gold-400">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-5 sm:px-6">
          {LEVELS.map((l, i) => (
            <span key={l} className="flex items-center gap-8 font-display text-lg font-extrabold uppercase tracking-wide text-ink-950">
              {l}
              {i < LEVELS.length - 1 && <span className="hidden h-2 w-2 rotate-45 bg-ink-950 sm:block" />}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Built for the school office</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink-950">Everything in one place, and it works on a phone too.</h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className={
                i === 0
                  ? 'group rounded-3xl bg-ink-950 p-7 text-white'
                  : 'group rounded-3xl border border-ink-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-ink-950 hover:shadow-lift'
              }
            >
              <div className={i === 0 ? 'mb-6 inline-flex rounded-2xl bg-gold-400 p-3 text-ink-950' : 'mb-6 inline-flex rounded-2xl bg-ink-950 p-3 text-gold-400'}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className={i === 0 ? 'font-display text-xl font-bold text-gold-400' : 'font-display text-xl font-bold text-ink-950'}>{title}</h3>
              <p className={i === 0 ? 'mt-2 text-[15px] leading-relaxed text-ink-300' : 'mt-2 text-[15px] leading-relaxed text-ink-500'}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] bg-gold-400 px-8 py-14 sm:px-14">
          <div className="pointer-events-none absolute -right-10 top-0 h-full w-1/2 bg-stripes from-ink-950/[0.07]" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">Ready for today’s register?</h2>
              <p className="mt-2 text-ink-800">Sign in with your school account to get started.</p>
            </div>
            <Link href="/login" className="group inline-flex items-center gap-2 rounded-xl bg-ink-950 px-6 py-3.5 text-[15px] font-bold text-gold-400 transition hover:bg-ink-800">
              Sign in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-ink-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <Wordmark dark />
          <p className="text-sm text-ink-400">© {new Date().getFullYear()} Joy Preparatory School · Adenta, Accra</p>
        </div>
      </footer>
    </div>
  )
}
