import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'

export default async function EmployeesPage() {
  await requireAuth()

  const employees = await db.employee.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      contracts: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[15px] font-semibold text-[#e8e8e8]">Employees</h1>
        <Link href="/employees/new" className="bg-[#c8f04a] text-[#0e0f11] font-medium rounded-md px-3 py-2 text-[12px] hover:bg-[#d4f566]">
          + Add Employee
        </Link>
      </div>
      <div className="bg-[#0e0f11] border border-[#1e2025] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Employee', 'Department', 'Type', 'Status'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[9px] tracking-widest text-[#3a3d44] uppercase border-b border-[#1a1c20]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id} className="border-b border-[#13151a] last:border-none hover:bg-[#0b0c0e]">
                <td className="px-4 py-3">
                  <Link href={`/employees/${e.id}`} className="text-[12px] text-[#e8e8e8] hover:text-[#c8f04a]">
                    {e.firstName} {e.lastName}
                  </Link>
                  <p className="text-[10px] text-[#3a3d44]">{e.email}</p>
                </td>
                <td className="px-4 py-3 text-[11px] text-[#9a9fa8]">{e.department ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${e.employmentType === 'CONTRACTOR' ? 'bg-[#f0a84a22] text-[#f0a84a] border-[#f0a84a44]' : 'bg-[#4ac8f022] text-[#4ac8f0] border-[#4ac8f044]'}`}>
                    {e.employmentType === 'CONTRACTOR' ? 'Contractor' : 'Full employee'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${e.status === 'ACTIVE' ? 'bg-[#4ac87a22] text-[#4ac87a] border-[#4ac87a44]' : 'bg-[#f0707022] text-[#f07070] border-[#f0707044]'}`}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
