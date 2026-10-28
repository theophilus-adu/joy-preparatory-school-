'use client'

import { RotateCcw, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, Card, CardHeader, Field, Modal, PageHeader, Toast } from '@/components/ui'
import { useStore } from '@/lib/store'
import type { School, Term } from '@/lib/types'
import { GRADE_SCALE } from '@/lib/utils'

export default function SettingsPage() {
  const { data, updateSchool, assignClassTeacher, resetDemoData } = useStore()
  const [school, setSchool] = useState<School>(data.school)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => setSchool(data.school), [data.school])
  const set = <K extends keyof School>(k: K, v: School[K]) => setSchool((s) => ({ ...s, [k]: v }))

  const teachers = data.staff.filter((s) => ['Class Teacher', 'Subject Teacher', 'Assistant Headteacher'].includes(s.position))

  return (
    <>
      <PageHeader title="Settings" description="School profile, academic calendar and class assignments." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="School profile" description="Shown on report cards and receipts." />
            <form
              className="grid gap-4 p-5 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault()
                updateSchool(school)
                setToast('School profile saved')
              }}
            >
              <Field label="School name" className="sm:col-span-2">
                <input className="input" value={school.name} onChange={(e) => set('name', e.target.value)} required />
              </Field>
              <Field label="Motto" className="sm:col-span-2">
                <input className="input" value={school.motto} onChange={(e) => set('motto', e.target.value)} />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <input className="input" value={school.address} onChange={(e) => set('address', e.target.value)} />
              </Field>
              <Field label="Phone">
                <input className="input" value={school.phone} onChange={(e) => set('phone', e.target.value)} />
              </Field>
              <Field label="Email">
                <input type="email" className="input" value={school.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Academic year">
                <input className="input" value={school.academicYear} onChange={(e) => set('academicYear', e.target.value)} pattern="\d{4}/\d{4}" title="e.g. 2026/2027" />
              </Field>
              <Field label="Current term">
                <select className="input" value={school.currentTerm} onChange={(e) => set('currentTerm', e.target.value as Term)}>
                  <option>Term 1</option>
                  <option>Term 2</option>
                  <option>Term 3</option>
                </select>
              </Field>
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit">
                  <Save className="h-4 w-4" /> Save changes
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader title="Class teachers" description="Changes are saved immediately." />
            <ul className="divide-y divide-slate-100">
              {data.classes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.level} · {data.students.filter((s) => s.classId === c.id && s.status === 'active').length} students
                    </p>
                  </div>
                  <select className="input w-full sm:w-64" value={c.teacherId ?? ''} onChange={(e) => assignClassTeacher(c.id, e.target.value)} aria-label={`Class teacher for ${c.name}`}>
                    <option value="">Unassigned</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Grading scale" description="Total = class score (30) + exam (70)" />
            <table className="min-w-full">
              <tbody className="divide-y divide-slate-100">
                {GRADE_SCALE.map((g, i) => (
                  <tr key={g.grade}>
                    <td className="td font-semibold text-slate-900">{g.grade}</td>
                    <td className="td tabular-nums">
                      {g.min}–{i === 0 ? 100 : GRADE_SCALE[i - 1].min - 1}
                    </td>
                    <td className="td">{g.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <CardHeader title="Subjects" />
            <ul className="divide-y divide-slate-100">
              {data.subjects.map((s) => (
                <li key={s.id} className="flex justify-between px-5 py-2.5 text-sm">
                  <span className="text-slate-900">{s.name}</span>
                  <span className="font-mono text-xs text-slate-500">{s.code}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-red-200">
            <CardHeader title="Demo data" description="All data is stored in this browser only." />
            <div className="p-5">
              <Button variant="secondary" onClick={() => setConfirmReset(true)} className="text-red-700">
                <RotateCcw className="h-4 w-4" /> Reset demo data
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        description="This replaces all students, attendance, scores, fees and staff in this browser with fresh sample data."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemoData()
                setConfirmReset(false)
                setToast('Demo data reset')
              }}
            >
              Reset
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Any changes you made will be lost.</p>
      </Modal>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  )
}
