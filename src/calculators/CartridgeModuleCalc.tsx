// Cartridge & Module Leveling. No ascension — each maxes to Lv 20. Per the
// update: only the Gold cartridge remains, and modules are split into Types
// II/III/IV (each its own cost). Choose how many of each you need and check it
// against your Manhole XP + Beetle Coins.
import { useMemo } from 'react'
import { gameData, xpFromSources } from '../lib/calc'
import { parseInput, sanitizeResource, short, cleanName } from '../lib/format'
import { ResourceInput } from '../components/ResourceInput'
import { CostRow } from '../components/CostRow'
import { IconStack } from '../components/IconStack'
import { CharacterBanner } from '../components/CharacterBanner'
import { useResources } from '../state/resources'

interface Item {
  key: string
  label: string
  icon: string
  xp: number
  coins: number
}

const COLORS = ['Green', 'Blue', 'Purple'] as const

export function CartridgeModuleCalc() {
  const gold = gameData.cartridges.find((c) => /gold/i.test(c.rarity))
  const items: Item[] = [
    ...(gold
      ? [{ key: 'cart:Gold', label: 'Gold Cartridge', icon: 'Cartridge', xp: gold.xp, coins: gold.coins }]
      : []),
    ...gameData.moduleTypes.map((m) => ({
      key: `mod:${m.type}`,
      label: `Module ${m.type}`,
      icon: `Module ${m.type}`,
      xp: m.xp,
      coins: m.coins,
    })),
  ]

  const { values, set } = useResources()
  const xpKey = (c: string) => `manhole:${c}`
  const wantKey = (k: string) => `want:${k}`

  const src = gameData.xpSources.cartridgeModule

  const xpPool = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of COLORS) counts[c] = parseInput(values[xpKey(c)] ?? '')
    return xpFromSources(src, counts)
  }, [values, src])
  const coinPool = parseInput(values['coins'] ?? '')

  const need = useMemo(() => {
    let xp = 0
    let cn = 0
    for (const it of items) {
      const q = parseInput(values[wantKey(it.key)] ?? '')
      xp += q * it.xp
      cn += q * it.coins
    }
    return { xp, coins: cn }
  }, [values, items])

  const sourceByColor = (c: string) => src.find((s) => s.color === c)

  return (
    <div className="calc">
      <CharacterBanner />

      <section className="panel inputs">
        <h3>Your resources</h3>
        <div className="input-grid">
          <div className="input-col">
            <div className="col-head">Manhole XP sources</div>
            {COLORS.map((c) => {
              const s = sourceByColor(c)
              if (!s) return null
              return (
                <ResourceInput
                  key={c}
                  label={cleanName(s.source)}
                  iconName={s.source}
                  value={values[xpKey(c)] ?? ''}
                  onChange={(v) => set(xpKey(c), v)}
                />
              )
            })}
            <div className="xp-total">= {short(xpPool)} Cartridge/Module XP</div>
          </div>
          <div className="input-col">
            <div className="col-head">Coins</div>
            <ResourceInput
              label="Beetle Coins"
              iconName="Beetle Coins"
              value={values['coins'] ?? ''}
              onChange={(v) => set('coins', v)}
              wide
            />
          </div>
        </div>
      </section>

      <section className="panel target">
        <h3>How many do you want to max to Lv 20?</h3>
        <table className="break-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>XP each</th>
              <th>Coins each</th>
              <th>Want</th>
              <th>Max affordable*</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const affordable = Math.min(
                it.xp ? Math.floor(xpPool / it.xp) : Infinity,
                it.coins ? Math.floor(coinPool / it.coins) : Infinity,
              )
              return (
                <tr key={it.key}>
                  <td>
                    <span className="mat-cell">
                      <IconStack name={it.icon} size={20} />
                      {it.label}
                    </span>
                  </td>
                  <td title={String(it.xp)}>{short(it.xp)}</td>
                  <td>{short(it.coins)}</td>
                  <td>
                    <input
                      className="mini"
                      inputMode="numeric"
                      placeholder="0"
                      value={values[wantKey(it.key)] ?? ''}
                      onChange={(e) => set(wantKey(it.key), sanitizeResource(e.target.value))}
                    />
                  </td>
                  <td className="muted">{Number.isFinite(affordable) ? affordable : '∞'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="footnote">
          *If you spent everything on that one item type. A “filled” module set is 1× Type IV + 4×
          Type III + 2× Type II.
        </p>
      </section>

      <section className="panel reach">
        <h3>Total for your plan</h3>
        <div className="cost-list">
          <CostRow label="Cartridge/Module XP" amount={need.xp} iconName="Cartridge/Module XP" have={xpPool} />
          <CostRow label="Beetle Coins" amount={need.coins} iconName="Beetle Coins" have={coinPool} />
        </div>
      </section>
    </div>
  )
}
