// A single cost line: label + amount (compact, with exact value on hover) +
// all matching icons.
import { IconStack } from './IconStack'
import { short, comma } from '../lib/format'

export function CostRow({
  label,
  amount,
  iconName,
  have,
}: {
  label: string
  amount: number
  iconName?: string
  have?: number // optional owned amount -> shows shortfall styling
}) {
  const enough = have == null || have >= amount
  return (
    <div className={`cost-row${have != null && !enough ? ' short' : ''}`}>
      <IconStack name={iconName ?? label} />
      <span className="cost-label">{label}</span>
      <span className="cost-amount" title={comma(amount)}>
        {short(amount)}
        {have != null && (
          <span className="cost-have">
            {' '}
            / have {short(have)}
            {!enough && <em> (need {short(amount - have)} more)</em>}
          </span>
        )}
      </span>
    </div>
  )
}
