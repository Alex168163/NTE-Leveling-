// ---------------------------------------------------------------------------
// parse-md.mjs — Source-of-truth pipeline.
//
// NTE_Leveling.md is the single source of truth for every cost in this app.
// This script parses its markdown tables into src/data/gameData.json, which
// the React app imports. Editing the markdown and re-running `npm run gen:data`
// (or any dev/build, which runs it automatically) propagates changes to the UI.
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MD_PATH = join(ROOT, 'NTE_Leveling.md')
const UPD_PATH = join(ROOT, 'NTE Update', 'NTE_Update.md')
const OUT_PATH = join(ROOT, 'src', 'data', 'gameData.json')
const ICONS_PATH = join(ROOT, 'src', 'data', 'icons.json')
const ASSETS_DIR = join(ROOT, 'public', 'assets')

// Two sources of truth: the base reference and the update. Both are parsed.
const md = readFileSync(MD_PATH, 'utf8')
const upd = readFileSync(UPD_PATH, 'utf8')

// --- number parsing -------------------------------------------------------
// "103k" -> 103000, "1.6m" -> 1600000, "26,000" -> 26000, "—"/"-" -> 0
function num(raw) {
  if (raw == null) return 0
  const s = String(raw).trim().toLowerCase().replace(/,/g, '')
  if (s === '' || s === '—' || s === '-' || s === '–') return 0
  const m = s.match(/([\d.]+)\s*([km])?/)
  if (!m) return 0
  let v = parseFloat(m[1])
  if (m[2] === 'k') v *= 1_000
  else if (m[2] === 'm') v *= 1_000_000
  return Math.round(v)
}

// "5x Green" -> { qty:5, color:"Green" }; "2x" -> { qty:2, color:null };
// "—" -> { qty:0, color:null }
function mat(raw) {
  const s = String(raw ?? '').trim()
  if (s === '' || s === '—' || s === '-' || s === '–') return { qty: 0, color: null }
  const m = s.match(/([\d.,]+)\s*x?\s*(green|blue|purple|gold|silver|bronze)?/i)
  if (!m) return { qty: 0, color: null }
  const qty = num(m[1])
  const color = m[2] ? m[2][0].toUpperCase() + m[2].slice(1).toLowerCase() : null
  return { qty, color }
}

// --- table extraction -----------------------------------------------------
// Find the first markdown table that appears after a heading whose text
// contains `headingNeedle`. Returns array of row objects keyed by header cells.
function tableAfter(headingNeedle, src = md) {
  const lines = src.split(/\r?\n/)
  let i = lines.findIndex(
    (l) => /^#{1,6}\s/.test(l) && l.toLowerCase().includes(headingNeedle.toLowerCase()),
  )
  if (i === -1) throw new Error(`Heading not found: ${headingNeedle}`)

  // advance to the header row of the next table
  while (i < lines.length && !lines[i].trim().startsWith('|')) i++
  if (i >= lines.length) throw new Error(`No table after heading: ${headingNeedle}`)

  const cells = (l) =>
    l
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim())

  const headers = cells(lines[i])
  i += 2 // skip header + separator row
  const rows = []
  for (; i < lines.length && lines[i].trim().startsWith('|'); i++) {
    const vals = cells(lines[i])
    const row = {}
    headers.forEach((h, idx) => (row[h] = vals[idx] ?? ''))
    rows.push(row)
  }
  return rows
}

// Parse a "Level Range" string like "70–80" / "1-20" -> { from, to }
function range(s) {
  const m = String(s).match(/(\d+)\s*[–-]\s*(\d+)/)
  return m ? { from: +m[1], to: +m[2] } : { from: 0, to: 0 }
}
function ascRange(s) {
  const m = String(s).match(/(\d+)\s*[→>-]+\s*(\d+)/)
  return m ? { from: +m[1], to: +m[2] } : { from: 0, to: 0 }
}

// --- build the data object ------------------------------------------------
const data = {}

// Ascension caps
data.ascensionCaps = tableAfter('Ascension Level Caps').map((r) => ({
  ascension: num(r['Ascension'].replace(/ascend/i, '')),
  unlocksTo: num(r['Unlocks Leveling To']),
}))

