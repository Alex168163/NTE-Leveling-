// Resolves a material name to ALL matching icon files. The spec requires that
// for any icon shown, every other icon "sharing the same name and color" is
// shown too — the generated icons.json already groups files that way, so this
// just maps a material label to the right group key.
import iconGroups from '../data/icons.json'

const groups = iconGroups as Record<string, string[]>

// Asset URL prefixed with Vite's base so it resolves on web and in Electron.
const url = (rel: string) => `${import.meta.env.BASE_URL}${rel}`

// Map a free-form material name to a canonical icon-group key.
function resolveKey(name: string): string | null {
  const n = name.toLowerCase()

  if (n.includes('beetle') || n === 'coins' || n === 'coin') return 'Beetle Coins'
  if (n.includes('anomaly hunt')) return 'Anomaly Hunt Material'
  if (n.includes('anomaly pilgrimage')) return 'Anomaly Pilgrimage Material'

  const color = (n.match(/green|blue|purple|gold|silver|bronze/) || [])[0]
  const cap = color ? color[0].toUpperCase() + color.slice(1) : ''

  if (n.includes('world')) return color ? `${cap} World Material` : null
  if (n.includes('arc')) return color ? `${cap} Arc Material` : null
  if (n.includes('ability')) return color ? `${cap} Ability Upgrade` : null

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

  // Direct key match fallback (e.g. exact group names)
  const direct = Object.keys(groups).find((k) => k.toLowerCase() === n)
  return direct ?? null
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
