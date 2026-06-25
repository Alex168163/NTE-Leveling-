// Resolves a material name to ALL matching icon files. The spec requires that
// for any icon shown, every other icon "sharing the same name and color" is
// shown too — the generated icons.json already groups files that way, so this
// just maps a material label to the right group key.
import iconGroups from '../data/icons.json'
import gameData from '../data/gameData.json'

const groups = iconGroups as Record<string, string[]>
const nameToCategory = (gameData as { nameToCategory?: Record<string, string> }).nameToCategory ?? {}

// Each example-material category maps to its icon group. Ability-upgrade tiers
// use Green/Blue/Purple wording now (#16) but reuse the Bronze/Silver/Gold art.
const CATEGORY_ICON: Record<string, string> = {
  anomalyHunt: 'Anomaly Hunt Material',
  anomalyPilgrimage: 'Anomaly Pilgrimage Material',
  abilityGreen: 'Bronze Ability Upgrade',
  abilityBlue: 'Silver Ability Upgrade',
  abilityPurple: 'Gold Ability Upgrade',
  wdGreen: 'Green World Material',
  wdBlue: 'Blue World Material',
  wdPurple: 'Purple World Material',
}
const ABILITY_TIER_ICON: Record<string, string> = {
  green: 'Bronze Ability Upgrade',
  blue: 'Silver Ability Upgrade',
  purple: 'Gold Ability Upgrade',
}

// Asset URL prefixed with Vite's base so it resolves on web and in Electron.
const url = (rel: string) => `${import.meta.env.BASE_URL}${rel}`

// Map a free-form material name to a canonical icon-group key.
function resolveKey(name: string): string | null {
  const n = name.toLowerCase()

  // In-game named example material (e.g. "Black Hat") -> its category icon.
  const cat = nameToCategory[name] ?? nameToCategory[name.trim()]
  if (cat && CATEGORY_ICON[cat]) return CATEGORY_ICON[cat]

  // Cartridge/Module XP badge (distinct from the generic XP badge).
  if (/\bxp\b/.test(n) && /cartridge|module|manhole|c\/m/.test(n)) return 'CM-XP'

  if (n.includes('beetle') || n === 'coins' || n === 'coin') return 'Beetle Coins'
  if (n.includes('anomaly hunt')) return 'Anomaly Hunt Material'
  if (n.includes('anomaly pilgrimage')) return 'Anomaly Pilgrimage Material'
  if (n.includes('heterogeneous')) return 'Heterogeneous Unit'
  if (n.includes('expansion core')) return 'Expansion Core'

  const color = (n.match(/green|blue|purple|gold|silver|bronze/) || [])[0]
  const cap = color ? color[0].toUpperCase() + color.slice(1) : ''

  if (n.includes('world')) return color ? `${cap} World Material` : null
  if (n.includes('arc')) return color ? `${cap} Arc Material` : null
  if (n.includes('ability')) return color ? ABILITY_TIER_ICON[color] ?? null : null
  if (n.includes('cartridge')) return 'Cartridge'
  const mt = n.match(/type\s*(ii|iii|iv)\b/)
  if (n.includes('module') && mt) return `Module Type ${mt[1].toUpperCase()}`

  // XP sources
  if (n.includes('rising')) return 'Rising Hunter Guide'
  if (n.includes('senior')) return 'Senior Hunter Guide'
  if (n.includes('elite')) return 'Elite Hunter Guide'
  if (n.includes('light dye')) return 'Light Dye'
  if (n.includes('colorless')) return 'Colorless Dye'
  if (n.includes('chaotic')) return 'Chaotic Dye'
  if (n.includes('thug')) return 'Manholer Thug'
  if (n.includes('crook')) return 'Manhole Crook'
  if (n.includes('boss')) return 'Manhole Boss'
  if (n.includes('fons')) return 'Fons'

  // Direct key match (e.g. exact group names like "Dreamless Seed")
  const direct = Object.keys(groups).find((k) => k.toLowerCase() === n)
  if (direct) return direct

  // Generic XP fallback — use the green "XP" badge for anything XP-related
  // that has no dedicated art.
  if (/\bxp\b/.test(n) || n === 'xp') return 'XP'
  return null
}

// Returns every matching icon URL for a material name (possibly empty, e.g.
// for example-only materials like "Eternal Memory" which have no art).
export function iconsFor(name: string): string[] {
  const key = resolveKey(name)
  if (!key || !groups[key]) return []
  return groups[key].map(url)
}

export function backgroundUrl(): string {
  return url('assets/Background.jpg')
}
