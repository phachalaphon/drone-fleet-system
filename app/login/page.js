'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'error' | 'info', text }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: `เข้าสู่ระบบไม่สำเร็จ: ${error.message}` })
      } else {
        router.replace('/')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage({ type: 'error', text: `สมัครไม่สำเร็จ: ${error.message}` })
      } else if (data.session) {
        router.replace('/')
      } else {
        setMessage({
          type: 'info',
          text: 'สมัครสำเร็จ กรุณายืนยันอีเมลก่อน (ถ้าเปิดระบบยืนยันอีเมลไว้) แล้วกลับมาเข้าสู่ระบบ',
        })
      }
    }
    setLoading(false)
  }

  return (
    <div className="login-wrap">
      <form className="card login" onSubmit={submit}>
        <h1>Drone Fleet</h1>
        <p className="muted">ระบบจัดการฝูงโดรนและภารกิจ</p>

        <label>
          อีเมล
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          รหัสผ่าน
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="อย่างน้อย 6 ตัวอักษร"
          />
        </label>

        {message && <p className={message.type === 'error' ? 'error' : 'info'}>{message.text}</p>}

        <button className="btn primary" disabled={loading}>
          {loading ? 'กำลังดำเนินการ...' : mode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </button>

        <button
          type="button"
          className="btn link"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setMessage(null)
          }}
        >
          {mode === 'signin' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  )
}
