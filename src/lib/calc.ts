// Calculation engine. Builds the per-10-level "steps" for Characters and Arcs
// (each step couples the ascension cost with that bracket's leveling cost) and
// computes both the cumulative cost to a target level and how far a given pool
// of resources can take you.
import type { GameData, Requirement, Step } from '../types'
import data from '../data/gameData.json'

const game = data as unknown as GameData

function matReq(
  id: string,
  label: string,
  qty: number,
  iconName: string,
): Requirement | null {
  return qty > 0 ? { id, label, qty, iconName } : null
}

// ---- Build steps ---------------------------------------------------------
export function characterSteps(): Step[] {
  const { leveling, ascension } = game.characters
  const steps: Step[] = []
  // Base bracket 1->20 needs no ascension.
  const base = leveling[0]
  steps.push({ to: base.to, levelXP: base.xp, coins: base.coins, reqs: [] })
  // Each ascension row couples with its matching leveling bracket.
  for (const asc of ascension) {
    const lev = leveling.find((l) => l.from === asc.from && l.to === asc.to)
    if (!lev) continue
    const wdId = `wd:${asc.worldDrop.color}`
    const reqs = [
      matReq('anomalyHunt', 'Anomaly Hunt Material', asc.anomalyHunt, 'Anomaly Hunt Material'),
      matReq(
        wdId,
        `${asc.worldDrop.color} World Drop Material`,
        asc.worldDrop.qty,
        `${asc.worldDrop.color} World Material`,
      ),
    ].filter(Boolean) as Requirement[]
    steps.push({ to: asc.to, levelXP: lev.xp, coins: lev.coins + asc.coins, reqs })
  }
  return steps
}

export function arcSteps(): Step[] {
  const { leveling, ascension } = game.arcs
  const steps: Step[] = []
  const base = leveling[0]
  steps.push({ to: base.to, levelXP: base.xp, coins: base.coins, reqs: [] })
  for (const asc of ascension) {
    const lev = leveling.find((l) => l.from === asc.from && l.to === asc.to)
    if (!lev) continue
    const reqs = [
      matReq(
        `arc:${asc.arcMat.color}`,
        `${asc.arcMat.color} Arc Material`,
        asc.arcMat.qty,
        `${asc.arcMat.color} Arc Material`,
      ),
      matReq(
        `wd:${asc.worldDrop.color}`,
        `${asc.worldDrop.color} World Drop Material`,
        asc.worldDrop.qty,
        `${asc.worldDrop.color} World Material`,
      ),
    ].filter(Boolean) as Requirement[]
    steps.push({ to: asc.to, levelXP: lev.xp, coins: lev.coins + asc.coins, reqs })
  }
  return steps
}

// ---- Aggregate cost to a target level ------------------------------------
export interface Totals {
  xp: number
  coins: number
  mats: Record<string, Requirement> // id -> aggregated requirement
}

// Sum every step in the range (fromLevel, targetLevel]. fromLevel lets an
// already-levelled character/arc skip the brackets it has finished.
export function cumulativeCost(steps: Step[], targetLevel: number, fromLevel = 1): Totals {
  const totals: Totals = { xp: 0, coins: 0, mats: {} }
  for (const s of steps) {
    if (s.to <= fromLevel) continue
    if (s.to > targetLevel) break
    totals.xp += s.levelXP
    totals.coins += s.coins
    for (const r of s.reqs) {
      const cur = totals.mats[r.id]
      totals.mats[r.id] = cur
        ? { ...cur, qty: cur.qty + r.qty }
        : { ...r }
    }
  }
  return totals
}

// ---- How far can a resource pool take you? -------------------------------
export interface Budget {
  xp: number
  coins: number
  mats: Record<string, number> // id -> owned qty
}
export interface ReachResult {
  level: number // highest fully-affordable level
  blockedBy: string[] // what ran short on the first unaffordable step (empty if maxed)
  nextLevel: number | null // the level you couldn't reach (null if maxed)
}

export function maxReach(steps: Step[], budget: Budget, fromLevel = 1): ReachResult {
  let xp = budget.xp
  let coins = budget.coins
  const mats: Record<string, number> = { ...budget.mats }
  let level = fromLevel // start from the level you're already at

  for (const s of steps) {
    if (s.to <= fromLevel) continue // already past this bracket
    const short: string[] = []
    if (xp < s.levelXP) short.push('XP')
    if (coins < s.coins) short.push('Beetle Coins')
    for (const r of s.reqs) if ((mats[r.id] ?? 0) < r.qty) short.push(r.label)

    if (short.length) {
      return { level, blockedBy: short, nextLevel: s.to }
    }
    xp -= s.levelXP
    coins -= s.coins
    for (const r of s.reqs) mats[r.id] = (mats[r.id] ?? 0) - r.qty
    level = s.to
  }
  return { level, blockedBy: [], nextLevel: null }
}

// XP available from a set of tiered sources (green/blue/purple counts).
export function xpFromSources(
  sources: { color: string | null; xp: number }[],
  counts: Record<string, number>,
): number {
  return sources.reduce((sum, s) => sum + (counts[s.color ?? ''] ?? 0) * s.xp, 0)
}

export const gameData = game
