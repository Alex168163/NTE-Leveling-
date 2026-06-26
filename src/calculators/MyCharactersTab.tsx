// "My Characters" (second tab). Pick the character you're working on; the
// leveling tabs then show that character's specific in-game materials. Choosing
// "Unreleased / No Character" (the default) uses the generic example materials.
import { useState } from 'react'
import {
  roster,
  getCharacter,
  SELECTED_KEY,
  cLevelKey,
  LEVEL_OPTIONS,
  parseCharLevel,
  cAscKey,
  charAscension,
  maxAscensionAt,
  ascensionForLevel,
} from '../lib/characters'

const stars = (asc: number) => '★'.repeat(asc) + '☆'.repeat(6 - asc)
import { IconStack } from '../components/IconStack'
import { useResources } from '../state/resources'

const RANK_ORDER: Record<string, number> = { S: 0, A: 1 }

// Friendly labels for a character's material categories.
const CAT_LABEL: Record<string, string> = {
  anomalyHunt: 'Anomaly Hunt',
  anomalyPilgrimage: 'Anomaly Pilgrimage',
  abilityGreen: 'Green Ability Upgrade',
  abilityBlue: 'Blue Ability Upgrade',
  abilityPurple: 'Purple Ability Upgrade',
  wdGreen: 'Green World Drop',
  wdBlue: 'Blue World Drop',
  wdPurple: 'Purple World Drop',
}
const CAT_ORDER = [
  'wdGreen',
  'wdBlue',
  'wdPurple',
  'abilityGreen',
  'abilityBlue',
  'abilityPurple',
  'anomalyHunt',
  'anomalyPilgrimage',
]

export function MyCharactersTab() {
  const { values, set } = useResources()
  const selected = values[SELECTED_KEY] ?? ''
  const [rankFilter, setRankFilter] = useState<'all' | 'S' | 'A'>('all')
  const [search, setSearch] = useState('')

  const list = roster
    .filter((c) => rankFilter === 'all' || c.rank === rankFilter)
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase().trim()))
    .sort(
      (a, b) =>
        (RANK_ORDER[a.rank ?? 'A'] - RANK_ORDER[b.rank ?? 'A']) || a.name.localeCompare(b.name),
    )

  const pick = (name: string) => set(SELECTED_KEY, name)
  const current = getCharacter(selected)

  return (
    <div className="calc">
      <section className="panel reach">
        <h3>My Characters</h3>
        <div className="disclaimer">
          Please set all your character levels, Ascension levels, and Ability levels to get accurate
          info on the other tabs. (Ability level is set on the <strong>Ability &amp; Life Skill
          Leveling</strong> tab.)
        </div>
        <p className="reach-note">
          Pick the character you're working on — the leveling tabs will show that character's
          specific materials. Choose <strong>Unreleased / No Character</strong> to use the generic
          example materials (the default).
        </p>
        {!selected && (
          <p className="reach-note">
            ⚠ Resources couldn't sync — no character selected. Feel free to fill in estimate data
            toward a future character we don't know the resources for.
          </p>
        )}
      </section>

      <section className="panel">
        <div className="char-filters">
          <div className="level-pills">
            {(['all', 'S', 'A'] as const).map((r) => (
              <button
                key={r}
                className={`level-pill${rankFilter === r ? ' active' : ''}`}
                onClick={() => setRankFilter(r)}
              >
                {r === 'all' ? 'All' : `${r}-Rank`}
              </button>
            ))}
          </div>
          <input
            className="char-search"
            placeholder="Search name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="char-grid">
          <button
            className={`char-card${!selected ? ' active' : ''}`}
            onClick={() => pick('')}
            title="Use generic example materials"
          >
            <div className="char-portrait none">?</div>
            <div className="char-name">Unreleased / No Character</div>
          </button>

          {list.map((c) => {
            const lvlRaw = values[cLevelKey(c.name)] ?? ''
            const lvl = parseCharLevel(lvlRaw)
            const owned = lvl != null
            const asc = owned ? charAscension(values[cAscKey(c.name)], lvl) : 0
            const ascOptions: number[] = []
            if (owned && lvl >= 20)
              for (let a = ascensionForLevel(lvl); a <= maxAscensionAt(lvl); a++) ascOptions.push(a)
            const badge = lvlRaw === 'none' ? "Don't own" : owned ? `Lv ${lvl}` : 'Set level'
            return (
              <div key={c.name} className={`char-card${selected === c.name ? ' active' : ''}`}>
                {c.rank && <span className={`char-rank r-${c.rank}`}>{c.rank}</span>}
                <button className="char-pick" onClick={() => pick(c.name)}>
                  <div className="char-portrait">
                    <IconStack name={c.name} size={88} />
                  </div>
                  <div className="char-name">{c.name}</div>
                </button>
                <div className={`char-level-badge${lvlRaw === 'none' ? ' dont-own' : owned ? ' set' : ''}`}>
                  {badge}
                  {owned && lvl >= 20 && <span className="char-stars" title={`Ascension ${asc}`}>{stars(asc)}</span>}
                </div>
                <select
                  className="char-level-select"
                  value={lvlRaw}
                  onChange={(e) => set(cLevelKey(c.name), e.target.value)}
                  title="Set this character's current level"
                >
                  <option value="">Set level…</option>
                  <option value="none">Don't own</option>
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      Lv {l}
                    </option>
                  ))}
                </select>

                {owned && lvl >= 20 && ascOptions.length > 1 && (
                  <select
                    className="char-level-select"
                    value={String(asc)}
                    onChange={(e) => set(cAscKey(c.name), e.target.value)}
                    title="Current ascension (one ahead = paid but not levelled yet)"
                  >
                    {ascOptions.map((a) => (
                      <option key={a} value={a}>
                        Ascension {a}
                        {a > ascensionForLevel(lvl) ? ' (one ahead)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {current && (
        <section className="panel breakdown">
          <h3>{current.name}'s materials</h3>
          <div className="cost-list">
            {CAT_ORDER.filter((cat) => current.materials[cat]).map((cat) => (
              <div className="cost-row" key={cat}>
                <IconStack name={current.materials[cat]} />
                <span className="cost-label">{current.materials[cat]}</span>
                <span className="cost-amount muted">{CAT_LABEL[cat]}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
