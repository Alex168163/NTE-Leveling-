// Maps a material display name to the canonical resource key used by the shared
// store. The same physical resource resolves to the SAME key everywhere it
// appears (e.g. Beetle Coins, or "Green World Drop Material" on the Characters,
// Arcs, and Abilities tabs), so entering it once fills it in everywhere.
//
// XP-source counts (hunter guides / dyes / manholes) are category-specific and
// use their own prefixed keys built directly in the calculators, so they don't
// collide across tabs.
export function resourceKeyForMaterial(name: string): string {
  const n = name.toLowerCase()

  if (n.includes('beetle')) return 'coins'
  if (n.includes('anomaly hunt')) return 'anomalyHunt'
  if (n.includes('anomaly pilgrimage')) return 'anomalyPilgrimage'

  if (n.includes('heterogeneous')) return 'heterogeneousUnit'
  if (n.includes('expansion core')) return 'expansionCore'

  const color = (n.match(/green|blue|purple/) || [])[0]
  const cap = color ? color[0].toUpperCase() + color.slice(1) : ''
  // Ability upgrades now use Green/Blue/Purple wording (#16).
  if (n.includes('ability')) return color ? `ability:${cap}` : 'ability'
  if (n.includes('world')) return color ? `wd:${cap}` : 'wd'
  if (n.includes('arc')) return color ? `arc:${cap}` : 'arc'

  if (n.includes('dreamless')) return 'dreamlessSeed'
  if (n.includes('fons')) return 'fons'

  // Fallback: a stable slug so unknown materials still persist & share by name.
  return 'mat:' + name.trim().toLowerCase().replace(/\s+/g, '-')
}
