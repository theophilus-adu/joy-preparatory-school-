'use client'

import { CheckCheck, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, PageHeader, Toast } from '@/components/ui'
import { useStore } from '@/lib/store'
import type { AttendanceStatus } from '@/lib/types'
import { cn, formatDate, recentSchoolDays, todayISO } from '@/lib/utils'

const OPTIONS: { value: AttendanceStatus; label: string; short: string; on: string }[] = [
  { value: 'present', label: 'Present', short: 'P', on: 'bg-emerald-600 text-white ring-emerald-600' },
  { value: 'late', label: 'Late', short: 'L', on: 'bg-amber-500 text-white ring-amber-500' },
  { value: 'absent', label: 'Absent', short: 'A', on: 'bg-red-600 text-white ring-red-600' },
]

const CELL = { present: 'bg-emerald-400', late: 'bg-amber-400', absent: 'bg-red-400' }

export default function AttendancePage() {
  const { data, setAttendance } = useStore()
  const [classId, setClassId] = useState(data.classes[5]?.id ?? data.classes[0].id)
  const [date, setDate] = useState(todayISO())
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({})
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const students = useMemo(
    () => data.students.filter((s) => s.classId === classId && s.status === 'active').sort((a, b) => a.lastName.localeCompare(b.lastName)),
    [data.students, classId],
  )

  const saved = data.attendance[date]
  const alreadyTaken = !!saved && students.some((s) => saved[s.id])

  // Load the saved register whenever the class or date changes.
  useEffect(() => {
    const existing = data.attendance[date] ?? {}
    setMarks(Object.fromEntries(students.filter((s) => existing[s.id]).map((s) => [s.id, existing[s.id]])))
    setDirty(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, date])

  const dow = new Date(date + 'T00:00:00').getDay()
  const isWeekend = dow === 0 || dow === 6

  const counts = { present: 0, late: 0, absent: 0 }
  for (const s of students) if (marks[s.id]) counts[marks[s.id]]++
  const unmarked = students.length - counts.present - counts.late - counts.absent

  const mark = (id: string, v: AttendanceStatus) => {
    setMarks((m) => ({ ...m, [id]: v }))
    setDirty(true)
  }

  const markAllPresent = () => {
    setMarks((m) => ({ ...Object.fromEntries(students.map((s) => [s.id, 'present' as const])), ...Object.fromEntries(Object.entries(m).filter(([, v]) => v !== 'present')) }))
    setDirty(true)
  }

  const save = () => {
    setAttendance(date, marks)
    setDirty(false)
    setToast(`Register saved for ${data.classes.find((c) => c.id === classId)?.name}, ${formatDate(date)}`)
  }

  const historyDays = recentSchoolDays(10, new Date(date + 'T00:00:00')).reverse()

  return (
    <>
      <PageHeader title="Attendance" description="Mark the daily register for each class." />

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4 p-4">
          <label className="block">
            <span className="label">Class</span>
            <select className="input w-44" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {data.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">Date</span>
            <input type="date" className="input w-44" value={date} max={todayISO()} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </label>
          <div className="flex flex-wrap items-center gap-2 pb-1 text-sm">
            <Badge tone="green">{counts.present} present</Badge>
            <Badge tone="amber">{counts.late} late</Badge>
            <Badge tone="red">{counts.absent} absent</Badge>
            {unmarked > 0 && <Badge>{unmarked} not marked</Badge>}
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={markAllPresent} disabled={students.length === 0}>
              <CheckCheck className="h-4 w-4" /> Mark rest present
            </Button>
            <Button onClick={save} disabled={!dirty}>
              <Save className="h-4 w-4" /> Save register
            </Button>
          </div>
        </div>
        {isWeekend && <p className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-sm text-amber-800">This date is a weekend. Make sure that’s intended.</p>}
        {alreadyTaken && !dirty && !isWeekend && (
          <p className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-sm text-slate-600">A register has already been saved for this date. Changes will update it.</p>
        )}
      </Card>

      <Card className="mb-6">
        {students.length === 0 ? (
          <EmptyState title="No active students in this class" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {students.map((s, i) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                <span className="w-6 text-right text-xs tabular-nums text-slate-400">{i + 1}</span>
                <Avatar first={s.firstName} last={s.lastName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {s.lastName}, {s.firstName}
                  </p>
                  <p className="text-xs text-slate-500">{s.studentId}</p>
                </div>
                <div className="flex gap-1.5" role="radiogroup" aria-label={`Attendance for ${s.firstName} ${s.lastName}`}>
                  {OPTIONS.map((o) => {
                    const on = marks[s.id] === o.value
                    return (
                      <button
                        key={o.value}
                        role="radio"
                        aria-checked={on}
                        onClick={() => mark(s.id, o.value)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition',
                          on ? o.on : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50',
                        )}
                      >
                        <span className="sm:hidden">{o.short}</span>
                        <span className="hidden sm:inline">{o.label}</span>
                      </button>
                    )
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader title="Recent history" description="Last 10 school days up to the selected date" />
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="th">Student</th>
                  {historyDays.map((d) => (
                    <th key={d} className="th px-1 text-center font-medium normal-case">
                      {new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </th>
                  ))}
                  <th className="th text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const row = historyDays.map((d) => data.attendance[d]?.[s.id])
                  const taken = row.filter(Boolean)
                  const rate = taken.length ? Math.round((taken.filter((m) => m !== 'absent').length / taken.length) * 100) : null
                  return (
                    <tr key={s.id}>
                      <td className="td py-2">
                        {s.lastName}, {s.firstName}
                      </td>
                      {row.map((m, i) => (
                        <td key={i} className="px-1 py-2 text-center">
                          <span title={m ?? 'not taken'} className={cn('inline-block h-4 w-4 rounded', m ? CELL[m] : 'bg-slate-100')} />
                        </td>
                      ))}
                      <td className={cn('td py-2 text-right tabular-nums', rate !== null && rate < 85 && 'font-semibold text-red-600')}>{rate !== null ? `${rate}%` : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  )
}
