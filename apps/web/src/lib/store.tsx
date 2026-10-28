'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { generateMockData } from './mock-data'
import type { AppData, AttendanceStatus, Payment, Role, School, Score, SessionUser, Staff, Student } from './types'
import { uid } from './utils'

/**
 * Frontend-only data layer. Everything lives in the browser (localStorage) so the
 * UI works without the API. When the backend is ready, swap these actions for
 * API calls (see lib/api.ts) without touching the pages.
 */

const DATA_KEY = 'joyprep:data:v1'
const SESSION_KEY = 'joyprep:session:v1'

export const DEMO_ACCOUNTS: (SessionUser & { password: string })[] = [
  { name: 'Mrs. Joyce Mensah', email: 'admin@joyprep.edu.gh', password: 'admin123', role: 'proprietor' },
  { name: 'Mr. Kofi Asante', email: 'head@joyprep.edu.gh', password: 'head123', role: 'headteacher' },
  { name: 'Ms. Ama Owusu', email: 'teacher@joyprep.edu.gh', password: 'teacher123', role: 'teacher' },
  { name: 'Mr. Yaw Boateng', email: 'accounts@joyprep.edu.gh', password: 'accounts123', role: 'accountant' },
]

export const ROLE_LABELS: Record<Role, string> = {
  proprietor: 'Proprietor',
  headteacher: 'Headteacher',
  teacher: 'Teacher',
  accountant: 'Accountant',
}

interface Store {
  ready: boolean
  data: AppData
  user: SessionUser | null
  login: (email: string, password: string) => boolean
  logout: () => void
  addStudent: (s: Omit<Student, 'id' | 'studentId'>) => Student
  updateStudent: (id: string, patch: Partial<Student>) => void
  addStaff: (s: Omit<Staff, 'id' | 'staffId'>) => void
  updateStaff: (id: string, patch: Partial<Staff>) => void
  setAttendance: (date: string, marks: Record<string, AttendanceStatus>) => void
  saveScores: (scores: Score[]) => void
  recordPayment: (p: Omit<Payment, 'id'>) => void
  updateSchool: (patch: Partial<School>) => void
  assignClassTeacher: (classId: string, teacherId: string) => void
  resetDemoData: () => void
}

const StoreContext = createContext<Store | null>(null)

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable: keep working in memory
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [data, setData] = useState<AppData>(() => generateMockData())
  const [user, setUser] = useState<SessionUser | null>(null)
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    const stored = load<AppData>(DATA_KEY)
    if (stored) setData(stored)
    setUser(load<SessionUser>(SESSION_KEY))
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) save(DATA_KEY, data)
  }, [data, ready])

  const login = useCallback((email: string, password: string) => {
    const acct = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password)
    if (!acct) return false
    const session: SessionUser = { name: acct.name, email: acct.email, role: acct.role }
    setUser(session)
    save(SESSION_KEY, session)
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    save(SESSION_KEY, null)
  }, [])

  const addStudent = useCallback((s: Omit<Student, 'id' | 'studentId'>) => {
    const year = String(new Date().getFullYear()).slice(2)
    const n = dataRef.current.students.length + 1
    const created: Student = { ...s, id: uid('stu-'), studentId: `JPS${year}${String(n).padStart(4, '0')}` }
    setData((d) => ({ ...d, students: [...d.students, created] }))
    return created
  }, [])

  const updateStudent = useCallback((id: string, patch: Partial<Student>) => {
    setData((d) => ({ ...d, students: d.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) }))
  }, [])

  const addStaff = useCallback((s: Omit<Staff, 'id' | 'staffId'>) => {
    setData((d) => {
      const n = d.staff.length + 1
      return { ...d, staff: [...d.staff, { ...s, id: uid('stf-'), staffId: `JPS-T${String(n).padStart(3, '0')}` }] }
    })
  }, [])

  const updateStaff = useCallback((id: string, patch: Partial<Staff>) => {
    setData((d) => ({ ...d, staff: d.staff.map((s) => (s.id === id ? { ...s, ...patch } : s)) }))
  }, [])

  const setAttendance = useCallback((date: string, marks: Record<string, AttendanceStatus>) => {
    setData((d) => ({ ...d, attendance: { ...d.attendance, [date]: { ...d.attendance[date], ...marks } } }))
  }, [])

  const saveScores = useCallback((incoming: Score[]) => {
    setData((d) => {
      const key = (s: Score) => `${s.studentId}|${s.subjectId}|${s.term}`
      const map = new Map(d.scores.map((s) => [key(s), s]))
      for (const s of incoming) map.set(key(s), s)
      return { ...d, scores: Array.from(map.values()) }
    })
  }, [])

  const recordPayment = useCallback((p: Omit<Payment, 'id'>) => {
    setData((d) => ({ ...d, payments: [...d.payments, { ...p, id: uid('pay-') }] }))
  }, [])

  const updateSchool = useCallback((patch: Partial<School>) => {
    setData((d) => ({ ...d, school: { ...d.school, ...patch } }))
  }, [])

  const assignClassTeacher = useCallback((classId: string, teacherId: string) => {
    setData((d) => ({
      ...d,
      classes: d.classes.map((c) => (c.id === classId ? { ...c, teacherId: teacherId || undefined } : c)),
    }))
  }, [])

  const resetDemoData = useCallback(() => setData(generateMockData()), [])

  const value = useMemo<Store>(
    () => ({
      ready,
      data,
      user,
      login,
      logout,
      addStudent,
      updateStudent,
      addStaff,
      updateStaff,
      setAttendance,
      saveScores,
      recordPayment,
      updateSchool,
      assignClassTeacher,
      resetDemoData,
    }),
    [ready, data, user, login, logout, addStudent, updateStudent, addStaff, updateStaff, setAttendance, saveScores, recordPayment, updateSchool, assignClassTeacher, resetDemoData],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
