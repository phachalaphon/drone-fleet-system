'use client'

import CrudPage from '@/components/CrudPage'
import { dateTh } from '@/lib/format'

const STATUS = ['planned', 'ongoing', 'completed', 'cancelled'].map((s) => ({ value: s, label: s }))

const config = {
  title: 'ภารกิจ',
  table: 'missions',
  idKey: 'mission_id',
  select: 'mission_id, title, mission_type, location_id, planned_start, planned_end, status, created_by, locations(name, province), users(full_name)',
  columns: [
    { key: 'mission_id', label: 'เลขที่' },
    { key: 'title', label: 'ชื่อภารกิจ' },
    { key: 'mission_type', label: 'ประเภท' },
    { key: 'locations', label: 'สถานที่', render: (v) => (v ? `${v.name} (${v.province ?? '-'})` : '-') },
    { key: 'planned_start', label: 'เริ่ม', render: dateTh },
    { key: 'planned_end', label: 'สิ้นสุด', render: dateTh },
    { key: 'status', label: 'สถานะ' },
    { key: 'users', label: 'ผู้สร้าง', render: (v) => v?.full_name ?? '-' },
  ],
  fields: [
    { name: 'title', label: 'ชื่อภารกิจ', required: true },
    { name: 'mission_type', label: 'ประเภทภารกิจ' },
    { name: 'location_id', label: 'สถานที่', required: true, optionsFrom: { table: 'locations', value: 'location_id', label: 'name' } },
    { name: 'planned_start', label: 'เริ่มตามแผน', type: 'datetime-local' },
    { name: 'planned_end', label: 'สิ้นสุดตามแผน', type: 'datetime-local' },
    { name: 'status', label: 'สถานะ', type: 'select', required: true, default: 'planned', options: STATUS },
    { name: 'created_by', label: 'ผู้สร้าง', required: true, optionsFrom: { table: 'users', value: 'user_id', label: 'full_name' } },
  ],
}

export default function Page() {
  return <CrudPage config={config} />
}
