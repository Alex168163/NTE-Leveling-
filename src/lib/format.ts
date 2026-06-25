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

// Largest value any resource input accepts (100 million).
export const MAX_INPUT = 100_000_000

// Strip a leading "Colour / " from an XP-source label:
// "Green / Rising Hunter Guide" -> "Rising Hunter Guide".
export function cleanName(s: string): string {
  return s.includes('/') ? s.split('/').pop()!.trim() : s.trim()
}

// Parse a user-typed resource value. Accepts plain numbers and k/m suffixes,
// where k = thousand (1k = 1000) and m = million (1m = 1000000). Capped at 100m.
export function parseInput(raw: string): number {
  const s = raw.trim().toLowerCase().replace(/,/g, '')
  if (s === '') return 0
  const m = s.match(/^([\d.]+)\s*([km])?$/)
  if (!m) return 0
  let v = parseFloat(m[1])
  if (m[2] === 'k') v *= 1_000
  else if (m[2] === 'm') v *= 1_000_000
  if (!isFinite(v)) return 0
  return Math.min(MAX_INPUT, Math.max(0, Math.round(v)))
}

// Keep only characters that can form a valid resource entry: digits, one dot,
// and a single trailing k/m. Used to sanitise keystrokes in the inputs.
export function sanitizeResource(raw: string): string {
  let s = raw.replace(/[^\d.km]/gi, '')
  // collapse to: digits, optional single dot, optional single trailing k/m
  const m = s.match(/^(\d*\.?\d*)\s*([kmKM])?/)
  if (!m) return ''
  const suffix = m[2] ? m[2].toLowerCase() : ''
  return m[1] + suffix
}
