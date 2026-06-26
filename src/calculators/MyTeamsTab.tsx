// "My Teams" (before the 1→80 tab). Build up to 10 teams of 4 characters and
// see the total resources still needed to fully level each team to 80 — XP,
// Beetle Coins, and each character's specific materials — vs what you own.
import { characterSteps, cumulativeCost, xpFromSources, gameData } from '../lib/calc'
import { parseInput } from '../lib/format'
import {
  roster,
  getCharacter,
  effectiveResourceKey,
  parseCharLevel,
  cLevelKey,
  cAscKey,
  cAbilityKey,
  charAscension,
  ascensionForLevel,
  materialMeta,
  ABILITY_LEVELS,
  CATEGORY_TO_KEY,
} from '../lib/characters'

import { useResources } from '../state/resources'
import { CostRow } from '../components/CostRow'
import { IconStack } from '../components/IconStack'
import { XpEquivalent } from '../components/XpEquivalent'

const MAX_TEAMS = 10
const SLOTS = 4
const STEPS = characterSteps()
const COLORS = ['Green', 'Blue', 'Purple']

// Fill-in substitutes by category: pool + tier (Green 1:1, Blue 3:1, Purple 9:1).
const RATE: Record<string, number> = { Green: 1, Blue: 3, Purple: 9 }
const CAT_FILL: Record<string, ['hetero' | 'expansion', string]> = {
  wdGreen: ['hetero', 'Green'],
  wdBlue: ['hetero', 'Blue'],
  wdPurple: ['hetero', 'Purple'],
  abilityGreen: ['expansion', 'Green'],
  abilityBlue: ['expansion', 'Blue'],
  abilityPurple: ['expansion', 'Purple'],
}
// Category of a material key (specific name or generic key).
function categoryOf(key: string): string | null {
  const nc = gameData.nameToCategory[key]
  if (nc) return nc
  if (key.startsWith('wd:')) return 'wd' + key.slice(3)
  if (key.startsWith('ability:')) return 'ability' + key.slice(8)
  return null
}
const TIER_ORDER: Record<string, number> = { Green: 0, Blue: 1, Purple: 2 }

interface TeamTotals {
  xp: number
  coins: number
  mats: { key: string; qty: number }[]
}

// Total still-needed resources to take every (filled) team member from its
// current set level to 80. Each character draws from its own specific materials.
function teamTotals(names: string[], values: Record<string, string>): TeamTotals {
  let xp = 0
  let coins = 0
  const mats: Record<string, number> = {}
  const order: string[] = []
  for (const name of names) {
    const ch = getCharacter(name)
    if (!ch) continue
    const from = parseCharLevel(values[cLevelKey(name)]) ?? 1
    const asc = charAscension(values[cAscKey(name)], from)
    const ascDone = asc > ascensionForLevel(from) ? from : null
    const c = cumulativeCost(STEPS, 80, from, ascDone)
    xp += c.xp
    coins += c.coins
    for (const req of Object.values(c.mats)) {
      const key = effectiveResourceKey(req.id, name) // this character's named material (or generic)
      if (!(key in mats)) order.push(key)
      mats[key] = (mats[key] ?? 0) + req.qty
    }

    // Ability upgrades: from the character's current ability level up to Lv 10
    // (a fully built character is Ascension 6 at Lv 80, so abilities cap at 10),
    // × 4 abilities. This adds Anomaly Pilgrimage + ability/world materials.
    const curAbility = Math.max(1, Number(values[cAbilityKey(name)] ?? 1) || 1)
    for (const row of ABILITY_LEVELS) {
      if (row.level <= curAbility) continue
      coins += row.coins * 4
      for (const m of row.mats) {
        const key = effectiveResourceKey(CATEGORY_TO_KEY[m.cat], name)
        if (!(key in mats)) order.push(key)
        mats[key] = (mats[key] ?? 0) + m.qty * 4
      }
    }
  }
  return { xp, coins, mats: order.map((key) => ({ key, qty: mats[key] })) }
}

