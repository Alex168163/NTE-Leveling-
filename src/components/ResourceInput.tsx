// A compact resource input with its material icon(s). Accepts plain numbers or
// k/m shorthand. Kept visually small per the spec (~4-char feel).
import { IconStack } from './IconStack'

export function ResourceInput({
  label,
  iconName,
  value,
  onChange,
  wide,
}: {
  label: string
  iconName?: string
  value: string
  onChange: (v: string) => void
  wide?: boolean
}) {
  return (
    <label className="res-input">
      <IconStack name={iconName ?? label} size={28} />
      <span className="res-label">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        className={wide ? 'wide' : ''}
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </label>
  )
}
