'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import DataTable from '@/components/DataTable'

/*
 config = {
   title, table, idKey, select,            // select = ข้อความ select ของ Supabase (ใส่ join ได้)
   columns: [{key,label,align,render}],    // คอลัมน์ในตาราง
   fields: [{ name,label,type,required,options,optionsFrom }]
     type: text | number | date | textarea | select
     options: [{value,label}]  หรือ  optionsFrom: {table,value,label,filter?}
 }
*/
export default function CrudPage({ config }) {
  const { title, table, idKey, select, columns, fields } = config
  const [rows, setRows] = useState([])
  const [opts, setOpts] = useState({})
  const [form, setForm] = useState(null) // null = ปิดฟอร์ม, {} = ฟอร์มเปิด
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(table)
      .select(select ?? '*')
      .order(idKey, { ascending: false })
    if (error) setError(error.message)
    setRows(data ?? [])
    setLoading(false)
  }, [table, idKey, select])

  useEffect(() => {
    load()
    fields.forEach(async (f) => {
      if (!f.optionsFrom) return
      const { table: t, value, label, filter } = f.optionsFrom
      let q = supabase.from(t).select(`${value}, ${label}`).order(label)
      if (filter) q = q.eq(filter[0], filter[1])
      const { data } = await q
      setOpts((o) => ({ ...o, [f.name]: (data ?? []).map((r) => ({ value: r[value], label: r[label] })) }))
    })
  }, [load, fields])

  const openNew = () => {
    const init = {}
    fields.forEach((f) => (init[f.name] = f.default ?? ''))
    setForm(init)
    setEditingId(null)
    setError(null)
  }

  const openEdit = (row) => {
    const init = {}
    fields.forEach((f) => {
      let v = row[f.name] ?? ''
      if (f.type === 'datetime-local' && v) {
        const d = new Date(v)
        const pad = (n) => String(n).padStart(2, '0')
        v = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      }
      init[f.name] = v
    })
    setForm(init)
    setEditingId(row[idKey])
    setError(null)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    // ค่าว่าง -> null, ตัวเลข -> number
    const payload = {}
    fields.forEach((f) => {
      const v = form[f.name]
      if (v === '' || v === undefined) payload[f.name] = null
      else if (f.type === 'number' || f.optionsFrom) payload[f.name] = Number(v)
      else if (f.type === 'datetime-local') payload[f.name] = new Date(v).toISOString()
      else payload[f.name] = v
    })
    const res = editingId
      ? await supabase.from(table).update(payload).eq(idKey, editingId)
      : await supabase.from(table).insert(payload)
    setSaving(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    setForm(null)
    setEditingId(null)
    load()
  }

  const remove = async (row) => {
    if (!window.confirm('ยืนยันการลบรายการนี้?')) return
    setError(null)
    const { error } = await supabase.from(table).delete().eq(idKey, row[idKey])
    if (error) setError(`ลบไม่ได้: ${error.message}`)
    else load()
  }

  const allColumns = [
    ...columns,
    {
      key: '_actions',
      label: '',
      render: (_v, row) => (
        <span style={{ display: 'flex', gap: 6 }}>
          <button className="btn" onClick={() => openEdit(row)}>แก้ไข</button>
          <button className="btn" onClick={() => remove(row)}>ลบ</button>
        </span>
      ),
    },
  ]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{title}</h1>
        <button className="btn primary" onClick={openNew}>+ เพิ่มรายการ</button>
      </div>
      {error && <p className="error">{error}</p>}

      {form && (
        <form className="card" onSubmit={save}>
          <h2>{editingId ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h2>
          <div className="grid">
            {fields.map((f) => {
              const val = form[f.name] ?? ''
              const set = (v) => setForm({ ...form, [f.name]: v })
              const list = f.options ?? opts[f.name] ?? []
              return (
                <label key={f.name}>
                  {f.label}
                  {f.type === 'select' || f.optionsFrom ? (
                    <select value={val} required={f.required} onChange={(e) => set(e.target.value)}>
                      <option value="">-- เลือก --</option>
                      {list.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea rows={3} value={val} onChange={(e) => set(e.target.value)} />
                  ) : (
                    <input
                      type={f.type ?? 'text'}
                      step={f.type === 'number' ? 'any' : undefined}
                      required={f.required}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                    />
                  )}
                </label>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
            <button type="button" className="btn" onClick={() => setForm(null)}>ยกเลิก</button>
          </div>
        </form>
      )}

      <section className="card">
        {loading ? <p className="muted">กำลังโหลด...</p> : <DataTable columns={allColumns} rows={rows} />}
      </section>
    </>
  )
}
