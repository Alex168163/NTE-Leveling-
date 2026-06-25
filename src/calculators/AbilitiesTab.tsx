// "Costs for all abilities Max to 10 + passive skills + life skills".
// These take no XP, so per the spec this is a progression checker, not part of
// the leveling calculators. The combat-ability cost is PER-SKILL (there
// are four such abilities). Tick each skill you've already maxed, AND enter how
// many of each material you have — the "still need" list subtracts both and
// keeps tracking everything else.
import { useMemo, useState } from 'react'
import { gameData } from '../lib/calc'
import { parseInput, sanitizeResource, short, comma } from '../lib/format'
import { IconStack } from '../components/IconStack'
import type { AbilityRow } from '../types'

const COMBAT_SKILLS = ['Base Attack', 'Redirect Skill', 'Ultimate', 'Support Skill']

interface Block {
  id: string
  title: string
  rows: AbilityRow[]
}

// A material-tracker row: needed amount, an input for what you own, and status.
function TrackRow({
  material,
  needed,
  have,
  onHave,
}: {
  material: string
  needed: number
  have: string
  onHave: (v: string) => void
}) {
  const owned = parseInput(have)
  const left = Math.max(0, needed - owned)
  const complete = left === 0
  return (
    <div className={`track-row${complete ? ' complete' : ''}`}>
      <IconStack name={material} />
      <span className="cost-label">{material}</span>
      <input
        className="track-input"
        type="text"
        inputMode="text"
        placeholder="0"
        title="How many you have. Accepts k/m (max 100m)."
        value={have}
        onChange={(e) => onHave(sanitizeResource(e.target.value))}
        spellCheck={false}
      />
      <span className="track-need" title={comma(needed)}>
        / {short(needed)}
      </span>
      <span className="track-status">{complete ? '✓ done' : `need ${short(left)}`}</span>
    </div>
  )
}

export function AbilitiesTab() {
  const { perSkill, passive1, passive2 } = gameData.abilities

  const blocks: Block[] = [
    ...COMBAT_SKILLS.map((name) => ({ id: name, title: `${name} → Lv 10`, rows: perSkill })),
    { id: 'passive1', title: 'Passive Skill 1', rows: passive1 },
    { id: 'passive2', title: 'Passive Skill 2', rows: passive2 },
  ]

  const [done, setDone] = useState<Record<string, boolean>>({})
  const [have, setHave] = useState<Record<string, string>>({})
  const onHave = (k: string, v: string) => setHave((p) => ({ ...p, [k]: v }))

  // Materials still required across every skill NOT yet ticked.
  const remaining = useMemo(() => {
    const map: Record<string, number> = {}
    const order: string[] = []
    for (const b of blocks) {
      if (done[b.id]) continue
      for (const r of b.rows) {
        if (!(r.material in map)) order.push(r.material)
        map[r.material] = (map[r.material] ?? 0) + r.amount
      }
    }
    return order.map((material) => ({ material, amount: map[material] }))
  }, [done, blocks])

  return (
    <div className="calc">
      <section className="panel reach">
        <h3>Progression checker — abilities &amp; passives</h3>
        <p className="reach-note">
          Each combat ability costs the amounts below (there are four of them), plus the two passive
          skills. Tick the skills you've already maxed, then in <strong>Still need</strong> enter how
          many of each material you have and check them off — the rest keeps tracking.
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
                  <span className="cost-label">{r.material}</span>
                  <span className="cost-amount">{short(r.amount)}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="panel target">
        <h3>Still need — add what you have &amp; check it off</h3>
        <div className="cost-list">
          {remaining.length === 0 ? (
            <p className="reach-note good">Everything ticked — all abilities maxed! 🎉</p>
          ) : (
            remaining.map((r) => (
              <TrackRow
                key={r.material}
                material={r.material}
                needed={r.amount}
                have={have[r.material] ?? ''}
                onHave={(v) => onHave(r.material, v)}
              />
            ))
          )}
        </div>
      </section>

      <section className="panel breakdown">
        <h3>All Life Skills on one character</h3>
        <div className="cost-list">
          {gameData.lifeSkills.map((l) => (
            <TrackRow
              key={l.material}
              material={l.material}
              needed={l.amount}
              have={have[l.material] ?? ''}
              onHave={(v) => onHave(l.material, v)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
