// Shows an XP amount expressed in the highest-tier XP material for that
// category — e.g. 6.51m Character XP ≈ 326~ Elite Hunter Guides. The count is
// always rounded UP (you need at least this many), and a "~" marks it as an
// estimate (in-game rounding means it won't be exact). Sits next to the XP icon
// as part of the XP display.
import { IconStack } from './IconStack'
import type { XpSource } from '../types'

// Clean material name from a source label like "Purple / Elite Hunter Guide".
function materialName(src: XpSource): string {
  return src.source.includes('/') ? src.source.split('/').pop()!.trim() : src.source
}

export function XpEquivalent({ xp, sources }: { xp: number; sources: XpSource[] }) {
  if (!xp || !sources.length) return null
  const highest = sources.reduce((a, b) => (b.xp > a.xp ? b : a))
  const name = materialName(highest)
  const count = Math.ceil(xp / highest.xp) // always round up
  const plural = count === 1 ? name : `${name}s`
  return (
    <span className="xp-equiv">
      ≈ <strong>{count}~</strong> {plural}
      <IconStack name={name} size={20} />
    </span>
  )
}
