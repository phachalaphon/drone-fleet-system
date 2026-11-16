'use client'

import CrudPage from '@/components/CrudPage'
import { baht, num } from '@/lib/format'

const config = {
  title: 'คลังอะไหล่',
  table: 'spare_parts',
  idKey: 'part_id',
  select: 'part_id, part_name, part_code, category, supplier_id, unit_price, stock_qty, reorder_level, suppliers(supplier_name)',
  columns: [
    { key: 'part_code', label: 'รหัส' },
    { key: 'part_name', label: 'ชื่ออะไหล่' },
    { key: 'category', label: 'หมวด' },
    { key: 'suppliers', label: 'ซัพพลายเออร์', render: (v) => v?.supplier_name ?? '-' },
    { key: 'unit_price', label: 'ราคา/หน่วย', align: 'right', render: baht },
    { key: 'stock_qty', label: 'คงเหลือ', align: 'right', render: num },
    { key: 'reorder_level', label: 'จุดสั่งซื้อ', align: 'right', render: num },
  ],
  fields: [
    { name: 'part_code', label: 'รหัสอะไหล่', required: true },
    { name: 'part_name', label: 'ชื่ออะไหล่', required: true },
    { name: 'category', label: 'หมวด' },
    { name: 'supplier_id', label: 'ซัพพลายเออร์', required: true, optionsFrom: { table: 'suppliers', value: 'supplier_id', label: 'supplier_name' } },
    { name: 'unit_price', label: 'ราคา/หน่วย (บาท)', type: 'number', required: true },
    { name: 'stock_qty', label: 'จำนวนคงเหลือ', type: 'number', required: true, default: 0 },
    { name: 'reorder_level', label: 'จุดสั่งซื้อซ้ำ', type: 'number', required: true, default: 5 },
  ],
}

export default function PartsPage() {
  return <CrudPage config={config} />
}
