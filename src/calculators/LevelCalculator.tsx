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
import { useResources } from '../state/resources'

export interface MatInput {
  id: string
  label: string
  iconName: string
}
export interface LevelConfig {
  id: string // 'char' | 'arc' — namespaces the target slider
  xpKeyPrefix: string // 'guide' | 'dye' — namespaces XP-source counts
  steps: Step[]
  xpSources: XpSource[]
  xpLabel: string
  matInputs: MatInput[]
}

const COLORS = ['Green', 'Blue', 'Purple'] as const

export function LevelCalculator({ config }: { config: LevelConfig }) {
  const { values, set } = useResources()
  const levels = config.steps.map((s) => s.to) // e.g. [20,30,...,80]

  const targetKey = `ui:target:${config.id}`
  const defaultTarget = levels[levels.length - 1]
  const target = Number(values[targetKey] ?? defaultTarget) || defaultTarget
  const setTarget = (lv: number) => set(targetKey, String(lv))

  const xpKey = (c: string) => `${config.xpKeyPrefix}:${c}`

  const budget: Budget = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of COLORS) counts[c] = parseInput(values[xpKey(c)] ?? '')
    const mats: Record<string, number> = {}
    for (const m of config.matInputs) mats[m.id] = parseInput(values[m.id] ?? '')
    return { xp: xpFromSources(config.xpSources, counts), coins: parseInput(values['coins'] ?? ''), mats }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, config])

  const totals = useMemo(() => cumulativeCost(config.steps, target), [config.steps, target])
  const reach = useMemo(() => maxReach(config.steps, budget), [config.steps, budget])

  // Map color -> the XP source row (for icon + per-unit value).
  const sourceByColor = (c: string) => config.xpSources.find((s) => s.color === c)

  return (
    <div className="calc">
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
            {config.matInputs.map((m) => (
              <ResourceInput
                key={m.id}
                label={m.label}
                iconName={m.iconName}
                value={values[m.id] ?? ''}
                onChange={(v) => set(m.id, v)}
              />
            ))}
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
          <h3>Cost to reach</h3>
          <div className="target-badge">Lv {target}</div>
        </div>
        <Slider levels={levels} value={target} onChange={setTarget} />

        <div className="cost-list">
          <CostRow
            label={config.xpLabel}
            amount={totals.xp}
            iconName="XP"
            have={budget.xp}
            extra={<XpEquivalent xp={totals.xp} sources={config.xpSources} />}
          />
          <CostRow label="Beetle Coins" amount={totals.coins} iconName="Beetle Coins" have={budget.coins} />
          {Object.values(totals.mats).map((r) => (
            <CostRow
              key={r.id}
              label={r.label}
              amount={r.qty}
              iconName={r.iconName}
              have={budget.mats[r.id] ?? 0}
            />
          ))}
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
            {config.steps.map((s) => (
              <tr key={s.to} className={s.to <= target ? 'in-range' : ''}>
                <td>Lv {s.to}</td>
                <td title={String(s.levelXP)}>{short(s.levelXP)}</td>
                <td>{short(s.coins)}</td>
                <td>
                  {s.reqs.length === 0 ? (
                    <span className="muted">—</span>
                  ) : (
                    <span className="mat-cells">
                      {s.reqs.map((r) => (
                        <span key={r.id} className="mat-cell">
                          <IconStack name={r.iconName} size={20} />
                          {r.qty}× {r.label}
                        </span>
                      ))}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
