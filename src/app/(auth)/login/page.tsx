'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password.')
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0b0c0e',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'360px',background:'#0e0f11',border:'1px solid #1e2025',borderRadius:'12px',padding:'24px'}}>
        <h1 style={{color:'#e8e8e8',marginBottom:'20px'}}>Sign in to StaffAccess</h1>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required style={{background:'#0b0c0e',border:'1px solid #1e2025',borderRadius:'6px',padding:'10px',color:'#e8e8e8'}} />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required style={{background:'#0b0c0e',border:'1px solid #1e2025',borderRadius:'6px',padding:'10px',color:'#e8e8e8'}} />
          {error && <p style={{color:'#f07070',fontSize:'12px'}}>{error}</p>}
          <button type="submit" disabled={loading} style={{background:'#c8f04a',color:'#0e0f11',border:'none',borderRadius:'6px',padding:'10px',fontWeight:'500',cursor:'pointer'}}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
