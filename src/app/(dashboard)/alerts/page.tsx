import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(d: Date) {
  return Math.round((new Date(d).getTime() - Date.now()) / 86400000)
}

export default async function AlertsPage() {
  await requireAuth()

  const now = new Date()
  const in30 = new Date(); in30.setDate(in30.getDate() + 30)
  const in7 = new Date(); in7.setDate(in7.getDate() + 7)

  const [expiringContracts, noIdCard, inactiveWithAccess] = await Promise.all([
    db.contract.findMany({
      where: { endDate: { lte: in30, gte: now } },
      orderBy: { endDate: 'asc' },
      include: {
        employee: {
          select: {
            id: true, firstName: true, lastName: true,
            department: true, jobTitle: true, employmentType: true,
            contractorCompany: true,
          },
        },
      },
    }),
    db.employee.findMany({
      where: { status: 'ACTIVE', idCards: { none: {} } },
      select: { id: true, firstName: true, lastName: true, department: true, jobTitle: true },
    }),
    db.employee.findMany({
      where: {
        status: 'INACTIVE',
        accessPermissions: { some: { isActive: true } },
      },
      select: { id: true, firstName: true, lastName: true, department: true },
    }),
  ])

  const critical = expiringContracts.filter((c: any) => daysUntil(c.endDate) <= 7)
  const warning = expiringContracts.filter((c: any) => daysUntil(c.endDate) > 7)

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Critical (≤7 days)', count: critical.length, color: 'text-[#f07070]', bg: 'bg-[#f0707015] border-[#f0707033]' },
          { label: 'Warning (≤30 days)', count: warning.length, color: 'text-[#f0a84a]', bg: 'bg-[#f0a84a15] border-[#f0a84a33]' },
          { label: 'No ID card', count: noIdCard.length, color: 'text-[#9a9fa8]', bg: 'bg-[#1e202515] border-[#1e2025]' },
          { label: 'Inactive with access', count: inactiveWithAccess.length, color: 'text-[#f07070]', bg: 'bg-[#f0707015] border-[#f0707033]' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${s.bg}`}>
            <span className={`font-['Syne'] text-[18px] font-semibold ${s.color}`}>{s.count}</span>
            <span className="text-[11px] text-[#6b7080]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Critical expiry */}
      {critical.length > 0 && (
        <AlertSection
          title="Critical — expiring within 7 days"
          titleColor="text-[#f07070]"
          dotColor="bg-[#f07070]"
          contracts={critical}
        />
      )}

      {/* Warning expiry */}
      {warning.length > 0 && (
        <AlertSection
          title="Warning — expiring within 30 days"
          titleColor="text-[#f0a84a]"
          dotColor="bg-[#f0a84a]"
          contracts={warning}
        />
      )}

      {/* No ID card */}
      {noIdCard.length > 0 && (
        <div>
          <p className="text-[9px] tracking-widest text-[#3a3d44] uppercase mb-3">Missing ID cards</p>
          <div className="flex flex-col gap-2">
            {noIdCard.map(e => (
              <div key={e.id} className="bg-[#0e0f11] border border-[#1e2025] rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9a9fa8] shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#c8cad0]">{e.firstName} {e.lastName}</p>
                  <p className="text-[10px] text-[#4a4d54]">{e.jobTitle} · {e.department}</p>
                </div>
                <Link
                  href={`/employees/${e.id}/id-card`}
                  className="text-[10px] bg-[#c8f04a] text-[#0e0f11] font-medium px-3 py-1 rounded font-mono hover:bg-[#d4f566] transition-colors"
                >
                  Print card
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive with active access */}
      {inactiveWithAccess.length > 0 && (
        <div>
          <p className="text-[9px] tracking-widest text-[#3a3d44] uppercase mb-3">Inactive employees with active access</p>
          <div className="flex flex-col gap-2">
            {inactiveWithAccess.map(e => (
              <div key={e.id} className="bg-[#0e0f11] border border-[#f0707033] rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f07070] shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#c8cad0]">{e.firstName} {e.lastName}</p>
                  <p className="text-[10px] text-[#4a4d54]">{e.department}</p>
                </div>
                <Link
                  href={`/employees/${e.id}`}
                  className="text-[10px] border border-[#f0707044] text-[#f07070] px-3 py-1 rounded font-mono hover:bg-[#f0707011] transition-colors"
                >
                  Review access
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All clear */}
      {critical.length === 0 && warning.length === 0 && noIdCard.length === 0 && inactiveWithAccess.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#4ac87a] text-[14px] font-medium font-mono">All clear</p>
          <p className="text-[11px] text-[#3a3d44] mt-1">No alerts at this time.</p>
        </div>
      )}
    </div>
  )
}

function AlertSection({
  title, titleColor, dotColor, contracts,
}: {
  title: string
  titleColor: string
  dotColor: string
  contracts: any[]
}) {
  return (
    <div>
      <p className={`text-[9px] tracking-widest uppercase mb-3 ${titleColor}`}>{title}</p>
      <div className="flex flex-col gap-2">
        {contracts.map(c => {
          const days = daysUntil(c.endDate)
          return (
            <Link
              key={c.id}
              href={`/employees/${c.employee.id}`}
              className="bg-[#0e0f11] border border-[#1e2025] rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-[#0b0c0e] transition-colors"
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#c8cad0]">
                  {c.employee.firstName} {c.employee.lastName}
                </p>
                <p className="text-[10px] text-[#4a4d54]">
                  {c.employee.jobTitle}
                  {c.employee.contractorCompany ? ` · ${c.employee.contractorCompany}` : ''}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-[11px] font-medium ${days <= 7 ? 'text-[#f07070]' : 'text-[#f0a84a]'}`}>
                  {days} day{days !== 1 ? 's' : ''}
                </p>
                <p className="text-[10px] text-[#3a3d44]">
                  {new Date(c.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
