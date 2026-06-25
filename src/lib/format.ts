// Number formatting helpers.

// Compact form for big costs: 2_620_000 -> "2.62m", 103_000 -> "103k".
export function short(n: number): string {
  if (n >= 1_000_000) return trim(n / 1_000_000) + 'm'
  if (n >= 1_000) return trim(n / 1_000) + 'k'
  return String(n)
}

function trim(v: number): string {
  // up to 2 decimals, no trailing zeros
  return parseFloat(v.toFixed(2)).toString()
}

// Full grouped form: 2620000 -> "2,620,000".
export function comma(n: number): string {
  return n.toLocaleString('en-US')
}

// Parse a user-typed resource value. Accepts plain numbers and k/m suffixes.
export function parseInput(raw: string): number {
  const s = raw.trim().toLowerCase().replace(/,/g, '')
  if (s === '') return 0
  const m = s.match(/^([\d.]+)\s*([km])?$/)
  if (!m) return 0
  let v = parseFloat(m[1])
  if (m[2] === 'k') v *= 1_000
  else if (m[2] === 'm') v *= 1_000_000
  return Math.max(0, Math.round(v))
}
