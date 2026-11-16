'use client'

import CrudPage from '@/components/CrudPage'
import { baht, dateTh } from '@/lib/format'

const config = {
  title: 'ใบงานซ่อมบำรุง',
  table: 'maintenance_records',
  idKey: 'record_id',
  select:
    'record_id, drone_id, maint_type_id, mechanic_id, start_date, end_date, status, labor_cost, description, drones(model, serial_number), maintenance_types(type_name), users(full_name)',
  columns: [
    { key: 'record_id', label: 'เลขที่' },
    { key: 'drones', label: 'โดรน', render: (v) => (v ? `${v.model} (${v.serial_number})` : '-') },
    { key: 'maintenance_types', label: 'ประเภทงาน', render: (v) => v?.type_name ?? '-' },
    { key: 'users', label: 'ช่าง', render: (v) => v?.full_name ?? '-' },
    { key: 'start_date', label: 'เริ่ม', render: dateTh },
    { key: 'end_date', label: 'เสร็จ', render: dateTh },
    { key: 'status', label: 'สถานะ' },
    { key: 'labor_cost', label: 'ค่าแรง', align: 'right', render: baht },
  ],
  fields: [
    { name: 'drone_id', label: 'โดรน', required: true, optionsFrom: { table: 'drones', value: 'drone_id', label: 'serial_number' } },
    { name: 'maint_type_id', label: 'ประเภทงาน', required: true, optionsFrom: { table: 'maintenance_types', value: 'maint_type_id', label: 'type_name' } },
    { name: 'mechanic_id', label: 'ช่าง', required: true, optionsFrom: { table: 'users', value: 'user_id', label: 'full_name', filter: ['role', 'mechanic'] } },
    { name: 'start_date', label: 'วันที่เริ่ม', type: 'date', required: true },
    { name: 'end_date', label: 'วันที่เสร็จ', type: 'date' },
    {
      name: 'status', label: 'สถานะ', type: 'select', required: true, default: 'scheduled',
      options: ['scheduled', 'in_progress', 'completed', 'cancelled'].map((s) => ({ value: s, label: s })),
    },
    { name: 'labor_cost', label: 'ค่าแรง (บาท)', type: 'number', default: 0 },
    { name: 'description', label: 'รายละเอียด', type: 'textarea' },
  ],
}

export default function RecordsPage() {
  return <CrudPage config={config} />
}
