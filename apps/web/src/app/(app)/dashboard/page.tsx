'use client'

import { ArrowRight, ArrowUpRight, CalendarCheck, GraduationCap, UserPlus, Users, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Card, CardHeader, StatCard } from '@/components/ui'
import { ROLE_LABELS, useStore } from '@/lib/store'
import { cn, formatDate, formatGHS, invoicePaid, invoiceStatus, todayISO } from '@/lib/utils'

const INK = '#0c0b0a'
const GOLD = '#ffcf1f'
const AXIS = { fontSize: 12, fill: '#717067', fontWeight: 500 }

const STATUS_META = {
  paid: { label: 'Paid', color: 'bg-ink-950' },
  partial: { label: 'Part-paid', color: 'bg-gold-400' },
  unpaid: { label: 'Unpaid', color: 'bg-ink-300' },
  overdue: { label: 'Overdue', color: 'bg-red-500' },
} as const

function ChartTooltip({ active, payload, label, unit = '' }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-ink-950 px-3 py-2 text-xs text-white shadow-lift">
      <p className="mb-1 font-semibold text-gold-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color === INK ? '#fff' : p.color }} />
          {p.name}: <span className="font-semibold">{p.value}{unit}</span>
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data, user } = useStore()

  const stats = useMemo(() => {
    const active = data.students.filter((s) => s.status === 'active')
    const teachers = data.staff.filter((s) => s.position === 'Class Teacher').length

    const days = Object.keys(data.attendance).sort()
    const trend = days.slice(-10).map((day) => {
      const marks = Object.values(data.attendance[day])
      const present = marks.filter((m) => m !== 'absent').length
      return {
        day: new Date(day + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        Attendance: marks.length ? Math.round((present / marks.length) * 1000) / 10 : 0,
      }
    })
    const latestDay = days[days.length - 1]
    const latestRate = trend[trend.length - 1]?.Attendance ?? 0

    const billed = data.invoices.reduce((s, i) => s + i.amount, 0)
    const collected = data.invoices.reduce((s, i) => s + Math.min(i.amount, invoicePaid(i, data.payments)), 0)
    const statusCounts = { paid: 0, partial: 0, unpaid: 0, overdue: 0 }
    for (const inv of data.invoices) statusCounts[invoiceStatus(inv, data.payments)]++

    const enrolment = data.classes.map((c) => ({
      name: c.name.replace('Nursery ', 'N').replace('Basic ', 'B').replace('KG ', 'KG').replace('JHS ', 'J'),
      Boys: active.filter((s) => s.classId === c.id && s.gender === 'Male').length,
      Girls: active.filter((s) => s.classId === c.id && s.gender === 'Female').length,
    }))

    const recentPayments = [...data.payments]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6)
      .map((p) => {
        const inv = data.invoices.find((i) => i.id === p.invoiceId)!
        return { ...p, student: data.students.find((s) => s.id === inv.studentId)! }
      })

    const owing = data.invoices.filter((inv) => inv.amount - invoicePaid(inv, data.payments) > 0).length
    const notMarkedToday = !data.attendance[todayISO()]

    return { active, teachers, trend, latestDay, latestRate, billed, collected, statusCounts, enrolment, recentPayments, owing, notMarkedToday }
  }, [data])

  const greeting = (() => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  })()

  const quickActions = [
    { href: '/students?new=1', label: 'Admit a student', icon: UserPlus, roles: ['proprietor', 'headteacher'] },
    { href: '/attendance', label: 'Mark attendance', icon: CalendarCheck, roles: ['proprietor', 'headteacher', 'teacher'] },
    { href: '/results', label: 'Enter scores', icon: GraduationCap, roles: ['proprietor', 'headteacher', 'teacher'] },
    { href: '/fees', label: 'Record a payment', icon: Wallet, roles: ['proprietor', 'headteacher', 'accountant'] },
  ].filter((a) => user && a.roles.includes(user.role))

  const collectedPct = Math.round((stats.collected / Math.max(stats.billed, 1)) * 100)
  const total = data.invoices.length || 1

  return (
    <>
      {/* Welcome banner */}
      <section className="relative mb-7 overflow-hidden rounded-3xl bg-ink-950 px-6 py-7 text-white sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-dots [background-size:20px_20px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gold-400/25 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400">
              {ROLE_LABELS[user!.role]} · {data.school.academicYear} · {data.school.currentTerm}
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {greeting}, <span className="text-gold-400">{user?.name.split(' ').slice(-1)[0]}</span>
            </h1>
            <p className="mt-2 max-w-lg text-sm text-ink-300">
              {stats.notMarkedToday ? 'Today’s registers haven’t been taken yet. ' : 'Today’s registers are in. '}
              {stats.owing} students still have fees outstanding this term.
            </p>
          </div>
          {quickActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickActions.map(({ href, label, icon: Icon }, i) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                    i === 0 ? 'bg-gold-400 text-ink-950 hover:bg-gold-300' : 'bg-white/[0.07] text-white ring-1 ring-inset ring-white/10 hover:bg-white/[0.12]',
                  )}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard featured label="Active students" value={stats.active.length.toLocaleString()} hint={`Across ${data.classes.length} classes, Creche to JHS 3`} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Attendance" value={`${stats.latestRate}%`} hint={stats.latestDay ? `Last register ${formatDate(stats.latestDay)}` : 'No registers yet'} icon={<CalendarCheck className="h-5 w-5" />} tone="amber" />
        <StatCard label="Class teachers" value={stats.teachers} hint={`${data.staff.length} staff in total`} icon={<GraduationCap className="h-5 w-5" />} />
        <StatCard label="Fees collected" value={`${collectedPct}%`} hint={`${formatGHS(stats.collected).replace('.00', '')} of ${formatGHS(stats.billed).replace('.00', '')}`} icon={<Wallet className="h-5 w-5" />} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Attendance trend"
            description="Present or late, last 10 school days"
            action={
              <Link href="/attendance" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-600 hover:text-ink-950">
                Registers <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="h-64 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend} margin={{ left: 0, right: 16, top: 12 }}>
                <defs>
                  <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#efefea" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={AXIS} dy={6} />
                <YAxis domain={[80, 100]} tickLine={false} axisLine={false} tick={AXIS} unit="%" width={46} />
                <Tooltip content={<ChartTooltip unit="%" />} cursor={{ stroke: INK, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="Attendance" stroke={INK} strokeWidth={2.5} fill="url(#att)" dot={{ r: 3, fill: INK }} activeDot={{ r: 6, fill: GOLD, stroke: INK, strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Fee status" description={`${data.invoices.length} invoices · ${data.school.currentTerm}`} />
          <div className="px-5 pb-5">
            <p className="font-display text-4xl font-extrabold tracking-tight text-ink-950">
              {collectedPct}
              <span className="text-xl text-ink-400">%</span>
            </p>
            <p className="text-[13px] text-ink-500">of billed fees collected</p>

            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-ink-100">
              {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((k) => (
                <div key={k} className={STATUS_META[k].color} style={{ width: `${(stats.statusCounts[k] / total) * 100}%` }} title={`${STATUS_META[k].label}: ${stats.statusCounts[k]}`} />
              ))}
            </div>

            <ul className="mt-5 space-y-2.5">
              {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((k) => (
                <li key={k} className="flex items-center gap-2.5 text-sm">
                  <span className={cn('h-2.5 w-2.5 rounded-sm', STATUS_META[k].color)} />
                  <span className="text-ink-600">{STATUS_META[k].label}</span>
                  <span className="ml-auto font-bold tabular-nums text-ink-950">{stats.statusCounts[k]}</span>
                </li>
              ))}
            </ul>
            <Link href="/fees?status=owing" className="group mt-5 flex items-center justify-between rounded-xl bg-gold-100 px-4 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-200">
              {stats.owing} students owing
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Enrolment by class"
            action={
              <div className="flex items-center gap-4 text-xs font-semibold text-ink-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-ink-950" /> Boys
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gold-400" /> Girls
                </span>
              </div>
            }
          />
          <div className="h-72 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.enrolment} margin={{ left: 0, right: 16, top: 12 }} barCategoryGap="22%">
                <CartesianGrid vertical={false} stroke="#efefea" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ ...AXIS, fontSize: 11 }} interval={0} dy={6} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS} width={32} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f7f7f4' }} />
                <Bar dataKey="Boys" stackId="a" fill={INK} />
                <Bar dataKey="Girls" stackId="a" fill={GOLD} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Recent payments"
            action={
              <Link href="/fees" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-600 hover:text-ink-950">
                All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <ul className="px-2 pb-3">
            {stats.recentPayments.map((p) => (
              <li key={p.id}>
                <Link href={`/students/${p.student.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-ink-50">
                  <Avatar first={p.student.firstName} last={p.student.lastName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-950">
                      {p.student.firstName} {p.student.lastName}
                    </p>
                    <p className="text-xs text-ink-500">
                      {formatDate(p.date)} · {p.method}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-ink-950">{formatGHS(p.amount).replace('.00', '')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