export function MyTeamsTab() {
  const { values, set } = useResources()
  const count = Math.min(MAX_TEAMS, Math.max(1, Number(values['team:count'] ?? 1) || 1))

  // Owned guide XP (shared pool) and coins for the "left" comparison.
  const ownedXp = xpFromSources(
    gameData.xpSources.character,
    Object.fromEntries(COLORS.map((c) => [c, parseInput(values[`guide:${c}`] ?? '')])),
  )
  const ownedCoins = parseInput(values['coins'] ?? '')

  const setSlot = (t: number, s: number, name: string) => set(`team:${t}:${s}`, name)
  const addTeam = () => set('team:count', String(Math.min(MAX_TEAMS, count + 1)))
  const removeTeam = (t: number) => {
    // shift teams above t down, then drop the last
    for (let i = t; i < count - 1; i++)
      for (let s = 0; s < SLOTS; s++) set(`team:${i}:${s}`, values[`team:${i + 1}:${s}`] ?? '')
    for (let s = 0; s < SLOTS; s++) set(`team:${count - 1}:${s}`, '')
    set('team:count', String(Math.max(1, count - 1)))
  }

  return (
    <div className="calc">
      <section className="panel reach">
        <h3>My Teams</h3>
        <p className="reach-note">
          Build up to {MAX_TEAMS} teams of 4 characters. Each team shows the total resources still
          needed to fully build all four characters — <strong>leveling to Lv 80</strong> (with
          ascensions) <strong>plus maxing all 4 abilities to Lv 10</strong> — compared against what
          you own (filled in on <strong>My Resources</strong>). Each character draws from its own
          specific materials.
        </p>
      </section>

      {Array.from({ length: count }, (_, t) => {
        const names = Array.from({ length: SLOTS }, (_, s) => values[`team:${t}:${s}`] ?? '')
        const totals = teamTotals(names, values)
        const filled = names.filter(Boolean).length
        return (
          <section className="panel team-card" key={t}>
            <div className="team-head">
              <h3>Team {t + 1}</h3>
              {count > 1 && (
                <button className="team-remove" onClick={() => removeTeam(t)} title="Remove team">
                  ✕
                </button>
              )}
            </div>

            <div className="team-slots">
              {names.map((name, s) => {
                const lvl = name ? parseCharLevel(values[cLevelKey(name)]) : null
                const asc = name && lvl != null ? charAscension(values[cAscKey(name)], lvl) : 0
                return (
                  <div className="team-slot" key={s}>
                    <div className="team-portrait">
                      {name ? (
                        <IconStack name={name} size={64} />
                      ) : (
                        <div className="char-portrait none small">?</div>
                      )}
                    </div>
                    <select value={name} onChange={(e) => setSlot(t, s, e.target.value)}>
                      <option value="">— empty —</option>
                      {roster.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.rank})
                        </option>
                      ))}
                    </select>
                    {name && (
                      <div className="team-slot-info">
                        {lvl != null ? `Lv ${lvl}` : 'no level set'}
                        {lvl != null && lvl >= 20 && (
                          <span className="char-stars" title={`Ascension ${asc}`}>
                            <span className="on">{'✦'.repeat(asc)}</span>
                            <span className="off">{'✧'.repeat(6 - asc)}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {filled === 0 ? (
              <p className="reach-note">Pick characters above to see the team's totals.</p>
            ) : (
              <div className="cost-list">
                <CostRow
                  label="Character XP"
                  amount={totals.xp}
                  iconName="XP"
                  have={ownedXp}
                  extra={<XpEquivalent xp={totals.xp} sources={gameData.xpSources.character} />}
                />
                <CostRow label="Beetle Coins" amount={totals.coins} iconName="Beetle Coins" have={ownedCoins} />
                {(() => {
                  // Apply Heterogeneous Unit / Expansion Core fill-in across this
                  // team's shortfalls (green first), then render each material.
                  let hetero = parseInput(values['heterogeneousUnit'] ?? '')
                  let expansion = parseInput(values['expansionCore'] ?? '')
                  const filledHave: Record<string, { have: number; note?: string }> = {}
                  const sorted = [...totals.mats].sort((a, b) => {
                    const ta = CAT_FILL[categoryOf(a.key) ?? '']?.[1]
                    const tb = CAT_FILL[categoryOf(b.key) ?? '']?.[1]
                    return (TIER_ORDER[ta] ?? 9) - (TIER_ORDER[tb] ?? 9)
                  })
                  for (const m of sorted) {
                    const realHave = parseInput(values[m.key] ?? '')
                    const f = CAT_FILL[categoryOf(m.key) ?? '']
                    if (!f) {
                      filledHave[m.key] = { have: realHave }
                      continue
                    }
                    const [pool, tier] = f
                    const rate = RATE[tier]
                    const shortfall = Math.max(0, m.qty - realHave)
                    const avail = pool === 'expansion' ? expansion : hetero
                    const used = Math.min(shortfall, Math.floor(avail / rate)) * rate
                    const got = used / rate
                    if (got > 0) {
                      if (pool === 'expansion') expansion -= used
                      else hetero -= used
                      filledHave[m.key] = {
                        have: realHave + got,
                        note: `+${got} from ${pool === 'expansion' ? 'Expansion Cores' : 'Heterogeneous Units'} (${used} used)`,
                      }
                    } else filledHave[m.key] = { have: realHave }
                  }
                  return totals.mats.map((m) => {
                    const meta = materialMeta(m.key)
                    const fh = filledHave[m.key]
                    return (
                      <CostRow
                        key={m.key}
                        label={meta.label}
                        amount={m.qty}
                        iconName={meta.icon}
                        have={fh?.have ?? parseInput(values[m.key] ?? '')}
                        extra={fh?.note ? <span className="fill-note">{fh.note}</span> : undefined}
                      />
                    )
                  })
                })()}
              </div>
            )}
          </section>
        )
      })}

      {count < MAX_TEAMS && (
        <button className="add-team" onClick={addTeam}>
          + Add team ({count}/{MAX_TEAMS})
        </button>
      )}
    </div>
  )
}
