import { PrismaClient, EmploymentType, EmployeeStatus, UserRole, AccessLevel } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const zones = await Promise.all([
    db.buildingZone.upsert({ where: { id: 'zone-main' }, update: {}, create: { id: 'zone-main', name: 'Main entrance', floor: 'Ground' } }),
    db.buildingZone.upsert({ where: { id: 'zone-f1' }, update: {}, create: { id: 'zone-f1', name: 'Floor 1 - General', floor: 'Floor 1' } }),
    db.buildingZone.upsert({ where: { id: 'zone-f2' }, update: {}, create: { id: 'zone-f2', name: 'Floor 2 - Operations', floor: 'Floor 2' } }),
    db.buildingZone.upsert({ where: { id: 'zone-server' }, update: {}, create: { id: 'zone-server', name: 'Server room', floor: 'Basement' } }),
    db.buildingZone.upsert({ where: { id: 'zone-car' }, update: {}, create: { id: 'zone-car', name: 'Car park - Level B', floor: 'Basement' } }),
  ])

  const adminHash = await bcrypt.hash('admin1234', 12)
  const admin = await db.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: { email: 'admin@company.com', passwordHash: adminHash, role: UserRole.ADMIN, isActive: true },
  })

  const managerHash = await bcrypt.hash('manager1234', 12)
  await db.user.upsert({
    where: { email: 'manager@company.com' },
    update: {},
    create: { email: 'manager@company.com', passwordHash: managerHash, role: UserRole.MANAGER, isActive: true },
  })

  const viewerHash = await bcrypt.hash('viewer1234', 12)
  await db.user.upsert({
    where: { email: 'viewer@company.com' },
    update: {},
    create: { email: 'viewer@company.com', passwordHash: viewerHash, role: UserRole.VIEWER, isActive: true },
  })

  console.log('Created users')

  const employees = [
    { firstName: 'James', lastName: 'Mitchell', email: 'james.mitchell@supplierco.com', jobTitle: 'Site Engineer', department: 'Operations', type: EmploymentType.CONTRACTOR, contractorCompany: 'Supplier Co. Ltd', daysFromNow: 45 },
    { firstName: 'Sara', lastName: 'Reeves', email: 'sara.reeves@company.com', jobTitle: 'Operations Lead', department: 'Operations', type: EmploymentType.FULL_EMPLOYEE, daysFromNow: 365 * 4 },
    { firstName: 'Kofi', lastName: 'Owusu', email: 'kofi.owusu@company.com', jobTitle: 'Security Officer', department: 'Security', type: EmploymentType.FULL_EMPLOYEE, daysFromNow: 365 * 3 },
    { firstName: 'Laura', lastName: 'Patel', email: 'laura.patel@buildtech.com', jobTitle: 'IT Technician', department: 'IT', type: EmploymentType.CONTRACTOR, contractorCompany: 'BuildTech Ltd', daysFromNow: 6 },
    { firstName: 'Mark', lastName: 'Thompson', email: 'mark.thompson@siteworks.com', jobTitle: 'Facilities Manager', department: 'Facilities', type: EmploymentType.CONTRACTOR, contractorCompany: 'SiteWorks', daysFromNow: 22 },
    { firstName: 'Aisha', lastName: 'Kamara', email: 'aisha.kamara@company.com', jobTitle: 'HR Coordinator', department: 'HR', type: EmploymentType.FULL_EMPLOYEE, daysFromNow: 365 * 2 },
  ]

  for (const emp of employees) {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + emp.daysFromNow)

    const created = await db.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        firstName: emp.firstName, lastName: emp.lastName, email: emp.email,
        jobTitle: emp.jobTitle, department: emp.department,
        employmentType: emp.type, status: EmployeeStatus.ACTIVE,
        contractorCompany: emp.contractorCompany ?? null,
        contracts: { create: { contractType: emp.type, startDate, endDate, durationMonths: emp.type === EmploymentType.CONTRACTOR ? 6 : 60 } },
      },
    })

    for (const zoneId of ['zone-main', 'zone-f1']) {
      await db.accessPermission.upsert({
        where: { employeeId_zoneId: { employeeId: created.id, zoneId } },
        update: {},
        create: { employeeId: created.id, zoneId, accessLevel: AccessLevel.FULL, grantedDate: startDate, grantedBy: admin.id, isActive: true },
      })
    }
  }

  console.log('Done. Login: admin@company.com / admin1234')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
