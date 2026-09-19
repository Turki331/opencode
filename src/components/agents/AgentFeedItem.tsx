import { Link } from 'react-router-dom'
import { AgentAvatar } from './AgentAvatar'
import { agentNames } from './agentNames'
import { formatDemoTime } from '../../lib/format'
import type { AgentLogEntry } from '../../store/types'

function relatedPath(relatedId: string) {
  if (relatedId.startsWith('kpi-') || relatedId.startsWith('initiative-')) {
    return '/boardroom'
  }
  if (relatedId.startsWith('task-') || relatedId.startsWith('person-')) {
    return '/hub'
  }
  if (relatedId.startsWith('P-')) {
    return '/agents'
  }
  return '/intake'
}

export function AgentFeedItem({ entry }: { entry: AgentLogEntry }) {
  return (
    <article className="agent-feed-item">
      <AgentAvatar agent={entry.agent} />
      <div className="agent-feed-content">
        <div className="agent-feed-meta">
          <strong>{agentNames[entry.agent]}</strong>
          <time dateTime={entry.at}>{formatDemoTime(entry.at)}</time>
        </div>
        <p>{entry.message}</p>
        {entry.relatedId ? (
          <Link className="agent-feed-link" to={relatedPath(entry.relatedId)}>
            View {entry.relatedId}
          </Link>
        ) : null}
      </div>
    </article>
  )
}
