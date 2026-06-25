import { useState } from 'react'
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
  { id: 'characters', label: 'Characters', hint: 'Hunter Guides · XP & ascensions', render: () => <CharacterCalc /> },
  { id: 'arcs', label: 'Arcs', hint: 'Dyes · XP & ascensions', render: () => <ArcCalc /> },
  { id: 'cm', label: 'Cartridges & Modules', hint: 'Manholes · max to 20', render: () => <CartridgeModuleCalc /> },
  { id: 'abilities', label: 'Abilities & Life Skills', hint: 'Fun fact · progression checker', render: () => <AbilitiesTab /> },
  { id: 'full', label: '1 → 80 Everything', hint: 'The grand total', render: () => <FullMaxTab /> },
]

export default function App() {
  const [active, setActive] = useState(TABS[0].id)
  const tab = TABS.find((t) => t.id === active)!

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-n">NTE</span>
          <span className="logo-sub">Leveling Calculator &amp; Resource Checker</span>
        </div>
        <div className="logo-tag">Neverness&nbsp;To&nbsp;Everness · QOL tool</div>
      </header>

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
        Data parsed live from <code>NTE_Leveling.md</code> · &ldquo;coins&rdquo; = Beetle Coins ·
        unofficial fan tool
      </footer>
    </div>
  )
}
