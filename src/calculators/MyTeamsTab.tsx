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
  materialMeta,
} from '../lib/characters'
import { useResources } from '../state/resources'
import { CostRow } from '../components/CostRow'
import { IconStack } from '../components/IconStack'

const MAX_TEAMS = 10
const SLOTS = 4
const STEPS = characterSteps()
const COLORS = ['Green', 'Blue', 'Purple']

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
    const c = cumulativeCost(STEPS, 80, from)
    xp += c.xp
    coins += c.coins
    for (const req of Object.values(c.mats)) {
      const key = effectiveResourceKey(req.id, name) // this character's named material (or generic)
      if (!(key in mats)) order.push(key)
      mats[key] = (mats[key] ?? 0) + req.qty
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
          needed to fully level all four characters to <strong>Lv 80</strong>, compared against what
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
              {names.map((name, s) => (
                <div className="team-slot" key={s}>
                  <div className="team-portrait">
                    {name ? <IconStack name={name} size={64} /> : <div className="char-portrait none small">?</div>}
                  </div>
                  <select value={name} onChange={(e) => setSlot(t, s, e.target.value)}>
                    <option value="">— empty —</option>
                    {roster.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.rank})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {filled === 0 ? (
              <p className="reach-note">Pick characters above to see the team's totals.</p>
            ) : (
              <div className="cost-list">
                <CostRow label="Character XP" amount={totals.xp} iconName="XP" have={ownedXp} />
                <CostRow label="Beetle Coins" amount={totals.coins} iconName="Beetle Coins" have={ownedCoins} />
                {totals.mats.map((m) => {
                  const meta = materialMeta(m.key)
                  return (
                    <CostRow
                      key={m.key}
                      label={meta.label}
                      amount={m.qty}
                      iconName={meta.icon}
                      have={parseInput(values[m.key] ?? '')}
                    />
                  )
                })}
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
