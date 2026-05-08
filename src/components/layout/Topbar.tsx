'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const pageMeta: Record<string, { title: string; action?: { label: string; href: string } }> = {
  '/': { title: 'Overview' },
  '/employees': { title: 'Employees', action: { label: '+ Add Employee', href: '/employees/new' } },
  '/employees/new': { title: 'Add Employee' },
  '/access': { title: 'Access Control' },
  '/alerts': { title: 'Alerts' },
  '/admin/users': { title: 'User Management' },
  '/admin/zones': { title: 'Building Zones' },
}

export function Topbar() {
  const pathname = usePathname()
  const meta = pageMeta[pathname] ?? { title: '' }

  return (
    <header className="h-[52px] border-b border-[#1a1c20] flex items-center px-5 gap-3 shrink-0 bg-[#0b0c0e]">
      <span className="text-[11px] text-[#3a3d44] font-mono">StaffAccess</span>
      <span className="text-[#2a2d34] text-[11px]">/</span>
      <span className="text-[14px] font-semibold text-[#e8e8e8]">{meta.title}</span>
      <div className="ml-auto flex items-center gap-2">
        {meta.action && (
          <Link
            href={meta.action.href}
            className="flex items-center gap-1.5 text-[11px] bg-[#c8f04a] text-[#0e0f11] font-medium rounded-md px-3 py-1.5 hover:bg-[#d4f566] transition-colors font-mono"
          >
            {meta.action.label}
          </Link>
        )}
      </div>
    </header>
  )
}
