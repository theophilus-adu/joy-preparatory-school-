'use client'

import { useState } from 'react'
import { HOUSES } from '@/lib/mock-data'
import { useStore } from '@/lib/store'
import type { Student } from '@/lib/types'
import { todayISO } from '@/lib/utils'
import { Button, Field, Modal } from './ui'

export type StudentDraft = Omit<Student, 'id' | 'studentId'>

const EMPTY: StudentDraft = {
  firstName: '',
  lastName: '',
  gender: 'Female',
  dob: '',
  classId: '',
  house: HOUSES[0],
  guardianName: '',
  guardianPhone: '',
  address: '',
  admissionDate: todayISO(),
  status: 'active',
}

export function StudentFormModal({
  open,
  onClose,
  initial,
  onSubmit,
  title,
}: {
  open: boolean
  onClose: () => void
  initial?: StudentDraft
  onSubmit: (draft: StudentDraft) => void
  title: string
}) {
  const { data } = useStore()
  const [draft, setDraft] = useState<StudentDraft>(initial ?? { ...EMPTY, classId: data.classes[0]?.id ?? '' })
  const [error, setError] = useState('')
  const set = <K extends keyof StudentDraft>(k: K, v: StudentDraft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^0\d{9}$/.test(draft.guardianPhone.replace(/\s/g, ''))) {
      setError('Enter a 10-digit Ghana phone number, e.g. 0244123456.')
      return
    }
    onSubmit({ ...draft, firstName: draft.firstName.trim(), lastName: draft.lastName.trim(), guardianPhone: draft.guardianPhone.replace(/\s/g, '') })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="student-form">
            Save student
          </Button>
        </>
      }
    >
      <form id="student-form" onSubmit={submit} className="space-y-6">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <section>
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Student</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <input className="input" value={draft.firstName} onChange={(e) => set('firstName', e.target.value)} required />
            </Field>
            <Field label="Surname">
              <input className="input" value={draft.lastName} onChange={(e) => set('lastName', e.target.value)} required />
            </Field>
            <Field label="Gender">
              <select className="input" value={draft.gender} onChange={(e) => set('gender', e.target.value as Student['gender'])}>
                <option>Female</option>
                <option>Male</option>
              </select>
            </Field>
            <Field label="Date of birth">
              <input type="date" className="input" value={draft.dob} max={todayISO()} onChange={(e) => set('dob', e.target.value)} required />
            </Field>
            <Field label="Class">
              <select className="input" value={draft.classId} onChange={(e) => set('classId', e.target.value)}>
                {data.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="House">
              <select className="input" value={draft.house} onChange={(e) => set('house', e.target.value)}>
                {HOUSES.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </Field>
            <Field label="Admission date">
              <input type="date" className="input" value={draft.admissionDate} onChange={(e) => set('admissionDate', e.target.value)} required />
            </Field>
            <Field label="Status">
              <select className="input" value={draft.status} onChange={(e) => set('status', e.target.value as Student['status'])}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
        </section>
        <section>
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Parent / guardian</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input className="input" value={draft.guardianName} onChange={(e) => set('guardianName', e.target.value)} required />
            </Field>
            <Field label="Phone">
              <input className="input" inputMode="tel" placeholder="0244123456" value={draft.guardianPhone} onChange={(e) => set('guardianPhone', e.target.value)} required />
            </Field>
            <Field label="Residential address" className="sm:col-span-2">
              <input className="input" placeholder="e.g. Adenta, Accra" value={draft.address} onChange={(e) => set('address', e.target.value)} />
            </Field>
          </div>
        </section>
      </form>
    </Modal>
  )
}
