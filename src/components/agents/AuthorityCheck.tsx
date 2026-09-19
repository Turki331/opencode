import { useDemoStore } from '../../store/demoStore'
import { formatSar } from '../../lib/format'
import { computeAuthorityDecision } from './authorityDecision'
import type { AgentProposal } from '../../store/types'

export function AuthorityCheck({ proposal }: { proposal: AgentProposal }) {
  const rules = useDemoStore((state) => state.authorityRules)
  const decision = computeAuthorityDecision(proposal, rules)

  if (!decision.rule) {
    return (
      <div className="authority-check authority-check-unavailable">
        <strong>Authority check unavailable</strong>
        <p>
          The referenced authority rule is not present in the Matrix of Powers.
        </p>
      </div>
    )
  }

  return (
    <section className="authority-check" aria-label="Authority check">
      <div className="authority-check-heading">
        <h3>Authority check</h3>
        <span className={decision.passes ? 'authority-pass' : 'authority-fail'}>
          {decision.passes ? 'Within authority' : 'Escalates'}
        </span>
      </div>
      <div className="authority-check-grid">
        <div>
          <span>Rule</span>
          <strong>
            {decision.rule.id} · {decision.rule.role}
          </strong>
        </div>
        <div>
          <span>Requested</span>
          <strong data-metric>
            {formatSar(proposal.authorityCheck.requestedAmount)}
          </strong>
        </div>
        <div>
          <span>Limit</span>
          <strong data-metric>{formatSar(decision.rule.financialLimit)}</strong>
        </div>
      </div>
      {!decision.passes ? (
        <p className="authority-escalation">
          This action exceeds {decision.rule.id}. It will route to{' '}
          <strong>
            {decision.escalationRule
              ? `${decision.escalationRule.id} · ${decision.escalationRule.role}`
              : 'the next authority tier'}
          </strong>{' '}
          instead.
        </p>
      ) : null}
    </section>
  )
}