// Characters
data.characters = {
  leveling: tableAfter('Characters')
    .filter((r) => r['Level Range'])
    .map((r) => ({ ...range(r['Level Range']), xp: num(r['XP']), coins: num(r['Coins']) })),
  ascension: tableAfter('Character Ascension Upgrade Costs').map((r) => ({
    ...ascRange(r['Ascension']),
    coins: num(r['Beetle Coins']),
    anomalyHunt: mat(r['Anomaly Hunt Material']).qty,
    worldDrop: mat(r['World Drop Material']),
  })),
}

// Arcs
data.arcs = {
  leveling: tableAfter('Arcs')
    .filter((r) => r['Level Range'])
    .map((r) => ({
      ...range(r['Level Range']),
      xp: num(r['XP']),
      coins: num(r['Coins']),
      ascendCoins: num(r['Ascend Coins']),
    })),
  ascension: tableAfter('Arc Ascension Upgrade Costs').map((r) => ({
    ...ascRange(r['Ascension']),
    coins: num(r['Beetle Coins']),
    arcMat: mat(r['Arc Material']),
    worldDrop: mat(r['World Drop Material']),
  })),
}

// Cartridges & Modules
const cm = (needle) =>
  tableAfter(needle).map((r) => ({
    rarity: r['Rarity'],
    maxLevel: num(r['Max Level']),
    xp: num(r['XP']),
    coins: num(r['Coins']),
  }))
// #1 (update): only Gold cartridges/modules going forward — drop the Purples.
data.cartridges = cm('Cost to Upgrade Cartridges').filter((r) => /gold/i.test(r.rarity))
data.modules = cm('Cost to Upgrade Modules').filter((r) => /gold/i.test(r.rarity))

// Abilities (progression checker)
const abilityRows = (needle) =>
  tableAfter(needle).map((r) => ({
    material: r['Material'].replace(/^\*example:\*\s*/i, '').trim(),
    isExample: /\*example:\*/i.test(r['Material']),
    amount: num(r['Amount']),
  }))
data.abilities = {
  perSkill: abilityRows('Base Attack'),
  passive1: abilityRows('Passive Skill 1'),
  passive2: abilityRows('Passive Skill 2'),
}

// Life skills
data.lifeSkills = tableAfter('All Life Skills on One Character').map((r) => ({
  material: r['Material'],
  amount: num(r['Amount']),
}))

// XP sources
const xpRows = (needle, xpKey) =>
  tableAfter(needle).map((r) => {
    const sourceKey = Object.keys(r).find((k) => /source/i.test(k))
    const valKey = Object.keys(r).find((k) => /xp/i.test(k))
    const src = r[sourceKey]
    const colorM = src.match(/green|blue|purple/i)
    return {
      source: src,
      color: colorM ? colorM[0][0].toUpperCase() + colorM[0].slice(1).toLowerCase() : null,
      xp: num(r[valKey]),
    }
  })
data.xpSources = {
  character: xpRows('Character XP'),
  arc: xpRows('Arc XP'),
  cartridgeModule: xpRows('Cartridges / Modules XP'),
}

// ===========================================================================
// NTE_Update.md — the second source of truth. Parsed and merged here.
// ===========================================================================

