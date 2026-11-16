import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'ยังไม่ได้ตั้งค่า Supabase: สร้างไฟล์ .env.local แล้วใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY (ดู .env.local.example) แล้วรัน npm run dev ใหม่'
  )
}

export const supabase = createClient(url, key)
