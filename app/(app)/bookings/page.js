'use client'

import CrudPage from '@/components/CrudPage'
import { dateTh } from '@/lib/format'

const config = {
  title: 'การจองโดรน',
  table: 'bookings',
  idKey: 'booking_id',
  select: 'booking_id, drone_id, user_id, mission_id, start_time, end_time, purpose, status, drones(model, serial_number), users(full_name)',
  columns: [
    { key: 'booking_id', label: 'เลขที่' },
    { key: 'drones', label: 'โดรน', render: (v) => (v ? `${v.model} (${v.serial_number})` : '-') },
    { key: 'users', label: 'ผู้จอง', render: (v) => v?.full_name ?? '-' },
    { key: 'start_time', label: 'เริ่ม', render: dateTh },
    { key: 'end_time', label: 'สิ้นสุด', render: dateTh },
    { key: 'purpose', label: 'วัตถุประสงค์' },
    { key: 'status', label: 'สถานะ' },
  ],
  fields: [
    { name: 'drone_id', label: 'โดรน', required: true, optionsFrom: { table: 'drones', value: 'drone_id', label: 'serial_number' } },
    { name: 'user_id', label: 'ผู้จอง', required: true, optionsFrom: { table: 'users', value: 'user_id', label: 'full_name' } },
    { name: 'mission_id', label: 'ภารกิจ (ไม่บังคับ)', optionsFrom: { table: 'missions', value: 'mission_id', label: 'title' } },
    { name: 'start_time', label: 'เวลาเริ่ม', type: 'datetime-local', required: true },
    { name: 'end_time', label: 'เวลาสิ้นสุด', type: 'datetime-local', required: true },
    { name: 'purpose', label: 'วัตถุประสงค์' },
    { name: 'status', label: 'สถานะ', type: 'select', required: true, default: 'pending',
      options: ['pending', 'approved', 'rejected', 'completed', 'cancelled'].map((s) => ({ value: s, label: s })) },
  ],
}

export default function Page() {
  return <CrudPage config={config} />
}
