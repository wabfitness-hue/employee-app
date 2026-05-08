'use client'

import { useState, useTransition } from 'react'

type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER'

interface User {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  lastLoginAt: Date | null
}

export function UserTable({ users }: { users: User[] }) {
  return (
    <div style={{background:'#0e0f11',border:'1px solid #1e2025',borderRadius:'8px',overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr>
            {['Email','Role','Last login','Status',''].map(h => (
              <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:'9px',letterSpacing:'0.1em',color:'#3a3d44',textTransform:'uppercase',borderBottom:'1px solid #1a1c20'}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(u => <UserRow key={u.id} user={u} />)}
        </tbody>
      </table>
    </div>
  )
}

function UserRow({ user }: { user: User }) {
  const [active, setActive] = useState(user.isActive)

  return (
    <tr style={{borderBottom:'1px solid #13151a',opacity:active?1:0.5}}>
      <td style={{padding:'12px 16px',fontSize:'12px',color:'#e8e8e8'}}>{user.email}</td>
      <td style={{padding:'12px 16px'}}>
        <span style={{fontSize:'9px',fontWeight:'500',padding:'2px 8px',borderRadius:'10px',background:user.role==='ADMIN'?'#c8f04a22':'#1e2025',color:user.role==='ADMIN'?'#c8f04a':'#6b7080',border:`1px solid ${user.role==='ADMIN'?'#c8f04a44':'#2a2d34'}`}}>
          {user.role}
        </span>
      </td>
      <td style={{padding:'12px 16px',fontSize:'11px',color:'#6b7080'}}>
        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('en-GB') : 'Never'}
      </td>
      <td style={{padding:'12px 16px'}}>
        <span style={{fontSize:'9px',fontWeight:'500',padding:'2px 8px',borderRadius:'10px',background:active?'#4ac87a22':'#f0707022',color:active?'#4ac87a':'#f07070',border:`1px solid ${active?'#4ac87a44':'#f0707044'}`}}>
          {active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td style={{padding:'12px 16px'}}>
        {user.role !== 'ADMIN' && (
          <button
            onClick={() => setActive(!active)}
            style={{fontSize:'10px',padding:'4px 10px',borderRadius:'4px',border:`1px solid ${active?'#f0707044':'#4ac87a44'}`,color:active?'#f07070':'#4ac87a',background:'transparent',cursor:'pointer'}}
          >
            {active ? 'Deactivate' : 'Reactivate'}
          </button>
        )}
      </td>
    </tr>
  )
}
