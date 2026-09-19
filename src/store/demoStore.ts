import { create } from 'zustand'
import { authorityRules } from '../data/authority'
import {
  evidenceVerificationCopy,
  ingestionStages,
  sourcePassages,
  toastCopy,
} from '../data/copy'
import { documents } from '../data/documents'
import { initiatives } from '../data/initiatives'
import { kpis } from '../data/kpis'
import { objectives } from '../data/objectives'
import { people } from '../data/people'
import { proposals } from '../data/proposals'
import { tasks } from '../data/tasks'
import { chapterSeeds } from '../demo/script'
import {
  cancelAllSequences,
  runSequence,
  type SequenceStep,
} from '../lib/runSequence'
import { auditEvent, resetAuditClock } from './audit'
import { applyEffect } from './effects'
import type {
  AgentLogEntry,
  AgentProposal,
  AlignmentChain,
  AuditEvent,
  Chapter,
  AuthorityRule,
  IngestedDocument,
  Initiative,
  Objective,
  ProposalRejection,
  Role,
  StrategicKPI,
  StateEffect,
  Task,
  TaskStatus,
  ToastMessage,
  Zone,
} from './types'

interface DemoState {
  role: Role
  chapter: Chapter
  documents: IngestedDocument[]
  objectives: Objective[]
  initiatives: Initiative[]
  kpis: StrategicKPI[]
  tasks: Task[]
  proposals: AgentProposal[]
  authorityRules: AuthorityRule[]
  auditEvents: AuditEvent[]
  agentActivity: AgentLogEntry[]
  delegations: { personId: string; amount: number; ruleId: string }[]
  pipeline: { stage: number; label: string; progress: number } | null
  verifying: string | null
  resolving: string | null
  provisioning: boolean
  highlightedObjectiveId: string | null
  toasts: ToastMessage[]
  proposalRejections: ProposalRejection[]
}

export interface DemoStore extends DemoState {
  ingestDocument(file?: File): Promise<void>
  submitEvidence(taskId: string, fileName: string): Promise<void>
  resolveProposal(
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    rejection?: { reason: string; note: string },
  ): Promise<void>
  provisionWorkspace(): Promise<void>
  setRole(role: Role): void
  reset(): void
  seed(chapter: Chapter): void
  dismissToast(id: string): void
}

const DEMO_INGESTED_AT = '2026-09-18T09:04:12Z'
const DEMO_VERIFIED_AT = '2026-09-18T09:06:18Z'
const INGESTION_DURATIONS = [1000, 1500, 1000, 700] as const
let storeGeneration = 0

function cloneProposals(): AgentProposal[] {
  return proposals.map((proposal) => ({
    ...proposal,
    authorityCheck: { ...proposal.authorityCheck },
    effects: [...proposal.effects],
  }))
}

function createInitialState(): DemoState {
  return {
    role: 'EXECUTIVE',
    chapter: 'PRE_INGEST',
    documents: documents.map((document) => ({ ...document })),
    objectives: [...objectives],
    initiatives: [...initiatives],
    kpis: kpis.map((kpi) => ({ ...kpi, history: [...kpi.history] })),
    tasks: tasks.map((task) => ({
      ...task,
      evidence: task.evidence ? { ...task.evidence } : null,
    })),
    proposals: cloneProposals(),
    authorityRules: [...authorityRules],
    auditEvents: [],
    agentActivity: [],
    delegations: [],
    pipeline: null,
    verifying: null,
    resolving: null,
    provisioning: false,
    highlightedObjectiveId: null,
    toasts: [],
    proposalRejections: [],
  }
}

function withAudit(state: DemoState, input: Parameters<typeof auditEvent>[0]) {
  return [...state.auditEvents, auditEvent(input)]
}

function addAgentActivity(
  state: DemoState,
  entry: Omit<AgentLogEntry, 'id'>,
): AgentLogEntry[] {
  const sequence = state.agentActivity.length + 1

  return [
    ...state.agentActivity,
    { ...entry, id: `AG-${String(sequence).padStart(4, '0')}` },
  ]
}

function addAgentActivities(
  state: DemoState,
  entries: Omit<AgentLogEntry, 'id'>[],
): AgentLogEntry[] {
  return entries.reduce(
    (activity, entry) => [
      ...activity,
      {
        ...entry,
        id: `AG-${String(activity.length + 1).padStart(4, '0')}`,
      },
    ],
    [...state.agentActivity],
  )
}

