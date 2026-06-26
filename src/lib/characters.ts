// Character roster + per-character material naming. Selecting a character makes
// the leveling tabs show that character's specific in-game material names
// (#5/#6); the underlying resource pools (My Resources) stay generic (#17).
import gameData from '../data/gameData.json'
import type { GameData, RosterChar } from '../types'

const game = gameData as unknown as GameData

export const roster: RosterChar[] = game.roster ?? []
export const ABILITY_LEVELS = game.abilityLevels ?? []

// Category key -> resource store key (so ability costs use the same pools).
export const CATEGORY_TO_KEY: Record<string, string> = {
  anomalyHunt: 'anomalyHunt',
  anomalyPilgrimage: 'anomalyPilgrimage',
  abilityGreen: 'ability:Green',
  abilityBlue: 'ability:Blue',
  abilityPurple: 'ability:Purple',
  wdGreen: 'wd:Green',
  wdBlue: 'wd:Blue',
  wdPurple: 'wd:Purple',
}

// The store key for the currently-selected character. '' = none / unreleased.
export const SELECTED_KEY = 'ui:character'

export function getCharacter(name: string | undefined): RosterChar | undefined {
  if (!name) return undefined
  return roster.find((c) => c.name === name)
}

// Resource store key -> update category key, for the character-specific
// categories only (arc materials stay generic per #13).
const KEY_TO_CATEGORY: Record<string, string> = {
  'wd:Green': 'wdGreen',
  'wd:Blue': 'wdBlue',
  'wd:Purple': 'wdPurple',
  'ability:Green': 'abilityGreen',
  'ability:Blue': 'abilityBlue',
  'ability:Purple': 'abilityPurple',
  anomalyHunt: 'anomalyHunt',
  anomalyPilgrimage: 'anomalyPilgrimage',
}

// Label to show for a resource: the selected character's named material if one
// applies, otherwise the generic fallback label.
export function displayLabel(storeKey: string, fallback: string, charName?: string): string {
  const cat = KEY_TO_CATEGORY[storeKey]
  const ch = getCharacter(charName)
  if (!cat || !ch) return fallback
  return ch.materials?.[cat] ?? fallback
}

// The effective resource-store key for a category-keyed requirement, given the
// selected character. Character-specific categories resolve to the character's
// SPECIFIC named material (so each character draws from its own pool, matching
// the per-material boxes on My Resources). Non-character keys (arc:*, coins,
// XP) are returned unchanged. With no character, the generic key is returned.
export function effectiveResourceKey(storeKey: string, charName?: string): string {
  const cat = KEY_TO_CATEGORY[storeKey]
  const ch = getCharacter(charName)
  if (cat && ch?.materials?.[cat]) return ch.materials[cat]
  return storeKey
}

export const isCharacterCategory = (storeKey: string) => storeKey in KEY_TO_CATEGORY

// ---- per-character current level ----------------------------------------
export const LEVEL_OPTIONS = [1, 20, 30, 40, 50, 60, 70, 80] as const
export const cLevelKey = (name: string) => `clevel:${name}`

// Stored value -> numeric level, or null for "don't own" / unset.
export function parseCharLevel(raw: string | undefined): number | null {
  if (raw == null || raw === '' || raw === 'none') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

// ---- ascension (stars) ---------------------------------------------------
export const cAscKey = (name: string) => `casc:${name}`
export const cAbilityKey = (name: string) => `cability:${name}`

// The ascension you must have to be AT a level (1/20 -> 0, 30 -> 1, ... 80 -> 6).
export function ascensionForLevel(level: number): number {
  return level <= 20 ? 0 : Math.floor((level - 20) / 10)
}
// Highest ascension selectable at a level: current, or one ahead (20–70).
export function maxAscensionAt(level: number): number {
  return Math.min(6, ascensionForLevel(level) + (level >= 20 && level < 80 ? 1 : 0))
}
// Resolve a character's ascension from its stored value, clamped to [current, max].
export function charAscension(stored: string | undefined, level: number): number {
  const def = ascensionForLevel(level)
  if (stored == null || stored === '') return def
  const n = Number(stored)
  if (!Number.isFinite(n)) return def
  return Math.max(def, Math.min(maxAscensionAt(level), n))
}
// Highest ability level reachable at a given ascension.
export function maxAbilityLevel(ascension: number): number {
  let max = 1
  for (const r of ABILITY_LEVELS) if (r.reqAscension <= ascension && r.level > max) max = r.level
  return max
}

// ---- ascension-already-done flag ----------------------------------------
// Marks that the ascension for the current 10-level bracket is already paid.
// Keyed per tab + character (or tab) + level so it saves per character.
export const ascDoneKey = (tabId: string, who: string, level: number) =>
  `ascdone:${tabId}:${who || '_'}:${level}`

// ---- friendly display metadata for a resource key ------------------------
// Generic category keys (e.g. a character that lacks a specific material) get a
// friendly label + grouped icon; specific named materials map to themselves
// (which resolve to their single icon).
const GENERIC_META: Record<string, { label: string; icon: string }> = {
  anomalyHunt: { label: 'Anomaly Hunt Material', icon: 'Anomaly Hunt Material' },
  anomalyPilgrimage: { label: 'Anomaly Pilgrimage Material', icon: 'Anomaly Pilgrimage Material' },
  'wd:Green': { label: 'Green World Material', icon: 'Green World Material' },
  'wd:Blue': { label: 'Blue World Material', icon: 'Blue World Material' },
  'wd:Purple': { label: 'Purple World Material', icon: 'Purple World Material' },
  'ability:Green': { label: 'Green Ability Upgrade Material', icon: 'Green Ability Upgrade Material' },
  'ability:Blue': { label: 'Blue Ability Upgrade Material', icon: 'Blue Ability Upgrade Material' },
  'ability:Purple': { label: 'Purple Ability Upgrade Material', icon: 'Purple Ability Upgrade Material' },
  'arc:Green': { label: 'Green Arc Material', icon: 'Green Arc Material' },
  'arc:Blue': { label: 'Blue Arc Material', icon: 'Blue Arc Material' },
  'arc:Purple': { label: 'Purple Arc Material', icon: 'Purple Arc Material' },
}
export function materialMeta(key: string): { label: string; icon: string } {
  return GENERIC_META[key] ?? { label: key, icon: key }
}
