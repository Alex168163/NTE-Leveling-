// Renders every icon matching a material name (per the spec: show all icons
// that share the same name and color).
import { iconsFor } from '../lib/icons'

export function IconStack({ name, size = 26 }: { name: string; size?: number }) {
  const icons = iconsFor(name)
  if (!icons.length) return null
  return (
    <span className="icon-stack" title={name}>
      {icons.map((src) => (
        <img key={src} src={src} alt={name} width={size} height={size} loading="lazy" />
      ))}
    </span>
  )
}
