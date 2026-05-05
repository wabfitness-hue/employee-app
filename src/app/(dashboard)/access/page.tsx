import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'

export default async function AccessPage() {
  await requireAuth()

  const zones = await db.buildingZone.findMany({
    where: { isActive: true },
    orderBy: { floor: 'asc' },
    include: {
      accessPermissions: {
        where: { isActive: true },
        include: {
          employee: {
            select: {
              id: true, firstName: true, lastName: true,
              jobTitle: true, employmentType: true, status: true,
            },
          },
        },
        orderBy: { grantedDate: 'desc' },
      },
    },
  })

  return (
    <div className="flex flex-col gap-4 max-w-4xl">

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0e0f11] border border-[#1e2025] rounded-lg px-4 py-3">
          <p className="text-[10px] tracking-widest text-[#3a3d44] uppercase mb-1">Total zones</p>
          <p className="font-['Syne'] text-[22px] font-semibold text-[#e8e8e8]">{zones.length}</p>
        </div>
        <div className="bg-[#0e0f11] border border-[#1e2025] rounded-lg px-4 py-3">
          <p className="text-[10px] tracking-widest text-[#3a3d44] uppercase mb-1">Total permissions</p>
          <p className="font-['Syne'] text-[22px] font-semibold text-[#e8e8e8]">
            {zones.reduce((acc, z) => acc + z.accessPermissions.length, 0)}
          </p>
        </div>
        <div className="bg-[#0e0f11] border border-[#1e2025] rounded-lg px-4 py-3">
          <p className="text-[10px] tracking-widest text-[#3a3d44] uppercase mb-1">Restricted zones</p>
          <p className="font-['Syne'] text-[22px] font-semibold text-[#e8e8e8]">
            {zones.filter(z => z.accessPermissions.some(p => p.accessLevel === 'ESCORT_ONLY')).length}
          </p>
        </div>
      </div>

      {/* Zone cards */}
      {zones.map(zone => (
        <div key={zone.id} className="bg-[#0e0f11] border border-[#1e2025] rounded-lg overflow-hidden">
          {/* Zone header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1c20]">
            <div className="w-8 h-8 rounded-md bg-[#1e2025] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#6b7080]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="2" y="2" width="12" height="13" rx="1" />
                <path d="M5 15V9h6v6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#e8e8e8]">{zone.name}</p>
              <p className="text-[10px] text-[#4a4d54]">
                {zone.floor ?? 'No floor'}
                {zone.description ? ` · ${zone.description}` : ''}
              </p>
            </div>
            <span className="text-[10px] text-[#4a4d54] font-mono shrink-0">
              {zone.accessPermissions.length} {zone.accessPermissions.length === 1 ? 'person' : 'people'}
            </span>
          </div>

          {/* Access list */}
          {zone.accessPermissions.length === 0 ? (
            <p className="px-4 py-3 text-[11px] text-[#3a3d44]">No active access permissions.</p>
          ) : (
            <div className="divide-y divide-[#13151a]">
              {zone.accessPermissions.map(p => {
                const isContractor = p.employee.employmentType === 'CONTRACTOR'
                const isInactive = p.employee.status === 'INACTIVE'
                const initials =
                  (p.employee.firstName[0] ?? '').toUpperCase() +
                  (p.employee.lastName[0] ?? '').toUpperCase()
                return (
                  <Link
                    key={p.id}
                    href={`/employees/${p.employee.id}`}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-[#0b0c0e] transition-colors ${isInactive ? 'opacity-50' : ''}`}
                  >
                    <div className="w-6 h-8 rounded bg-[#1a2030] border border-[#2a3040] flex items-center justify-center text-[9px] font-medium text-[#6080c0] shrink-0 font-['Syne']">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[#c8cad0]">
                        {p.employee.firstName} {p.employee.lastName}
                        {isInactive && <span className="text-[#f07070] ml-1">(inactive)</span>}
                      </p>
                      <p className="text-[10px] text-[#3a3d44]">{p.employee.jobTitle}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Access level */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${
                        p.accessLevel === 'ESCORT_ONLY'
                          ? 'bg-[#f0a84a22] text-[#f0a84a] border-[#f0a84a44]'
                          : 'bg-[#4ac87a22] text-[#4ac87a] border-[#4ac87a44]'
                      }`}>
                        {p.accessLevel === 'ESCORT_ONLY' ? 'Escort only' : 'Full access'}
                      </span>
                      {/* Employee type */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                        isContractor
                          ? 'bg-[#f0a84a22] text-[#f0a84a] border-[#f0a84a44]'
                          : 'bg-[#4ac8f022] text-[#4ac8f0] border-[#4ac8f044]'
                      }`}>
                        {isContractor ? 'Contractor' : 'Full'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
