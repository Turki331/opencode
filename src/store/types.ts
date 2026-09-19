export type Role = 'EXECUTIVE' | 'MANAGER' | 'CONSULTANT'
export type Zone = 'GREEN' | 'YELLOW' | 'RED'
export type Chapter = 'PRE_INGEST' | 'INGESTED' | 'FLAGGED' | 'RESOLVED'
export type AgentCode = 'INTAKE' | 'EVIDENCE' | 'DEVIATION'

export interface Person {
  id: string
  name: string
  title: string
  department: string
  authorityRuleId: string
}

export interface Objective {
  id: string
  code: string
  title: string
  pillar: string
  sourceRef: { page: number; section: string } | null
}

export interface Initiative {
  id: string
  objectiveId: string
  title: string
  ownerId: string
  status: 'PLANNED' | 'ACTIVE' | 'AT_RISK'
}

export interface StrategicKPI {
  id: string
  name: string
  pillar: string
  initiativeId: string
  ownerId: string
  target: number
  actual: number
  unit: '%' | 'SAR' | 'score' | 'days'
  zone: Zone
  forecast: number | null
  history: { month: string; value: number }[]
}

export type TaskStatus =
  | 'DRAFT'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'EVIDENCE_UPLOADED'
  | 'VERIFIED'
  | 'COMPLETED'

export interface Task {
  id: string
  initiativeId: string
  ownerId: string
  title: string
  requirementRef: string
  dueDate: string
  status: TaskStatus
  evidence: {
    fileName: string
    verifiedAt: string | null
    verdict: string | null
  } | null
}

export interface AuthorityRule {
  id: string
  role: string
  scope: string
  financialLimit: number | null
  signOff: string
}

export type StateEffect =
  | { kind: 'KPI_FORECAST'; kpiId: string; to: number; toZone: Zone }
  | { kind: 'TASK_CREATE'; task: Omit<Task, 'evidence'> }
  | { kind: 'TASK_STATUS'; taskId: string; to: TaskStatus }
  | {
      kind: 'INITIATIVE_STATUS'
      initiativeId: string
      to: Initiative['status']
    }
  | {
      kind: 'BUDGET_DELEGATE'
      toPersonId: string
      amount: number
      ruleId: string
    }

export interface AgentProposal {
  id: string
  agent: AgentCode
  raisedAt: string
  title: string
  finding: string
  rootCause: string
  proposedAction: string
  authorityCheck: {
    ruleId: string
    requestedAmount: number
    limit: number | null
    passes: boolean
    escalatesToRuleId: string | null
  }
  effects: StateEffect[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface AgentLogEntry {
  id: string
  agent: AgentCode
  at: string
  message: string
  relatedId: string | null
}

export interface AuditEvent {
  id: string
  at: string
  actor: { type: 'HUMAN' | 'AGENT'; name: string }
  action: string
  entity: string
  previousState: string | null
  newState: string | null
}

export interface IngestedDocument {
  id: string
  fileName: string
  pageCount: number
  chunkCount: number
  ingestedAt: string | null
}

export interface AlignmentChain {
  objective: Objective
  initiative: Initiative
  task: Task
  owner: Person
  authorityRule: AuthorityRule
  kpi: StrategicKPI
}

export interface SourcePassage {
  id: string
  page: number
  section: string
  passage: string
  matchedText: string
}

export interface ToastMessage {
  id: string
  message: string
}

export interface ProposalRejection {
  proposalId: string
  reason: string
  note: string
  decidedBy: string
}
