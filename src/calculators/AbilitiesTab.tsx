// "Costs for all abilities Max to 10 + passive skills + life skills".
// These take no XP, so per the spec this is a progression CHECKER (a fun fact),
// not part of the leveling calculators. Tick what you've finished; it tallies
// what's left.
import { useMemo, useState } from 'react'
import { gameData } from '../lib/calc'
import { short } from '../lib/format'
import { IconStack } from '../components/IconStack'
import type { AbilityRow } from '../types'

const COMBAT_SKILLS = ['Base Attack', 'Redirect Skill', 'Ultimate', 'Support Skill']

interface Block {
  id: string
  title: string
  rows: AbilityRow[]
}

export function AbilitiesTab() {
  const { perSkill, passive1, passive2 } = gameData.abilities

  const blocks: Block[] = [
    ...COMBAT_SKILLS.map((name) => ({ id: name, title: `${name} → Lv 10`, rows: perSkill })),
    { id: 'passive1', title: 'Passive Skill 1', rows: passive1 },
    { id: 'passive2', title: 'Passive Skill 2', rows: passive2 },
  ]

  const [done, setDone] = useState<Record<string, boolean>>({})

  // Remaining materials across everything not yet ticked.
  const remaining = useMemo(() => {
    const map: Record<string, { amount: number; example: boolean }> = {}
    for (const b of blocks) {
      if (done[b.id]) continue
      for (const r of b.rows) {
        const cur = map[r.material] ?? { amount: 0, example: r.isExample }
        cur.amount += r.amount
        map[r.material] = cur
      }
    }
    return map
  }, [done, blocks])

  return (
    <div className="calc">
      <section className="panel reach">
        <h3>Progression checker — abilities &amp; passives</h3>
        <p className="reach-note">
          Tick each skill you've already maxed. The remaining materials update below. (Passive-skill
          materials are examples — your character's actual passives may differ.)
        </p>
      </section>

      <div className="ability-grid">
        {blocks.map((b) => (
          <section key={b.id} className={`panel ability-card${done[b.id] ? ' done' : ''}`}>
            <label className="ability-head">
              <input
                type="checkbox"
                checked={!!done[b.id]}
                onChange={(e) => setDone((p) => ({ ...p, [b.id]: e.target.checked }))}
              />
              <h4>{b.title}</h4>
            </label>
            <div className="cost-list">
              {b.rows.map((r) => (
                <div className="cost-row" key={r.material}>
                  <IconStack name={r.material} />
                  <span className="cost-label">
                    {r.isExample && <em className="ex">e.g. </em>}
                    {r.material}
                  </span>
                  <span className="cost-amount">{short(r.amount)}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="panel target">
        <h3>Still need (un-ticked skills)</h3>
        <div className="cost-list">
          {Object.entries(remaining).length === 0 ? (
            <p className="reach-note good">Everything ticked — all abilities maxed! 🎉</p>
          ) : (
            Object.entries(remaining).map(([mat, { amount, example }]) => (
              <div className="cost-row" key={mat}>
                <IconStack name={mat} />
                <span className="cost-label">
                  {example && <em className="ex">e.g. </em>}
                  {mat}
                </span>
                <span className="cost-amount">{short(amount)}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="panel breakdown">
        <h3>All Life Skills on one character (fun fact)</h3>
        <div className="cost-list">
          {gameData.lifeSkills.map((l) => (
            <div className="cost-row" key={l.material}>
              <IconStack name={l.material} />
              <span className="cost-label">{l.material}</span>
              <span className="cost-amount">{short(l.amount)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
