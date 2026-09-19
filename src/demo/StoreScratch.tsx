import { Card } from '../components/ui/Card'
import {
  selectAlignmentChain,
  selectPendingProposalCount,
  selectZoneCounts,
  useDemoStore,
} from '../store/demoStore'
import type { Chapter } from '../store/types'

const warehouseAlignmentSelector = selectAlignmentChain('kpi-warehouse')

const chapters: readonly Chapter[] = [
  'PRE_INGEST',
  'INGESTED',
  'FLAGGED',
  'RESOLVED',
]

export function StoreScratch() {
  const chapter = useDemoStore((state) => state.chapter)
  const role = useDemoStore((state) => state.role)
  const documentIngestedAt = useDemoStore(
    (state) => state.documents[0]?.ingestedAt,
  )
  const pipeline = useDemoStore((state) => state.pipeline)
  const verifying = useDemoStore((state) => state.verifying)
  const resolving = useDemoStore((state) => state.resolving)
  const auditCount = useDemoStore((state) => state.auditEvents.length)
  const activityCount = useDemoStore((state) => state.agentActivity.length)
  const tasks = useDemoStore((state) => state.tasks)
  const zoneCounts = useDemoStore(selectZoneCounts)
  const pendingProposalCount = useDemoStore(selectPendingProposalCount)
  const alignment = useDemoStore(warehouseAlignmentSelector)
  const ingestDocument = useDemoStore((state) => state.ingestDocument)
  const submitEvidence = useDemoStore((state) => state.submitEvidence)
  const resolveProposal = useDemoStore((state) => state.resolveProposal)
  const setRole = useDemoStore((state) => state.setRole)
  const reset = useDemoStore((state) => state.reset)
  const seed = useDemoStore((state) => state.seed)

  const q3Task = tasks.find((task) => task.id === 'task-q3-logistics-audit')

  return (
    <section
      className="screen-section store-scratch"
      aria-labelledby="store-scratch-title"
    >
      <div className="screen-heading">
        <span className="screen-eyebrow">WP-06 demo engine</span>
        <h1 id="store-scratch-title">Store scratch page</h1>
      </div>
      <Card>
        <div className="store-scratch-actions">
          <button onClick={() => void ingestDocument()} type="button">
            Ingest document
          </button>
          <button
            disabled={!q3Task}
            onClick={() =>
              void submitEvidence(
                'task-q3-logistics-audit',
                'Q3_Logistics_Audit_Verification.pdf',
              )
            }
            type="button"
          >
            Verify Q3 evidence
          </button>
          <button
            onClick={() => void resolveProposal('P-01', 'APPROVED')}
            type="button"
          >
            Approve P-01
          </button>
          <button
            onClick={() => void resolveProposal('P-02', 'REJECTED')}
            type="button"
          >
            Reject P-02
          </button>
          <button onClick={() => setRole('MANAGER')} type="button">
            Switch to manager
          </button>
          <button onClick={() => seed('INGESTED')} type="button">
            Seed ingested
          </button>
          <button onClick={reset} type="button">
            Reset
          </button>
        </div>
        <dl className="store-scratch-state">
          <div>
            <dt>Chapter</dt>
            <dd>{chapter}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{role}</dd>
          </div>
          <div>
            <dt>Document ingested</dt>
            <dd>{documentIngestedAt ?? 'No'}</dd>
          </div>
          <div>
            <dt>Zones</dt>
            <dd>
              {zoneCounts.GREEN} / {zoneCounts.YELLOW} / {zoneCounts.RED}
            </dd>
          </div>
          <div>
            <dt>Pending proposals</dt>
            <dd>{pendingProposalCount}</dd>
          </div>
          <div>
            <dt>Pipeline</dt>
            <dd>{pipeline?.label ?? 'Idle'}</dd>
          </div>
          <div>
            <dt>Verifying</dt>
            <dd>{verifying ?? 'Idle'}</dd>
          </div>
          <div>
            <dt>Resolving</dt>
            <dd>{resolving ?? 'Idle'}</dd>
          </div>
          <div>
            <dt>Audit events</dt>
            <dd>{auditCount}</dd>
          </div>
          <div>
            <dt>Agent activity</dt>
            <dd>{activityCount}</dd>
          </div>
          <div>
            <dt>Warehouse owner</dt>
            <dd>{alignment?.owner.name ?? 'Unresolved'}</dd>
          </div>
          <div>
            <dt>Available seed chapters</dt>
            <dd>{chapters.join(', ')}</dd>
          </div>
        </dl>
      </Card>
    </section>
  )
}
