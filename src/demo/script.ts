import type { AgentLogEntry, Chapter } from '../store/types'
import type { AuditEventInput } from '../store/audit'

export interface ChapterSeedDefinition {
  chapter: Chapter
  naturalPath: '/intake' | '/boardroom' | '/agents' | '/governance'
  documentIngested: boolean
  resolved: boolean
  agentActivity: readonly AgentLogEntry[]
  auditInputs: readonly AuditEventInput[]
}

const documentId = 'document-regional-growth-2026'

const ingestionAudit: readonly AuditEventInput[] = [
  {
    actor: { type: 'HUMAN', name: 'Current user' },
    action: 'Ingestion started',
    entity: documentId,
    newState: 'PROCESSING',
  },
  {
    actor: { type: 'AGENT', name: 'Intake Agent' },
    action: 'Document chunks indexed',
    entity: documentId,
    newState: 'STAGE_2',
  },
  {
    actor: { type: 'AGENT', name: 'Intake Agent' },
    action: 'Objectives, KPIs and owners extracted',
    entity: documentId,
    previousState: 'STAGE_2',
    newState: 'STAGE_3',
  },
  {
    actor: { type: 'AGENT', name: 'Intake Agent' },
    action: 'Alignment chain and authority limits mapped',
    entity: documentId,
    previousState: 'STAGE_3',
    newState: 'STAGE_4',
  },
  {
    actor: { type: 'AGENT', name: 'Intake Agent' },
    action: 'Document ingested',
    entity: documentId,
    previousState: 'PROCESSING',
    newState: 'INGESTED',
  },
]

const intakeActivity: readonly AgentLogEntry[] = [
  {
    id: 'AG-0001',
    agent: 'INTAKE',
    at: '2026-09-18T09:04:12Z',
    message: 'Document structure mapped to the alignment chain.',
    relatedId: documentId,
  },
]

const flaggedActivity: readonly AgentLogEntry[] = [
  ...intakeActivity,
  {
    id: 'AG-0002',
    agent: 'DEVIATION',
    at: '2026-09-18T09:04:36Z',
    message: 'Warehouse order fulfilment speed entered the red zone at 52%.',
    relatedId: 'kpi-warehouse',
  },
  {
    id: 'AG-0003',
    agent: 'DEVIATION',
    at: '2026-09-18T09:04:54Z',
    message: 'Root cause trace linked the deviation to supplier dispatch lag.',
    relatedId: 'initiative-warehouse',
  },
  {
    id: 'AG-0004',
    agent: 'DEVIATION',
    at: '2026-09-18T09:05:12Z',
    message:
      'Routine sweep across the other seven KPIs found no further deviations.',
    relatedId: null,
  },
  {
    id: 'AG-0005',
    agent: 'DEVIATION',
    at: '2026-09-18T09:05:26Z',
    message:
      'Authority check passed for the SAR 165,000 contingency under AR-01.',
    relatedId: 'P-01',
  },
  {
    id: 'AG-0006',
    agent: 'INTAKE',
    at: '2026-09-18T09:05:40Z',
    message: 'Eight KPI records and their source references are linked.',
    relatedId: documentId,
  },
]

const flaggedAudit: readonly AuditEventInput[] = [
  ...ingestionAudit,
  {
    actor: { type: 'AGENT', name: 'Anomaly & Deviation Agent' },
    action: 'KPI anomaly detected',
    entity: 'kpi-warehouse',
    newState: 'RED',
  },
  {
    actor: { type: 'AGENT', name: 'Anomaly & Deviation Agent' },
    action: 'Authority check completed',
    entity: 'P-01',
    newState: 'PENDING',
  },
]

const resolvedAudit: readonly AuditEventInput[] = [
  ...flaggedAudit,
  {
    actor: { type: 'HUMAN', name: 'Faisal Al-Harbi' },
    action: 'Proposal approval started',
    entity: 'P-01',
    previousState: 'PENDING',
    newState: 'APPROVED',
  },
  {
    actor: { type: 'AGENT', name: 'Anomaly & Deviation Agent' },
    action: 'KPI forecast updated',
    entity: 'kpi-warehouse',
    previousState: '52 / RED',
    newState: '72 / YELLOW',
  },
  {
    actor: { type: 'AGENT', name: 'Anomaly & Deviation Agent' },
    action: 'Task created',
    entity: 'task-q4-secondary-provider',
    newState: 'ASSIGNED',
  },
  {
    actor: { type: 'AGENT', name: 'Anomaly & Deviation Agent' },
    action: 'Initiative status updated',
    entity: 'initiative-warehouse',
    previousState: 'AT_RISK',
    newState: 'ACTIVE',
  },
  {
    actor: { type: 'AGENT', name: 'Anomaly & Deviation Agent' },
    action: 'Budget delegated',
    entity: 'person-sara',
    newState: 'SAR 165,000 / AR-01',
  },
  {
    actor: { type: 'HUMAN', name: 'Faisal Al-Harbi' },
    action: 'Proposal approved',
    entity: 'P-01',
    previousState: 'RESOLVING',
    newState: 'APPROVED',
  },
]

export const chapterSeeds: Record<Chapter, ChapterSeedDefinition> = {
  PRE_INGEST: {
    chapter: 'PRE_INGEST',
    naturalPath: '/intake',
    documentIngested: false,
    resolved: false,
    agentActivity: [],
    auditInputs: [],
  },
  INGESTED: {
    chapter: 'INGESTED',
    naturalPath: '/boardroom',
    documentIngested: true,
    resolved: false,
    agentActivity: intakeActivity,
    auditInputs: ingestionAudit,
  },
  FLAGGED: {
    chapter: 'FLAGGED',
    naturalPath: '/agents',
    documentIngested: true,
    resolved: false,
    agentActivity: flaggedActivity,
    auditInputs: flaggedAudit,
  },
  RESOLVED: {
    chapter: 'RESOLVED',
    naturalPath: '/governance',
    documentIngested: true,
    resolved: true,
    agentActivity: [
      ...flaggedActivity,
      {
        id: 'AG-0004',
        agent: 'DEVIATION',
        at: '2026-09-18T09:05:42Z',
        message: 'Approved mitigation applied across the alignment chain.',
        relatedId: 'P-01',
      },
    ],
    auditInputs: resolvedAudit,
  },
}

export const chapterOrder: readonly Chapter[] = [
  'PRE_INGEST',
  'INGESTED',
  'FLAGGED',
  'RESOLVED',
]

export function parseChapter(value: string | undefined): Chapter | null {
  const normalized = value?.toUpperCase()

  return chapterOrder.find((chapter) => chapter === normalized) ?? null
}
