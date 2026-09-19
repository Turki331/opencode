import type { ReactNode } from 'react'
import type { Zone } from '../../store/types'

interface StatCardProps {
  label: string
  value: ReactNode
  zone?: Zone
  onClick?: () => void
}

export function StatCard({ label, value, zone, onClick }: StatCardProps) {
  const valueClass = zone
    ? `stat-card-value zone-${zone.toLowerCase()}`
    : 'stat-card-value'
  const content = (
    <>
      <strong className={valueClass} data-metric>
        {value}
      </strong>
      <span className="stat-card-label">{label}</span>
    </>
  )

  return onClick ? (
    <button
      className="stat-card stat-card-button"
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  ) : (
    <article className="stat-card">{content}</article>
  )
}
