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

export interface GameData {
  ascensionCaps: { ascension: number; unlocksTo: number }[]
  characters: { leveling: LevelRow[]; ascension: CharAscRow[] }
  arcs: { leveling: LevelRow[]; ascension: ArcAscRow[] }
  cartridges: RarityRow[]
  modules: RarityRow[]
  abilities: { perSkill: AbilityRow[]; passive1: AbilityRow[]; passive2: AbilityRow[] }
  lifeSkills: { material: string; amount: number }[]
  xpSources: { character: XpSource[]; arc: XpSource[]; cartridgeModule: XpSource[] }
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
  reqs: Requirement[] // material requirements for this step (excl. xp & coins)
}
