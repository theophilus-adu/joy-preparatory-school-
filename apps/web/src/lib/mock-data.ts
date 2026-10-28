import type {
  AppData,
  AttendanceBook,
  ClassRoom,
  Invoice,
  Payment,
  PaymentMethod,
  Score,
  Staff,
  Student,
  Subject,
} from './types'
import { recentSchoolDays, toISODate } from './utils'

// Small deterministic PRNG so the demo data is stable between reloads/resets.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const MALE_NAMES = ['Kwame', 'Kofi', 'Kwabena', 'Yaw', 'Kwaku', 'Kojo', 'Kwasi', 'Nana', 'Emmanuel', 'Daniel', 'Samuel', 'Prince', 'Elikem', 'Selorm', 'Nii', 'Fiifi', 'Jeremiah', 'Caleb', 'Joshua', 'Benjamin']
const FEMALE_NAMES = ['Ama', 'Akua', 'Abena', 'Yaa', 'Afua', 'Adwoa', 'Esi', 'Efua', 'Akosua', 'Naa', 'Abigail', 'Priscilla', 'Mavis', 'Delali', 'Esinam', 'Grace', 'Joy', 'Nhyira', 'Maame', 'Elorm']
const SURNAMES = ['Mensah', 'Owusu', 'Boateng', 'Asante', 'Osei', 'Agyeman', 'Appiah', 'Addo', 'Quaye', 'Tetteh', 'Ansah', 'Darko', 'Amoah', 'Frimpong', 'Acheampong', 'Badu', 'Danso', 'Gyamfi', 'Kumi', 'Lartey', 'Nkansah', 'Ofori', 'Sarpong', 'Yeboah', 'Agbeko', 'Dzidzornu']
const AREAS = ['Adenta', 'Madina', 'East Legon', 'Haatso', 'Ashongman', 'Dome', 'Kwabenya', 'Taifa', 'Pokuase', 'Oyarifa']
export const HOUSES = ['Aggrey', 'Nkrumah', 'Yaa Asantewaa', 'Guggisberg']

const CLASS_DEFS: Pick<ClassRoom, 'name' | 'level'>[] = [
  { name: 'Creche', level: 'Pre-school' },
  { name: 'Nursery 1', level: 'Pre-school' },
  { name: 'Nursery 2', level: 'Pre-school' },
  { name: 'KG 1', level: 'Kindergarten' },
  { name: 'KG 2', level: 'Kindergarten' },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ name: `Basic ${n}`, level: 'Primary' as const })),
  ...[1, 2, 3].map((n) => ({ name: `JHS ${n}`, level: 'JHS' as const })),
]

// Approx. age of a child in each class, used to generate plausible birth dates.
const CLASS_AGE = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

const SUBJECTS: Subject[] = [
  { id: 'sub-eng', name: 'English Language', code: 'ENG' },
  { id: 'sub-mat', name: 'Mathematics', code: 'MAT' },
  { id: 'sub-sci', name: 'Science', code: 'SCI' },
  { id: 'sub-soc', name: 'Social Studies', code: 'SOC' },
  { id: 'sub-rme', name: 'Religious & Moral Ed.', code: 'RME' },
  { id: 'sub-ict', name: 'Computing', code: 'ICT' },
  { id: 'sub-twi', name: 'Ghanaian Language', code: 'GHL' },
  { id: 'sub-cad', name: 'Creative Arts & Design', code: 'CAD' },
]

const STAFF_POSITIONS: [string, string][] = [
  ['Headteacher', 'Administration'],
  ['Assistant Headteacher', 'Administration'],
  ['Accountant', 'Finance'],
  ['Administrator', 'Administration'],
  ['Librarian', 'Academic'],
  ['School Nurse', 'Health'],
]

export const FEES_BY_LEVEL: Record<ClassRoom['level'], number> = {
  'Pre-school': 1200,
  Kindergarten: 1450,
  Primary: 1800,
  JHS: 2200,
}

