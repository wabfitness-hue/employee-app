import React from 'react'
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
      },
    },
  })

  const totalPermissions = zones.reduce((sum: number, z: typeof zones[0]) => sum + z.accessPermissions.length, 0)
  const restrictedZones = zones.filter(z => z.accessPermissions.some(p => p.accessLevel === 'ESCORT_ONLY')).length

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0e0f11] border border-[#1e2025] rounded-lg px-4 py-3">
          <p className="text-[10px] tracking-widest text-[#3a3d44] uppercase mb-1">Total zones</p>
          <p className="text-[22px] font-semibold text-[#e8e8e8]">{zones.length}</p>
        </div>
        <div className="bg-[#0e0f11] border border-[#1e2025] rounded-lg px-4 py-3">
          <p className="text-[10px] tracking-widest text-[#3a3d44] uppercase mb-1">Total permissions</p>
          <p className="text-[22px] font-semibold text-[#e8e8e8]">{totalPermissions}</p>
        </div>
        <div className="bg-[#0e0f11] border border-[#1e2025] rounded-lg px-4 py-3">
          <p className="text-[10px] tracking-widest text-[#3a3d44] uppercase mb-1">Restricted zones</p>
          <p className="text-[22px] font-semibold text-[#e8e8e8]">{restrictedZones}</p>
        </div>
      </div>

      {zones.map(zone => (
        <div key={zone.id} className="bg-[#0e0f11] border border-[#1e2025] rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1c20]">
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[#e8e8e8]">{zone.name}</p>
              <p className="text-[10px] text-[#4a4d54]">{zone.floor ?? 'No floor'}</p>
            </div>
            <span className="text-[10px] text-[#4a4d54]">{zone.accessPermissions.length} people</span>
          </div>
          {zone.accessPermissions.length === 0 ? (
            <p className="px-4 py-3 text-[11px] text-[#3a3d44]">No active access permissions.</p>
          ) : (
            <div>
              {zone.accessPermissions.map(p => (
                <Link
                  key={p.id}
                  href={`/employees/${p.employee.id}`}
                  className="flex items-center gap-3 px-4 py-3 border-t border-[#1a1c20] hover:bg-[#131416] transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-[12px] text-[#e8e8e8]">{p.employee.firstName} {p.employee.lastName}</p>
                    <p className="text-[10px] text-[#4a4d54]">{p.employee.jobTitle ?? p.employee.employmentType}</p>
                  </div>
                  <span className="text-[10px] text-[#4a4d54]">{p.accessLevel}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
