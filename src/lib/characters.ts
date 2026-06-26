// Character roster + per-character material naming. Selecting a character makes
// the leveling tabs show that character's specific in-game material names
// (#5/#6); the underlying resource pools (My Resources) stay generic (#17).
import gameData from '../data/gameData.json'
import type { GameData, RosterChar } from '../types'

const game = gameData as unknown as GameData

export const roster: RosterChar[] = game.roster ?? []

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
