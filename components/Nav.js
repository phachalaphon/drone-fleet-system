'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Nav() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand"><strong>Drone Fleet</strong></Link>
        <nav className="links">
          <Link href="/missions">ภารกิจ</Link>
          <Link href="/flights">เที่ยวบิน</Link>
          <Link href="/bookings">การจอง</Link>
          <Link href="/licenses">ใบอนุญาต</Link>
          <Link href="/trainings">อบรม</Link>
          <Link href="/records">ใบงานซ่อม</Link>
          <Link href="/parts">อะไหล่</Link>
          <span className="muted">|</span>
          <Link href="/mission-analysis">วิเคราะห์ภารกิจ</Link>
          <Link href="/pilot-analysis">วิเคราะห์นักบิน</Link>
          <Link href="/">วิเคราะห์ซ่อมบำรุง</Link>
        </nav>
        <div className="nav-user">
          <span className="muted small">{email}</span>
          <button className="btn ghost" onClick={logout}>
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>
  )
}