function createSeedState(chapter: Chapter): DemoState {
  const definition = chapterSeeds[chapter]
  const state = createInitialState()

  let seededState: DemoState = {
    ...state,
    chapter,
    documents: definition.documentIngested
      ? state.documents.map((document) => ({
          ...document,
          ingestedAt: DEMO_INGESTED_AT,
        }))
      : state.documents,
    agentActivity: [...definition.agentActivity],
    auditEvents: definition.auditInputs.map((input) => auditEvent(input)),
  }

  if (!definition.resolved) {
    return seededState
  }

  const resolvedProposal = seededState.proposals.find(
    (proposal) => proposal.id === 'P-01',
  )

  seededState = {
    ...seededState,
    proposals: seededState.proposals.map((proposal) =>
      proposal.id === 'P-01' ? { ...proposal, status: 'APPROVED' } : proposal,
    ),
  }

  for (const effect of resolvedProposal?.effects ?? []) {
    seededState = applySeedEffect(seededState, effect)
  }

  return seededState
}

function applySeedEffect(state: DemoState, effect: StateEffect): DemoState {
  const applied = applyEffect(
    {
      kpis: state.kpis,
      tasks: state.tasks,
      initiatives: state.initiatives,
      delegations: state.delegations,
    },
    effect,
  )

  return { ...state, ...applied.next }
}

