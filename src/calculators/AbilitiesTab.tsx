// Ability & Life Skill Leveling. Self-contained: pick a character here (or on
// My Characters), set/confirm its level & ascension inline, then set the current
// ability level and slide to a target. Costs use the per-LEVEL table
// (Ability_Changes_Update.md): the character's specific materials × 4 abilities
// + fixed coins, with Heterogeneous/Expansion fill-in. Passive & life skills
// stay as manual trackers.
import { useMemo } from 'react'
import { gameData } from '../lib/calc'
import { parseInput, short, comma, sanitizeResource } from '../lib/format'
import { IconStack } from '../components/IconStack'
import { CostRow } from '../components/CostRow'
import { Slider } from '../components/Slider'
import { useResources } from '../state/resources'
import { resourceKeyForMaterial } from '../lib/resourceKey'
import {
  SELECTED_KEY,
  roster,
  getCharacter,
  displayLabel,
  effectiveResourceKey,
  cLevelKey,
  cAbilityKey,
  cAscKey,
  LEVEL_OPTIONS,
  parseCharLevel,
  charAscension,
  ascensionForLevel,
  maxAscensionAt,
  maxAbilityLevel,
  ABILITY_LEVELS,
  CATEGORY_TO_KEY,
} from '../lib/characters'

const RATE: Record<string, number> = { Green: 1, Blue: 3, Purple: 9 }
const CAT_FILL: Record<string, [string, string]> = {
  abilityGreen: ['expansionCore', 'Green'],
  abilityBlue: ['expansionCore', 'Blue'],
  abilityPurple: ['expansionCore', 'Purple'],
  wdGreen: ['heterogeneousUnit', 'Green'],
  wdBlue: ['heterogeneousUnit', 'Blue'],
  wdPurple: ['heterogeneousUnit', 'Purple'],
}
const ORDER = ['abilityGreen', 'abilityBlue', 'abilityPurple', 'wdGreen', 'wdBlue', 'wdPurple', 'anomalyPilgrimage']

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
  const left = Math.max(0, needed - parseInput(have))
  return (
    <div className={`track-row${left === 0 ? ' complete' : ''}`}>
      <IconStack name={display} />
      <span className="cost-label">{display}</span>
      <input
        className="track-input"
        type="text"
        placeholder="0"
        maxLength={7}
        value={have}
        onChange={(e) => onHave(sanitizeResource(e.target.value))}
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
  const hasLevel = lvl != null
  const asc = ch && hasLevel ? charAscension(values[cAscKey(char)], lvl) : 0
  const maxByAsc = ch && hasLevel ? maxAbilityLevel(asc) : 1

  const curAbility = ch
    ? Math.min(Math.max(1, maxByAsc), Math.max(1, Number(values[cAbilityKey(char)] ?? 1) || 1))
    : 1
  const sliderLevels: number[] = []
  for (let l = curAbility; l <= maxByAsc; l++) sliderLevels.push(l)
  const targetKey = 'ui:abtarget'
  const target = Math.min(maxByAsc, Math.max(curAbility, Number(values[targetKey] ?? maxByAsc) || maxByAsc))

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

  const rows = useMemo(() => {
    let hetero = parseInput(values['heterogeneousUnit'] ?? '')
    let expansion = parseInput(values['expansionCore'] ?? '')
    return ORDER.filter((cat) => cost.byCat[cat]).map((cat) => {
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
  const keyFor = (m: string) => effectiveResourceKey(resourceKeyForMaterial(m), char)
  const passives = [...gameData.abilities.passive1, ...gameData.abilities.passive2]

  const ascOptions: number[] = []
  if (hasLevel && lvl >= 20)
    for (let a = ascensionForLevel(lvl); a <= maxAscensionAt(lvl); a++) ascOptions.push(a)

  return (
    <div className="calc">
      {/* ---- character + level + ascension (editable here too) ---- */}
      <section className="panel inputs">
        <h3>Whose abilities?</h3>
        <div className="ability-current">
          <span>Character:</span>
          <select value={char} onChange={(e) => set(SELECTED_KEY, e.target.value)}>
            <option value="">— select a character —</option>
            {roster.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.rank})
              </option>
            ))}
          </select>
          {ch && (
            <>
              <span>Level:</span>
              <select value={values[cLevelKey(char)] ?? ''} onChange={(e) => set(cLevelKey(char), e.target.value)}>
                <option value="">— set —</option>
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    Lv {l}
                  </option>
                ))}
              </select>
            </>
          )}
          {ch && hasLevel && lvl >= 20 && ascOptions.length > 1 && (
            <>
              <span>Ascension:</span>
              <select value={String(asc)} onChange={(e) => set(cAscKey(char), e.target.value)}>
                {ascOptions.map((a) => (
                  <option key={a} value={a}>
                    Asc {a}
                    {a > ascensionForLevel(lvl) ? ' (one ahead)' : ''}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        {!ch && <p className="reach-note">Pick a character to calculate ability-upgrade costs.</p>}
        {ch && !hasLevel && (
          <p className="reach-note">Set {ch.name}'s level above (ability levels are capped by ascension).</p>
        )}
      </section>

      {/* ---- ability upgrade slider + cost ---- */}
      {ch && hasLevel && (
        <section className="panel target">
          <div className="target-head">
            <h3>Upgrade all 4 abilities</h3>
            {maxByAsc > 1 && <div className="target-badge">Lv {target}</div>}
          </div>
          <div className="ability-current">
            <span>Current ability level:</span>
            <select value={String(curAbility)} onChange={(e) => set(cAbilityKey(char), e.target.value)}>
              {Array.from({ length: Math.max(1, maxByAsc) }, (_, i) => i + 1).map((a) => (
                <option key={a} value={a}>
                  Lv {a}
                </option>
              ))}
            </select>
            <span className="muted">max Lv {maxByAsc} at Ascension {asc}</span>
          </div>

          {maxByAsc <= 1 ? (
            <p className="reach-note">
              No ability upgrades available yet — Lv 2 needs Ascension 2 (character Lv 40+). Raise{' '}
              {ch.name}'s level/ascension above.
            </p>
          ) : curAbility >= maxByAsc ? (
            <p className="reach-note good">
              Abilities are at the cap for Ascension {asc} (Lv {maxByAsc}). Raise ascension to unlock
              more.
            </p>
          ) : (
            <>
              <Slider levels={sliderLevels} value={target} onChange={(l) => set(targetKey, String(l))} />
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
                Per ability level × 4 abilities. Beetle Coins are the same for every character;
                materials are {ch.name}'s specific ones.
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
