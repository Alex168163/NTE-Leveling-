import { useState } from 'react'
import { useResources } from './state/resources'
import { ResourcesTab } from './calculators/ResourcesTab'
import { CharacterCalc } from './calculators/CharacterCalc'
import { ArcCalc } from './calculators/ArcCalc'
import { CartridgeModuleCalc } from './calculators/CartridgeModuleCalc'
import { AbilitiesTab } from './calculators/AbilitiesTab'
import { FullMaxTab } from './calculators/FullMaxTab'

interface Tab {
  id: string
  label: string
  hint: string
  render: () => JSX.Element
}

const TABS: Tab[] = [
  { id: 'resources', label: 'My Resources', hint: 'Fill once · fills everywhere', render: () => <ResourcesTab /> },
  { id: 'characters', label: 'Characters', hint: 'Hunter Guides · XP & ascensions', render: () => <CharacterCalc /> },
  { id: 'arcs', label: 'Arcs', hint: 'Dyes · XP & ascensions', render: () => <ArcCalc /> },
  { id: 'cm', label: 'Cartridges & Modules', hint: 'Manholes · max to 20', render: () => <CartridgeModuleCalc /> },
  { id: 'abilities', label: 'Abilities & Life Skills', hint: 'Progression checker', render: () => <AbilitiesTab /> },
  { id: 'full', label: '1 → 80 Everything', hint: 'The grand total', render: () => <FullMaxTab /> },
]

export default function App() {
  const [active, setActive] = useState(TABS[0].id)
  const tab = TABS.find((t) => t.id === active)!
  const { reset } = useResources()

  return (
    <div className="app">
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
