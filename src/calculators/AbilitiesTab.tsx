// "Costs for all abilities Max to 10 + passive skills + life skills".
// These take no XP, so per the spec this is a fun-fact tracker (not part of the
// leveling calculators). The combat-ability cost is the COMBINED total to max
// all four abilities — not a per-skill cost — so it's counted once. Enter how
// much of each resource you have and it shows what's left.
import { useMemo, useState } from 'react'
import { gameData } from '../lib/calc'
import { parseInput, sanitizeResource, short, comma } from '../lib/format'
import { IconStack } from '../components/IconStack'

interface Req {
  material: string
  amount: number
}

function aggregate(rows: { material: string; amount: number }[]): Req[] {
  const map: Record<string, number> = {}
  const order: string[] = []
  for (const r of rows) {
    if (!(r.material in map)) order.push(r.material)
    map[r.material] = (map[r.material] ?? 0) + r.amount
  }
  return order.map((material) => ({ material, amount: map[material] }))
}

function TrackerSection({
  title,
  note,
  reqs,
  have,
  onHave,
}: {
  title: string
  note?: string
  reqs: Req[]
  have: Record<string, string>
  onHave: (key: string, val: string) => void
}) {
  const done = reqs.filter((r) => parseInput(have[r.material] ?? '') >= r.amount).length
  return (
    <section className="panel tracker">
      <div className="tracker-head">
        <h3>{title}</h3>
        <span className={`tracker-count${done === reqs.length ? ' all' : ''}`}>
          {done}/{reqs.length} done
        </span>
      </div>
      {note && <p className="reach-note">{note}</p>}
      <div className="cost-list">
        {reqs.map((r) => {
          const owned = parseInput(have[r.material] ?? '')
          const remaining = Math.max(0, r.amount - owned)
          const complete = remaining === 0
          return (
            <div className={`track-row${complete ? ' complete' : ''}`} key={r.material}>
              <IconStack name={r.material} />
              <span className="cost-label">{r.material}</span>
              <input
                className="track-input"
                type="text"
                inputMode="text"
                placeholder="0"
                title="How many you have. Accepts k/m (max 100m)."
                value={have[r.material] ?? ''}
                onChange={(e) => onHave(r.material, sanitizeResource(e.target.value))}
                spellCheck={false}
              />
              <span className="track-need" title={comma(r.amount)}>
                / {short(r.amount)}
              </span>
              <span className="track-status">
                {complete ? '✓' : `need ${short(remaining)}`}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function AbilitiesTab() {
  const { perSkill, passive1, passive2 } = gameData.abilities

  // One combined requirement list: all 4 combat abilities + both passives.
  const abilityReqs = useMemo(
    () => aggregate([...perSkill, ...passive1, ...passive2]),
    [perSkill, passive1, passive2],
  )
  const lifeReqs: Req[] = gameData.lifeSkills.map((l) => ({ material: l.material, amount: l.amount }))

  const [have, setHave] = useState<Record<string, string>>({})
  const onHave = (key: string, val: string) => setHave((p) => ({ ...p, [key]: val }))

  return (
    <div className="calc">
      <section className="panel reach">
        <h3>Progression tracker — abilities &amp; passives</h3>
        <p className="reach-note">
          The combat-ability figures are the <strong>combined total to max all four</strong>{' '}
          abilities (Base Attack · Redirect · Ultimate · Support) to Lv 10, plus Passive Skill 1 and
          Passive Skill 2 on one character. Enter what you have — the tracker shows what's left.
        </p>
      </section>

      <TrackerSection
        title="All abilities + passives (one character)"
        reqs={abilityReqs}
        have={have}
        onHave={onHave}
      />

      <TrackerSection
        title="All life skills on one character"
        note="A fun-fact goal — everything one character would spend to learn every life skill."
        reqs={lifeReqs}
        have={have}
        onHave={onHave}
      />
    </div>
  )
}
