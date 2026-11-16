'use client'

import CrudPage from '@/components/CrudPage'
import { dateTh, num } from '@/lib/format'

const config = {
  title: 'บันทึกเที่ยวบิน',
  table: 'flight_logs',
  idKey: 'flight_log_id',
  select: 'flight_log_id, mission_id, drone_id, pilot_id, takeoff_time, landing_time, flight_duration_min, distance_km, max_altitude_m, battery_used_pct, notes, missions(title), drones(model, serial_number), users(full_name)',
  columns: [
    { key: 'flight_log_id', label: 'เลขที่' },
    { key: 'missions', label: 'ภารกิจ', render: (v) => v?.title ?? '-' },
    { key: 'drones', label: 'โดรน', render: (v) => (v ? `${v.model} (${v.serial_number})` : '-') },
    { key: 'users', label: 'นักบิน', render: (v) => v?.full_name ?? '-' },
    { key: 'takeoff_time', label: 'ขึ้นบิน', render: dateTh },
    { key: 'flight_duration_min', label: 'นาที', align: 'right', render: num },
    { key: 'distance_km', label: 'กม.', align: 'right', render: num },
    { key: 'battery_used_pct', label: 'แบต %', align: 'right', render: num },
  ],
  fields: [
    { name: 'mission_id', label: 'ภารกิจ', required: true, optionsFrom: { table: 'missions', value: 'mission_id', label: 'title' } },
    { name: 'drone_id', label: 'โดรน', required: true, optionsFrom: { table: 'drones', value: 'drone_id', label: 'serial_number' } },
    { name: 'pilot_id', label: 'นักบิน', required: true, optionsFrom: { table: 'users', value: 'user_id', label: 'full_name', filter: ['role', 'pilot'] } },
    { name: 'takeoff_time', label: 'เวลาขึ้นบิน', type: 'datetime-local', required: true },
    { name: 'landing_time', label: 'เวลาลงจอด', type: 'datetime-local' },
    { name: 'flight_duration_min', label: 'ระยะเวลา (นาที)', type: 'number' },
    { name: 'distance_km', label: 'ระยะทาง (กม.)', type: 'number' },
    { name: 'max_altitude_m', label: 'ความสูงสูงสุด (ม.)', type: 'number' },
    { name: 'battery_used_pct', label: 'แบตที่ใช้ (%)', type: 'number' },
    { name: 'notes', label: 'หมายเหตุ', type: 'textarea' },
  ],
}

export default function Page() {
  return <CrudPage config={config} />
}