export const useDemoStore = create<DemoStore>((set, get) => ({
  ...createInitialState(),
  ingestDocument: async (file) => {
    const current = get()
    const document = current.documents[0]
    const generation = storeGeneration

    if (!document || document.ingestedAt || current.pipeline) {
      return
    }

    const enterStage = (stage: number, label: string) => {
      if (generation !== storeGeneration) {
        return
      }

      set((state) => ({
        pipeline: { stage, label, progress: 0 },
        auditEvents: withAudit(state, {
          actor: {
            type: stage === 1 ? 'HUMAN' : 'AGENT',
            name: stage === 1 ? 'Current user' : 'Intake Agent',
          },
          action:
            stage === 1
              ? 'Ingestion started'
              : stage === 2
                ? 'Document chunks indexed'
                : stage === 3
                  ? 'Objectives, KPIs and owners extracted'
                  : 'Alignment chain and authority limits mapped',
          entity: document.id,
          newState:
            stage === 1
              ? 'PROCESSING'
              : stage === 2
                ? 'CHUNKING'
                : stage === 3
                  ? 'EXTRACTED'
                  : 'MAPPED',
        }),
        agentActivity:
          stage === 3
            ? addAgentActivity(state, {
                agent: 'INTAKE',
                at: DEMO_INGESTED_AT,
                message: label,
                relatedId: document.id,
              })
            : state.agentActivity,
      }))
    }

    const steps: SequenceStep[] = ingestionStages.map((label, index) => ({
      label,
      durationMs: INGESTION_DURATIONS[index] ?? 0,
      onEnter: () => enterStage(index + 1, label),
    }))

    await runSequence(steps, (tick) => {
      if (generation !== storeGeneration) {
        return
      }

      set({ pipeline: tick })
    })

    if (generation !== storeGeneration) {
      return
    }

    set((state) => ({
      documents: state.documents.map((item, index) =>
        index === 0
          ? {
              ...item,
              fileName: file?.name ?? item.fileName,
              ingestedAt: DEMO_INGESTED_AT,
            }
          : item,
      ),
      chapter: 'INGESTED',
      pipeline: null,
      auditEvents: withAudit(state, {
        actor: { type: 'AGENT', name: 'Intake Agent' },
        action: 'Document ingested',
        entity: document.id,
        previousState: 'PROCESSING',
        newState: 'INGESTED',
      }),
      agentActivity: addAgentActivities(state, [
        {
          agent: 'INTAKE',
          at: DEMO_INGESTED_AT,
          message: 'Document structure linked to the alignment chain.',
          relatedId: document.id,
        },
        {
          agent: 'DEVIATION',
          at: '2026-09-18T09:04:36Z',
          message:
            'Warehouse order fulfilment speed entered the red zone at 52%.',
          relatedId: 'kpi-warehouse',
        },
        {
          agent: 'DEVIATION',
          at: '2026-09-18T09:04:54Z',
          message:
            'Routine sweep across the other seven KPIs found no further deviations.',
          relatedId: null,
        },
      ]),
    }))
  },
  submitEvidence: async (taskId, fileName) => {
    const current = get()
    const task = current.tasks.find((item) => item.id === taskId)
    const generation = storeGeneration

    if (!task || current.verifying) {
      return
    }

    set((state) => ({
      verifying: taskId,
      tasks: state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status: 'EVIDENCE_UPLOADED' as TaskStatus,
              evidence: { fileName, verifiedAt: null, verdict: null },
            }
          : item,
      ),
      auditEvents: withAudit(state, {
        actor: { type: 'HUMAN', name: 'Current user' },
        action: 'Evidence uploaded',
        entity: taskId,
        previousState: task.status,
        newState: 'EVIDENCE_UPLOADED',
      }),
    }))

    await runSequence(
      [
        {
          label: evidenceVerificationCopy.processing,
          durationMs: 1800,
        },
      ],
      (tick) => {
        if (generation !== storeGeneration) {
          return
        }

        set({ pipeline: tick })
      },
    )

    if (generation !== storeGeneration) {
      return
    }

    set((state) => ({
      verifying: null,
      pipeline: null,
      tasks: state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status: 'VERIFIED' as TaskStatus,
              evidence: {
                fileName,
                verifiedAt: DEMO_VERIFIED_AT,
                verdict: evidenceVerificationCopy.verdict,
              },
            }
          : item,
      ),
      auditEvents: withAudit(state, {
        actor: { type: 'AGENT', name: 'Evidence Verification Agent' },
        action: 'Evidence verified',
        entity: taskId,
        previousState: 'EVIDENCE_UPLOADED',
        newState: 'VERIFIED',
      }),
      agentActivity: addAgentActivity(state, {
        agent: 'EVIDENCE',
        at: DEMO_VERIFIED_AT,
        message: evidenceVerificationCopy.verdict,
        relatedId: taskId,
      }),
    }))
  },
  resolveProposal: async (id, decision, rejection) => {
    const current = get()
    const proposal = current.proposals.find((item) => item.id === id)
    const generation = storeGeneration

    if (
      current.role !== 'EXECUTIVE' ||
      !proposal ||
      proposal.status !== 'PENDING' ||
      current.resolving
    ) {
      return
    }

    set((state) => ({
      resolving: id,
      auditEvents: withAudit(state, {
        actor: { type: 'HUMAN', name: 'Current user' },
        action:
          decision === 'APPROVED'
            ? 'Proposal approval started'
            : 'Proposal rejection started',
        entity: id,
        previousState: 'PENDING',
        newState: decision,
      }),
    }))

    if (decision === 'REJECTED') {
      await Promise.resolve()

      if (generation !== storeGeneration) {
        return
      }

      set((state) => ({
        resolving: null,
        proposals: state.proposals.map((item) =>
          item.id === id ? { ...item, status: decision } : item,
        ),
        auditEvents: withAudit(state, {
          actor: { type: 'HUMAN', name: 'Current user' },
          action: `Proposal rejected: ${rejection?.reason ?? 'Reason not recorded'}`,
          entity: id,
          previousState: 'RESOLVING',
          newState: decision,
        }),
        proposalRejections: [
          ...state.proposalRejections,
          {
            proposalId: id,
            reason: rejection?.reason ?? 'Reason not recorded',
            note: rejection?.note ?? '',
            decidedBy: 'Current user',
          },
        ],
        agentActivity: addAgentActivity(state, {
          agent: 'DEVIATION',
          at: '2026-09-18T09:06:14Z',
          message: `Proposal ${id} was rejected: ${rejection?.reason ?? 'Reason not recorded'}.`,
          relatedId: id,
        }),
      }))
      return
    }

    const applyLiveEffect = (effect: StateEffect | undefined) => {
      if (!effect || generation !== storeGeneration) {
        return
      }

      set((state) => {
        const applied = applyEffect(
          {
            kpis: state.kpis,
            tasks: state.tasks,
            initiatives: state.initiatives,
            delegations: state.delegations,
          },
          effect,
        )
        const highlightedObjectiveId =
          effect.kind === 'KPI_FORECAST'
            ? (state.initiatives.find(
                (initiative) =>
                  initiative.id ===
                  state.kpis.find((kpi) => kpi.id === effect.kpiId)
                    ?.initiativeId,
              )?.objectiveId ?? state.highlightedObjectiveId)
            : state.highlightedObjectiveId

        return {
          ...applied.next,
          highlightedObjectiveId,
          auditEvents: [
            ...state.auditEvents,
            auditEvent({
              actor: {
                type: 'AGENT',
                name: 'Anomaly & Deviation Agent',
              },
              ...applied.audit,
            }),
          ],
        }
      })
    }

    await runSequence(
      [
        { label: 'Awaiting authority confirmation', durationMs: 1200 },
        {
          label: 'Authority confirmed',
          durationMs: 200,
          onEnter: () => {
            if (generation === storeGeneration) {
              set((state) => ({
                toasts: [
                  ...state.toasts,
                  {
                    id: 'toast-approval-verified',
                    message: toastCopy.approvalVerified,
                  },
                ],
              }))
            }
          },
        },
        {
          label: 'Updating KPI forecast',
          durationMs: 200,
          onEnter: () => applyLiveEffect(proposal.effects[0]),
        },
        {
          label: 'Assigning downstream task',
          durationMs: 200,
          onEnter: () => applyLiveEffect(proposal.effects[1]),
        },
        {
          label: 'Applying remaining approved effects',
          durationMs: 200,
          onEnter: () => {
            proposal.effects.slice(2).forEach(applyLiveEffect)
            if (generation === storeGeneration) {
              set((state) => ({
                auditEvents: withAudit(state, {
                  actor: { type: 'HUMAN', name: 'Current user' },
                  action: 'Proposal approved',
                  entity: id,
                  previousState: 'RESOLVING',
                  newState: 'APPROVED',
                }),
              }))
            }
          },
        },
      ],
      () => undefined,
    )

    if (generation !== storeGeneration) {
      return
    }

    set((state) => ({
      resolving: null,
      proposals: state.proposals.map((item) =>
        item.id === id ? { ...item, status: 'APPROVED' } : item,
      ),
      agentActivity: addAgentActivity(state, {
        agent: 'DEVIATION',
        at: '2026-09-18T09:06:14Z',
        message: 'Approved mitigation applied across the alignment chain.',
        relatedId: id,
      }),
    }))
  },
  provisionWorkspace: async () => {
    const current = get()
    const document = current.documents[0]
    const generation = storeGeneration

    if (!document?.ingestedAt || current.provisioning) {
      return
    }

    set({ provisioning: true })

    await runSequence(
      [{ label: 'Provisioning Strategy OS workspace', durationMs: 600 }],
      () => undefined,
    )

    if (generation !== storeGeneration) {
      return
    }

    set((state) => {
      let auditEvents = withAudit(state, {
        actor: { type: 'HUMAN', name: 'Current user' },
        action: 'Workspace provisioned',
        entity: 'Workspace',
        previousState: 'INGESTED',
        newState: 'PROVISIONED',
      })

      if (state.role !== 'EXECUTIVE') {
        auditEvents = [
          ...auditEvents,
          auditEvent({
            actor: { type: 'HUMAN', name: 'Current user' },
            action: 'Role switched',
            entity: 'Role',
            previousState: state.role,
            newState: 'EXECUTIVE',
          }),
        ]
      }

      return {
        provisioning: false,
        role: 'EXECUTIVE' as Role,
        highlightedObjectiveId: 'objective-03',
        toasts: [
          ...state.toasts,
          {
            id: 'toast-workspace-provisioned',
            message: toastCopy.workspaceProvisioned,
          },
        ],
        auditEvents,
      }
    })

    const highlightGeneration = storeGeneration
    void runSequence(
      [{ label: 'Highlighting provisioned objective', durationMs: 800 }],
      () => undefined,
    ).then(() => {
      if (highlightGeneration === storeGeneration) {
        set({ highlightedObjectiveId: null })
      }
    })
  },
  setRole: (role) =>
    set((state) => {
      if (
        state.role === role ||
        state.pipeline ||
        state.verifying ||
        state.resolving ||
        state.provisioning
      ) {
        return state
      }

      return {
        role,
        auditEvents: withAudit(state, {
          actor: { type: 'HUMAN', name: 'Current user' },
          action: 'Role switched',
          entity: 'Role',
          previousState: state.role,
          newState: role,
        }),
      }
    }),
  reset: () => {
    storeGeneration += 1
    cancelAllSequences()
    resetAuditClock()
    set(createInitialState())
  },
  seed: (chapter) => {
    storeGeneration += 1
    cancelAllSequences()
    resetAuditClock()
    set(createSeedState(chapter))
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))

