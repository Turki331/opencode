import { Link } from 'react-router-dom'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { formatSar } from '../../lib/format'
import { AuditLog } from './AuditLog'
import { selectPeople, useDemoStore } from '../../store/demoStore'
import type { AuthorityRule } from '../../store/types'

export function Governance() {
  const authorityRules = useDemoStore((state) => state.authorityRules)
  const people = useDemoStore(selectPeople)
  const delegations = useDemoStore((state) => state.delegations)
  const proposals = useDemoStore((state) => state.proposals)
  const latestDelegation = delegations[delegations.length - 1]
  const invokedProposal = proposals.find(
    (proposal) =>
      proposal.status === 'APPROVED' &&
      proposal.effects.some(
        (effect) =>
          effect.kind === 'BUDGET_DELEGATE' &&
          effect.ruleId === latestDelegation?.ruleId,
      ),
  )
  const invokedRuleId = latestDelegation?.ruleId

  const columns: readonly DataTableColumn<AuthorityRule>[] = [
    {
      key: 'id',
      header: 'Rule',
      render: (rule) => (
        <div className="governance-rule-cell">
          <strong>{rule.id}</strong>
          {invokedRuleId === rule.id && latestDelegation ? (
            <small>
              Most recent approval · {formatSar(latestDelegation.amount)}{' '}
              delegated
            </small>
          ) : null}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role / title',
      render: (rule) => {
        const governedPeople = people.filter(
          (person) => person.authorityRuleId === rule.id,
        )

        return (
          <div className="governance-people-cell">
            <span>{rule.role}</span>
            {governedPeople.map((person) => (
              <Link
                key={person.id}
                to={person.id === 'person-sara' ? '/hub' : '/boardroom'}
              >
                {person.name} · {person.title}
              </Link>
            ))}
          </div>
        )
      },
    },
    { key: 'scope', header: 'Operational scope' },
    {
      key: 'financialLimit',
      header: 'Financial approval limit',
      render: (rule) => (
        <span data-metric>{formatSar(rule.financialLimit)}</span>
      ),
    },
    { key: 'signOff', header: 'Sign-off authority' },
  ]

  return (
    <section
      className="screen-section governance-screen"
      aria-labelledby="governance-title"
    >
      <div className="screen-heading">
        <span className="screen-eyebrow">Governance</span>
        <h1 id="governance-title">Matrix of Powers &amp; Audit Log</h1>
      </div>
      <p className="governance-intro">
        The Matrix of Powers governs who may approve operational and strategic
        actions, within which scope, and up to what financial limit.
      </p>
      <DataTable
        columns={columns}
        rowClassName={(rule) =>
          rule.id === invokedRuleId ? 'governance-row-invoked' : undefined
        }
        rowKey={(rule) => rule.id}
        rows={authorityRules}
      />
      {invokedProposal && latestDelegation ? (
        <p className="governance-invocation-note">
          Latest approval: {invokedProposal.title} ·{' '}
          {formatSar(latestDelegation.amount)} delegated under{' '}
          {latestDelegation.ruleId}.
        </p>
      ) : null}
      <AuditLog />
    </section>
  )
}
