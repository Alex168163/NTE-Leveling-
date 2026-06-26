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

// Largest value any resource input accepts (999 million).
export const MAX_INPUT = 999_000_000

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

// Max characters allowed in any resource input box.
export const MAX_INPUT_CHARS = 7

// Uncapped numeric value of an already-sanitised string (for clamp checks).
function rawValue(s: string): number {
  const m = s.match(/^([\d.]+)\s*([km])?$/)
  if (!m) return 0
  let v = parseFloat(m[1])
  if (!isFinite(v)) return 0
  if (m[2] === 'k') v *= 1_000
  else if (m[2] === 'm') v *= 1_000_000
  return v
}

// Sanitise a keystroke into a valid resource entry: digits, one optional dot,
// and a single trailing k/m. Rules:
//  - must contain at least one digit (letters-only is rejected -> empty),
//  - at most 7 characters,
//  - the value can never exceed 999m (clamped to "999m").
export function sanitizeResource(raw: string): string {
  const s = raw.toLowerCase().replace(/[^\d.km]/g, '')
  const m = s.match(/^(\d*\.?\d*)\s*([km])?/)
  if (!m) return ''
  const digits = m[1]
  if (!/\d/.test(digits)) return '' // letters-only / no number -> invalid
  let out = digits + (m[2] || '')
  if (out.length > MAX_INPUT_CHARS) out = out.slice(0, MAX_INPUT_CHARS)
  if (rawValue(out) > MAX_INPUT) return '999m' // hard cap at 999m
  return out
}
