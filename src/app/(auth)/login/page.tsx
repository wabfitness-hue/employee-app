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
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email: email.toLowerCase(),
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password.')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-8 h-8 bg-[#c8f04a] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="#0e0f11" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="#0e0f11" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="#0e0f11" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="#0e0f11" opacity="0.4" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#e8e8e8]">StaffAccess</p>
            <p className="text-[10px] text-[#4a4d54] tracking-widest uppercase">Employee System</p>
          </div>
        </div>
        <div className="bg-[#0e0f11] border border-[#1e2025] rounded-xl p-6">
          <h1 className="text-[16px] font-semibold text-[#e8e8e8] mb-1">Sign in</h1>
          <p className="text-[11px] text-[#4a4d54] mb-6">Enter your credentials to continue</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest text-[#4a4d54] uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
