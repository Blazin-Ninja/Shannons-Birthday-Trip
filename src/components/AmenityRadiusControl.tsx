import { useState } from 'react'
import { AMENITY_RADIUS_PRESETS } from '../lib/amenityRadius'

type Props = {
  radiusMiles: number
  onChange: (miles: number) => void
}

export function AmenityRadiusControl({ radiusMiles, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`map-radius-control${open ? ' map-radius-control--open' : ''}`}>
      <button
        type="button"
        className={`map-control-btn map-control-btn--radius${open ? ' map-control-btn--active' : ''}`}
        aria-label="Adjust amenity search radius"
        title="How far off route to search for amenities"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="map-control-btn-icon" aria-hidden="true">
          {radiusMiles}
        </span>
        <span className="map-control-btn-suffix">mi</span>
      </button>

      {open ? (
        <div className="map-radius-panel" role="dialog" aria-label="Amenity search radius">
          <p className="map-radius-title">Search off route</p>
          <p className="map-radius-hint">Show amenities within this distance of the driving route.</p>
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
            <span className="map-radius-slider-label">{radiusMiles} mi from route</span>
          </label>
        </div>
      ) : null}
    </div>
  )
}