let lastKpis: StrategicKPI[] | null = null
let lastZoneCounts: Record<Zone, number> = { GREEN: 0, YELLOW: 0, RED: 0 }

export const selectZoneCounts = (state: DemoStore) => {
  if (state.kpis === lastKpis) {
    return lastZoneCounts
  }

  lastKpis = state.kpis
  lastZoneCounts = state.kpis.reduce(
    (counts, kpi) => {
      counts[kpi.zone] += 1
      return counts
    },
    { GREEN: 0, YELLOW: 0, RED: 0 } as Record<Zone, number>,
  )

  return lastZoneCounts
}

export const selectAlignmentChain = (kpiId: string) => {
  let previousKpis: StrategicKPI[] | null = null
  let previousInitiatives: Initiative[] | null = null
  let previousObjectives: Objective[] | null = null
  let previousTasks: Task[] | null = null
  let previousAuthorityRules: AuthorityRule[] | null = null
  let previousResult: AlignmentChain | null = null

  return (state: DemoStore): AlignmentChain | null => {
    if (
      state.kpis === previousKpis &&
      state.initiatives === previousInitiatives &&
      state.objectives === previousObjectives &&
      state.tasks === previousTasks &&
      state.authorityRules === previousAuthorityRules
    ) {
      return previousResult
    }

    previousKpis = state.kpis
    previousInitiatives = state.initiatives
    previousObjectives = state.objectives
    previousTasks = state.tasks
    previousAuthorityRules = state.authorityRules

    const kpi = state.kpis.find((item) => item.id === kpiId)
    const initiative = state.initiatives.find(
      (item) => item.id === kpi?.initiativeId,
    )
    const objective = state.objectives.find(
      (item) => item.id === initiative?.objectiveId,
    )
    const task = state.tasks.find(
      (item) => item.initiativeId === initiative?.id,
    )
    const owner = people.find((item) => item.id === task?.ownerId)
    const authorityRule = state.authorityRules.find(
      (item) => item.id === owner?.authorityRuleId,
    )

    if (
      !kpi ||
      !initiative ||
      !objective ||
      !task ||
      !owner ||
      !authorityRule
    ) {
      previousResult = null
      return null
    }

    previousResult = { objective, initiative, task, owner, authorityRule, kpi }
    return previousResult
  }
}

