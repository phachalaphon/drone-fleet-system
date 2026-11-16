'use client'

import CrudPage from '@/components/CrudPage'
import { dateTh, num } from '@/lib/format'

const config = {
  title: 'การอบรมนักบิน',
  table: 'pilot_trainings',
  idKey: 'training_id',
  select: 'training_id, user_id, course_name, completed_date, training_hours, score, users(full_name)',
  columns: [
    { key: 'users', label: 'นักบิน', render: (v) => v?.full_name ?? '-' },
    { key: 'course_name', label: 'หลักสูตร' },
    { key: 'completed_date', label: 'วันที่จบ', render: dateTh },
    { key: 'training_hours', label: 'ชั่วโมง', align: 'right', render: num },
    { key: 'score', label: 'คะแนน', align: 'right', render: num },
  ],
  fields: [
    { name: 'user_id', label: 'นักบิน', required: true, optionsFrom: { table: 'users', value: 'user_id', label: 'full_name', filter: ['role', 'pilot'] } },
    { name: 'course_name', label: 'หลักสูตร', required: true },
    { name: 'completed_date', label: 'วันที่จบ', type: 'date' },
    { name: 'training_hours', label: 'ชั่วโมงอบรม', type: 'number' },
    { name: 'score', label: 'คะแนน (0-100)', type: 'number' },
  ],
}

export default function Page() {
  return <CrudPage config={config} />
}
