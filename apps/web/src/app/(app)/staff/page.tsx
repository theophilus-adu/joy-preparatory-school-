'use client'

import { Mail, Pencil, Phone, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Avatar, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, Toast } from '@/components/ui'
import { useStore } from '@/lib/store'
import type { Staff } from '@/lib/types'
import { formatDate, todayISO } from '@/lib/utils'

type Draft = Omit<Staff, 'id' | 'staffId'>

const POSITIONS = ['Class Teacher', 'Subject Teacher', 'Headteacher', 'Assistant Headteacher', 'Accountant', 'Administrator', 'Librarian', 'School Nurse', 'Security', 'Cleaner', 'Driver']
const DEPARTMENTS = ['Early Years', 'Primary', 'JHS', 'Administration', 'Finance', 'Academic', 'Health', 'Support']

export default function StaffPage() {
  const { data, addStaff, updateStaff } = useStore()
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('')
  const [editing, setEditing] = useState<Staff | 'new' | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const classOf = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of data.classes) if (c.teacherId) m.set(c.teacherId, c.name)
    return m
  }, [data.classes])

  const filtered = data.staff
    .filter((s) => !dept || s.department === dept)
    .filter((s) => {
      const q = query.trim().toLowerCase()
      return !q || `${s.firstName} ${s.lastName} ${s.staffId} ${s.position} ${s.phone}`.toLowerCase().includes(q)
    })

  return (
    <>
      <PageHeader
        title="Staff"
        description={`${data.staff.length} staff members`}
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> Add staff
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search name, ID, position or phone…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="input sm:w-48" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState title="No staff found" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start gap-3">
                <Avatar first={s.firstName} last={s.lastName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{s.position}</p>
                </div>
                <button onClick={() => setEditing(s)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Edit ${s.firstName}`}>
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge>{s.department}</Badge>
                {classOf.get(s.id) && <Badge tone="blue">{classOf.get(s.id)}</Badge>}
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                <a href={`tel:${s.phone}`} className="flex items-center gap-2 text-slate-600 hover:underline hover:decoration-gold-400 hover:decoration-2 hover:underline-offset-4">
                  <Phone className="h-4 w-4 text-slate-400" /> {s.phone}
                </a>
                <a href={`mailto:${s.email}`} className="flex items-center gap-2 truncate text-slate-600 hover:underline hover:decoration-gold-400 hover:decoration-2 hover:underline-offset-4">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" /> <span className="truncate">{s.email}</span>
                </a>
              </div>
              <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                {s.staffId} · Joined {formatDate(s.joinedOn)}
              </p>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <StaffModal
          initial={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(d) => {
            if (editing === 'new') {
              addStaff(d)
              setToast(`${d.firstName} ${d.lastName} added`)
            } else {
              updateStaff(editing.id, d)
              setToast('Staff record updated')
            }
            setEditing(null)
          }}
        />
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  )
}

function StaffModal({ initial, onClose, onSave }: { initial?: Staff; onClose: () => void; onSave: (d: Draft) => void }) {
  const [d, setD] = useState<Draft>(
    initial
      ? (({ id: _i, staffId: _s, ...rest }) => rest)(initial)
      : { firstName: '', lastName: '', gender: 'Female', position: 'Class Teacher', department: 'Primary', phone: '', email: '', joinedOn: todayISO() },
  )
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? 'Edit staff member' : 'Add staff member'}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="staff-form">
            Save
          </Button>
        </>
      }
    >
      <form
        id="staff-form"
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSave(d)
        }}
      >
        <Field label="First name">
          <input className="input" value={d.firstName} onChange={(e) => set('firstName', e.target.value)} required />
        </Field>
        <Field label="Surname">
          <input className="input" value={d.lastName} onChange={(e) => set('lastName', e.target.value)} required />
        </Field>
        <Field label="Gender">
          <select className="input" value={d.gender} onChange={(e) => set('gender', e.target.value as Staff['gender'])}>
            <option>Female</option>
            <option>Male</option>
          </select>
        </Field>
        <Field label="Date joined">
          <input type="date" className="input" value={d.joinedOn} onChange={(e) => set('joinedOn', e.target.value)} required />
        </Field>
        <Field label="Position">
          <select className="input" value={d.position} onChange={(e) => set('position', e.target.value)}>
            {POSITIONS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Department">
          <select className="input" value={d.department} onChange={(e) => set('department', e.target.value)}>
            {DEPARTMENTS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Phone">
          <input className="input" inputMode="tel" pattern="0\d{9}" title="10-digit number starting with 0" value={d.phone} onChange={(e) => set('phone', e.target.value.replace(/\s/g, ''))} required />
        </Field>
        <Field label="Email">
          <input type="email" className="input" value={d.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
      </form>
    </Modal>
  )
}
