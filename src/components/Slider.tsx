// Custom discrete slider. The thumb and the active tick label are positioned at
// the exact same percentage (both centred with translateX(-50%)), so the thumb
// always lands dead-centre on its number. Smooth/animated via CSS transitions.
import { useRef } from 'react'

export function Slider({
  levels,
  value,
  onChange,
}: {
  levels: number[]
  value: number
  onChange: (level: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const n = levels.length
  const index = Math.max(0, levels.indexOf(value))
  const pct = n > 1 ? (index / (n - 1)) * 100 : 0

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const idx = Math.round(ratio * (n - 1))
    if (levels[idx] !== value) onChange(levels[idx])
  }

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    setFromClientX(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 1) setFromClientX(e.clientX)
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(levels[Math.min(n - 1, index + 1)])
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(levels[Math.max(0, index - 1)])
    }
  }

  return (
    <div
      className="nslider"
      role="slider"
      tabIndex={0}
      aria-valuemin={levels[0]}
      aria-valuemax={levels[n - 1]}
      aria-valuenow={value}
      onKeyDown={onKeyDown}
    >
      <div
        className="nslider-track"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <div className="nslider-fill" style={{ width: `${pct}%` }} />
        {levels.map((l, i) => (
          <span
            key={l}
            className={`nslider-dot${l <= value ? ' on' : ''}`}
            style={{ left: `${n > 1 ? (i / (n - 1)) * 100 : 0}%` }}
          />
        ))}
        <div className="nslider-thumb" style={{ left: `${pct}%` }}>
          <span className="nslider-bubble">{value}</span>
        </div>
      </div>
      <div className="nslider-labels">
        {levels.map((l, i) => (
          <button
            key={l}
            className={`nslider-label${l === value ? ' active' : ''}`}
            style={{ left: `${n > 1 ? (i / (n - 1)) * 100 : 0}%` }}
            onClick={() => onChange(l)}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}
