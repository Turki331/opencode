import { agentNames } from './agentNames'
import { AuthorityCheck } from './AuthorityCheck'
import { useDemoStore } from '../../store/demoStore'
import type { AgentProposal } from '../../store/types'
import { useState } from 'react'

const rejectionReasons = [
  'Insufficient evidence',
  'Wrong owner',
  'Amount too high',
  'Defer to next review',
] as const

export function ProposalCard({ proposal }: { proposal: AgentProposal }) {
  const role = useDemoStore((state) => state.role)
  const resolving = useDemoStore((state) => state.resolving)
  const resolveProposal = useDemoStore((state) => state.resolveProposal)
  const isResolving = resolving === proposal.id
  const [showRejectionPanel, setShowRejectionPanel] = useState(false)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')

  function confirmRejection() {
    if (!reason) {
      return
    }

    setShowRejectionPanel(false)
    void resolveProposal(proposal.id, 'REJECTED', { reason, note })
  }

  return (
    <article
      className={`proposal-card${isResolving ? ' proposal-card-resolving' : ''}`}
    >
      <header className="proposal-card-header">
        <div>
          <span className="proposal-card-agent">
            {proposal.id} · {agentNames[proposal.agent]}
          </span>
          <h3>{proposal.title}</h3>
        </div>
        <span className="proposal-card-status">Pending</span>
      </header>
      <div className="proposal-card-section">
        <h4>Finding</h4>
        <p>{proposal.finding}</p>
      </div>
      <div className="proposal-card-section">
        <h4>Root cause</h4>
        <p>{proposal.rootCause}</p>
      </div>
      <div className="proposal-card-section">
        <h4>Proposed action</h4>
        <p>{proposal.proposedAction}</p>
      </div>
      <AuthorityCheck proposal={proposal} />
      {role === 'EXECUTIVE' ? (
        <div className="proposal-card-actions">
          <button
            className="proposal-approve-button"
            disabled={isResolving}
            onClick={() => void resolveProposal(proposal.id, 'APPROVED')}
            type="button"
          >
            {isResolving ? 'Processing...' : 'Approve action'}
          </button>
          <button
            className="proposal-reject-button"
            disabled={isResolving}
            onClick={() => setShowRejectionPanel(true)}
            type="button"
          >
            Reject or modify
          </button>
        </div>
      ) : (
        <p className="proposal-decision-holder">
          Decision held by Faisal Al-Harbi, Chief Executive Officer.
        </p>
      )}
      {showRejectionPanel ? (
        <div className="proposal-rejection-panel">
          <label>
            <span>Reason</span>
            <select
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            >
              <option value="">Select a reason</option>
              {rejectionReasons.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Note (optional)</span>
            <textarea
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add context for the audit record"
              rows={3}
              value={note}
            />
          </label>
          <div className="proposal-rejection-actions">
            <button
              className="proposal-reject-button"
              disabled={!reason || isResolving}
              onClick={confirmRejection}
              type="button"
            >
              Confirm rejection
            </button>
            <button
              className="proposal-cancel-button"
              onClick={() => setShowRejectionPanel(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </article>
  )
}
