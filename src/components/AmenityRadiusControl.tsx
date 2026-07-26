import { useEffect, useRef, useState } from 'react'
import { AMENITY_RADIUS_PRESETS } from '../lib/amenityRadius'

type Props = {
  radiusMiles: number
  onChange: (miles: number) => void
  stayMode?: boolean
  stayAnchorLabel?: string
}

export function AmenityRadiusControl({
  radiusMiles,
  onChange,
  stayMode = false,
  stayAnchorLabel = 'hotel',
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`map-radius-control${open ? ' map-radius-control--open' : ''}`}
    >
      <button
        type="button"
        className={`map-control-btn map-control-btn--radius${open ? ' map-control-btn--active' : ''}`}
        aria-label={
          open
            ? 'Close search radius'
            : stayMode
              ? 'Adjust search radius from hotel'
              : 'Adjust amenity search radius'
        }
        title={
          stayMode
            ? `How far from ${stayAnchorLabel} to search`
            : 'How far off route to search for amenities'
        }
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="map-control-btn-icon" aria-hidden="true">
          {radiusMiles}
        </span>
        <span className="map-control-btn-suffix">mi</span>
      </button>

      {open ? (
        <div className="map-radius-panel" role="dialog" aria-label="Search radius">
          <div className="map-radius-panel-head">
            <p className="map-radius-title">
              {stayMode ? 'Search nearby' : 'Search off route'}
            </p>
            <button
              type="button"
              className="map-radius-close"
              aria-label="Close radius settings"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <p className="map-radius-hint">
            {stayMode
              ? `Show places within this distance of ${stayAnchorLabel}.`
              : 'Show amenities within this distance of the driving route.'}
          </p>
          <div className="map-radius-presets">
            {AMENITY_RADIUS_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`map-radius-chip${preset === radiusMiles ? ' map-radius-chip--active' : ''}`}
                onClick={() => onChange(preset)}
              >
                {preset} mi
              </button>
            ))}
          </div>
          <label className="map-radius-slider-wrap">
            <input
              className="map-radius-slider"
              type="range"
              min={5}
              max={50}
              step={1}
              value={radiusMiles}
              onChange={(e) => onChange(Number(e.target.value))}
            />
            <span className="map-radius-slider-label">
              {radiusMiles} mi from {stayMode ? stayAnchorLabel : 'route'}
            </span>
          </label>
        </div>
      ) : null}
    </div>
  )
}
