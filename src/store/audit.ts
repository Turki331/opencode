import type { AuditEvent } from './types'

const DEMO_EPOCH_MS = Date.UTC(2026, 8, 18, 9, 0, 0)
let eventSequence = 0
let timestampOffsetMs = 0

export interface AuditEventInput {
  actor: { type: 'HUMAN' | 'AGENT'; name: string }
  action: string
  entity: string
  previousState?: string | null
  newState?: string | null
}

export function auditEvent(input: AuditEventInput): AuditEvent {
  eventSequence += 1

  const event: AuditEvent = {
    id: `EV-${String(eventSequence).padStart(4, '0')}`,
    at: new Date(DEMO_EPOCH_MS + timestampOffsetMs).toISOString(),
    actor: input.actor,
    action: input.action,
    entity: input.entity,
    previousState: input.previousState ?? null,
    newState: input.newState ?? null,
  }

  timestampOffsetMs += 1000
  return event
}

export function resetAuditClock() {
  eventSequence = 0
  timestampOffsetMs = 0
}
