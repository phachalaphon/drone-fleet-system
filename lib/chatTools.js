// ชุด Tool ที่เปิดให้ LLM เรียก (เฉพาะอ่านข้อมูล SELECT เท่านั้น ไม่มี Tool เขียน/ลบ)
// ทุก Tool ทำงานในนามผู้ใช้ที่ล็อกอิน จึงถูกควบคุมด้วย RLS ของ Supabase

const MAX_ROWS = 30

const str = (d) => ({ type: 'STRING', description: d })
const int = (d) => ({ type: 'INTEGER', description: d })
const num = (d) => ({ type: 'NUMBER', description: d })

export const toolDeclarations = [
  {
    name: 'get_overdue_maintenance',
    description: 'งานตรวจ/ซ่อมบำรุงที่เลยกำหนดแล้วยังไม่ทำ (View v_overdue_maintenance) เรียงจากเลยนานสุด',
    parameters: { type: 'OBJECT', properties: { min_days_overdue: int('เลยกำหนดอย่างน้อยกี่วัน (ไม่บังคับ)') } },
  },
  {
    name: 'get_low_stock_parts',
    description: 'อะไหล่ที่สต๊อกต่ำกว่าหรือเท่ากับจุดสั่งซื้อ พร้อมซัพพลายเออร์ (View v_low_stock_parts)',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_drone_maintenance_cost',
    description: 'ค่าบำรุงรักษารวม (ค่าแรง+ค่าอะไหล่) ต่อโดรน เรียงจากมากไปน้อย (View v_drone_maintenance_cost)',
    parameters: { type: 'OBJECT', properties: { top_n: int('จำนวนอันดับ (ค่าเริ่มต้น 10)') } },
  },
  {
    name: 'get_mission_summary',
    description: 'สรุปภารกิจ: จำนวนเที่ยวบิน เวลาบินรวม ระยะทางรวม (View v_mission_flight_summary)',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: str('planned | ongoing | completed | cancelled'),
        province: str('จังหวัด'),
        mission_type: str('ประเภทภารกิจ เช่น survey, mapping, spraying, inspection, delivery'),
      },
    },
  },
  {
    name: 'get_incidents',
    description: 'อุบัติการณ์ระหว่างบิน พร้อมภารกิจ โดรน นักบิน (View v_incident_detail)',
    parameters: { type: 'OBJECT', properties: { severity: str('low | medium | high') } },
  },
  {
    name: 'get_expiring_licenses',
    description: 'ใบอนุญาตนักบินที่หมดอายุแล้วหรือจะหมดใน 90 วัน (View v_license_expiring)',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'get_bookings',
    description: 'รายละเอียดการจองโดรน (View v_booking_detail)',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: str('pending | approved | rejected | completed | cancelled'),
        model: str('ส่วนหนึ่งของชื่อรุ่นโดรน'),
      },
    },
  },
  {
    name: 'search_spare_parts',
    description: 'ค้นหาอะไหล่ในคลัง (ตาราง spare_parts) ตามคำค้น หมวด และช่วงราคา',
    parameters: {
      type: 'OBJECT',
      properties: {
        keyword: str('คำค้นในชื่ออะไหล่'),
        category: str('หมวดอะไหล่'),
        min_price: num('ราคาต่อหน่วยขั้นต่ำ (บาท)'),
        max_price: num('ราคาต่อหน่วยสูงสุด (บาท)'),
      },
    },
  },
  {
    name: 'search_drones',
    description: 'ค้นหาโดรน (ตาราง drones) ตามรุ่นและสถานะ',
    parameters: {
      type: 'OBJECT',
      properties: {
        keyword: str('ส่วนหนึ่งของชื่อรุ่น'),
        status: str('available | in_mission | maintenance | retired'),
      },
    },
  },
  {
    name: 'summarize_maintenance_by_category',
    description: 'สรุปงานซ่อมแยกตามประเภทงาน (preventive/corrective/inspection): จำนวนงาน ค่าแรงรวม ค่าแรงเฉลี่ย',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'summarize_parts_by_category',
    description: 'สรุปคลังอะไหล่แยกตามหมวด: จำนวนรายการ จำนวนชิ้นคงเหลือ มูลค่าสต๊อก',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'summarize_flights_by_pilot',
    description: 'สรุปเที่ยวบินแยกตามนักบิน: จำนวนเที่ยว เวลาบินรวม ระยะทางรวม',
    parameters: { type: 'OBJECT', properties: {} },
  },
]

const ENUMS = {
  mission_status: ['planned', 'ongoing', 'completed', 'cancelled'],
  severity: ['low', 'medium', 'high'],
  booking_status: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
  drone_status: ['available', 'in_mission', 'maintenance', 'retired'],
}
const okEnum = (v, list) => (list.includes(v) ? v : null)
// ตัดอักขระที่อาจแทรกเข้า filter ของ PostgREST
const clean = (s) => String(s ?? '').replace(/[%,()*\\]/g, '').trim().slice(0, 60)

const round = (n, d = 2) => Math.round(Number(n) * 10 ** d) / 10 ** d
const group = (rows, keyFn) => {
  const m = new Map()
  rows.forEach((r) => {
    const k = keyFn(r) ?? 'ไม่ระบุ'
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(r)
  })
  return m
}

