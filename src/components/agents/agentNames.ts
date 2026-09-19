import type { AgentCode } from '../../store/types'

export const agentNames: Record<AgentCode, string> = {
  INTAKE: 'Intake Agent',
  EVIDENCE: 'Evidence Verification Agent',
  DEVIATION: 'Anomaly & Deviation Agent',
}
