'use client'

import { ArrowLeft, Printer } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Logo } from '@/components/logo'
import { Button, Card, EmptyState } from '@/components/ui'
import { useStore } from '@/lib/store'
import type { Term } from '@/lib/types'
import { GRADE_SCALE, formatDate, gradeFor, scoreTotal } from '@/lib/utils'

function remarkFor(avg: number) {
  if (avg >= 80) return 'An outstanding term. Keep up the excellent work!'
  if (avg >= 70) return 'Very good performance. Aim even higher next term.'
  if (avg >= 60) return 'Good work. More focus will bring better results.'
  if (avg >= 50) return 'Fair performance. Needs to put in more effort.'
  return 'Needs serious improvement. Extra support is recommended.'
}

export default function ReportCardPage({ params }: { params: { id: string } }) {
  const { data } = useStore()
  const [term, setTerm] = useState<Term>(data.school.currentTerm)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('term')
    if (t === 'Term 1' || t === 'Term 2' || t === 'Term 3') setTerm(t)
  }, [])

  const student = data.students.find((s) => s.id === params.id)

  const report = useMemo(() => {
    if (!student) return null
    const cls = data.classes.find((c) => c.id === student.classId)
    const teacher = data.staff.find((s) => s.id === cls?.teacherId)
    const head = data.staff.find((s) => s.position === 'Headteacher')
    const classmates = data.students.filter((s) => s.classId === student.classId && s.status === 'active')

    // Rank by total across subjects, and per subject
    const totalFor = (id: string) => data.scores.filter((s) => s.studentId === id && s.term === term).reduce((a, s) => a + scoreTotal(s), 0)
    const totals = classmates.map((s) => totalFor(s.id)).filter((t) => t > 0).sort((a, b) => b - a)
    const myTotal = totalFor(student.id)
    const position = totals.indexOf(myTotal) + 1

    const rows = data.subjects
      .map((sub) => {
        const sc = data.scores.find((s) => s.studentId === student.id && s.subjectId === sub.id && s.term === term)
        if (!sc) return null
        const subjectTotals = classmates
          .map((c) => data.scores.find((s) => s.studentId === c.id && s.subjectId === sub.id && s.term === term))
          .filter(Boolean)
          .map((s) => scoreTotal(s!))
          .sort((a, b) => b - a)
        const total = scoreTotal(sc)
        return { sub, sc, total, grade: gradeFor(total), position: subjectTotals.indexOf(total) + 1 }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)

    const avg = rows.length ? rows.reduce((a, r) => a + r.total, 0) / rows.length : 0
    const marks = Object.values(data.attendance).map((day) => day[student.id]).filter(Boolean)
    const attended = marks.filter((m) => m !== 'absent').length

    return { cls, teacher, head, rows, avg, position, classSize: totals.length, attended, totalDays: marks.length }
  }, [data, student, term])

  if (!student || !report) {
    return (
      <Card>
        <EmptyState title="Student not found" />
      </Card>
    )
  }

  return (
    <>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/students/${student.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> {student.firstName} {student.lastName}
        </Link>
        <div className="flex gap-2">
          <select className="input w-32" value={term} onChange={(e) => setTerm(e.target.value as Term)}>
            {(['Term 1', 'Term 2', 'Term 3'] as Term[]).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-card print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="-mx-8 -mt-8 mb-6 h-2 rounded-t-xl bg-gold-400 print:mx-0 print:mt-0 print:rounded-none" />
        <header className="flex items-center gap-4 border-b-4 border-ink-950 pb-5">
          <Logo className="h-16 w-16" />
          <div className="flex-1">
            <h1 className="text-xl font-extrabold uppercase tracking-wide text-ink-950">{data.school.name}</h1>
            <p className="text-sm italic text-slate-600">{data.school.motto}</p>
            <p className="text-xs text-slate-500">
              {data.school.address} · {data.school.phone}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Terminal Report</p>
            <p className="text-sm font-semibold text-slate-900">{term}</p>
            <p className="text-xs text-slate-500">{data.school.academicYear}</p>
          </div>
        </header>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 py-5 text-sm sm:grid-cols-3">
          {[
            ['Name', `${student.firstName} ${student.lastName}`],
            ['Student ID', student.studentId],
            ['Class', report.cls?.name ?? ''],
            ['Position', report.position ? `${report.position} of ${report.classSize}` : '—'],
            ['Attendance', `${report.attended} of ${report.totalDays} days`],
            ['House', student.house],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wide text-slate-500">{k}</dt>
              <dd className="font-semibold text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>

        {report.rows.length === 0 ? (
          <EmptyState title={`No scores recorded for ${term}`} />
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-ink-950 text-gold-400">
                <th className="px-3 py-2 text-left font-semibold">Subject</th>
                <th className="px-3 py-2 text-right font-semibold">Class (30)</th>
                <th className="px-3 py-2 text-right font-semibold">Exam (70)</th>
                <th className="px-3 py-2 text-right font-semibold">Total</th>
                <th className="px-3 py-2 text-center font-semibold">Grade</th>
                <th className="px-3 py-2 text-center font-semibold">Pos.</th>
                <th className="px-3 py-2 text-left font-semibold">Remark</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r, i) => (
                <tr key={r.sub.id} className={i % 2 ? 'bg-slate-50' : ''}>
                  <td className="border-b border-slate-200 px-3 py-2 font-medium">{r.sub.name}</td>
                  <td className="border-b border-slate-200 px-3 py-2 text-right tabular-nums">{r.sc.classScore}</td>
                  <td className="border-b border-slate-200 px-3 py-2 text-right tabular-nums">{r.sc.examScore}</td>
                  <td className="border-b border-slate-200 px-3 py-2 text-right font-semibold tabular-nums">{r.total}</td>
                  <td className="border-b border-slate-200 px-3 py-2 text-center font-semibold">{r.grade.grade}</td>
                  <td className="border-b border-slate-200 px-3 py-2 text-center tabular-nums">{r.position}</td>
                  <td className="border-b border-slate-200 px-3 py-2">{r.grade.remark}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="px-3 py-2" colSpan={3}>
                  Average
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{report.avg.toFixed(1)}</td>
                <td className="px-3 py-2 text-center">{gradeFor(report.avg).grade}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        )}

        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Class teacher’s remark</p>
            <p className="mt-2 text-slate-800">{report.rows.length ? remarkFor(report.avg) : '—'}</p>
            <p className="mt-6 border-t border-dashed border-slate-300 pt-1 text-xs text-slate-500">
              {report.teacher ? `${report.teacher.firstName} ${report.teacher.lastName}` : 'Class teacher'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Headteacher’s remark</p>
            <p className="mt-2 text-slate-800">{report.avg >= 70 ? 'Excellent progress. Keep it up.' : report.avg >= 50 ? 'Satisfactory progress.' : 'Must work harder next term.'}</p>
            <p className="mt-6 border-t border-dashed border-slate-300 pt-1 text-xs text-slate-500">
              {report.head ? `${report.head.firstName} ${report.head.lastName}` : 'Headteacher'}
            </p>
          </div>
        </div>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
          <span>Grading: {GRADE_SCALE.map((g) => `${g.grade} ${g.min}+`).join(' · ')}</span>
          <span>Printed {formatDate(new Date().toISOString().slice(0, 10))}</span>
        </footer>
      </div>
    </>
  )
}
