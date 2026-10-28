'use client'

import { Download, FileText, Save } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, PageHeader, Segmented, Toast } from '@/components/ui'
import { useStore } from '@/lib/store'
import type { Score, Term } from '@/lib/types'
import { cn, downloadCSV, gradeFor, scoreTotal } from '@/lib/utils'

const TERMS: Term[] = ['Term 1', 'Term 2', 'Term 3']

type Row = { classScore: string; examScore: string }

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export default function ResultsPage() {
  const { data, saveScores } = useStore()
  const [tab, setTab] = useState<'entry' | 'broadsheet'>('entry')
  const gradedClasses = data.classes.filter((c) => c.level === 'Primary' || c.level === 'JHS')
  const [classId, setClassId] = useState(gradedClasses[0]?.id ?? data.classes[0].id)
  const [subjectId, setSubjectId] = useState(data.subjects[0].id)
  const [term, setTerm] = useState<Term>(data.school.currentTerm)
  const [rows, setRows] = useState<Record<string, Row>>({})
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const students = useMemo(
    () => data.students.filter((s) => s.classId === classId && s.status === 'active').sort((a, b) => a.lastName.localeCompare(b.lastName)),
    [data.students, classId],
  )

  useEffect(() => {
    const next: Record<string, Row> = {}
    for (const s of students) {
      const sc = data.scores.find((x) => x.studentId === s.id && x.subjectId === subjectId && x.term === term)
      next[s.id] = { classScore: sc ? String(sc.classScore) : '', examScore: sc ? String(sc.examScore) : '' }
    }
    setRows(next)
    setDirty(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, subjectId, term, students.length])

  const setCell = (id: string, key: keyof Row, value: string, max: number) => {
    if (value !== '' && !/^\d{0,3}(\.\d?)?$/.test(value)) return
    if (value !== '' && Number(value) > max) value = String(max)
    setRows((r) => ({ ...r, [id]: { ...r[id], [key]: value } }))
    setDirty(true)
  }

  const save = () => {
    const out: Score[] = []
    for (const s of students) {
      const r = rows[s.id]
      if (!r || r.classScore === '' || r.examScore === '') continue
      out.push({ studentId: s.id, subjectId, term, classScore: Number(r.classScore), examScore: Number(r.examScore) })
    }
    saveScores(out)
    setDirty(false)
    setToast(`Saved ${out.length} scores`)
  }

  // Broadsheet: totals per subject, average and class position
  const broadsheet = useMemo(() => {
    const lines = students.map((s) => {
      const perSubject = data.subjects.map((sub) => {
        const sc = data.scores.find((x) => x.studentId === s.id && x.subjectId === sub.id && x.term === term)
        return sc ? scoreTotal(sc) : null
      })
      const got = perSubject.filter((x): x is number => x !== null)
      const total = got.reduce((a, b) => a + b, 0)
      return { student: s, perSubject, total, avg: got.length ? total / got.length : null }
    })
    const ranked = [...lines].filter((l) => l.avg !== null).sort((a, b) => b.total - a.total)
    const pos = new Map<string, number>()
    ranked.forEach((l, i) => pos.set(l.student.id, i > 0 && ranked[i - 1].total === l.total ? pos.get(ranked[i - 1].student.id)! : i + 1))
    return lines.map((l) => ({ ...l, position: pos.get(l.student.id) ?? null })).sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
  }, [students, data.subjects, data.scores, term])

  const className = data.classes.find((c) => c.id === classId)?.name ?? ''
  const exportBroadsheet = () =>
    downloadCSV(`broadsheet-${className}-${term}.csv`.replace(/\s/g, '-'), [
      ['Position', 'Student ID', 'Name', ...data.subjects.map((s) => s.code), 'Total', 'Average'],
      ...broadsheet.map((l) => [l.position ?? '', l.student.studentId, `${l.student.lastName} ${l.student.firstName}`, ...l.perSubject.map((x) => x ?? ''), l.total, l.avg?.toFixed(1) ?? '']),
    ])

  return (
    <>
      <PageHeader title="Results" description="Continuous assessment (30%) and end-of-term exam (70%)." />

      <div className="mb-4">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            ['entry', 'Score entry'],
            ['broadsheet', 'Class broadsheet'],
          ]}
        />
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4 p-4">
          <label className="block">
            <span className="label">Class</span>
            <select className="input w-40" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {data.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {tab === 'entry' && (
            <label className="block">
              <span className="label">Subject</span>
              <select className="input w-56" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block">
            <span className="label">Term</span>
            <select className="input w-32" value={term} onChange={(e) => setTerm(e.target.value as Term)}>
              {TERMS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <div className="ml-auto">
            {tab === 'entry' ? (
              <Button onClick={save} disabled={!dirty}>
                <Save className="h-4 w-4" /> Save scores
              </Button>
            ) : (
              <Button variant="secondary" onClick={exportBroadsheet}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        {students.length === 0 ? (
          <EmptyState title="No active students in this class" />
        ) : tab === 'entry' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Student</th>
                  <th className="th w-28 text-center">Class (30)</th>
                  <th className="th w-28 text-center">Exam (70)</th>
                  <th className="th text-right">Total</th>
                  <th className="th">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const r = rows[s.id] ?? { classScore: '', examScore: '' }
                  const complete = r.classScore !== '' && r.examScore !== ''
                  const total = complete ? Number(r.classScore) + Number(r.examScore) : null
                  const g = total !== null ? gradeFor(total) : null
                  return (
                    <tr key={s.id}>
                      <td className="td">
                        <p className="font-medium text-slate-900">
                          {s.lastName}, {s.firstName}
                        </p>
                        <p className="text-xs text-slate-500">{s.studentId}</p>
                      </td>
                      <td className="px-4 py-2">
                        <input className="input text-center tabular-nums" inputMode="decimal" value={r.classScore} onChange={(e) => setCell(s.id, 'classScore', e.target.value, 30)} aria-label={`Class score for ${s.firstName}`} />
                      </td>
                      <td className="px-4 py-2">
                        <input className="input text-center tabular-nums" inputMode="decimal" value={r.examScore} onChange={(e) => setCell(s.id, 'examScore', e.target.value, 70)} aria-label={`Exam score for ${s.firstName}`} />
                      </td>
                      <td className="td text-right font-semibold tabular-nums text-slate-900">{total ?? '—'}</td>
                      <td className="td">{g ? <Badge tone={g.grade === 'F' ? 'red' : g.grade <= 'B' ? 'green' : 'gray'}>{g.grade} · {g.remark}</Badge> : <span className="text-slate-400">—</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Pos.</th>
                  <th className="th">Student</th>
                  {data.subjects.map((s) => (
                    <th key={s.id} className="th text-right" title={s.name}>
                      {s.code}
                    </th>
                  ))}
                  <th className="th text-right">Total</th>
                  <th className="th text-right">Avg</th>
                  <th className="th" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {broadsheet.map((l) => (
                  <tr key={l.student.id} className="hover:bg-slate-50">
                    <td className="td font-semibold text-slate-900">{l.position ? ordinal(l.position) : '—'}</td>
                    <td className="td">
                      {l.student.lastName}, {l.student.firstName}
                    </td>
                    {l.perSubject.map((x, i) => (
                      <td key={i} className={cn('td text-right tabular-nums', x !== null && x < 40 && 'font-semibold text-red-600')}>
                        {x ?? '—'}
                      </td>
                    ))}
                    <td className="td text-right font-semibold tabular-nums text-slate-900">{l.total || '—'}</td>
                    <td className="td text-right tabular-nums">{l.avg?.toFixed(1) ?? '—'}</td>
                    <td className="td">
                      {l.avg !== null && (
                        <Link href={`/results/report/${l.student.id}?term=${encodeURIComponent(term)}`} className="link inline-flex items-center gap-1 text-sm">
                          <FileText className="h-4 w-4" /> Report
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  )
}
