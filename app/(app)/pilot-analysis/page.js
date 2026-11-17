'use client'

import ViewSection from '@/components/ViewSection'
import { dateTh, num } from '@/lib/format'

const ORDER_LICENSE = ['days_left', true]
const ORDER_BOOKING = ['start_time', false]

export default function PilotAnalysis() {
  return (
    <>
      <h1>วิเคราะห์นักบินและการจอง</h1>
      <ViewSection
        title="ใบอนุญาตที่หมดอายุแล้วหรือใกล้หมดใน 90 วัน"
        view="v_license_expiring"
        order={ORDER_LICENSE}
        columns={[
          { key: 'full_name', label: 'นักบิน' },
          { key: 'license_number', label: 'เลขที่ใบอนุญาต' },
          { key: 'license_class', label: 'ชั้น' },
          { key: 'expiry_date', label: 'วันหมดอายุ', render: dateTh },
          { key: 'days_left', label: 'เหลือ (วัน)', align: 'right', render: num },
          { key: 'status', label: 'สถานะ' },
        ]}
      />
      <ViewSection
        title="รายละเอียดการจองโดรน"
        view="v_booking_detail"
        order={ORDER_BOOKING}
        columns={[
          { key: 'model', label: 'โดรน' },
          { key: 'booked_by', label: 'ผู้จอง' },
          { key: 'start_time', label: 'เริ่ม', render: dateTh },
          { key: 'end_time', label: 'สิ้นสุด', render: dateTh },
          { key: 'hours', label: 'ชั่วโมง', align: 'right', render: num },
          { key: 'purpose', label: 'วัตถุประสงค์' },
          { key: 'status', label: 'สถานะ' },
        ]}
      />
    </>
  )
}
