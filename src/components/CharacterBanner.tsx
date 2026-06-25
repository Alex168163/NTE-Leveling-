// Shows which character the leveling tabs are currently building for, or the
// "no character selected" disclaimer (#6). Not shown on the 1→80 tab.
import { useResources } from '../state/resources'
import { SELECTED_KEY, getCharacter } from '../lib/characters'
import { IconStack } from './IconStack'

export function CharacterBanner() {
  const { values } = useResources()
  const ch = getCharacter(values[SELECTED_KEY] ?? '')
  if (!ch) {
    return (
      <div className="char-banner none">
        Resources couldn't sync — no character selected. Feel free to fill in estimate data toward a
        future character we don't know the resources for. Pick one in <strong>My Characters</strong>.
      </div>
    )
  }
  return (
    <div className="char-banner">
      <IconStack name={ch.name} size={26} />
      Building for <strong>{ch.name}</strong>
      {ch.rank && <span className={`char-rank r-${ch.rank}`}>{ch.rank}</span>}
    </div>
  )
}
