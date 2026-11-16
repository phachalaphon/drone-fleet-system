-- View เพิ่มสำหรับหน้า Dashboard (ค่าบำรุงรักษารวมต่อโดรน) รันใน Supabase SQL Editor 1 ครั้ง
CREATE OR REPLACE VIEW v_drone_maintenance_cost AS
SELECT
  d.drone_id,
  d.model,
  COUNT(r.record_id)                                   AS jobs,
  SUM(r.labor_cost)                                    AS labor_total,
  COALESCE(SUM(pc.parts_cost), 0)                      AS parts_total,
  SUM(r.labor_cost) + COALESCE(SUM(pc.parts_cost), 0)  AS total_cost
FROM drones d
JOIN maintenance_records r ON r.drone_id = d.drone_id
LEFT JOIN (
  SELECT record_id, SUM(quantity * unit_cost) AS parts_cost
  FROM part_transactions
  WHERE txn_type = 'issue'
  GROUP BY record_id
) pc ON pc.record_id = r.record_id
WHERE r.status = 'completed'
GROUP BY d.drone_id, d.model;
