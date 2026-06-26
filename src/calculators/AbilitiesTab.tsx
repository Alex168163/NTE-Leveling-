// Ability & Life Skill Leveling. The combat-ability cost is now PER LEVEL
// (Ability_Changes_Update.md): pick the selected character's current ability
// level (from My Characters) and slide to a target — capped by ascension — to
// see the materials (this character's specific ones) and fixed coins to bring
// all 4 abilities there. Passive skills and life skills stay as trackers.
import { useMemo } from 'react'
import { gameData } from '../lib/calc'
import { parseInput, short, comma } from '../lib/format'
import { IconStack } from '../components/IconStack'
import { CostRow } from '../components/CostRow'
import { CharacterBanner } from '../components/CharacterBanner'
import { Slider } from '../components/Slider'
import { useResources } from '../state/resources'
import { resourceKeyForMaterial } from '../lib/resourceKey'
import {
  SELECTED_KEY,
  getCharacter,
  displayLabel,
  effectiveResourceKey,
  cLevelKey,
  cAbilityKey,
  cAscKey,
  parseCharLevel,
  charAscension,
  maxAbilityLevel,
  ABILITY_LEVELS,
  CATEGORY_TO_KEY,
} from '../lib/characters'

const RATE: Record<string, number> = { Green: 1, Blue: 3, Purple: 9 }
// category -> [substitute pool key | null, tier]
const CAT_FILL: Record<string, [string | null, string]> = {
  abilityGreen: ['expansionCore', 'Green'],
  abilityBlue: ['expansionCore', 'Blue'],
  abilityPurple: ['expansionCore', 'Purple'],
  wdGreen: ['heterogeneousUnit', 'Green'],
  wdBlue: ['heterogeneousUnit', 'Blue'],
  wdPurple: ['heterogeneousUnit', 'Purple'],
}

// A small manual tracker row (passives / life skills).
function TrackRow({
  display,
  needed,
  have,
  onHave,
}: {
  display: string
  needed: number
  have: string
  onHave: (v: string) => void
}) {
  const owned = parseInput(have)
  const left = Math.max(0, needed - owned)
  return (
    <div className={`track-row${left === 0 ? ' complete' : ''}`}>
      <IconStack name={display} />
      <span className="cost-label">{display}</span>
      <input
        className="track-input"
        type="text"
        placeholder="0"
        value={have}
        onChange={(e) => onHave(e.target.value)}
        spellCheck={false}
      />
      <span className="track-need" title={comma(needed)}>
        / {short(needed)}
      </span>
      <span className="track-status">{left === 0 ? '✓ done' : `need ${short(left)}`}</span>
    </div>
  )
}

