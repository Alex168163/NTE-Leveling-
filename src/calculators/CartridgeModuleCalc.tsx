// Cartridges & Modules have no ascension — each item just maxes to Lv 20 by
// rarity. This tab lets you plan how many of each item type to max and checks
// it against your Manhole XP + Beetle Coins.
import { useMemo, useState } from 'react'
import { gameData, xpFromSources } from '../lib/calc'
import { parseInput, short } from '../lib/format'
import { ResourceInput } from '../components/ResourceInput'
import { CostRow } from '../components/CostRow'
import { IconStack } from '../components/IconStack'

interface Item {
  key: string
  type: string
  rarity: string
  xp: number
  coins: number
}

const COLORS = ['Green', 'Blue', 'Purple'] as const

export function CartridgeModuleCalc() {
  const items: Item[] = [
    ...gameData.cartridges.map((c) => ({ key: `cart:${c.rarity}`, type: 'Cartridge', rarity: c.rarity, xp: c.xp, coins: c.coins })),
    ...gameData.modules.map((m) => ({ key: `mod:${m.rarity}`, type: 'Module', rarity: m.rarity, xp: m.xp, coins: m.coins })),
  ]

  const [xpCounts, setXpCounts] = useState<Record<string, string>>({})
  const [coins, setCoins] = useState('')
  const [want, setWant] = useState<Record<string, string>>({})

  const src = gameData.xpSources.cartridgeModule

  const xpPool = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of COLORS) counts[c] = parseInput(xpCounts[c] ?? '')
    return xpFromSources(src, counts)
  }, [xpCounts, src])
  const coinPool = parseInput(coins)

  const need = useMemo(() => {
    let xp = 0
    let cn = 0
    for (const it of items) {
      const q = parseInput(want[it.key] ?? '')
      xp += q * it.xp
      cn += q * it.coins
    }
    return { xp, coins: cn }
  }, [want, items])

  const sourceByColor = (c: string) => src.find((s) => s.color === c)

  return (
    <div className="calc">
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
                  label={s.source}
                  iconName={s.source}
                  value={xpCounts[c] ?? ''}
                  onChange={(v) => setXpCounts((p) => ({ ...p, [c]: v }))}
                />
              )
            })}
            <div className="xp-total">= {short(xpPool)} Cartridge/Module XP</div>
          </div>
          <div className="input-col">
            <div className="col-head">Coins</div>
            <ResourceInput label="Beetle Coins" iconName="Beetle Coins" value={coins} onChange={setCoins} wide />
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
              const manholeIcon =
                it.rarity === 'Gold' ? 'Manhole Boss' : 'Manhole Crook'
              return (
                <tr key={it.key}>
                  <td>
                    <span className="mat-cell">
                      <IconStack name={manholeIcon} size={20} />
                      {it.type} · {it.rarity}
                    </span>
                  </td>
                  <td title={String(it.xp)}>{short(it.xp)}</td>
                  <td>{short(it.coins)}</td>
                  <td>
                    <input
                      className="mini"
                      inputMode="numeric"
                      placeholder="0"
                      value={want[it.key] ?? ''}
                      onChange={(e) => setWant((p) => ({ ...p, [it.key]: e.target.value }))}
                    />
                  </td>
                  <td className="muted">{Number.isFinite(affordable) ? affordable : '∞'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="footnote">*If you spent everything on that one item type.</p>
      </section>

      <section className="panel reach">
        <h3>Total for your plan</h3>
        <div className="cost-list">
          <CostRow label="Cartridge/Module XP" amount={need.xp} iconName={src[0].source} have={xpPool} />
          <CostRow label="Beetle Coins" amount={need.coins} iconName="Beetle Coins" have={coinPool} />
        </div>
      </section>
    </div>
  )
}