// executor: คืน { source, rows }
export async function runTool(supabase, name, args = {}) {
  const a = args || {}
  const fail = (e) => {
    throw new Error(e.message)
  }

  switch (name) {
    case 'get_overdue_maintenance': {
      let q = supabase.from('v_overdue_maintenance').select('*').order('days_overdue', { ascending: false }).limit(MAX_ROWS)
      if (Number.isFinite(a.min_days_overdue)) q = q.gte('days_overdue', a.min_days_overdue)
      const { data, error } = await q
      if (error) fail(error)
      return { source: 'view v_overdue_maintenance', rows: data }
    }
    case 'get_low_stock_parts': {
      const { data, error } = await supabase.from('v_low_stock_parts').select('*').order('shortage', { ascending: false }).limit(MAX_ROWS)
      if (error) fail(error)
      return { source: 'view v_low_stock_parts', rows: data }
    }
    case 'get_drone_maintenance_cost': {
      const n = Math.min(Math.max(parseInt(a.top_n) || 10, 1), MAX_ROWS)
      const { data, error } = await supabase.from('v_drone_maintenance_cost').select('*').order('total_cost', { ascending: false }).limit(n)
      if (error) fail(error)
      return { source: 'view v_drone_maintenance_cost', rows: data }
    }
    case 'get_mission_summary': {
      let q = supabase.from('v_mission_flight_summary').select('*').order('flights', { ascending: false }).limit(MAX_ROWS)
      const st = okEnum(a.status, ENUMS.mission_status)
      if (st) q = q.eq('status', st)
      if (a.province) q = q.ilike('province', `%${clean(a.province)}%`)
      if (a.mission_type) q = q.ilike('mission_type', `%${clean(a.mission_type)}%`)
      const { data, error } = await q
      if (error) fail(error)
      return { source: 'view v_mission_flight_summary', rows: data }
    }
    case 'get_incidents': {
      let q = supabase.from('v_incident_detail').select('*').order('occurred_at', { ascending: false }).limit(MAX_ROWS)
      const sv = okEnum(a.severity, ENUMS.severity)
      if (sv) q = q.eq('severity', sv)
      const { data, error } = await q
      if (error) fail(error)
      return { source: 'view v_incident_detail', rows: data }
    }
    case 'get_expiring_licenses': {
      const { data, error } = await supabase.from('v_license_expiring').select('*').order('days_left', { ascending: true }).limit(MAX_ROWS)
      if (error) fail(error)
      return { source: 'view v_license_expiring', rows: data }
    }
    case 'get_bookings': {
      let q = supabase.from('v_booking_detail').select('*').order('start_time', { ascending: false }).limit(MAX_ROWS)
      const st = okEnum(a.status, ENUMS.booking_status)
      if (st) q = q.eq('status', st)
      if (a.model) q = q.ilike('model', `%${clean(a.model)}%`)
      const { data, error } = await q
      if (error) fail(error)
      return { source: 'view v_booking_detail', rows: data }
    }
    case 'search_spare_parts': {
      let q = supabase.from('spare_parts').select('part_code, part_name, category, unit_price, stock_qty, reorder_level').order('unit_price', { ascending: false }).limit(MAX_ROWS)
      if (a.keyword) q = q.ilike('part_name', `%${clean(a.keyword)}%`)
      if (a.category) q = q.ilike('category', `%${clean(a.category)}%`)
      if (Number.isFinite(a.min_price)) q = q.gte('unit_price', a.min_price)
      if (Number.isFinite(a.max_price)) q = q.lte('unit_price', a.max_price)
      const { data, error } = await q
      if (error) fail(error)
      return { source: 'table spare_parts', rows: data }
    }
    case 'search_drones': {
      let q = supabase.from('drones').select('drone_id, model, serial_number, drone_type, status, total_flight_hours').order('drone_id').limit(MAX_ROWS)
      if (a.keyword) q = q.ilike('model', `%${clean(a.keyword)}%`)
      const st = okEnum(a.status, ENUMS.drone_status)
      if (st) q = q.eq('status', st)
      const { data, error } = await q
      if (error) fail(error)
      return { source: 'table drones', rows: data }
    }
    case 'summarize_maintenance_by_category': {
      const { data, error } = await supabase.from('maintenance_records').select('labor_cost, maintenance_types(category)').limit(1000)
      if (error) fail(error)
      const g = group(data, (r) => r.maintenance_types?.category)
      const rows = [...g].map(([category, list]) => {
        const total = list.reduce((s, r) => s + Number(r.labor_cost || 0), 0)
        return { category, jobs: list.length, labor_total: round(total), labor_avg: round(total / list.length) }
      })
      return { source: 'maintenance_records JOIN maintenance_types GROUP BY category', rows }
    }
    case 'summarize_parts_by_category': {
      const { data, error } = await supabase.from('spare_parts').select('category, stock_qty, unit_price').limit(1000)
      if (error) fail(error)
      const g = group(data, (r) => r.category)
      const rows = [...g].map(([category, list]) => ({
        category,
        items: list.length,
        stock_units: list.reduce((s, r) => s + Number(r.stock_qty || 0), 0),
        stock_value: round(list.reduce((s, r) => s + Number(r.stock_qty || 0) * Number(r.unit_price || 0), 0)),
      }))
      return { source: 'spare_parts GROUP BY category', rows }
    }
    case 'summarize_flights_by_pilot': {
      const { data, error } = await supabase.from('flight_logs').select('flight_duration_min, distance_km, users(full_name)').limit(2000)
      if (error) fail(error)
      const g = group(data, (r) => r.users?.full_name)
      const rows = [...g]
        .map(([pilot, list]) => ({
          pilot,
          flights: list.length,
          total_minutes: round(list.reduce((s, r) => s + Number(r.flight_duration_min || 0), 0)),
          total_km: round(list.reduce((s, r) => s + Number(r.distance_km || 0), 0)),
        }))
        .sort((x, y) => y.flights - x.flights)
        .slice(0, MAX_ROWS)
      return { source: 'flight_logs JOIN users GROUP BY pilot', rows }
    }
    default:
      throw new Error(`ไม่รู้จัก Tool: ${name}`)
  }
}