export function generateMockData(): AppData {
  const rand = mulberry32(20260901)
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]
  const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
  const phone = () => `0${pick(['24', '54', '55', '20', '50', '27'])}${int(1000000, 9999999)}`

  // --- Staff: one class teacher per class plus admin roles
  const staff: Staff[] = []
  const makeStaff = (position: string, department: string): Staff => {
    const gender = rand() < 0.6 ? 'Female' : 'Male'
    const firstName = pick(gender === 'Male' ? MALE_NAMES : FEMALE_NAMES)
    const lastName = pick(SURNAMES)
    const n = staff.length + 1
    return {
      id: `stf-${n}`,
      staffId: `JPS-T${String(n).padStart(3, '0')}`,
      firstName,
      lastName,
      gender,
      position,
      department,
      phone: phone(),
      email: `${firstName}.${lastName}`.toLowerCase() + '@joyprep.edu.gh',
      joinedOn: toISODate(new Date(int(2012, 2025), int(0, 11), int(1, 28))),
    }
  }
  for (const [pos, dept] of STAFF_POSITIONS) staff.push(makeStaff(pos, dept))

  const classes: ClassRoom[] = CLASS_DEFS.map((c, i) => {
    const teacher = makeStaff('Class Teacher', c.level === 'JHS' ? 'JHS' : c.level === 'Primary' ? 'Primary' : 'Early Years')
    staff.push(teacher)
    return { id: `cls-${i + 1}`, ...c, teacherId: teacher.id }
  })

  // --- Students
  const students: Student[] = []
  const thisYear = new Date().getFullYear()
  classes.forEach((cls, ci) => {
    const count = int(9, 15)
    for (let i = 0; i < count; i++) {
      const gender = rand() < 0.5 ? 'Female' : 'Male'
      const lastName = pick(SURNAMES)
      const n = students.length + 1
      const birthYear = thisYear - CLASS_AGE[ci]
      students.push({
        id: `stu-${n}`,
        studentId: `JPS${String(thisYear).slice(2)}${String(n).padStart(4, '0')}`,
        firstName: pick(gender === 'Male' ? MALE_NAMES : FEMALE_NAMES),
        lastName,
        gender,
        dob: toISODate(new Date(birthYear, int(0, 11), int(1, 28))),
        classId: cls.id,
        house: pick(HOUSES),
        guardianName: `${rand() < 0.5 ? 'Mr.' : 'Mrs.'} ${pick(rand() < 0.5 ? MALE_NAMES : FEMALE_NAMES)} ${lastName}`,
        guardianPhone: phone(),
        address: `${pick(AREAS)}, Accra`,
        admissionDate: toISODate(new Date(thisYear - int(0, Math.min(ci, 6)), 8, int(1, 15))),
        status: rand() < 0.97 ? 'active' : 'inactive',
      })
    }
  })

  // --- Attendance for the last 15 school days (excluding today so it can be marked live)
  const attendance: AttendanceBook = {}
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  for (const day of recentSchoolDays(15, yesterday)) {
    attendance[day] = {}
    for (const s of students) {
      if (s.status !== 'active') continue
      const r = rand()
      attendance[day][s.id] = r < 0.9 ? 'present' : r < 0.95 ? 'late' : 'absent'
    }
  }

  // --- Scores for Basic 1 and up, current term
  const scores: Score[] = []
  const gradedClassIds = new Set(classes.filter((c) => c.level === 'Primary' || c.level === 'JHS').map((c) => c.id))
  for (const s of students) {
    if (!gradedClassIds.has(s.classId)) continue
    const ability = 0.45 + rand() * 0.45
    for (const sub of SUBJECTS) {
      const a = Math.min(0.98, Math.max(0.2, ability + (rand() - 0.5) * 0.25))
      scores.push({
        studentId: s.id,
        subjectId: sub.id,
        term: 'Term 1',
        classScore: Math.round(30 * a),
        examScore: Math.round(70 * Math.min(0.99, a + (rand() - 0.5) * 0.15)),
      })
    }
  }

  // --- Fees: one invoice per active student for the current term, with mixed payment progress
  const invoices: Invoice[] = []
  const payments: Payment[] = []
  const methods: PaymentMethod[] = ['Mobile Money', 'Mobile Money', 'Cash', 'Bank Transfer']
  const termStart = new Date(thisYear, 8, 9)
  const dueDate = new Date(thisYear, 9, 10)
  students
    .filter((s) => s.status === 'active')
    .forEach((s, i) => {
      const cls = classes.find((c) => c.id === s.classId)!
      const inv: Invoice = {
        id: `inv-${i + 1}`,
        invoiceNo: `INV-${thisYear}-${String(i + 1).padStart(4, '0')}`,
        studentId: s.id,
        term: 'Term 1',
        description: `${cls.name} school fees`,
        amount: FEES_BY_LEVEL[cls.level],
        dueDate: toISODate(dueDate),
        createdAt: toISODate(termStart),
      }
      invoices.push(inv)
      const r = rand()
      const plan = r < 0.55 ? [1] : r < 0.8 ? [0.5, 0.5] : r < 0.9 ? [0.5] : []
      plan.forEach((frac, k) => {
        const d = new Date(termStart)
        d.setDate(d.getDate() + int(0, 20) + k * 21)
        if (d > new Date()) return
        payments.push({
          id: `pay-${payments.length + 1}`,
          invoiceId: inv.id,
          amount: Math.round(inv.amount * frac),
          method: pick(methods),
          reference: `TXN${int(10000000, 99999999)}`,
          date: toISODate(d),
        })
      })
    })

  return {
    school: {
      name: 'Joy Preparatory School',
      motto: 'Knowledge, Discipline and Joy',
      address: 'P.O. Box AD 123, Adenta, Accra',
      phone: '030 255 1234',
      email: 'info@joyprep.edu.gh',
      academicYear: `${thisYear}/${thisYear + 1}`,
      currentTerm: 'Term 1',
    },
    classes,
    students,
    staff,
    subjects: SUBJECTS,
    attendance,
    scores,
    invoices,
    payments,
  }
}
