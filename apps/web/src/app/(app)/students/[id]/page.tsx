'use client'

import { ArrowLeft, FileText, Pencil, Phone } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { StudentFormModal } from '@/components/student-form'
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Toast } from '@/components/ui'
import { useStore } from '@/lib/store'
import { ageFrom, cn, formatDate, formatGHS, gradeFor, invoicePaid, invoiceStatus, scoreTotal } from '@/lib/utils'

const STATUS_TONE = { paid: 'green', partial: 'amber', unpaid: 'gray', overdue: 'red' } as const

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const { data, user, updateStudent } = useStore()
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const student = data.students.find((s) => s.id === params.id)
  const canEdit = user?.role === 'proprietor' || user?.role === 'headteacher'
  const showFees = user?.role !== 'teacher'

  const info = useMemo(() => {
    if (!student) return null
    const cls = data.classes.find((c) => c.id === student.classId)
    const teacher = data.staff.find((s) => s.id === cls?.teacherId)
    const days = Object.keys(data.attendance).sort().reverse()
    const marks = days.map((d) => ({ date: d, status: data.attendance[d][student.id] })).filter((m) => m.status)
    const present = marks.filter((m) => m.status === 'present').length
    const late = marks.filter((m) => m.status === 'late').length
    const absent = marks.filter((m) => m.status === 'absent').length
    const scores = data.subjects
      .map((sub) => ({ sub, score: data.scores.find((s) => s.studentId === student.id && s.subjectId === sub.id && s.term === data.school.currentTerm) }))
      .filter((x) => x.score)
    const avg = scores.length ? scores.reduce((s, x) => s + scoreTotal(x.score!), 0) / scores.length : null
    const invoices = data.invoices.filter((i) => i.studentId === student.id)
    const payments = data.payments.filter((p) => invoices.some((i) => i.id === p.invoiceId)).sort((a, b) => b.date.localeCompare(a.date))
    const balance = invoices.reduce((s, i) => s + i.amount - invoicePaid(i, data.payments), 0)
    return { cls, teacher, marks, present, late, absent, scores, avg, invoices, payments, balance }
  }, [data, student])

  if (!student || !info) {
    return (
      <Card>
        <EmptyState title="Student not found" description="This record may have been removed." />
        <div className="pb-8 text-center">
          <Link href="/students" className="link text-sm">
            Back to students
          </Link>
        </div>
      </Card>
    )
  }

  const rate = info.marks.length ? Math.round(((info.present + info.late) / info.marks.length) * 100) : null
  const { id: _id, studentId: _sid, ...draft } = student

  return (
    <>
      <Link href="/students" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Students
      </Link>

      <Card className="mb-6 overflow-hidden">
        <div className="relative h-24 bg-ink-950">
          <div className="absolute inset-0 bg-dots [background-size:18px_18px]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-stripes from-gold-400/15" />
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gold-400" />
        </div>
        <div className="-mt-10 flex flex-wrap items-start gap-5 px-6 pb-6">
          <Avatar first={student.firstName} last={student.lastName} size="lg" />
          <div className="min-w-0 flex-1 pt-12">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-950">
                {student.firstName} {student.lastName}
              </h1>
              <Badge tone={student.status === 'active' ? 'green' : 'gray'}>{student.status === 'active' ? 'Active' : 'Inactive'}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {student.studentId} · {info.cls?.name} · {student.house} House
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-slate-500">Gender</dt>
                <dd className="font-medium text-slate-900">{student.gender}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Date of birth</dt>
                <dd className="font-medium text-slate-900">
                  {formatDate(student.dob)} ({ageFrom(student.dob)} yrs)
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Admitted</dt>
                <dd className="font-medium text-slate-900">{formatDate(student.admissionDate)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Class teacher</dt>
                <dd className="font-medium text-slate-900">{info.teacher ? `${info.teacher.firstName} ${info.teacher.lastName}` : '—'}</dd>
              </div>
            </dl>
          </div>
          <div className="flex gap-2 pt-12">
            {info.scores.length > 0 && (
              <Link href={`/results/report/${student.id}`}>
                <Button variant="secondary">
                  <FileText className="h-4 w-4" /> Report card
                </Button>
              </Link>
            )}
            {canEdit && (
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title={`Results · ${data.school.currentTerm}`}
              description={info.avg !== null ? `Average ${info.avg.toFixed(1)}% · Grade ${gradeFor(info.avg).grade}` : undefined}
            />
            {info.scores.length === 0 ? (
              <EmptyState title="No scores recorded" description="Scores appear here once they’re entered on the Results page." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="th">Subject</th>
                      <th className="th text-right">Class (30)</th>
                      <th className="th text-right">Exam (70)</th>
                      <th className="th text-right">Total</th>
                      <th className="th">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {info.scores.map(({ sub, score }) => {
                      const total = scoreTotal(score!)
                      const g = gradeFor(total)
                      return (
                        <tr key={sub.id}>
                          <td className="td font-medium text-slate-900">{sub.name}</td>
                          <td className="td text-right tabular-nums">{score!.classScore}</td>
                          <td className="td text-right tabular-nums">{score!.examScore}</td>
                          <td className="td text-right font-semibold tabular-nums text-slate-900">{total}</td>
                          <td className="td">
                            <Badge tone={g.grade === 'F' ? 'red' : g.grade <= 'B' ? 'green' : 'gray'}>
                              {g.grade} · {g.remark}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {showFees && (
            <Card>
              <CardHeader
                title="Fees"
                description={info.balance > 0 ? `Outstanding balance ${formatGHS(info.balance)}` : 'All fees paid'}
                action={info.balance > 0 ? <Link href={`/fees?student=${student.id}`}><Button size="sm">Record payment</Button></Link> : undefined}
              />
              <ul className="divide-y divide-slate-100">
                {info.invoices.map((inv) => {
                  const st = invoiceStatus(inv, data.payments)
                  return (
                    <li key={inv.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{inv.description}</p>
                        <p className="text-xs text-slate-500">
                          {inv.invoiceNo} · Due {formatDate(inv.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tabular-nums text-slate-900">{formatGHS(inv.amount)}</p>
                        <Badge tone={STATUS_TONE[st]} className="capitalize">
                          {st}
                        </Badge>
                      </div>
                    </li>
                  )
                })}
                {info.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 bg-slate-50/60 px-5 py-2.5 text-sm">
                    <span className="text-slate-600">
                      Payment · {formatDate(p.date)} · {p.method}
                    </span>
                    <span className="font-medium tabular-nums text-emerald-700">−{formatGHS(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Guardian" />
            <div className="space-y-2 px-5 py-4 text-sm">
              <p className="font-medium text-slate-900">{student.guardianName}</p>
              <a href={`tel:${student.guardianPhone}`} className="link flex items-center gap-2">
                <Phone className="h-4 w-4" /> {student.guardianPhone}
              </a>
              {student.address && <p className="text-slate-500">{student.address}</p>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Attendance" description={rate !== null ? `${rate}% over ${info.marks.length} days` : 'No records yet'} />
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 text-center">
              {[
                ['Present', info.present, 'text-emerald-700'],
                ['Late', info.late, 'text-amber-700'],
                ['Absent', info.absent, 'text-red-700'],
              ].map(([label, n, color]) => (
                <div key={label as string} className="py-3">
                  <p className={cn('text-xl font-bold', color as string)}>{n}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 px-5 py-4">
              {info.marks
                .slice(0, 20)
                .reverse()
                .map((m) => (
                  <span
                    key={m.date}
                    title={`${formatDate(m.date)}: ${m.status}`}
                    className={cn('h-5 w-5 rounded', m.status === 'present' ? 'bg-emerald-400' : m.status === 'late' ? 'bg-amber-400' : 'bg-red-400')}
                  />
                ))}
            </div>
          </Card>
        </div>
      </div>

      {editing && (
        <StudentFormModal
          open
          title="Edit student"
          initial={draft}
          onClose={() => setEditing(false)}
          onSubmit={(d) => {
            updateStudent(student.id, d)
            setEditing(false)
            setToast('Student record updated')
          }}
        />
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  )
}
