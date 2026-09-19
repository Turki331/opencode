import type { SourcePassage } from '../store/types'

export const ingestionStages = [
  'Parsing document layout, tables and section hierarchies',
  'Chunking by section boundary and generating embeddings',
  'Intake agent: extracting objectives, KPIs and owners',
  'Mapping the alignment chain and authority limits',
] as const

export const evidenceVerificationCopy = {
  processing:
    'Evidence verification agent: checking document structure, signatures and requirement coverage.',
  verdict:
    'Verified — satisfies requirement 3.2: independent audit sign-off present',
}

export const toastCopy = {
  workspaceProvisioned:
    'Workspace provisioned — 12 objectives, 8 KPIs and 6 owners are now live',
  approvalVerified: 'Approved. Authority verified against AR-01.',
  proposalRejected: 'Proposal rejected. The workspace state did not change.',
}

export const sourcePassages: readonly SourcePassage[] = [
  {
    id: 'source-regional-share',
    page: 47,
    section: '3.2',
    passage:
      'The 2026 regional growth programme sets a measurable ambition: expand regional market share by 25% by Q4 2027, supported by a more responsive logistics network.',
    matchedText: 'expand regional market share by 25% by Q4 2027',
  },
  {
    id: 'source-warehouse-speed',
    page: 14,
    section: '2.1',
    passage:
      'The operating model sets a target of 85% for warehouse order fulfilment speed, with depot-level exceptions reviewed through the Operations governance cadence.',
    matchedText: 'target of 85% for warehouse order fulfilment speed',
  },
  {
    id: 'source-case-resolution',
    page: 58,
    section: '4.1',
    passage:
      'Priority customer cases should be resolved within the agreed service window, with resolution evidence retained against the account record for review.',
    matchedText: 'resolved within the agreed service window',
  },
]
