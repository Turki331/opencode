import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Drawer } from '../../components/ui/Drawer'
import { ZoneBadge } from '../../components/ui/ZoneBadge'
import { formatMetricValue, formatSar } from '../../lib/format'
import {
  selectApprovedForecastProposal,
  selectAlignmentChain,
  useDemoStore,
} from '../../store/demoStore'
import type { StrategicKPI } from '../../store/types'

interface AlignmentDrawerProps {
  kpi: StrategicKPI | undefined
  onClose: () => void
}

function AlignmentChain({
  kpi,
  onClose,
}: {
  kpi: StrategicKPI
  onClose: () => void
}) {
  const navigate = useNavigate()
  const chain = useDemoStore(selectAlignmentChain(kpi.id))

  if (!chain) {
    return <p>Alignment chain is not available for this KPI.</p>
  }

  const steps = [
    {
      type: 'Objective',
      title: `${chain.objective.code} · ${chain.objective.title}`,
    },
    { type: 'Initiative', title: chain.initiative.title },
    { type: 'Task', title: chain.task.title },
    {
      type: 'Owner',
      title: `${chain.owner.name} · ${chain.owner.title}`,
      onClick: () => {
        onClose()
        navigate('/hub')
      },
    },
    {
      type: 'Authority',
      title: `${chain.authorityRule.id} · limit ${formatSar(chain.authorityRule.financialLimit)}`,
      onClick: () => {
        onClose()
        navigate('/governance')
      },
    },
    {
      type: 'KPI',
      title: `${chain.kpi.name} · ${formatMetricValue(chain.kpi.actual, chain.kpi.unit)}`,
    },
  ]

  return (
    <div className="alignment-chain" aria-label="KPI alignment chain">
      {steps.map((step) => (
        <div className="alignment-chain-step" key={step.type}>
          <span className="alignment-chain-type">{step.type}</span>
          {step.onClick ? (
            <button
              className="alignment-chain-link"
              onClick={step.onClick}
              type="button"
            >
              {step.title}
            </button>
          ) : (
            <span className="alignment-chain-title">{step.title}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function TrendChart({ kpi }: { kpi: StrategicKPI }) {
  const chartData = kpi.history.map((point) => ({
    ...point,
    redValue: point.value < 60 ? point.value : null,
  }))
  const crossing = kpi.history.find((point) => point.value < 60)

  return (
    <div className="kpi-trend-chart" aria-label={`${kpi.name} trend chart`}>
      <ResponsiveContainer height={230} width="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 12, bottom: 8, left: 0 }}
        >
          <ReferenceArea
            fill="var(--zone-red)"
            fillOpacity={0.05}
            ifOverflow="extendDomain"
            y1={0}
            y2={60}
          />
          <ReferenceArea
            fill="var(--zone-amber)"
            fillOpacity={0.05}
            ifOverflow="extendDomain"
            y1={60}
            y2={80}
          />
          <ReferenceArea
            fill="var(--zone-green)"
            fillOpacity={0.05}
            ifOverflow="extendDomain"
            y1={80}
            y2={100}
          />
          <CartesianGrid
            stroke="var(--rule)"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            axisLine={{ stroke: 'var(--rule)' }}
            dataKey="month"
            tick={{ fill: 'var(--ink-soft)', fontSize: 10 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'var(--ink-soft)', fontSize: 10 }}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              border: '1px solid var(--rule)',
              borderRadius: 0,
              fontSize: 12,
            }}
            formatter={(value: unknown) => [
              formatMetricValue(
                typeof value === 'number' ? value : Number(value ?? 0),
                kpi.unit,
              ),
              'Actual',
            ]}
            labelStyle={{ color: 'var(--ink)' }}
          />
          <ReferenceLine
            stroke="var(--accent)"
            strokeDasharray="4 4"
            y={kpi.target}
          >
            <Label
              fill="var(--accent)"
              fontSize={10}
              position="insideTopRight"
              value={`Target ${formatMetricValue(kpi.target, kpi.unit)}`}
            />
          </ReferenceLine>
          {crossing ? (
            <ReferenceLine
              stroke="var(--zone-red)"
              strokeDasharray="3 3"
              x={crossing.month}
            >
              <Label
                fill="var(--zone-red)"
                fontSize={10}
                position="insideTop"
                value="Red-zone crossing"
              />
            </ReferenceLine>
          ) : null}
          <Line
            dataKey="value"
            dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
            isAnimationActive={false}
            stroke="var(--accent)"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            activeDot={false}
            connectNulls={false}
            dataKey="redValue"
            dot={{
              fill: 'var(--zone-red)',
              r: 4,
              stroke: 'var(--surface)',
              strokeWidth: 2,
            }}
            isAnimationActive={false}
            stroke="transparent"
            strokeWidth={0}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AlignmentDrawer({ kpi, onClose }: AlignmentDrawerProps) {
  const approvedProposal = useDemoStore((state) =>
    selectApprovedForecastProposal(state, kpi?.id ?? null),
  )

  return (
    <Drawer
      onClose={onClose}
      open={Boolean(kpi)}
      title={kpi?.name ?? 'KPI details'}
    >
      {kpi ? (
        <div className="alignment-drawer-content">
          <div className="kpi-summary">
            <div className="kpi-summary-figure">
              <span>Actual</span>
              <strong data-metric>
                {formatMetricValue(kpi.actual, kpi.unit)}
              </strong>
            </div>
            <div className="kpi-summary-figure">
              <span>Target</span>
              <strong data-metric>
                {formatMetricValue(kpi.target, kpi.unit)}
              </strong>
            </div>
            <ZoneBadge
              value={formatMetricValue(kpi.forecast ?? kpi.actual, kpi.unit)}
              zone={kpi.zone}
            />
          </div>
          {kpi.forecast !== null ? (
            <div className="kpi-reforecast">
              <div>
                <span>Re-forecast</span>
                <strong data-metric>
                  {formatMetricValue(kpi.forecast, kpi.unit)}
                </strong>
              </div>
              <p>
                Approved action:{' '}
                {approvedProposal?.proposedAction ??
                  'mitigation applied to the operating plan.'}
              </p>
            </div>
          ) : null}
          <section className="alignment-drawer-section">
            <h3>Alignment chain</h3>
            <AlignmentChain kpi={kpi} onClose={onClose} />
          </section>
          <section className="alignment-drawer-section">
            <h3>Performance trend</h3>
            <TrendChart kpi={kpi} />
          </section>
          <p className="kpi-threshold-note">
            Green at or above 80%, amber 60–79%, red below 60%.
          </p>
        </div>
      ) : null}
    </Drawer>
  )
}
