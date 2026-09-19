import type { AuthorityRule } from '../store/types'

export const authorityRules: readonly AuthorityRule[] = [
  {
    id: 'AR-01',
    role: 'Department Manager',
    scope: 'Department operations',
    financialLimit: 187500,
    signOff: 'Internal initiatives',
  },
  {
    id: 'AR-02',
    role: 'VP / Director',
    scope: 'Division-wide',
    financialLimit: 937500,
    signOff: 'Strategic realignments',
  },
  {
    id: 'AR-03',
    role: 'C-Suite / CEO',
    scope: 'Enterprise-wide',
    financialLimit: null,
    signOff: 'Board decisions and policy overhauls',
  },
]
