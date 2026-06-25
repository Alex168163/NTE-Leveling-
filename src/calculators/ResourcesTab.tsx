// "My Resources" — the first tab. Lists every resource type in one place. Each
// input is wired to the same shared store (by canonical key) that the other
// tabs use, so filling something in here automatically fills it in everywhere
// (Characters, Arcs, Cartridges & Modules, Abilities).
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

export function ResourcesTab() {
  const { values, set } = useResources()

  const groups: Group[] = [
    { title: 'Beetle Coins', items: [{ key: 'coins', label: 'Beetle Coins', iconName: 'Beetle Coins' }] },
    xpGroup('Character XP — Hunter Guides', gameData.xpSources.character, 'guide'),
    xpGroup('Arc XP — Dyes', gameData.xpSources.arc, 'dye'),
    xpGroup('Cartridge / Module XP — Manholes', gameData.xpSources.cartridgeModule, 'manhole'),
    {
      title: 'World Materials',
      items: [
        { key: 'wd:Green', label: 'Green World Material', iconName: 'Green World Material' },
        { key: 'wd:Blue', label: 'Blue World Material', iconName: 'Blue World Material' },
        { key: 'wd:Purple', label: 'Purple World Material', iconName: 'Purple World Material' },
      ],
    },
    {
      title: 'Ability Upgrade Materials',
      items: [
        { key: 'ability:Green', label: 'Green Ability Upgrade Material', iconName: 'Green Ability Upgrade Material' },
        { key: 'ability:Blue', label: 'Blue Ability Upgrade Material', iconName: 'Blue Ability Upgrade Material' },
        { key: 'ability:Purple', label: 'Purple Ability Upgrade Material', iconName: 'Purple Ability Upgrade Material' },
      ],
    },
    {
      title: 'Arc Materials',
      items: [
        { key: 'arc:Green', label: 'Green Arc Material', iconName: 'Green Arc Material' },
        { key: 'arc:Blue', label: 'Blue Arc Material', iconName: 'Blue Arc Material' },
        { key: 'arc:Purple', label: 'Purple Arc Material', iconName: 'Purple Arc Material' },
      ],
    },
    {
      title: 'Anomaly Materials',
      items: [
        { key: 'anomalyHunt', label: 'Anomaly Hunt Material', iconName: 'Anomaly Hunt Material' },
        { key: 'anomalyPilgrimage', label: 'Anomaly Pilgrimage Material', iconName: 'Anomaly Pilgrimage Material' },
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
          Fill in everything you own <strong>here, once</strong>. These values are shared across the
          whole app, so they automatically fill in on every other tab — and they stay the same no
          matter which character is selected. Inputs accept <strong>k</strong> (thousand) and{' '}
          <strong>m</strong> (million), e.g. <code>26k</code> or <code>1.6m</code>, up to 999m.
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
