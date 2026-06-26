import { useState } from 'react'
import { useResources } from './state/resources'
import { ResourcesTab } from './calculators/ResourcesTab'
import { MyCharactersTab } from './calculators/MyCharactersTab'
import { CharacterCalc } from './calculators/CharacterCalc'
import { ArcCalc } from './calculators/ArcCalc'
import { CartridgeModuleCalc } from './calculators/CartridgeModuleCalc'
import { AbilitiesTab } from './calculators/AbilitiesTab'
import { MyTeamsTab } from './calculators/MyTeamsTab'
import { FullMaxTab } from './calculators/FullMaxTab'

interface Tab {
  id: string
  label: string
  hint: string
  render: () => JSX.Element
}

const TABS: Tab[] = [
  { id: 'resources', label: 'My Resources', hint: 'Fill once · fills everywhere', render: () => <ResourcesTab /> },
  { id: 'mychars', label: 'My Characters', hint: 'Pick who you own', render: () => <MyCharactersTab /> },
  { id: 'characters', label: 'Character Leveling', hint: 'Hunter Guides · XP & ascensions', render: () => <CharacterCalc /> },
  { id: 'arcs', label: 'Arc Leveling', hint: 'Dyes · XP & ascensions', render: () => <ArcCalc /> },
  { id: 'cm', label: 'Cartridge and Module Leveling', hint: 'Manholes · max to 20', render: () => <CartridgeModuleCalc /> },
  { id: 'abilities', label: 'Ability & Life Skill Leveling', hint: 'Progression checker', render: () => <AbilitiesTab /> },
  { id: 'teams', label: 'My Teams', hint: 'Up to 10 teams of 4', render: () => <MyTeamsTab /> },
  { id: 'full', label: '1 → 80 Everything', hint: 'The grand total', render: () => <FullMaxTab /> },
]

const VIDEO_URL = `${import.meta.env.BASE_URL}assets/Rick Roll.mp4`

export default function App() {
  const [active, setActive] = useState(TABS[0].id)
  const tab = TABS.find((t) => t.id === active)!
  const { reset } = useResources()
  const [playing, setPlaying] = useState(false)

  return (
    <div className="app">
      <button className="easter-egg" onClick={() => setPlaying(true)}>
        Esper Zero and Mint Kissing Here!
      </button>

      {playing && (
        <div className="rickroll-overlay">
          <video
            className="rickroll-video"
            src={VIDEO_URL}
            autoPlay
            onEnded={() => setPlaying(false)}
            onError={() => setPlaying(false)}
          />
        </div>
      )}

      <header className="app-header">
        <div className="logo">
          <span className="logo-n">NTE</span>
          <span className="logo-sub">Leveling Calculator &amp; Resource Checker</span>
        </div>
        <div className="header-right">
          <div className="logo-tag">Neverness&nbsp;To&nbsp;Everness · QOL tool</div>
          <button
            className="reset-btn"
            onClick={() => {
              if (confirm('Clear every value you have entered across all tabs?')) reset()
            }}
            title="Clear all saved inputs"
          >
            Reset inputs
          </button>
        </div>
      </header>

      <div className="disclaimer">
        <strong>Disclaimer:</strong> In-Game rounding lands some upgrades to inconsistent numbers,
        some beetle coin calculations and XP calculations are rounded to the nearest thousand. This
        means you might have a little extra left over even after using this calculator.
      </div>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={t.id === active ? 'tab active' : 'tab'}
            onClick={() => setActive(t.id)}
          >
            <span className="tab-label">{t.label}</span>
            <span className="tab-hint">{t.hint}</span>
          </button>
        ))}
      </nav>

      <main className="content">{tab.render()}</main>

      <footer className="app-footer">
        This is an unofficial fan tool Made by Parkdevelopment
      </footer>
    </div>
  )
}
