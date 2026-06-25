// "1–80" tab — what everything maxed from 1 to 80 would cost, in one place.
// Sums: one character 1->80, one arc 1->80, one of every cartridge & module
// rarity, all four combat abilities + both passives, and all life skills.
import { useMemo } from 'react'
import { characterSteps, arcSteps, cumulativeCost, gameData } from '../lib/calc'
import { short, comma } from '../lib/format'
import { IconStack } from '../components/IconStack'

interface Line {
  label: string
  coins: number
  xp?: number
  xpLabel?: string
  mats: { name: string; qty: number; iconName: string }[]
}

export function FullMaxTab() {
  const lines = useMemo<Line[]>(() => {
    const out: Line[] = []

    const char = cumulativeCost(characterSteps(), 80)
    out.push({
      label: 'Character 1 → 80 (all 6 ascensions)',
      coins: char.coins,
      xp: char.xp,
      xpLabel: 'Character XP',
      mats: Object.values(char.mats).map((r) => ({ name: r.label, qty: r.qty, iconName: r.iconName })),
    })

    const arc = cumulativeCost(arcSteps(), 80)
    out.push({
      label: 'Arc 1 → 80 (all 6 ascensions)',
      coins: arc.coins,
      xp: arc.xp,
      xpLabel: 'Arc XP',
      mats: Object.values(arc.mats).map((r) => ({ name: r.label, qty: r.qty, iconName: r.iconName })),
    })

    const cmXP =
      gameData.cartridges.reduce((s, c) => s + c.xp, 0) +
      gameData.modules.reduce((s, m) => s + m.xp, 0)
    const cmCoins =
      gameData.cartridges.reduce((s, c) => s + c.coins, 0) +
      gameData.modules.reduce((s, m) => s + m.coins, 0)
    out.push({
      label: 'One of every Cartridge & Module rarity → Lv 20',
      coins: cmCoins,
      xp: cmXP,
      xpLabel: 'Cartridge/Module XP',
      mats: [],
    })

    // Abilities. The combat-ability cost already covers all four skills (it is
    // NOT per-skill), so each list is counted once.
    const { perSkill, passive1, passive2 } = gameData.abilities
    const allAbilityRows = [...perSkill, ...passive1, ...passive2]
    const abilityCoins = allAbilityRows
      .filter((r) => /beetle/i.test(r.material))
      .reduce((s, r) => s + r.amount, 0)
    const abilityMats: Record<string, number> = {}
    for (const r of allAbilityRows)
      if (!/beetle/i.test(r.material)) abilityMats[r.material] = (abilityMats[r.material] ?? 0) + r.amount
    out.push({
      label: 'All 4 combat abilities → Lv 10 + both passive skills',
      coins: abilityCoins,
      mats: Object.entries(abilityMats).map(([name, qty]) => ({ name, qty, iconName: name })),
    })

    out.push({
      label: 'All life skills on one character',
      coins: 0,
      mats: gameData.lifeSkills.map((l) => ({ name: l.material, qty: l.amount, iconName: l.material })),
    })

    return out
  }, [])

  const grandCoins = lines.reduce((s, l) => s + l.coins, 0)

  return (
    <div className="calc">
      <section className="panel reach grand">
        <h3>Grand total — everything maxed, 1 → 80</h3>
        <div className="reach-level">
          <IconStack name="Beetle Coins" size={34} />
          <strong title={comma(grandCoins)}>{short(grandCoins)}</strong> Beetle Coins
        </div>
        <p className="reach-note">
          Plus all the XP &amp; materials below. (XP is per category and comes from different
          sources — see each line.)
        </p>
      </section>

      {lines.map((l) => (
        <section key={l.label} className="panel breakdown">
          <h3>{l.label}</h3>
          <div className="cost-list">
            {l.coins > 0 && (
              <div className="cost-row">
                <IconStack name="Beetle Coins" />
                <span className="cost-label">Beetle Coins</span>
                <span className="cost-amount" title={comma(l.coins)}>{short(l.coins)}</span>
              </div>
            )}
            {l.xp != null && l.xp > 0 && (
              <div className="cost-row">
                <IconStack name="XP" />
                <span className="cost-label">{l.xpLabel}</span>
                <span className="cost-amount" title={comma(l.xp)}>{short(l.xp)}</span>
              </div>
            )}
            {l.mats.map((m) => (
              <div className="cost-row" key={m.name}>
                <IconStack name={m.iconName} />
                <span className="cost-label">{m.name}</span>
                <span className="cost-amount">{short(m.qty)}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
