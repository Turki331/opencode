import { Bot, UserRound } from 'lucide-react'
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { formatAuditTimestamp } from '../../lib/format'
import { useDemoStore } from '../../store/demoStore'
import type { AuditEvent } from '../../store/types'

type AuditFilter = 'ALL' | 'AGENT' | 'HUMAN' | 'SESSION'

const filters: readonly { value: AuditFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'AGENT', label: 'Agent actions' },
  { value: 'HUMAN', label: 'Human actions' },
  { value: 'SESSION', label: 'This session' },
]

export function AuditLog() {
  const auditEvents = useDemoStore((state) => state.auditEvents)
  const [filter, setFilter] = useState<AuditFilter>('ALL')
  const newestFirst = [...auditEvents].reverse()
  const visibleEvents =
    filter === 'ALL' || filter === 'SESSION'
      ? newestFirst
      : newestFirst.filter((event) => event.actor.type === filter)
  const newestId = visibleEvents[0]?.id

  const columns: readonly DataTableColumn<AuditEvent>[] = [
    {
      key: 'at',
      header: 'Timestamp',
      render: (event) => (
        <time dateTime={event.at}>{formatAuditTimestamp(event.at)}</time>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (event) => (
        <span className="audit-actor-cell">
          {event.actor.type === 'AGENT' ? (
            <Bot aria-hidden="true" size={15} />
          ) : (
            <UserRound aria-hidden="true" size={15} />
          )}
          <span>{event.actor.name}</span>
        </span>
      ),
    },
    { key: 'action', header: 'Action' },
    {
      key: 'previousState',
      header: 'Previous state',
      render: (event) => event.previousState ?? '—',
    },
    {
      key: 'newState',
      header: 'New state',
      render: (event) => event.newState ?? '—',
    },
  ]

  return (
    <section className="audit-log-section" aria-labelledby="audit-log-title">
      <div className="audit-log-heading">
        <div>
          <span className="screen-eyebrow">Governance record</span>
          <h2 id="audit-log-title">Audit log</h2>
        </div>
        <p>Append-only. This log cannot be edited from the interface.</p>
      </div>
      <div className="audit-filter-strip" aria-label="Audit log filters">
        {filters.map((item) => (
          <button
            aria-pressed={filter === item.value}
            className={
              filter === item.value ? 'audit-filter active' : 'audit-filter'
            }
            key={item.value}
            onClick={() => setFilter(item.value)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      {visibleEvents.length > 0 ? (
        <DataTable
          columns={columns}
          rowClassName={(event) =>
            event.id === newestId ? 'audit-row-new' : undefined
          }
          rowKey={(event) => event.id}
          rows={visibleEvents}
        />
      ) : (
        <p className="audit-empty">No audit events in this filter.</p>
      )}
    </section>
  )
}
