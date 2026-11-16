const numberFmt = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 })

export const baht = (v) =>
  v === null || v === undefined ? '-' : `฿${numberFmt.format(Number(v))}`

export const num = (v) =>
  v === null || v === undefined ? '-' : numberFmt.format(Number(v))

export const dateTh = (v) => {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}
