import { LevelCalculator } from './LevelCalculator'
import { arcSteps, gameData } from '../lib/calc'

export function ArcCalc() {
  return (
    <LevelCalculator
      config={{
        id: 'arc',
        xpKeyPrefix: 'dye',
        steps: arcSteps(),
        xpSources: gameData.xpSources.arc,
        xpLabel: 'Arc XP',
        matInputs: [
          { id: 'arc:Green', label: 'Green Arc Material', iconName: 'Green Arc Material' },
          { id: 'arc:Blue', label: 'Blue Arc Material', iconName: 'Blue Arc Material' },
          { id: 'arc:Purple', label: 'Purple Arc Material', iconName: 'Purple Arc Material' },
          { id: 'wd:Green', label: 'Green World Drop', iconName: 'Green World Material' },
          { id: 'wd:Blue', label: 'Blue World Drop', iconName: 'Blue World Material' },
          { id: 'wd:Purple', label: 'Purple World Drop', iconName: 'Purple World Material' },
        ],
      }}
    />
  )
}
