# Drone Fleet System (AIE313)

## รันบนเครื่อง
1. ติดตั้ง Node.js 18+ แล้วเปิด terminal ในโฟลเดอร์นี้
2. `npm install`
3. คัดลอก `.env.local.example` เป็น `.env.local` แล้วใส่ URL กับ anon key จาก Supabase (Project Settings > API) ห้ามใส่ service_role key
4. ใน Supabase SQL Editor รัน `sql/extra_view.sql` 1 ครั้ง
5. `npm run dev` แล้วเปิด http://localhost:3000
6. สมัครสมาชิกที่หน้า Login (ถ้าเปิดยืนยันอีเมลไว้ ให้ยืนยันก่อน)

## หมายเหตุ
- หน้าภาพรวมอ่านจาก View: v_overdue_maintenance, v_low_stock_parts, v_drone_maintenance_cost
- ตอนนี้ RLS ปิดอยู่ ต้องเปิด RLS + ตั้ง policy ก่อน deploy จริง
