import { formatMetricValue } from '../../lib/format'
import type { Initiative, StrategicKPI } from '../../store/types'

interface StrategicHeatmapProps {
  kpis: readonly StrategicKPI[]
  initiatives: readonly Initiative[]
  highlightedObjectiveId: string | null
  onSelect: (kpiId: string) => void
}

const pillarOrder = [
  'Operational Excellence',
  'Customer Experience',
  'Vision 2030 Alignment',
  'Financial Resilience',
] as const

export function StrategicHeatmap({
  highlightedObjectiveId,
  initiatives,
  kpis,
  onSelect,
}: StrategicHeatmapProps) {
  return (
    <div className="strategic-heatmap">
      {pillarOrder.map((pillar) => {
        const pillarKpis = kpis.filter((kpi) => kpi.pillar === pillar)

        return (
          <div className="heatmap-row" key={pillar}>
            <div className="heatmap-pillar">
              <span>{pillar}</span>
              <small>{pillarKpis.length} KPIs</small>
            </div>
            <div className="heatmap-cells">
              {pillarKpis.map((kpi) => {
                const initiative = initiatives.find(
                  (item) => item.id === kpi.initiativeId,
                )
                const isHighlighted =
                  initiative?.objectiveId === highlightedObjectiveId

                return (
                  <button
                    className={`heatmap-cell zone-edge-${kpi.zone.toLowerCase()}${isHighlighted ? ' heatmap-cell-objective-highlight' : ''}`}
                    key={kpi.id}
                    onClick={() => onSelect(kpi.id)}
                    type="button"
                  >
                    <span className="heatmap-cell-name">{kpi.name}</span>
                    <span
                      className={`heatmap-cell-value zone-${kpi.zone.toLowerCase()}`}
                      data-metric
                    >
                      {formatMetricValue(kpi.forecast ?? kpi.actual, kpi.unit)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
