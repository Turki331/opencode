import { useDemoStore, selectProposalRejection } from '../../store/demoStore'
import { agentNames } from './agentNames'
import type { AgentProposal } from '../../store/types'

export function ResolvedProposal({ proposal }: { proposal: AgentProposal }) {
  const rejection = useDemoStore(selectProposalRejection(proposal.id))

  return (
    <article className="resolved-proposal">
      <div>
        <span>
          {proposal.id} · {agentNames[proposal.agent]}
        </span>
        <strong>{proposal.title}</strong>
      </div>
      <p>
        {proposal.status === 'REJECTED'
          ? `Rejected: ${rejection?.reason ?? 'Reason recorded in audit log.'}`
          : 'Approved. Effects applied.'}
      </p>
      {rejection?.note ? <small>Note: {rejection.note}</small> : null}
    </article>
  )
}
