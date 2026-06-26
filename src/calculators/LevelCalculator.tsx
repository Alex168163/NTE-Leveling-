// Shared calculator for the two categories that have leveling + ascensions
// (Characters and Arcs). Driven entirely by a config built from the parsed
// markdown data.
import { useMemo } from 'react'
import type { Step, XpSource } from '../types'
import { cumulativeCost, maxReach, xpFromSources, type Budget } from '../lib/calc'
import { parseInput, short, cleanName } from '../lib/format'
import { ResourceInput } from '../components/ResourceInput'
import { CostRow } from '../components/CostRow'
import { IconStack } from '../components/IconStack'
import { Slider } from '../components/Slider'
import { XpEquivalent } from '../components/XpEquivalent'
import { CharacterBanner } from '../components/CharacterBanner'
import { useResources } from '../state/resources'
import {
  SELECTED_KEY,
  displayLabel,
  effectiveResourceKey,
  cLevelKey,
  parseCharLevel,
  cAscKey,
  charAscension,
  ascensionForLevel,
} from '../lib/characters'

export interface MatInput {
  id: string
  label: string
  iconName: string
}
export interface LevelConfig {
  id: string // 'char' | 'arc' — namespaces the target slider
  xpKeyPrefix: string // 'guide' | 'dye' — namespaces XP-source counts
  usesCharacterLevel?: boolean // char tab: current level comes from the selected character
  steps: Step[]
  xpSources: XpSource[]
  xpLabel: string
  matInputs: MatInput[]
}

const COLORS = ['Green', 'Blue', 'Purple'] as const
// Current-level choices: "New" (level 1) plus every 10 from 20 to 80.
const CURRENT_OPTIONS = [1, 20, 30, 40, 50, 60, 70, 80] as const

