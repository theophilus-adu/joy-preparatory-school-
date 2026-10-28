'use client'

import { Download, Plus, Search, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { StudentFormModal } from '@/components/student-form'
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, Toast } from '@/components/ui'
import { useStore } from '@/lib/store'
import { ageFrom, downloadCSV } from '@/lib/utils'

const PAGE_SIZE = 20

export default function StudentsPage() {
  const router = useRouter()
  const { data, user, addStudent } = useStore()
  const [query, setQuery] = useState('')
  const [classId, setClassId] = useState('')
  const [gender, setGender] = useState('')
  const [status, setStatus] = useState('active')
  const [page, setPage] = useState(0)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const canEdit = user?.role === 'proprietor' || user?.role === 'headteacher'
  const classById = useMemo(() => new Map(data.classes.map((c) => [c.id, c])), [data.classes])

  // Read ?new, ?class and ?q (the top-bar search) whenever the URL changes.
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('new') === '1' && canEdit) setAdding(true)
    if (searchParams.get('class')) setClassId(searchParams.get('class')!)
    if (searchParams.get('q') !== null) {
      setQuery(searchParams.get('q')!)
      setStatus('')
    }
  }, [searchParams, canEdit])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.students
      .filter((s) => (!classId || s.classId === classId) && (!gender || s.gender === gender) && (!status || s.status === status))
      .filter((s) => !q || `${s.firstName} ${s.lastName} ${s.studentId} ${s.guardianName} ${s.guardianPhone}`.toLowerCase().includes(q))
      .sort((a, b) => {
        const ca = data.classes.findIndex((c) => c.id === a.classId)
        const cb = data.classes.findIndex((c) => c.id === b.classId)
        return ca - cb || a.lastName.localeCompare(b.lastName)
      })
  }, [data.students, data.classes, query, classId, gender, status])

  useEffect(() => setPage(0), [query, classId, gender, status])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const exportCSV = () =>
    downloadCSV('students.csv', [
      ['Student ID', 'First name', 'Surname', 'Gender', 'Date of birth', 'Class', 'House', 'Guardian', 'Guardian phone', 'Address', 'Status'],
      ...filtered.map((s) => [s.studentId, s.firstName, s.lastName, s.gender, s.dob, classById.get(s.classId)?.name ?? '', s.house, s.guardianName, s.guardianPhone, s.address, s.status]),
    ])

  return (
    <>
      <PageHeader
        title="Students"
        description={`${data.students.filter((s) => s.status === 'active').length} active students`}
        actions={
          <>
            <Button variant="secondary" onClick={exportCSV}>
              <Download className="h-4 w-4" /> Export
            </Button>
            {canEdit && (
              <Button onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4" /> Admit student
              </Button>
            )}
          </>
        }
      />

      <Card>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search name, ID, guardian or phone…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="input lg:w-40" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">All classes</option>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="input lg:w-32" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">All genders</option>
            <option>Female</option>
            <option>Male</option>
          </select>
          <select className="input lg:w-32" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="">All</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Users className="h-6 w-6" />} title="No students found" description="Try a different search or clear the filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Student</th>
                    <th className="th">Class</th>
                    <th className="th hidden md:table-cell">Age</th>
                    <th className="th hidden lg:table-cell">House</th>
                    <th className="th hidden md:table-cell">Guardian</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((s) => (
                    <tr key={s.id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/students/${s.id}`)}>
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <Avatar first={s.firstName} last={s.lastName} size="sm" />
                          <div>
                            <Link href={`/students/${s.id}`} className="font-medium text-slate-900 hover:underline hover:decoration-gold-400 hover:decoration-2 hover:underline-offset-4" onClick={(e) => e.stopPropagation()}>
                              {s.firstName} {s.lastName}
                            </Link>
                            <p className="text-xs text-slate-500">{s.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="td">{classById.get(s.classId)?.name}</td>
                      <td className="td hidden md:table-cell">{ageFrom(s.dob)}</td>
                      <td className="td hidden lg:table-cell">{s.house}</td>
                      <td className="td hidden md:table-cell">
                        <p>{s.guardianName}</p>
                        <p className="text-xs text-slate-500">{s.guardianPhone}</p>
                      </td>
                      <td className="td">
                        <Badge tone={s.status === 'active' ? 'green' : 'gray'}>{s.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
              <span>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="secondary" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {adding && (
        <StudentFormModal
          open
          title="Admit a new student"
          onClose={() => setAdding(false)}
          onSubmit={(draft) => {
            const s = addStudent(draft)
            setAdding(false)
            setToast(`${s.firstName} ${s.lastName} admitted as ${s.studentId}`)
          }}
        />
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  )
}
