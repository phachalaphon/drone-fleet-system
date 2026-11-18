'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const EXAMPLES = [
  'มีอะไหล่อะไรบ้างที่ราคาเกิน 5,000 บาท',
  'โดรนเครื่องไหนค้างตรวจเกินกำหนดนานที่สุด',
  'ค่าบำรุงรักษารวมแยกตามประเภทงานเป็นเท่าไร',
  'ใบอนุญาตนักบินใครใกล้หมดอายุ',
]

function Evidence({ items }) {
  if (!items?.length) return null
  return (
    <div style={{ marginTop: 8 }}>
      {items.map((e, i) => {
        const cols = e.rows?.[0] ? Object.keys(e.rows[0]) : []
        return (
          <details key={i} style={{ marginTop: 6 }}>
            <summary className="small">
              หลักฐาน: Tool <b>{e.tool}</b> ({e.source}) • {e.rows?.length ?? 0} แถว
            </summary>
            <p className="small muted">พารามิเตอร์: {JSON.stringify(e.args)}</p>
            {e.error && <p className="error small">{e.error}</p>}
            {cols.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {e.rows.map((r, j) => (
                      <tr key={j}>{cols.map((c) => <td key={c}>{String(r[c] ?? '-')}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </details>
        )
      })}
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]) // {role, text, evidence?}
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottom = useRef(null)

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')
    const next = [...messages, { role: 'user', text: q }]
    setMessages(next)
    setLoading(true)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, text: m.text })) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'เกิดข้อผิดพลาด')
      setMessages([...next, { role: 'assistant', text: json.answer, evidence: json.evidence }])
    } catch (e) {
      setMessages([...next, { role: 'assistant', text: `⚠ ${e.message}` }])
    }
    setLoading(false)
  }

  return (
    <>
      <h1>Chat สอบถามข้อมูล</h1>
      <p className="muted">ถามเป็นภาษาไทยหรืออังกฤษ ระบบจะดึงข้อมูลจริงจากฐานข้อมูลและแสดง Tool ที่ใช้เป็นหลักฐาน</p>

      <section className="card">
        {messages.length === 0 && (
          <div>
            <p className="muted">ลองถาม เช่น</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EXAMPLES.map((e) => (
                <button key={e} className="btn" onClick={() => send(e)}>{e}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '12px 0', textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <div
              style={{
                display: 'inline-block',
                maxWidth: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                background: m.role === 'user' ? '#2563eb' : '#eef2f7',
                color: m.role === 'user' ? '#fff' : 'inherit',
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.text}
            </div>
            {m.role === 'assistant' && <Evidence items={m.evidence} />}
          </div>
        ))}
        {loading && <p className="muted">กำลังประมวลผล...</p>}
        <div ref={bottom} />
      </section>

      <form
        style={{ display: 'flex', gap: 8 }}
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input
          style={{ flex: 1 }}
          value={input}
          maxLength={500}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำถาม..."
        />
        <button className="btn primary" disabled={loading}>ส่ง</button>
      </form>
    </>
  )
}
