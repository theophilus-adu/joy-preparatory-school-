import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  const school = await prisma.school.upsert({
    where: { id: 'school-joyprep' },
    update: {},
    create: {
      id: 'school-joyprep',
      name: 'Joy Preparatory School',
      motto: 'Learn. Grow. Shine.',
      phone: '+233000000000',
      email: 'info@joyprep.edu.gh',
      website: 'https://joyprep.edu.gh',
    },
  })

  const [directorRole, headmasterRole, teacherRole, accountantRole, parentRole, studentRole] = await Promise.all(
    ['proprietor', 'headmaster', 'teacher', 'accountant', 'parent', 'student'].map(async (name) =>
      prisma.role.upsert({ where: { name }, update: {}, create: { name, label: name } })
    )
  )

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@joyprep.edu.gh' },
    update: {},
    create: {
      email: 'admin@joyprep.edu.gh',
      firstName: 'Admin',
      lastName: 'JoyPrep',
      password: 'CHANGEME',
    },
  })

  await prisma.userRole.upsert({
    where: { id: 'userrole-admin' },
    update: {},
    create: { id: 'userrole-admin', userId: adminUser.id, roleId: directorRole.id },
  })

  const ay = await prisma.academicYear.upsert({
    where: { name: '2025/2026' },
    update: {},
    create: { name: '2025/2026', startDate: new Date('2025-09-01'), endDate: new Date('2026-07-31'), isActive: true },
  })

  await prisma.term.upsert({
    where: { id: 'term-first-2025' },
    update: {},
    create: { id: 'term-first-2025', name: 'First Term', startDate: new Date('2025-09-01'), endDate: new Date('2025-12-15'), academicYearId: ay.id, isActive: true },
  })

  // Create basic classes and sections
  const basic1 = await prisma.class.upsert({ where: { id: 'class-basic-1' }, update: {}, create: { id: 'class-basic-1', name: 'Basic 1', level: 'primary' } })
  await prisma.section.upsert({ where: { id: 'class-basic-1-a' }, update: {}, create: { id: 'class-basic-1-a', name: 'Section A', classId: basic1.id } })

  // Houses
  await prisma.house.upsert({ where: { name: 'Red' }, update: {}, create: { name: 'Red' } })
  await prisma.house.upsert({ where: { name: 'Blue' }, update: {}, create: { name: 'Blue' } })
  await prisma.house.upsert({ where: { name: 'Green' }, update: {}, create: { name: 'Green' } })
  await prisma.house.upsert({ where: { name: 'Yellow' }, update: {}, create: { name: 'Yellow' } })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
