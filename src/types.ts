// Shapes of the generated gameData.json (produced by scripts/parse-md.mjs from
// NTE_Leveling.md — the source of truth).
export type Color = 'Green' | 'Blue' | 'Purple' | 'Gold' | 'Silver' | 'Bronze'

export interface MatRef {
  qty: number
  color: Color | null
}
export interface LevelRow {
  from: number
  to: number
  xp: number
  coins: number
  ascendCoins?: number
}
export interface CharAscRow {
  from: number
  to: number
  coins: number
  anomalyHunt: number
  worldDrop: MatRef
}
export interface ArcAscRow {
  from: number
  to: number
  coins: number
  arcMat: MatRef
  worldDrop: MatRef
}
export interface RarityRow {
  rarity: string
  maxLevel: number
  xp: number
  coins: number
}
export interface AbilityRow {
  material: string
  isExample: boolean
  amount: number
}
export interface XpSource {
  source: string
  color: Color | null
  xp: number
}

export interface ModuleType {
  type: string // "Type II"
  xp: number
  coins: number
}
export interface RosterChar {
  name: string
  rank: 'S' | 'A' | null
  // category key -> in-game material name (anomalyHunt, abilityGreen, wdBlue, ...)
  materials: Record<string, string>
}

export interface GameData {
  ascensionCaps: { ascension: number; unlocksTo: number }[]
  characters: { leveling: LevelRow[]; ascension: CharAscRow[] }
  arcs: { leveling: LevelRow[]; ascension: ArcAscRow[] }
  cartridges: RarityRow[]
  modules: RarityRow[]
  abilities: { perSkill: AbilityRow[]; passive1: AbilityRow[]; passive2: AbilityRow[] }
  lifeSkills: { material: string; amount: number }[]
  xpSources: { character: XpSource[]; arc: XpSource[]; cartridgeModule: XpSource[] }
  // ---- from NTE_Update.md ----
  moduleTypes: ModuleType[]
  filledModuleSet: Record<string, number>
  inGameNames: Record<string, string[]>
  nameToCategory: Record<string, string>
  materialIcon: Record<string, string>
  roster: RosterChar[]
  abilityLevels: AbilityLevel[]
}

// One ability-upgrade level (per ability). Materials are category keys that map
// to the selected character's specific named materials. Coins are fixed.
export interface AbilityLevel {
  level: number
  reqAscension: number
  mats: { cat: string; qty: number }[]
  coins: number
}

// A single material requirement carried through the calculators.
export interface Requirement {
  id: string // stable key, e.g. "coins", "wd:Green", "anomalyHunt"
  label: string
  qty: number
  iconName: string // group key into icons.json
}

// One coupled ascension + leveling step (everything to reach `to`).
export interface Step {
  to: number
  levelXP: number
  coins: number // ascension coins + leveling coins
  ascCoins: number // the ascension portion of `coins` (for "ascension already done")
  reqs: Requirement[] // material requirements for this step (excl. xp & coins)
}
