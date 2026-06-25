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
      title: 'World Drop Materials',
      items: [
        { key: 'wd:Green', label: 'Green World Drop Material', iconName: 'Green World Material' },
        { key: 'wd:Blue', label: 'Blue World Drop Material', iconName: 'Blue World Material' },
        { key: 'wd:Purple', label: 'Purple World Drop Material', iconName: 'Purple World Material' },
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
      title: 'Ability Upgrade Materials',
      items: [
        { key: 'ability:Gold', label: 'Gold Ability Upgrade Material', iconName: 'Gold Ability Upgrade' },
        { key: 'ability:Silver', label: 'Silver Ability Upgrade Material', iconName: 'Silver Ability Upgrade' },
        { key: 'ability:Bronze', label: 'Bronze Ability Upgrade Material', iconName: 'Bronze Ability Upgrade' },
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
          whole app, so they automatically fill in on every other tab — Characters, Arcs, Cartridges
          &amp; Modules, and Abilities. Inputs accept <strong>k</strong> (thousand) and{' '}
          <strong>m</strong> (million), e.g. <code>26k</code> or <code>1.6m</code>, up to 100m.
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
