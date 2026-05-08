import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'

export default async function DashboardPage() {
  await requireAuth()

  const now = new Date()
  const in30 = new Date()
  in30.setDate(in30.getDate() + 30)

  const [totalEmployees, totalContractors, expiringContracts, noIdCard] = await Promise.all([
    db.employee.count({ where: { status: 'ACTIVE' } }),
    db.employee.count({ where: { status: 'ACTIVE', employmentType: 'CONTRACTOR' } }),
    db.contract.count({ where: { endDate: { lte: in30, gte: now } } }),
    db.employee.count({ where: { status: 'ACTIVE', idCards: { none: {} } } }),
  ])

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total staff', value: totalEmployees, sub: 'Active employees' },
          { label: 'Contractors', value: totalContractors, sub: `${expiringContracts} expiring soon` },
          { label: 'Expiring soon', value: expiringContracts, sub: 'Within 30 days' },
          { label: 'No ID card', value: noIdCard, sub: 'Missing cards' },
        ].map(s => (
          <div key={s.label} className="bg-[#0e0f11] border border-[#1e2025] rounded-lg p-4">
            <p className="text-[10px] tracking-widest text-[#3a3d44] uppercase mb-2">{s.label}</p>
            <p className="text-[28px] font-semibold text-[#e8e8e8] leading-none">{s.value}</p>
            <p className="text-[10px] mt-1.5 text-[#4a4d54]">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="text-[12px] text-[#4a4d54]">
        <Link href="/employees" className="text-[#c8f04a] hover:underline">View all employees →</Link>
      </div>
    </div>
  )
}
