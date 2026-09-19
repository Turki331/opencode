import type { Person } from '../store/types'

export const people: readonly Person[] = [
  {
    id: 'person-sara',
    name: 'Sara Al-Mahmoud',
    title: 'Head of Operations',
    department: 'Operations',
    authorityRuleId: 'AR-01',
  },
  {
    id: 'person-khalid',
    name: 'Khalid Al-Riyami',
    title: 'Customer Experience Lead',
    department: 'Commercial',
    authorityRuleId: 'AR-01',
  },
  {
    id: 'person-nouf',
    name: 'Nouf Al-Otaibi',
    title: 'VP Supply Chain',
    department: 'Operations',
    authorityRuleId: 'AR-02',
  },
  {
    id: 'person-faisal',
    name: 'Faisal Al-Harbi',
    title: 'Chief Executive Officer',
    department: 'Executive',
    authorityRuleId: 'AR-03',
  },
  {
    id: 'person-layla',
    name: 'Layla Al-Dossary',
    title: 'Financial Planning Director',
    department: 'Finance',
    authorityRuleId: 'AR-02',
  },
  {
    id: 'person-maayish-advisory',
    name: 'Maayish Advisory',
    title: 'Strategy Consultant',
    department: 'External',
    authorityRuleId: 'NONE',
  },
]
