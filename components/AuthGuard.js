'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

// ครอบหน้าที่ต้อง Login ก่อนใช้งาน ถ้ายังไม่ Login จะเด้งไปหน้า /login
export default function AuthGuard({ children }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (!data.session) router.replace('/login')
      else setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login')
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [router])

  if (!ready) return <p className="muted center pad">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
  return children
}