export function LevelCalculator({ config }: { config: LevelConfig }) {
  const { values, set } = useResources()
  const char = values[SELECTED_KEY] ?? '' // selected character (for material names)
  const levels = config.steps.map((s) => s.to) // e.g. [20,30,...,80]

  // Current level — the level you're ALREADY at. Locks the slider's floor and
  // makes the cost cover only the levels you have left. On the Character tab it
  // comes from the selected character (set on My Characters); otherwise it's a
  // per-tab value. "1" = new / unlevelled.
  const fromCharacter = !!config.usesCharacterLevel && !!char
  const curKey = fromCharacter ? cLevelKey(char) : `ui:cur:${config.id}`
  const currentLevel =
    (fromCharacter ? parseCharLevel(values[curKey]) : Number(values[curKey])) || 1
  const setCurrentLevel = (lv: number) => set(curKey, String(lv))

  // A character set "one ahead" on My Characters has already paid the current
  // bracket's ascension, so its cost is excluded automatically. No manual toggle.
  const hasAscension = currentLevel >= 20 && currentLevel <= 70
  const fromCharAsc = !!config.usesCharacterLevel && !!char
  const ascDoneLevel =
    fromCharAsc &&
    hasAscension &&
    charAscension(values[cAscKey(char)], currentLevel) > ascensionForLevel(currentLevel)
      ? currentLevel
      : null

  const minTarget = Math.max(currentLevel, levels[0])
  const sliderLevels = levels.filter((l) => l >= minTarget)

  const targetKey = `ui:target:${config.id}`
  const defaultTarget = levels[levels.length - 1]
  const rawTarget = Number(values[targetKey] ?? defaultTarget) || defaultTarget
  const target = Math.min(levels[levels.length - 1], Math.max(rawTarget, minTarget))
  const setTarget = (lv: number) => set(targetKey, String(lv))

  const xpKey = (c: string) => `${config.xpKeyPrefix}:${c}`

  const budget: Budget = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of COLORS) counts[c] = parseInput(values[xpKey(c)] ?? '')
    const mats: Record<string, number> = {}
    for (const m of config.matInputs)
      mats[m.id] = parseInput(values[effectiveResourceKey(m.id, char)] ?? '')
    return { xp: xpFromSources(config.xpSources, counts), coins: parseInput(values['coins'] ?? ''), mats }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, config])

  const totals = useMemo(
    () => cumulativeCost(config.steps, target, currentLevel, ascDoneLevel),
    [config.steps, target, currentLevel, ascDoneLevel],
  )
  const reach = useMemo(
    () => maxReach(config.steps, budget, currentLevel, ascDoneLevel),
    [config.steps, budget, currentLevel, ascDoneLevel],
  )

  // Fill-in substitutes: Heterogeneous Units cover world-material shortfalls and
  // Expansion Cores cover ability-upgrade shortfalls — used only after your real
  // resources run out, at Green 1:1, Blue 3:1, Purple 9:1.
  const fill = useMemo(() => {
    const RATE: Record<string, number> = { Green: 1, Blue: 3, Purple: 9 }
    const res: Record<string, { have: number; used: number; sub: string; cost: number }> = {}
    let hetero = parseInput(values['heterogeneousUnit'] ?? '')
    let expansion = parseInput(values['expansionCore'] ?? '')
    for (const color of ['Green', 'Blue', 'Purple']) {
      for (const kind of ['wd', 'ability'] as const) {
        const id = `${kind}:${color}`
        const req = totals.mats[id]
        if (!req) continue
        const have = budget.mats[id] ?? 0
        const shortfall = Math.max(0, req.qty - have)
        if (shortfall <= 0) continue
        const rate = RATE[color]
        const pool = kind === 'wd' ? hetero : expansion
        const filled = Math.min(shortfall, Math.floor(pool / rate))
        if (filled <= 0) continue
        if (kind === 'wd') hetero -= filled * rate
        else expansion -= filled * rate
        res[id] = {
          have: have + filled,
          used: filled,
          sub: kind === 'wd' ? 'Heterogeneous Units' : 'Expansion Cores',
          cost: filled * rate,
        }
      }
    }
    return res
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals, budget, values])

  // Map color -> the XP source row (for icon + per-unit value).
  const sourceByColor = (c: string) => config.xpSources.find((s) => s.color === c)

  return (
    <div className="calc">
      <CharacterBanner />

      {/* ---- Current level (slider floor) ---- */}
      <section className="panel level-set">
        <div className="level-set-head">
          <h3>Your current level</h3>
          <span className="level-set-hint">
            Already levelled? Set it here — the slider won't go below it and costs only count the
            levels you have left.
          </span>
        </div>
        <div className="level-pills">
          {CURRENT_OPTIONS.map((l) => (
            <button
              key={l}
              className={`level-pill${currentLevel === l ? ' active' : ''}`}
              onClick={() => setCurrentLevel(l)}
            >
              {l === 1 ? 'New' : l}
            </button>
          ))}
        </div>
      </section>

      {/* ---- Owned resources ---- */}
      <section className="panel inputs">
        <h3>Your resources</h3>
        <div className="input-grid">
          <div className="input-col">
            <div className="col-head">{config.xpLabel} sources</div>
            {COLORS.map((c) => {
              const src = sourceByColor(c)
              if (!src) return null
              return (
                <ResourceInput
                  key={c}
                  label={cleanName(src.source)}
                  iconName={src.source}
                  value={values[xpKey(c)] ?? ''}
                  onChange={(v) => set(xpKey(c), v)}
                />
              )
            })}
            <div className="xp-total">
              = {short(budget.xp)} {config.xpLabel}
            </div>
          </div>

          <div className="input-col">
            <div className="col-head">Materials &amp; coins</div>
            <ResourceInput
              label="Beetle Coins"
              iconName="Beetle Coins"
              value={values['coins'] ?? ''}
              onChange={(v) => set('coins', v)}
              wide
            />
            {config.matInputs.map((m) => {
              const disp = displayLabel(m.id, m.label, char)
              const rk = effectiveResourceKey(m.id, char)
              return (
                <ResourceInput
                  key={m.id}
                  label={disp}
                  iconName={disp}
                  value={values[rk] ?? ''}
                  onChange={(v) => set(rk, v)}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* ---- Max reach readout ---- */}
      <section className="panel reach">
        <h3>How high can you go?</h3>
        <div className="reach-level">
          Level <strong>{reach.level}</strong>
        </div>
        {reach.nextLevel ? (
          <p className="reach-note">
            To reach <strong>Lv {reach.nextLevel}</strong> you still need:{' '}
            {reach.blockedBy.join(', ')}.
          </p>
        ) : (
          <p className="reach-note good">Maxed — your resources cover all the way to Lv 80. 🎉</p>
        )}
      </section>

      {/* ---- Target slider + cost ---- */}
      <section className="panel target">
        <div className="target-head">
          <h3>Cost {currentLevel > 1 ? `from Lv ${currentLevel} ` : ''}to reach</h3>
          <div className="target-badge">Lv {target}</div>
        </div>
        <Slider levels={sliderLevels} value={target} onChange={setTarget} />

        <div className="cost-list">
          <CostRow
            label={config.xpLabel}
            amount={totals.xp}
            iconName="XP"
            have={budget.xp}
            extra={<XpEquivalent xp={totals.xp} sources={config.xpSources} />}
          />
          <CostRow label="Beetle Coins" amount={totals.coins} iconName="Beetle Coins" have={budget.coins} />
          {Object.values(totals.mats).map((r) => {
            const disp = displayLabel(r.id, r.label, char)
            const f = fill[r.id]
            return (
              <CostRow
                key={r.id}
                label={disp}
                amount={r.qty}
                iconName={disp}
                have={f ? f.have : budget.mats[r.id] ?? 0}
                extra={
                  f && f.used > 0 ? (
                    <span className="fill-note">
                      +{f.used} from {f.sub} ({f.cost} used)
                    </span>
                  ) : undefined
                }
              />
            )
          })}
        </div>
      </section>

      {/* ---- Per-step breakdown ---- */}
      <section className="panel breakdown">
        <h3>Per-ascension breakdown</h3>
        <table className="break-table">
          <thead>
            <tr>
              <th>Reach</th>
              <th>{config.xpLabel}</th>
              <th>Coins</th>
              <th>Ascension materials</th>
            </tr>
          </thead>
          <tbody>
            {config.steps.map((s) => {
              const cls =
                s.to <= currentLevel
                  ? 'done-step'
                  : s.to <= target
                    ? 'in-range'
                    : ''
              return (
              <tr key={s.to} className={cls}>
                <td>Lv {s.to}</td>
                <td title={String(s.levelXP)}>{short(s.levelXP)}</td>
                <td>{short(s.coins)}</td>
                <td>
                  {s.reqs.length === 0 ? (
                    <span className="muted">—</span>
                  ) : (
                    <span className="mat-cells">
                      {s.reqs.map((r) => {
                        const disp = displayLabel(r.id, r.label, char)
                        return (
                          <span key={r.id} className="mat-cell">
                            <IconStack name={disp} size={20} />
                            {r.qty}× {disp}
                          </span>
                        )
                      })}
                    </span>
                  )}
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
