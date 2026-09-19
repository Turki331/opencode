import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { AlignmentDrawer } from './AlignmentDrawer'
import { StrategicHeatmap } from './StrategicHeatmap'
import {
  selectActiveObjectiveCount,
  selectAtRiskInitiativeCount,
  selectBoardroomProvisioned,
  selectPendingProposalCount,
  selectVisibleKpis,
  selectZoneCounts,
  useDemoStore,
} from '../../store/demoStore'

const allKpisSelector = selectVisibleKpis('EXECUTIVE')
const managerKpisSelector = selectVisibleKpis('MANAGER')

export function Boardroom() {
  const navigate = useNavigate()
  const role = useDemoStore((state) => state.role)
  const provisioned = useDemoStore(selectBoardroomProvisioned)
  const objectiveCount = useDemoStore(selectActiveObjectiveCount)
  const atRiskInitiativeCount = useDemoStore(selectAtRiskInitiativeCount)
  const pendingProposalCount = useDemoStore(selectPendingProposalCount)
  const initiatives = useDemoStore((state) => state.initiatives)
  const highlightedObjectiveId = useDemoStore(
    (state) => state.highlightedObjectiveId,
  )
  const zoneCounts = useDemoStore(selectZoneCounts)
  const visibleKpis = useDemoStore(
    role === 'MANAGER' ? managerKpisSelector : allKpisSelector,
  )
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null)
  const selectedKpi = visibleKpis.find((kpi) => kpi.id === selectedKpiId)

  return (
    <section className="screen-section" aria-labelledby="boardroom-title">
      <div className="screen-heading">
        <span className="screen-eyebrow">Autonomous Strategy OS</span>
        <h1 id="boardroom-title">Executive Boardroom</h1>
      </div>

      {!provisioned ? (
        <Card>
          <div className="boardroom-empty">
            <span className="screen-placeholder-kicker">
              Workspace not provisioned
            </span>
            <h2>Turn the strategy report into a live dashboard.</h2>
            <p>
              Load the sample report to provision objectives, KPIs, owners and
              authority limits for this boardroom.
            </p>
            <button
              className="boardroom-empty-action"
              onClick={() => navigate('/intake')}
              type="button"
            >
              Go to Document Intake
            </button>
          </div>
        </Card>
      ) : (
        <>
          <div className="boardroom-metrics">
            <StatCard label="Active objectives" value={objectiveCount} />
            <StatCard
              label="Performance zones"
              value={
                <span
                  aria-label={`${zoneCounts.GREEN} green, ${zoneCounts.YELLOW} amber, ${zoneCounts.RED} red`}
                  className="zone-summary"
                >
                  <span className="zone-summary-figure zone-green">
                    {zoneCounts.GREEN}
                  </span>
                  <span className="zone-summary-separator">/</span>
                  <span className="zone-summary-figure zone-amber">
                    {zoneCounts.YELLOW}
                  </span>
                  <span className="zone-summary-separator">/</span>
                  <span className="zone-summary-figure zone-red">
                    {zoneCounts.RED}
                  </span>
                </span>
              }
            />
            <StatCard
              label="Initiatives at risk"
              value={atRiskInitiativeCount}
            />
            {role === 'EXECUTIVE' ? (
              <StatCard
                label="Decisions awaiting you"
                value={pendingProposalCount}
                onClick={() => navigate('/agents')}
              />
            ) : null}
          </div>
          {role === 'MANAGER' ? (
            <p className="boardroom-scope-note">
              View scoped to Sara Al-Mahmoud&apos;s Operations department.
            </p>
          ) : null}
          <Card
            className="boardroom-heatmap-card"
            header={
              <>
                <h2>Strategic portfolio heatmap</h2>
                <p>Select a KPI to inspect its alignment chain.</p>
              </>
            }
          >
            <StrategicHeatmap
              highlightedObjectiveId={highlightedObjectiveId}
              initiatives={initiatives}
              kpis={visibleKpis}
              onSelect={setSelectedKpiId}
            />
          </Card>
          <AlignmentDrawer
            kpi={selectedKpi}
            onClose={() => setSelectedKpiId(null)}
          />
        </>
      )}
    </section>
  )
}
