export type Role = 'proprietor' | 'headteacher' | 'teacher' | 'accountant'

export interface SessionUser {
  name: string
  email: string
  role: Role
}

export interface School {
  name: string
  motto: string
  address: string
  phone: string
  email: string
  academicYear: string
  currentTerm: Term
}

export type Term = 'Term 1' | 'Term 2' | 'Term 3'

export interface ClassRoom {
  id: string
  name: string
  level: 'Pre-school' | 'Kindergarten' | 'Primary' | 'JHS'
  teacherId?: string
}

export interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  gender: 'Male' | 'Female'
  dob: string
  classId: string
  house: string
  guardianName: string
  guardianPhone: string
  address: string
  admissionDate: string
  status: 'active' | 'inactive'
}

export interface Staff {
  id: string
  staffId: string
  firstName: string
  lastName: string
  gender: 'Male' | 'Female'
  position: string
  department: string
  phone: string
  email: string
  joinedOn: string
}

export interface Subject {
  id: string
  name: string
  code: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late'

/** date (YYYY-MM-DD) -> studentId -> status */
export type AttendanceBook = Record<string, Record<string, AttendanceStatus>>

export interface Score {
  studentId: string
  subjectId: string
  term: Term
  classScore: number // out of 30
  examScore: number // out of 70
}

export interface Invoice {
  id: string
  invoiceNo: string
  studentId: string
  term: Term
  description: string
  amount: number
  dueDate: string
  createdAt: string
}

export type PaymentMethod = 'Cash' | 'Mobile Money' | 'Bank Transfer'

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: PaymentMethod
  reference: string
  date: string
}

export interface AppData {
  school: School
  classes: ClassRoom[]
  students: Student[]
  staff: Staff[]
  subjects: Subject[]
  attendance: AttendanceBook
  scores: Score[]
  invoices: Invoice[]
  payments: Payment[]
}
