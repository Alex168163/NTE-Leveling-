// "My Resources" (first tab). One input box for EVERY specific resource, each
// with its single correct icon (no grouped icons) — anomaly-hunt has all 7,
// world/ability materials are split per tier, etc. Arc materials are the only
// grouped exception (#13). Values are shared across the app and stay the same
// regardless of which character is selected (#17).
import { gameData } from '../lib/calc'
import { cleanName } from '../lib/format'
import { ResourceInput } from '../components/ResourceInput'
import { useResources } from '../state/resources'
import type { XpSource } from '../types'

interface ResItem {
  key: string
  label: string
  iconName: string
}
interface Group {
  title: string
  items: ResItem[]
}

function xpGroup(title: string, sources: XpSource[], prefix: string): Group {
  return {
    title,
    items: sources.map((s) => ({
      key: `${prefix}:${s.color}`,
      label: cleanName(s.source),
      iconName: s.source,
    })),
  }
}

// One box per named material in a category — keyed by the material name so it
// shares with the per-character pools used by the calculators.
function namedGroup(title: string, category: string): Group {
  const names = gameData.inGameNames[category] ?? []
  return { title, items: names.map((name) => ({ key: name, label: name, iconName: name })) }
}

export function ResourcesTab() {
  const { values, set } = useResources()

  const groups: Group[] = [
    { title: 'Beetle Coins', items: [{ key: 'coins', label: 'Beetle Coins', iconName: 'Beetle Coins' }] },
    xpGroup('Character XP — Hunter Guides', gameData.xpSources.character, 'guide'),
    xpGroup('Arc XP — Dyes', gameData.xpSources.arc, 'dye'),
    xpGroup('Cartridge / Module XP — Manholes', gameData.xpSources.cartridgeModule, 'manhole'),

    namedGroup('Anomaly Hunt Materials', 'anomalyHunt'),
    namedGroup('Anomaly Pilgrimage Materials', 'anomalyPilgrimage'),
    namedGroup('Green Ability Upgrades', 'abilityGreen'),
    namedGroup('Blue Ability Upgrades', 'abilityBlue'),
    namedGroup('Purple Ability Upgrades', 'abilityPurple'),
    namedGroup('Green World Materials', 'wdGreen'),
    namedGroup('Blue World Materials', 'wdBlue'),
    namedGroup('Purple World Materials', 'wdPurple'),

    {
      // Arc materials are the one grouped exception (#13).
      title: 'Arc Materials (grouped)',
      items: [
        { key: 'arc:Green', label: 'Green Arc Material', iconName: 'Green Arc Material' },
        { key: 'arc:Blue', label: 'Blue Arc Material', iconName: 'Blue Arc Material' },
        { key: 'arc:Purple', label: 'Purple Arc Material', iconName: 'Purple Arc Material' },
      ],
    },
    {
      title: 'Fill-in Materials (substitutes)',
      items: [
        { key: 'heterogeneousUnit', label: 'Heterogeneous Unit', iconName: 'Heterogeneous Unit' },
        { key: 'expansionCore', label: 'Expansion Core', iconName: 'Expansion Core' },
      ],
    },
    {
      title: 'Life Skill Materials',
      items: [
        { key: 'dreamlessSeed', label: 'Dreamless Seed', iconName: 'Dreamless Seed' },
        { key: 'fons', label: 'Fons', iconName: 'Fons' },
      ],
    },
  ]

  return (
    <div className="calc">
      <section className="panel reach">
        <h3>My Resources</h3>
        <p className="reach-note">
          Your current resources will change all the time from dailies or spending it here and there.
          I wish I could sync the inventory from the game, but unfortunately it's a live-service game
          :(. Please make sure to update these resources whenever you are looking into leveling up a
          new character or a current one, just to see what the cost will be approximately.
        </p>
        <p className="reach-note">
          Every specific material has its own box with its own icon. Values are shared across the
          whole app and stay the same no matter which character is selected. Inputs accept{' '}
          <strong>k</strong> (thousand) and <strong>m</strong> (million), e.g. <code>26k</code> or{' '}
          <code>1.6m</code>, up to 999m.
        </p>
        <p className="reach-note">
          Any material-selection boxes aren't calculated here — either use them and add that material
          here, or hold on and use them when needed. Just know that if you have some, you can fill in
          materials you might be missing currently.
        </p>
        <p className="reach-note">
          <strong>Fill-in materials:</strong> a <em>Heterogeneous Unit</em> counts as any 1 green
          world material, and an <em>Expansion Core</em> as 1 green ability upgrade. They top up
          materials you're missing (fill rates — Green 1:1, Blue 3:1, Purple 9:1) and are only used
          once your real resources of that type run out.
        </p>
      </section>

      {groups.map((g) => (
        <section className="panel" key={g.title}>
          <h3>{g.title}</h3>
          <div className="res-grid">
            {g.items.map((it) => (
              <ResourceInput
                key={it.key}
                label={it.label}
                iconName={it.iconName}
                value={values[it.key] ?? ''}
                onChange={(v) => set(it.key, v)}
                wide
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
