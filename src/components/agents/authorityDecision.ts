import type { AgentProposal, AuthorityRule } from '../../store/types'

export interface ComputedAuthorityDecision {
  rule: AuthorityRule | undefined
  passes: boolean
  escalationRule: AuthorityRule | undefined
}

export function computeAuthorityDecision(
  proposal: AgentProposal,
  rules: readonly AuthorityRule[],
): ComputedAuthorityDecision {
  const rule = rules.find((item) => item.id === proposal.authorityCheck.ruleId)

  if (!rule) {
    return { rule: undefined, passes: false, escalationRule: undefined }
  }

  const passes =
    rule.financialLimit === null ||
    proposal.authorityCheck.requestedAmount <= rule.financialLimit
  const ruleIndex = rules.findIndex((item) => item.id === rule.id)
  const escalationRule = passes
    ? undefined
    : rules
        .slice(ruleIndex + 1)
        .find(
          (item) =>
            item.financialLimit === null ||
            proposal.authorityCheck.requestedAmount <= item.financialLimit,
        )

  return { rule, passes, escalationRule }
}
