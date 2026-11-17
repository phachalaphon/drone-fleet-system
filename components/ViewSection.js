'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import DataTable from '@/components/DataTable'

// แสดงผลจาก View หนึ่งตัวเป็นตาราง: view = ชื่อ View, order = [คอลัมน์, ascending]
export default function ViewSection({ title, view, columns, order, limit = 20 }) {
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let q = supabase.from(view).select('*').limit(limit)
    if (order) q = q.order(order[0], { ascending: order[1] })
    q.then(({ data, error }) => {
      if (error) setError(error.message)
      setRows(data ?? [])
      setLoading(false)
    })
  }, [view, order, limit])

  return (
    <section className="card">
      <h2>{title}</h2>
      <p className="muted small">จาก View: {view}</p>
      {error && <p className="error">โหลดข้อมูลไม่สำเร็จ: {error}</p>}
      {loading ? <p className="muted">กำลังโหลด...</p> : <DataTable columns={columns} rows={rows} />}
    </section>
  )
}
