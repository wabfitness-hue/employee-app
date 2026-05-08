'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const initials = session?.user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  const navItems = [
    { label: 'Overview', href: '/', icon: 'grid' },
    { label: 'Employees', href: '/employees', icon: 'users' },
    { label: 'Access', href: '/access', icon: 'lock' },
    { label: 'Alerts', href: '/alerts', icon: 'alert' },
  ]

  const adminItems = [
    { label: 'Users', href: '/admin/users', icon: 'user' },
    { label: 'Zones', href: '/admin/zones', icon: 'building' },
  ]

  return (
    <aside className="w-[220px] shrink-0 bg-[#0e0f11] border-r border-[#1e2025] flex flex-col">
      <div className="px-[18px] py-5 border-b border-[#1e2025] flex items-center gap-2.5">
        <div className="w-7 h-7 bg-[#c8f04a] rounded-md flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="#0e0f11" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="#0e0f11" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="#0e0f11" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="#0e0f11" opacity="0.4" />
          </svg>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[#e8e8e8]">StaffAccess</div>
          <div className="text-[10px] text-[#4a4d54] tracking-widest">EMPLOYEE SYSTEM</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-2.5 mb-2">
          <p className="text-[9px] tracking-[0.12em] text-[#3a3d44] px-2 mb-1 uppercase">Main</p>
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md mb-px transition-colors text-[12px] ${
                  isActive ? 'bg-[#171a1e] text-[#e8e8e8]' : 'text-[#4a4d54] hover:bg-[#15171a] hover:text-[#9a9fa8]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {role === 'ADMIN' && (
          <div className="px-2.5 mb-2">
            <p className="text-[9px] tracking-[0.12em] text-[#3a3d44] px-2 mb-1 uppercase">Admin</p>
            {adminItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md mb-px transition-colors text-[12px] ${
                    isActive ? 'bg-[#171a1e] text-[#e8e8e8]' : 'text-[#4a4d54] hover:bg-[#15171a] hover:text-[#9a9fa8]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      <div className="border-t border-[#1e2025] p-2.5">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-[#15171a] cursor-pointer">
          <div className="w-[26px] h-[26px] rounded-full bg-[#1e2a14] border border-[#c8f04a44] flex items-center justify-center text-[10px] font-medium text-[#c8f04a] shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-[#9a9fa8] truncate">{session?.user?.email ?? 'User'}</div>
            <div className="text-[9px] text-[#3a3d44] tracking-widest uppercase">{role}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