export const selectVisibleKpis = (role: Role) => {
  let previousKpis: StrategicKPI[] | null = null
  let previousVisibleKpis: StrategicKPI[] = []

  return (state: DemoStore) => {
    if (state.kpis === previousKpis) {
      return previousVisibleKpis
    }

    previousKpis = state.kpis
    previousVisibleKpis =
      role === 'MANAGER'
        ? state.kpis.filter((kpi) => kpi.ownerId === 'person-sara')
        : state.kpis

    return previousVisibleKpis
  }
}

let lastProposals: AgentProposal[] | null = null
let lastPendingProposals: AgentProposal[] = []

export const selectPendingProposals = (state: DemoStore) => {
  if (state.proposals === lastProposals) {
    return lastPendingProposals
  }

  lastProposals = state.proposals
  lastPendingProposals = state.proposals.filter(
    (proposal) => proposal.status === 'PENDING',
  )

  return lastPendingProposals
}

export const selectPendingProposalCount = (state: DemoStore) =>
  selectPendingProposals(state).length

let lastResolvedProposals: AgentProposal[] | null = null
let lastResolvedProposalList: AgentProposal[] = []

export const selectResolvedProposals = (state: DemoStore) => {
  if (state.proposals === lastResolvedProposals) {
    return lastResolvedProposalList
  }

  lastResolvedProposals = state.proposals
  lastResolvedProposalList = state.proposals.filter(
    (proposal) => proposal.status !== 'PENDING',
  )

  return lastResolvedProposalList
}

export const selectProposalRejection =
  (proposalId: string) => (state: DemoStore) =>
    state.proposalRejections.find((record) => record.proposalId === proposalId)

export const selectActiveObjectiveCount = (state: DemoStore) =>
  state.objectives.length

export const selectAtRiskInitiativeCount = (state: DemoStore) =>
  state.initiatives.reduce(
    (count, initiative) => count + (initiative.status === 'AT_RISK' ? 1 : 0),
    0,
  )

export const selectBoardroomProvisioned = (state: DemoStore) =>
  Boolean(state.documents[0]?.ingestedAt)

export const selectApprovedForecastProposal = (
  state: DemoStore,
  kpiId: string | null,
) =>
  kpiId
    ? state.proposals.find(
        (proposal) =>
          proposal.status === 'APPROVED' &&
          proposal.effects.some(
            (effect) =>
              effect.kind === 'KPI_FORECAST' && effect.kpiId === kpiId,
          ),
      )
    : undefined

export const selectIngestionStages = () => ingestionStages

export const selectSourcePassages = () => sourcePassages

export const selectPeople = () => people

let lastManagerTasks: Task[] | null = null
let lastManagerTaskList: Task[] = []

export const selectManagerTasks = (state: DemoStore) => {
  if (state.tasks === lastManagerTasks) {
    return lastManagerTaskList
  }

  lastManagerTasks = state.tasks
  lastManagerTaskList = state.tasks
    .filter((task) => task.ownerId === 'person-sara')
    .sort((left, right) => {
      if (left.id === 'task-q4-secondary-provider') return -1
      if (right.id === 'task-q4-secondary-provider') return 1
      return left.dueDate.localeCompare(right.dueDate)
    })

  return lastManagerTaskList
}