// Slice an "## N. ..." section out of the update markdown so look-ups inside
// it can't collide with same-named headings elsewhere in the file.
function section(src, startNeedle, endNeedle) {
  const lines = src.split(/\r?\n/)
  const start = lines.findIndex((l) => /^##\s/.test(l) && l.includes(startNeedle))
  if (start === -1) return ''
  let end = lines.length
  if (endNeedle) {
    const e = lines.findIndex((l, i) => i > start && /^##\s/.test(l) && l.includes(endNeedle))
    if (e !== -1) end = e
  }
  return lines.slice(start, end).join('\n')
}

// #1: Module types — each maxes to Lv 20 at its own cost.
data.moduleTypes = tableAfter('Module Types', upd).map((r) => ({
  type: r['Module Type'].trim(),
  xp: num(r['XP']),
  coins: num(r['Beetle Coins']),
}))
// A "filled" module set used on the 1->80 tab.
data.filledModuleSet = { 'Type IV': 1, 'Type III': 4, 'Type II': 2 }

// #18 + #19: example material categories. Bronze/Silver/Gold ability upgrades
// are renamed to Green/Blue/Purple per #16. Each category carries its ordered
// in-game names (#18) and the per-character assignment (#19).
const SEC18 = section(upd, '18.', '19.')
const SEC19 = section(upd, '19.')
const CATEGORIES = [
  { key: 'anomalyHunt', name18: 'Anomaly Hunt Material', name19: 'Anomaly Hunt Materials' },
  { key: 'anomalyPilgrimage', name18: 'Anomaly Pilgrimage Material', name19: 'Anomaly Pilgrimage Materials' },
  { key: 'abilityGreen', name18: 'Bronze Ability Upgrade', name19: 'Bronze Ability Upgrades' },
  { key: 'abilityBlue', name18: 'Silver Ability Upgrade', name19: 'Silver Ability Upgrades' },
  { key: 'abilityPurple', name18: 'Gold Ability Upgrade', name19: 'Gold Ability Upgrades' },
  { key: 'wdGreen', name18: 'Green World Material', name19: 'Green World Materials' },
  { key: 'wdBlue', name18: 'Blue World Material', name19: 'Blue World Materials' },
  { key: 'wdPurple', name18: 'Purple World Material', name19: 'Purple World Materials' },
]

data.inGameNames = {} // category -> [name in example order]
const nameToCategory = {} // in-game name -> category
const charMats = {} // character -> { category: in-game material name }

for (const c of CATEGORIES) {
  // #18 — ordered in-game names
  const arr = []
  for (const r of tableAfter(c.name18, SEC18)) {
    const ex = num(r['Example'])
    const nm = (r['In-Game Name'] || '').trim()
    if (nm) {
      arr[ex - 1] = nm
      nameToCategory[nm] = c.key
    }
  }
  data.inGameNames[c.key] = arr.filter(Boolean)

  // #19 — material -> characters, inverted to character -> material
  for (const r of tableAfter(c.name19, SEC19)) {
    const material = (r['Material'] || '').trim()
    const chars = (r['Characters'] || '').split(',').map((s) => s.trim()).filter(Boolean)
    for (const ch of chars) (charMats[ch] ||= {})[c.key] = material
  }
}
data.nameToCategory = nameToCategory

// Character roster: every character named in #19, with rank read from its
// portrait filename ("Adler - A.png" -> rank A).
const rankByName = {}
for (const f of readdirSync(ASSETS_DIR)) {
  const m = f.match(/^(.+?)\s*-\s*([AS])\.png$/i)
  if (m) rankByName[m[1].trim()] = m[2].toUpperCase()
}
data.roster = Object.keys(charMats)
  .sort()
  .map((name) => ({ name, rank: rankByName[name] || null, materials: charMats[name] }))

writeFileSync(OUT_PATH, JSON.stringify(data, null, 2) + '\n')

// --- icon manifest --------------------------------------------------------
// The spec requires that for any icon used, "all others sharing the same name
// and color" are listed too. We group every PNG by its base name (stripping a
// trailing "Example N" / number) so a material maps to ALL its matching icons.
// "Materal" (a source typo) is normalised to "Material".
function baseName(file) {
  return file
    .replace(/\.(png|svg)$/i, '')
    .replace(/\s*Example\s*\d*$/i, '') // "... Example 3" / "... Example"
    .replace(/\s*-\s*[AS]$/i, '') // character portrait "Adler - A" -> "Adler"
    .replace(/\s+\d+$/i, '') // trailing bare number
    .replace(/\s*-\s*$/, '') // trailing " -" left by module-type "Type II - Example 1"
    .replace(/Materal/gi, 'Material')
    .trim()
}

const groups = {}
for (const file of readdirSync(ASSETS_DIR)) {
  if (!/\.(png|svg)$/i.test(file)) continue // skip Background.jpg etc.
  const key = baseName(file)
  ;(groups[key] ||= []).push(`assets/${file}`)
}
// stable order within each group
for (const k of Object.keys(groups)) groups[k].sort()

writeFileSync(ICONS_PATH, JSON.stringify(groups, null, 2) + '\n')

console.log(`✓ Parsed NTE_Leveling.md -> ${OUT_PATH}`)
console.log(`✓ Built icon manifest (${Object.keys(groups).length} groups) -> ${ICONS_PATH}`)
console.log(
  `  ${data.characters.leveling.length} char levels, ${data.arcs.leveling.length} arc levels, ` +
    `${data.cartridges.length} cartridge rarities, ${data.xpSources.character.length} char XP sources`,
)
