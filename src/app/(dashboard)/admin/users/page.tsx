import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { UserTable } from '@/components/admin/UserTable'

export default async function UsersPage() {
  await requireRole(['ADMIN'])

  const users = await db.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      employee: { select: { firstName: true, lastName: true, jobTitle: true } },
    },
  })

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Syne'] text-[15px] font-semibold text-[#e8e8e8]">System users</h2>
          <p className="text-[11px] text-[#4a4d54] mt-0.5">Accounts that can log into StaffAccess</p>
        </div>
        <InviteButton />
      </div>
      <UserTable users={users} />
    </div>
  )
}

function InviteButton() {
  // Client component would handle the modal — stubbed here
  return (
    <button className="flex items-center gap-1.5 bg-[#c8f04a] text-[#0e0f11] font-medium rounded-md px-3 py-2 text-[12px] font-mono hover:bg-[#d4f566] transition-colors">
      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M7 2v10M2 7h10" />
      </svg>
      Invite user
    </button>
  )
}
