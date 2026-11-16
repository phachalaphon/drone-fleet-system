'use client'

import CrudPage from '@/components/CrudPage'
import { dateTh } from '@/lib/format'

const config = {
  title: 'ใบอนุญาตนักบิน',
  table: 'pilot_licenses',
  idKey: 'license_id',
  select: 'license_id, user_id, license_number, license_class, issued_date, expiry_date, status, users(full_name)',
  columns: [
    { key: 'license_number', label: 'เลขที่ใบอนุญาต' },
    { key: 'users', label: 'นักบิน', render: (v) => v?.full_name ?? '-' },
    { key: 'license_class', label: 'ชั้น' },
    { key: 'issued_date', label: 'วันที่ออก', render: dateTh },
    { key: 'expiry_date', label: 'วันหมดอายุ', render: dateTh },
    { key: 'status', label: 'สถานะ' },
  ],
  fields: [
    { name: 'user_id', label: 'นักบิน', required: true, optionsFrom: { table: 'users', value: 'user_id', label: 'full_name', filter: ['role', 'pilot'] } },
    { name: 'license_number', label: 'เลขที่ใบอนุญาต', required: true },
    { name: 'license_class', label: 'ชั้นใบอนุญาต' },
    { name: 'issued_date', label: 'วันที่ออก', type: 'date', required: true },
    { name: 'expiry_date', label: 'วันหมดอายุ', type: 'date', required: true },
    { name: 'status', label: 'สถานะ', type: 'select', required: true, default: 'active',
      options: ['active', 'expired', 'suspended'].map((s) => ({ value: s, label: s })) },
  ],
}

export default function Page() {
  return <CrudPage config={config} />
}
