import { LevelCalculator } from './LevelCalculator'
import { characterSteps, gameData } from '../lib/calc'

export function CharacterCalc() {
  return (
    <LevelCalculator
      config={{
        steps: characterSteps(),
        xpSources: gameData.xpSources.character,
        xpLabel: 'Character XP',
        matInputs: [
          { id: 'anomalyHunt', label: 'Anomaly Hunt Material', iconName: 'Anomaly Hunt Material' },
          { id: 'wd:Green', label: 'Green World Drop', iconName: 'Green World Material' },
          { id: 'wd:Blue', label: 'Blue World Drop', iconName: 'Blue World Material' },
          { id: 'wd:Purple', label: 'Purple World Drop', iconName: 'Purple World Material' },
        ],
      }}
    />
  )
}
