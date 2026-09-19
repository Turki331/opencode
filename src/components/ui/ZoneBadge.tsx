import type { ReactNode } from 'react'
import type { Zone } from '../../store/types'

interface ZoneBadgeProps {
  zone: Zone
  value: ReactNode
}

const zoneLabels: Record<Zone, string> = {
  GREEN: 'Green',
  YELLOW: 'Yellow',
  RED: 'Red',
}

export function ZoneBadge({ zone, value }: ZoneBadgeProps) {
  return (
    <span className={`zone-badge zone-${zone.toLowerCase()}`}>
      <span className="zone-badge-label">{zoneLabels[zone]}</span>
      <span data-metric>{value}</span>
    </span>
  )
}