export function AbilitiesTab() {
  const { values, set } = useResources()
  const char = values[SELECTED_KEY] ?? ''
  const ch = getCharacter(char)
  const lvl = ch ? parseCharLevel(values[cLevelKey(char)]) : null
  const owned = !!ch && lvl != null
  const asc = owned ? charAscension(values[cAscKey(char)], lvl as number) : 0
  const maxTarget = maxAbilityLevel(asc)
  const curAbility = owned
    ? Math.min(maxTarget, Math.max(1, Number(values[cAbilityKey(char)] ?? 1) || 1))
    : 1

  const levels: number[] = []
  for (let l = curAbility; l <= maxTarget; l++) levels.push(l)
  const targetKey = 'ui:abtarget'
  const target = Math.min(
    maxTarget,
    Math.max(curAbility, Number(values[targetKey] ?? maxTarget) || maxTarget),
  )
  const setTarget = (l: number) => set(targetKey, String(l))

  // Per-category cost (×4 abilities) from curAbility -> target.
  const cost = useMemo(() => {
    const byCat: Record<string, number> = {}
    let coins = 0
    for (const row of ABILITY_LEVELS) {
      if (row.level <= curAbility || row.level > target) continue
      coins += row.coins * 4
      for (const m of row.mats) byCat[m.cat] = (byCat[m.cat] ?? 0) + m.qty * 4
    }
    return { byCat, coins }
  }, [curAbility, target])

  // Build display rows with have + fill-in substitutes.
  const rows = useMemo(() => {
    let hetero = parseInput(values['heterogeneousUnit'] ?? '')
    let expansion = parseInput(values['expansionCore'] ?? '')
    // tier order so green is filled before blue/purple
    const order = ['abilityGreen', 'abilityBlue', 'abilityPurple', 'wdGreen', 'wdBlue', 'wdPurple', 'anomalyPilgrimage']
    return order
      .filter((cat) => cost.byCat[cat])
      .map((cat) => {
        const need = cost.byCat[cat]
        const storeKey = effectiveResourceKey(CATEGORY_TO_KEY[cat], char)
        const label = displayLabel(CATEGORY_TO_KEY[cat], CATEGORY_TO_KEY[cat], char)
        const realHave = parseInput(values[storeKey] ?? '')
        let have = realHave
        let note: string | undefined
        const f = CAT_FILL[cat]
        if (f) {
          const [pool, tier] = f
          const rate = RATE[tier]
          const shortfall = Math.max(0, need - realHave)
          const avail = pool === 'expansionCore' ? expansion : hetero
          const filled = Math.min(shortfall, Math.floor(avail / rate))
          if (filled > 0) {
            if (pool === 'expansionCore') expansion -= filled * rate
            else hetero -= filled * rate
            have = realHave + filled
            note = `+${filled} from ${pool === 'expansionCore' ? 'Expansion Cores' : 'Heterogeneous Units'} (${filled * rate} used)`
          }
        }
        return { cat, label, need, have, note }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost, values, char])

  const coinsHave = parseInput(values['coins'] ?? '')

  // Passive skills + life skills (manual trackers, per-character names).
  const keyFor = (m: string) => effectiveResourceKey(resourceKeyForMaterial(m), char)
  const passives = [...gameData.abilities.passive1, ...gameData.abilities.passive2]

  return (
    <div className="calc">
      <CharacterBanner />

      {!owned ? (
        <section className="panel reach">
          <h3>Ability upgrades</h3>
          <p className="reach-note">
            Select a character <strong>and set its level</strong> on the <strong>My Characters</strong>{' '}
            tab to calculate ability-upgrade costs. Ability levels are capped by ascension, so set the
            character's level and ascension first.
          </p>
        </section>
      ) : (
        <section className="panel target">
          <div className="target-head">
            <h3>Upgrade all 4 abilities</h3>
            <div className="target-badge">Lv {target}</div>
          </div>
          <div className="ability-current">
            <span>My current ability level:</span>
            <select
              value={String(curAbility)}
              onChange={(e) => set(cAbilityKey(char), e.target.value)}
              title="Set once here — editable anytime"
            >
              {Array.from({ length: maxTarget }, (_, i) => i + 1).map((a) => (
                <option key={a} value={a}>
                  Lv {a}
                </option>
              ))}
            </select>
            <span className="muted">
              capped at Lv {maxTarget} by Ascension {asc}
            </span>
          </div>
          {maxTarget <= curAbility ? (
            <p className="reach-note">
              Abilities are already at the max for Ascension {asc} (Lv {maxTarget}). Raise the
              character's ascension on My Characters to unlock higher ability levels.
            </p>
          ) : (
            <>
              <Slider levels={levels} value={target} onChange={setTarget} />
              <div className="cost-list">
                <CostRow label="Beetle Coins" amount={cost.coins} iconName="Beetle Coins" have={coinsHave} />
                {rows.map((r) => (
                  <CostRow
                    key={r.cat}
                    label={r.label}
                    amount={r.need}
                    iconName={r.label}
                    have={r.have}
                    extra={r.note ? <span className="fill-note">{r.note}</span> : undefined}
                  />
                ))}
              </div>
              <p className="footnote">
                Costs are per ability level × 4 abilities. Beetle Coins are the same for every
                character; materials are {ch?.name}'s specific ones.
              </p>
            </>
          )}
        </section>
      )}

      <section className="panel breakdown">
        <h3>Passive skills (1 &amp; 2)</h3>
        <div className="cost-list">
          {passives.map((r, i) => (
            <TrackRow
              key={`${r.material}-${i}`}
              display={displayLabel(resourceKeyForMaterial(r.material), r.material, char)}
              needed={r.amount}
              have={values[keyFor(r.material)] ?? ''}
              onHave={(v) => set(keyFor(r.material), v)}
            />
          ))}
        </div>
      </section>

      <section className="panel breakdown">
        <h3>All Life Skills on one character</h3>
        <div className="cost-list">
          {gameData.lifeSkills.map((l) => (
            <TrackRow
              key={l.material}
              display={l.material}
              needed={l.amount}
              have={values[resourceKeyForMaterial(l.material)] ?? ''}
              onHave={(v) => set(resourceKeyForMaterial(l.material), v)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
