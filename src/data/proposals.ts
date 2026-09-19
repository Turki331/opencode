import { authorityRules } from './authority'
import type { AgentProposal } from '../store/types'

const departmentManagerRule = authorityRules.find((rule) => rule.id === 'AR-01')

if (!departmentManagerRule || departmentManagerRule.financialLimit === null) {
  throw new Error('AR-01 must define a financial limit before proposals load.')
}

const departmentManagerLimit = departmentManagerRule.financialLimit

export const proposals: readonly AgentProposal[] = [
  {
    id: 'P-01',
    agent: 'DEVIATION',
    raisedAt: '2026-09-18T09:00:00Z',
    title: 'Reroute Q4 fulfilment volume to the secondary provider',
    finding:
      'Fulfilment speed has fallen to 52%, a 33-point gap to target, sustained over two quarters.',
    rootCause:
      "The primary logistics supplier's average dispatch lag rose from 1.8 to 4.6 days after a depot consolidation in month 8.",
    proposedAction:
      'Reroute Q4 fulfilment volume to the secondary provider and delegate a SAR 165,000 contingency to Sara Al-Mahmoud.',
    authorityCheck: {
      ruleId: 'AR-01',
      requestedAmount: 165000,
      limit: departmentManagerLimit,
      passes: 165000 <= departmentManagerLimit,
      escalatesToRuleId: null,
    },
    effects: [
      {
        kind: 'KPI_FORECAST',
        kpiId: 'kpi-warehouse',
        to: 72,
        toZone: 'YELLOW',
      },
      {
        kind: 'TASK_CREATE',
        task: {
          id: 'task-q4-secondary-provider',
          initiativeId: 'initiative-warehouse',
          ownerId: 'person-sara',
          title: 'Reroute Q4 fulfilment volume to the secondary provider',
          requirementRef: '3.5',
          dueDate: '2026-10-28',
          status: 'ASSIGNED',
        },
      },
      {
        kind: 'INITIATIVE_STATUS',
        initiativeId: 'initiative-warehouse',
        to: 'ACTIVE',
      },
      {
        kind: 'BUDGET_DELEGATE',
        toPersonId: 'person-sara',
        amount: 165000,
        ruleId: 'AR-01',
      },
    ],
    status: 'PENDING',
  },
  {
    id: 'P-02',
    agent: 'DEVIATION',
    raisedAt: '2026-09-18T09:00:01Z',
    title: 'Escalate a cross-division logistics intervention',
    finding:
      'The requested intervention exceeds the department manager approval limit.',
    rootCause: 'The proposed contingency spans multiple operating divisions.',
    proposedAction:
      'Request a SAR 420,000 contingency and route the decision to the VP / Director tier.',
    authorityCheck: {
      ruleId: 'AR-01',
      requestedAmount: 420000,
      limit: departmentManagerLimit,
      passes: 420000 <= departmentManagerLimit,
      escalatesToRuleId: 'AR-02',
    },
    effects: [],
    status: 'PENDING',
  },
]
