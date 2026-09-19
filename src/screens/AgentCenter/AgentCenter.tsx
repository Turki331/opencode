import { Bot } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { AgentFeedItem } from '../../components/agents/AgentFeedItem'
import { agentNames } from '../../components/agents/agentNames'
import { ProposalCard } from '../../components/agents/ProposalCard'
import { ResolvedProposal } from '../../components/agents/ResolvedProposal'
import {
  selectPendingProposals,
  selectResolvedProposals,
  useDemoStore,
} from '../../store/demoStore'
import type { AgentCode } from '../../store/types'

const agents: readonly AgentCode[] = ['INTAKE', 'EVIDENCE', 'DEVIATION']

export function AgentCenter() {
  const activity = useDemoStore((state) => state.agentActivity)
  const pendingProposals = useDemoStore(selectPendingProposals)
  const resolvedProposals = useDemoStore(selectResolvedProposals)
  const pipeline = useDemoStore((state) => state.pipeline)
  const verifying = useDemoStore((state) => state.verifying)
  const resolving = useDemoStore((state) => state.resolving)
  const feed = [...activity].reverse()

  function isActive(agent: AgentCode) {
    if (agent === 'INTAKE') {
      return Boolean(pipeline)
    }
    if (agent === 'EVIDENCE') {
      return Boolean(verifying)
    }
    return Boolean(resolving)
  }

  return (
    <section
      className="screen-section agent-center"
      aria-labelledby="agents-title"
    >
      <div className="screen-heading">
        <span className="screen-eyebrow">Autonomous Strategy OS</span>
        <h1 id="agents-title">AI Agent Command Centre</h1>
      </div>

      <div className="agent-status-strip" aria-label="Agent status">
        {agents.map((agent) => (
          <div className="agent-status-card" key={agent}>
            <Bot aria-hidden="true" size={17} />
            <div>
              <strong>{agentNames[agent]}</strong>
              <span className={isActive(agent) ? 'agent-active' : ''}>
                {isActive(agent) ? 'Active' : 'Idle'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="agent-center-layout">
        <Card
          className="agent-feed-card"
          header={
            <>
              <h2>Activity feed</h2>
              <p>Agent work, newest first</p>
            </>
          }
        >
          {feed.length > 0 ? (
            <div className="agent-feed">
              {feed.map((entry) => (
                <AgentFeedItem entry={entry} key={entry.id} />
              ))}
            </div>
          ) : (
            <div className="agent-empty">
              No agent activity recorded. Ingest a report to start the feed.
            </div>
          )}
        </Card>

        <Card
          className="agent-proposals-card"
          header={
            <>
              <h2>Pending proposals</h2>
              <p>Awaiting human decision</p>
            </>
          }
        >
          {pendingProposals.length > 0 ? (
            <div className="agent-proposal-previews">
              {pendingProposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          ) : (
            <div className="agent-empty">
              No pending proposals. The decision queue is clear.
            </div>
          )}
        </Card>
        {resolvedProposals.length > 0 ? (
          <details className="agent-resolved-proposals">
            <summary>Resolved ({resolvedProposals.length})</summary>
            <div className="resolved-proposal-list">
              {resolvedProposals.map((proposal) => (
                <ResolvedProposal key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </section>
  )
}
