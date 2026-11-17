'use client'

import ViewSection from '@/components/ViewSection'
import { dateTh, num } from '@/lib/format'

const ORDER_MISSION = ['flights', false]
const ORDER_INCIDENT = ['occurred_at', false]

export default function MissionAnalysis() {
  return (
    <>
      <h1>วิเคราะห์ภารกิจและเที่ยวบิน</h1>
      <ViewSection
        title="สรุปภารกิจ (จำนวนเที่ยวบิน เวลา และระยะทาง)"
        view="v_mission_flight_summary"
        order={ORDER_MISSION}
        columns={[
          { key: 'title', label: 'ภารกิจ' },
          { key: 'mission_type', label: 'ประเภท' },
          { key: 'location_name', label: 'สถานที่' },
          { key: 'province', label: 'จังหวัด' },
          { key: 'status', label: 'สถานะ' },
          { key: 'flights', label: 'เที่ยวบิน', align: 'right', render: num },
          { key: 'total_minutes', label: 'รวม (นาที)', align: 'right', render: num },
          { key: 'total_km', label: 'รวม (กม.)', align: 'right', render: num },
        ]}
      />
      <ViewSection
        title="อุบัติการณ์ระหว่างบิน"
        view="v_incident_detail"
        order={ORDER_INCIDENT}
        columns={[
          { key: 'occurred_at', label: 'เวลา', render: dateTh },
          { key: 'severity', label: 'ระดับ' },
          { key: 'mission_title', label: 'ภารกิจ' },
          { key: 'drone_model', label: 'โดรน' },
          { key: 'pilot_name', label: 'นักบิน' },
          { key: 'description', label: 'รายละเอียด' },
        ]}
      />
    </>
  )
}
