'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import DataTable from '@/components/DataTable'
import { baht, num, dateTh } from '@/lib/format'

export default function Dashboard() {
  const [overdue, setOverdue] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [cost, setCost] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [a, b, c] = await Promise.all([
        supabase.from('v_overdue_maintenance').select('*').order('days_overdue', { ascending: false }),
        supabase.from('v_low_stock_parts').select('*').order('shortage', { ascending: false }),
        supabase.from('v_drone_maintenance_cost').select('*').order('total_cost', { ascending: false }).limit(10),
      ])
      const err = a.error || b.error || c.error
      if (err) setError(err.message)
      setOverdue(a.data ?? [])
      setLowStock(b.data ?? [])
      setCost(c.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="muted">กำลังโหลดข้อมูล...</p>

  return (
    <>
      <h1>ภาพรวมระบบซ่อมบำรุงและคลังอะไหล่</h1>
      <p className="muted">ข้อมูลจาก View ใน Supabase</p>
      {error && <p className="error">โหลดข้อมูลไม่สำเร็จ: {error}</p>}

      <div className="grid">
        <div className="stat"><span className="muted">งานเลยกำหนด</span><b>{overdue.length}</b></div>
        <div className="stat"><span className="muted">อะไหล่ต้องสั่งเพิ่ม</span><b>{lowStock.length}</b></div>
      </div>

      <section className="card">
        <h2>งานตรวจ/ซ่อมที่เลยกำหนด</h2>
        <DataTable
          rows={overdue}
          columns={[
            { key: 'model', label: 'รุ่นโดรน' },
            { key: 'serial_number', label: 'Serial' },
            { key: 'type_name', label: 'ประเภทงาน' },
            { key: 'due_date', label: 'กำหนด', render: dateTh },
            { key: 'days_overdue', label: 'เลย (วัน)', align: 'right', render: num },
          ]}
        />
      </section>

      <section className="card">
        <h2>อะไหล่ที่สต๊อกต่ำ</h2>
        <DataTable
          rows={lowStock}
          columns={[
            { key: 'part_code', label: 'รหัส' },
            { key: 'part_name', label: 'ชื่ออะไหล่' },
            { key: 'stock_qty', label: 'คงเหลือ', align: 'right', render: num },
            { key: 'reorder_level', label: 'จุดสั่งซื้อ', align: 'right', render: num },
            { key: 'shortage', label: 'ขาด', align: 'right', render: num },
            { key: 'supplier_name', label: 'ซัพพลายเออร์' },
          ]}
        />
      </section>

      <section className="card">
        <h2>ค่าบำรุงรักษารวมต่อโดรน (10 อันดับ)</h2>
        <DataTable
          rows={cost}
          columns={[
            { key: 'model', label: 'รุ่นโดรน' },
            { key: 'jobs', label: 'จำนวนงาน', align: 'right', render: num },
            { key: 'labor_total', label: 'ค่าแรง', align: 'right', render: baht },
            { key: 'parts_total', label: 'ค่าอะไหล่', align: 'right', render: baht },
            { key: 'total_cost', label: 'รวม', align: 'right', render: baht },
          ]}
        />
      </section>
    </>
  )
}
