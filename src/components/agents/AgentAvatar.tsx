import { Activity, FileText, ShieldCheck } from 'lucide-react'
import type { AgentCode } from '../../store/types'
import { agentNames } from './agentNames'

const agentIcons = {
  INTAKE: FileText,
  EVIDENCE: ShieldCheck,
  DEVIATION: Activity,
}

export function AgentAvatar({ agent }: { agent: AgentCode }) {
  const Icon = agentIcons[agent]

  return (
    <span className="agent-avatar" aria-label={agentNames[agent]}>
      <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
    </span>
  )
}
