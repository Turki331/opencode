import type { ReactNode } from 'react'
import type { Zone } from './ZoneBadge'

interface StatCardProps {
  label: string
  value: ReactNode
  zone?: Zone
}

export function StatCard({ label, value, zone }: StatCardProps) {
  const valueClass = zone
    ? `stat-card-value zone-${zone.toLowerCase()}`
    : 'stat-card-value'

  return (
    <article className="stat-card">
      <strong className={valueClass} data-metric>
        {value}
      </strong>
      <span className="stat-card-label">{label}</span>
    </article>
  )
}
