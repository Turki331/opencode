# Autonomous Strategy OS — Phased Implementation Plan

**Frontend-only demo build · 26 work packages · 7 phases**
Draft v1 · 18 September 2026

---

## How to use this document

This is written to be executed by an AI coding agent, one work package at a time.

- **Read Section 1 (Global Context) before every work package.** Each WP assumes that context and does not repeat it.
- **Do one WP per session.** Each has its own acceptance criteria. Do not start the next WP until the previous one's criteria pass.
- **Commit per WP** using the WP ID: `WP-07: sequence runner and audit derivation`.
- **Do not improvise scope.** If a WP seems to need something that isn't in it, check the dependency list first; if it genuinely isn't anywhere in this plan, it is out of scope by design. Flag it, don't build it.

---

# Section 1 — Global Context

*(Every work package assumes everything in this section.)*

## 1.1 What is being built

A high-fidelity, clickable prototype of the **Autonomous Strategy Execution OS** — an AI-native platform that turns static consulting deliverables (strategy reports, authority matrices, policy manuals) into a live system that monitors its own execution and proposes corrections for human approval.

The prototype exists to make one claim believable in six minutes: *a 120-page consulting deliverable can become a live, self-monitoring operating system, and humans stay in control of every consequential change.*

## 1.2 The hard architectural constraint

**100% client-side. No backend, no API, no database, no model inference, no persistence beyond the browser tab.**

Every "AI" behaviour is a scripted state transition with simulated latency. Every document is a fixture. Nothing leaves the browser. This is not a limitation to work around — it is the specification. Any code that attempts a network request is a defect.

## 1.3 The demo arc (what the build serves)

| Time | Beat | Screen |
|---|---|---|
| 0:00–1:15 | A consultant drops a strategy PDF in and watches it get parsed, chunked and mapped | Intake |
| 1:15–2:30 | Extracted objectives, KPIs, owners and authority limits provision a live dashboard | Intake → Boardroom |
| 2:30–3:30 | One KPI is red at 52%. Drill through the alignment chain to the owner and initiative | Boardroom |
| 3:30–4:30 | The deviation agent already found it, traced a root cause, and checked its own authority | Agent Centre |
| 4:30–6:00 | One approval click produces five visible consequences across four screens | All |

Role switching (Consultant → Executive → Manager) happens *inside* beats 3–5, so it reads as product behaviour rather than a feature tour.

## 1.4 Vocabulary (use these exact terms in code and UI)

| Term | Meaning |
|---|---|
| **Objective** | A strategic goal extracted from the deliverable. Top of the chain. |
| **Initiative** | A programme of work that serves an objective. |
| **Task** | An assigned unit of work under an initiative, owned by a person. |
| **KPI** | A measured indicator attached to an initiative, with target, actual and zone. |
| **Zone** | Performance band. `GREEN` ≥ 80, `YELLOW` 60–79, `RED` < 60. |
| **Alignment chain** | Objective → Initiative → Task → Owner → Authority rule → KPI. The spine of the product. |
| **Matrix of Powers** | The table of authority rules: who may approve what, up to what amount. |
| **Authority rule** | One row of the Matrix of Powers. Referenced as `AR-01`, `AR-02`, `AR-03`. |
| **Proposal** | A drafted action from an agent, pending human decision. |
| **Effect** | One declared state mutation that a proposal will cause if approved. |
| **Audit event** | An immutable record of any state change, human or agent. |

## 1.5 The three agents

| Agent | Code | What it does in the demo |
|---|---|---|
| Intake Agent | `INTAKE` | Extracts objectives, KPIs, owners and authority limits during ingestion |
| Evidence Verification Agent | `EVIDENCE` | Checks an uploaded completion document against a named task requirement |
| Anomaly & Deviation Agent | `DEVIATION` | Watches KPI streams, flags red-zone drops, drafts mitigations |

## 1.6 The three personas

| Role | Code | Sees |
|---|---|---|
| C-Suite Executive / Board | `EXECUTIVE` | Full portfolio, governance, all proposals |
| Department Manager (Sara Al-Mahmoud, Head of Operations) | `MANAGER` | Her own tasks, her own KPIs, no governance tab |
| Strategy Consultant (Maayish Advisory) | `CONSULTANT` | Intake, boardroom read-only, no approval rights |

## 1.7 Stack

| Layer | Choice | Note |
|---|---|---|
| Build | Vite + React 18 + TypeScript (strict) | Static output, no server runtime |
| State | Zustand, single store | One file holds the whole demo |
| Styling | Plain CSS + a CSS custom-property token layer | Tokens keep status colours consistent |
| Charts | Recharts | Line/area only |
| Motion | Framer Motion | Only for state-change reveals |
| Icons | lucide-react | |
| Routing | React Router, **hash mode** | Deep links work on a static host with no rewrite rules |
| Hosting | Local production build via npm; remote hosting is optional | |

## 1.8 Routes

```
#/intake       Document Intake (RAG)
#/boardroom    Executive Boardroom
#/hub          Manager Execution Hub
#/agents       AI Agent Command Centre
#/governance   Matrix of Powers & Audit Log
```

Plus seed routes: `#/seed/:chapter` — see WP-08.

## 1.9 File layout (create exactly this)

```
src/
  main.tsx
  App.tsx
  routes.tsx
  styles/tokens.css
  lib/
    runSequence.ts      simulated-latency scheduler
    zones.ts            zone calculation
    format.ts           SAR currency, dates, tabular numbers
  store/
    types.ts            all interfaces
    demoStore.ts        the single Zustand store
    effects.ts          the declarative cascade applier
    audit.ts            audit-event construction
  data/
    people.ts  objectives.ts  initiatives.ts  kpis.ts
    tasks.ts   authority.ts   proposals.ts    documents.ts
    copy.ts             every string shown during simulated processing
  components/
    shell/   AppShell TopBar RoleSwitcher SideNav NotificationBell
    ui/      Card StatCard ZoneBadge DataTable Drawer Toast ProgressStages
    agents/  AgentAvatar AgentFeedItem ProposalCard AuthorityCheck
  screens/
    Intake/ Boardroom/ ManagerHub/ AgentCenter/ Governance/
  demo/
    script.ts           chapter seed definitions
    DemoControls.tsx    reset control + keyboard shortcuts
```

## 1.10 Four engineering rules (non-negotiable)

1. **Deterministic, never random.** No `Math.random()` anywhere in timing, ordering or outcomes. The same clicks must produce the same demo every rehearsal. Timestamps are derived from a fixed demo epoch plus an offset, not from `Date.now()`.
2. **One clock, one dispatcher.** All simulated latency goes through `runSequence()` in `lib/runSequence.ts`. No `setTimeout` inside a component, ever.
3. **Every mutation writes an audit event.** The audit log is *derived from* the same event stream that drives the UI, not a separate faked list. This is cheap and it is the single most convincing detail in the product.
4. **Resettable and seedable.** A keyboard shortcut restores the opening state in under a second. Hash routes seed any chapter so a section can be re-run without replaying the whole story.

## 1.11 Latency budget

| Interaction | Duration | Feedback |
|---|---|---|
| Navigation, drill-down, role switch | **0 ms** | Instant. Fake latency here reads as a slow app, not a smart one. |
| Evidence verification | **1,800 ms** | Inline indicator on the task card, then a verified badge |
| Agent approval cascade | **2,000 ms total**, staggered | See WP-18 |
| Document ingestion | **4,200 ms**, four named stages | Determinate bar + live chunk counter |

## 1.12 Visual tokens

| Token | Value | Used for |
|---|---|---|
| `--canvas` | `#F5F6F8` | Application background |
| `--surface` | `#FFFFFF` | Cards, drawers, tables |
| `--ink` | `#141821` | Primary text, table header rules |
| `--ink-soft` | `#4A5364` | Secondary text |
| `--rule` | `#C9D0DA` | Borders, dividers |
| `--accent` | `#1B3A6B` | Primary actions, active nav, chart line |
| `--zone-green` | `#1F6F43` | KPI ≥ 80% |
| `--zone-amber` | `#B8730C` | KPI 60–79% |
| `--zone-red` | `#A32E2E` | KPI < 60% |

**Status colours only ever mean KPI status.** If green appears on screen, it means a KPI is healthy. Never use them decoratively.

Other standing rules: tabular numerals everywhere numbers stack in columns; agent-authored text set apart with a hairline left rule, not a coloured chat bubble; motion only in response to a user action, never on page load; desktop-first at 1280px; **light mode only**.

## 1.13 Currency and numbers

All money is **SAR**. Format as `SAR 165,000`. Never use round placeholder numbers — round numbers read as fixture data. Every figure a viewer can read closely should look like it came from a real organisation.

## 1.14 Explicitly out of scope

Do not build any of these, even if they seem natural:

- Any network call, API route, auth flow, or persistence beyond the tab
- Real PDF parsing, embeddings, vector search or model inference
- **Free-text chat with documents or agents** — someone will type into it during the demo and there is nothing behind it
- CRUD on objectives, KPIs, tasks or users; the data set is fixed and curated
- Settings, onboarding, billing, multi-tenancy switching
- Mobile phone layout; dark mode for the app
- A second ingested document, a second tenant

---

# Section 2 — Work Package Index

| WP | Name | Phase | Depends on | Est. |
|---|---|---|---|---|
| WP-01 | Project scaffold and quality gates | 0 | — | 1.5 h |
| WP-02 | Design token layer and UI primitives | 0 | WP-01 | 2.5 h |
| WP-03 | App shell, navigation and routing | 0 | WP-02 | 3 h |
| WP-04 | Type system | 1 | WP-01 | 1.5 h |
| WP-05 | Fixture data set | 1 | WP-04 | 3.5 h |
| WP-06 | The demo store | 1 | WP-05 | 3 h |
| WP-07 | Sequence runner and audit derivation | 1 | WP-06 | 2.5 h |
| WP-08 | Reset, seed routes and demo controls | 1 | WP-07 | 2 h |
| WP-09 | Boardroom: portfolio metric row | 2 | WP-06, WP-03 | 1.5 h |
| WP-10 | Boardroom: strategic portfolio heatmap | 2 | WP-09 | 3 h |
| WP-11 | Boardroom: alignment chain drawer and KPI trend | 2 | WP-10 | 4 h |
| WP-12 | Intake: dropzone and sample loader | 3 | WP-03 | 2 h |
| WP-13 | Intake: simulated RAG pipeline | 3 | WP-12, WP-07 | 3 h |
| WP-14 | Intake: extraction tree with source citations | 3 | WP-13 | 4 h |
| WP-15 | Intake: provisioning handoff to boardroom | 3 | WP-14, WP-11 | 1.5 h |
| WP-16 | Agent Centre: sub-agent activity feed | 4 | WP-06 | 2 h |
| WP-17 | Agent Centre: proposal card and authority check | 4 | WP-16 | 3.5 h |
| WP-18 | The cascade — declarative effects engine | 4 | WP-17, WP-11 | 4 h |
| WP-19 | Reject and modify path | 4 | WP-18 | 2 h |
| WP-20 | Manager Hub and evidence verification | 5 | WP-07, WP-18 | 4 h |
| WP-21 | Governance: Matrix of Powers table | 5 | WP-06 | 2 h |
| WP-22 | Governance: immutable audit log feed | 5 | WP-21, WP-18 | 2.5 h |
| WP-23 | Copy pass | 6 | all screens | 3 h |
| WP-24 | Role-scoping sweep | 6 | all screens | 2 h |
| WP-25 | Rehearsal hardening and QA script | 6 | WP-24 | 3 h |
| WP-26 | Build, deploy and offline fallback | 6 | WP-25 | 1.5 h |

**Parallelisable:** WP-04/05 can run alongside WP-02/03. Phases 2, 3 and 4 must be sequential because each reuses the previous phase's components. WP-21 can start any time after WP-06.

---

# Phase 0 — Foundation

**Goal:** an empty but correctly shaped application that already looks like the product.
**Gate to exit:** all five routes reachable behind the real shell, role switcher changes the visible navigation, zero TypeScript errors, zero console warnings.

---

## WP-01 — Project scaffold and quality gates

**Context.** Everything downstream assumes a strict TypeScript setup and a fixed folder structure. Getting this wrong costs refactors in every later WP. There is no backend, so there is no environment configuration, no `.env`, and no API client — resist scaffolding them.

**Tasks.**

1. Initialise with `npm create vite@latest . -- --template react-ts`.
2. Install: `zustand recharts framer-motion lucide-react react-router-dom`. Dev: `prettier eslint`.
3. Use plain CSS and CSS custom properties for styling; do not add Tailwind, PostCSS, or an additional component library.
4. Set `tsconfig.json` to `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noUnusedLocals": true`.
5. Add path alias `@/*` → `src/*` in both `tsconfig.json` and `vite.config.ts`.
6. Create the full empty folder tree from §1.9, each folder holding a `.gitkeep` or an index stub.
7. Add an ESLint rule banning `Math.random` and raw `setTimeout` outside `src/lib/runSequence.ts` — `no-restricted-globals` / `no-restricted-properties`. This mechanically enforces rules 1 and 2 from §1.10.
8. Add npm scripts: `dev`, `build`, `preview`, `typecheck`, `lint`.

**Acceptance.**
- `npm run dev` serves a blank page with no errors.
- `npm run typecheck` and `npm run lint` both pass clean.
- Adding `Math.random()` to any file fails lint.
- No `.env`, no `axios`/`fetch` wrapper, no `api/` folder exists.

**Do not:** add a testing framework, a component library (shadcn, MUI, Chakra), or a state-persistence middleware.

---

## WP-02 — Design token layer and UI primitives

**Context.** Five screens must look like one product built by one team. The fastest route to that is a small set of primitives built once, before any screen exists. The status palette in particular has to be centralised, because the entire credibility of the boardroom depends on green/amber/red meaning exactly one thing.

**Tasks.**

1. Write `src/styles/tokens.css` defining every token in §1.12 on `:root`. No dark-mode block — this app is light only.
2. Use the tokens directly through CSS custom properties; there is no Tailwind configuration to maintain.
3. Set the base type: a single sans family, system stack acceptable, with `font-variant-numeric: tabular-nums` applied globally to table cells and any element holding a metric.
4. Build `ui/Card.tsx` — surface, 1px rule border, no drop shadow. Optional header slot.
5. Build `ui/StatCard.tsx` — a large tabular figure, a small label beneath, optional zone tint on the figure only.
6. Build `ui/ZoneBadge.tsx` — takes a `Zone`, renders the label and value in the zone colour with a 1px border of the same colour and no fill. Single source of truth for how a zone looks.
7. Build `ui/DataTable.tsx` — a generic table with a heavy bottom rule under the header, hairline row rules, horizontal overflow container. Accepts a `columns` descriptor and `rows`.
8. Build `ui/Drawer.tsx` — right-side panel, Framer Motion slide-in (200 ms), Escape closes, focus trapped, backdrop click closes.
9. Build `ui/Toast.tsx` plus a toast host — top-right, auto-dismiss at 4 s, max two stacked.
10. Build `ui/ProgressStages.tsx` — takes `{ label, progress, stageIndex, stageCount }` and renders a determinate bar, the current stage label, and a stage counter (e.g. *Stage 2 of 4*). Used by both ingestion and evidence verification.

**Acceptance.**
- A scratch route renders all seven primitives together and they are visually coherent.
- Changing `--zone-red` in `tokens.css` changes every red element in the app.
- `Drawer` is keyboard-operable: Tab cycles inside it, Escape closes it.
- `prefers-reduced-motion: reduce` disables the drawer slide and the toast entrance.

**Do not:** add variants, sizes or props that no screen in this plan requires.

---

## WP-03 — App shell, navigation and routing

**Context.** The shell is on screen for the entire demo, so it carries the product's identity. It also holds the role switcher, which is the mechanism that makes three personas legible in six minutes, and the notification badge, which is the hook that pulls the viewer from the boardroom into the agent centre at the 3:30 mark.

**Tasks.**

1. Configure React Router in **hash mode** with the five routes from §1.8, all rendering inside `AppShell`.
2. `shell/TopBar.tsx`:
   - Product mark: *Autonomous Strategy OS*.
   - Agent status indicator: a small dot with a slow 2 s pulse and the label *Agent mode active*. This is the one exception to "no non-user-triggered motion" — it is a status indicator, keep it subtle.
   - `RoleSwitcher` (below).
   - `NotificationBell` (below).
3. `shell/RoleSwitcher.tsx`: dropdown with the three personas from §1.6, each showing name and role title. Selecting one calls `setRole()` and re-renders instantly — **no loading state, no transition delay**.
4. `shell/NotificationBell.tsx`: bell icon with a count badge bound to the number of `PENDING` proposals. Clicking navigates to `#/agents`. Badge hides at zero.
5. `shell/SideNav.tsx`: the five items with their icons —
   `FileText` Document Intake · `LayoutDashboard` Executive Boardroom · `Target` Manager Execution Hub · `Bot` AI Agent Command Centre · `Scale` Matrix of Powers & Audit Log.
6. Role-based nav filtering: items the active role cannot reach are **hidden, not disabled**. Mapping —
   - `EXECUTIVE`: all five
   - `MANAGER`: Manager Execution Hub, Executive Boardroom (scoped), AI Agent Command Centre (read-only)
   - `CONSULTANT`: Document Intake, Executive Boardroom, AI Agent Command Centre (read-only)
7. Guard direct hash navigation to a route the current role cannot see: redirect to that role's landing route (`EXECUTIVE` → boardroom, `MANAGER` → hub, `CONSULTANT` → intake).
8. Each screen renders a placeholder card naming itself for now.

**Acceptance.**
- All five hashes load; a browser refresh on any hash restores that screen.
- Switching to `MANAGER` removes the governance item within one frame with no flicker.
- Typing `#/governance` as `MANAGER` lands on `#/hub`.
- The bell badge reads `2` on first load (two seeded pending proposals) and clicking it navigates to the agent centre.

**Do not:** build a collapsible sidebar, a breadcrumb trail, or a global search field.

---

# Phase 1 — Data and the Demo Engine

**Goal:** the machinery that makes fake work feel like real work, and makes the whole prototype recoverable in two seconds on stage.
**Gate to exit:** the store can be driven from a scratch page — ingest, verify evidence, approve a proposal, reset — with every action appearing in the audit array, and the same click sequence producing byte-identical state twice.

> This phase is the real build. Everything after it is screens. Do not compress it.

---

## WP-04 — Type system

**Context.** One file defines every shape in the demo. Screens consume these types and never define their own local variants. The `effects` array on a proposal is the key design decision in this WP: it is what makes the cascade look engineered rather than hardcoded, and it means a second demonstrable agent action later costs one data object instead of one code path.

**Tasks.** Author `src/store/types.ts` containing:

```ts
export type Role = 'EXECUTIVE' | 'MANAGER' | 'CONSULTANT';
export type Zone = 'GREEN' | 'YELLOW' | 'RED';        // >=80 | 60-79 | <60
export type Chapter = 'PRE_INGEST' | 'INGESTED' | 'FLAGGED' | 'RESOLVED';
export type AgentCode = 'INTAKE' | 'EVIDENCE' | 'DEVIATION';

export interface Person {
  id: string; name: string; title: string;
  department: string; authorityRuleId: string;
}

export interface Objective {
  id: string; code: string;          // 'OBJ-03'
  title: string; pillar: string;
  sourceRef: { page: number; section: string } | null;
}

export interface Initiative {
  id: string; objectiveId: string;
  title: string; ownerId: string;
  status: 'PLANNED' | 'ACTIVE' | 'AT_RISK';
}

export interface StrategicKPI {
  id: string; name: string; pillar: string;
  initiativeId: string; ownerId: string;
  target: number; actual: number;
  unit: '%' | 'SAR' | 'score' | 'days';
  zone: Zone;
  forecast: number | null;           // set by a cascade; labelled as re-forecast in UI
  history: { month: string; value: number }[];   // 12 pre-authored points
}

export type TaskStatus =
  | 'DRAFT' | 'ASSIGNED' | 'IN_PROGRESS'
  | 'EVIDENCE_UPLOADED' | 'VERIFIED' | 'COMPLETED';

export interface Task {
  id: string; initiativeId: string; ownerId: string;
  title: string; requirementRef: string;   // '3.2'
  dueDate: string; status: TaskStatus;
  evidence: { fileName: string; verifiedAt: string | null;
              verdict: string | null } | null;
}

export interface AuthorityRule {
  id: string;                        // 'AR-01'
  role: string; scope: string;
  financialLimit: number | null;     // null = uncapped
  signOff: string;
}

export type StateEffect =
  | { kind: 'KPI_FORECAST'; kpiId: string; to: number; toZone: Zone }
  | { kind: 'TASK_CREATE'; task: Omit<Task, 'evidence'> }
  | { kind: 'TASK_STATUS'; taskId: string; to: TaskStatus }
  | { kind: 'INITIATIVE_STATUS'; initiativeId: string;
      to: Initiative['status'] }
  | { kind: 'BUDGET_DELEGATE'; toPersonId: string; amount: number;
      ruleId: string };

export interface AgentProposal {
  id: string; agent: AgentCode;
  raisedAt: string; title: string;
  finding: string; rootCause: string; proposedAction: string;
  authorityCheck: {
    ruleId: string; requestedAmount: number;
    limit: number | null; passes: boolean;
    escalatesToRuleId: string | null;
  };
  effects: StateEffect[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface AgentLogEntry {
  id: string; agent: AgentCode; at: string;
  message: string; relatedId: string | null;
}

export interface AuditEvent {
  id: string; at: string;
  actor: { type: 'HUMAN' | 'AGENT'; name: string };
  action: string; entity: string;
  previousState: string | null; newState: string | null;
}

export interface IngestedDocument {
  id: string; fileName: string; pageCount: number;
  chunkCount: number; ingestedAt: string | null;
}
```

**Acceptance.**
- `npm run typecheck` passes with the file in place and nothing importing it yet.
- Every entity that appears anywhere in this plan has a type here.

**Do not:** add optional fields "just in case", or generics.

---

## WP-05 — Fixture data set

**Context.** This is the content the viewer actually reads. Generic data is the fastest way to make a good prototype feel fake. Twelve objectives, eight KPIs, six tasks, three authority tiers, two proposals — all curated so that any row survives being read closely. Every name should sound like a real Saudi enterprise; every figure should be specific.

**Tasks.**

1. `data/people.ts` — at minimum:
   - Sara Al-Mahmoud · Head of Operations · Operations · `AR-01`
   - Khalid Al-Riyami · Customer Experience Lead · Commercial · `AR-01`
   - Nouf Al-Otaibi · VP Supply Chain · Operations · `AR-02`
   - Faisal Al-Harbi · Chief Executive Officer · Executive · `AR-03`
   - Maayish Advisory · Strategy Consultant · External · no approval rights
2. `data/authority.ts` — exactly three rules:

   | id | Role | Scope | Limit | Sign-off |
   |---|---|---|---|---|
   | AR-01 | Department Manager | Department operations | SAR 187,500 | Internal initiatives |
   | AR-02 | VP / Director | Division-wide | SAR 937,500 | Strategic realignments |
   | AR-03 | C-Suite / CEO | Enterprise-wide | Uncapped | Board decisions and policy overhauls |

3. `data/objectives.ts` — 12 objectives across four pillars: *Operational Excellence*, *Customer Experience*, *Vision 2030 Alignment*, *Financial Resilience*. Each carries a `sourceRef` such as `{ page: 47, section: '3.2' }`. One must be **OBJ-03 · Expand regional market share by 25% by Q4 2027** (pillar: Vision 2030 Alignment) — this is the one traced on stage.
4. `data/initiatives.ts` — one to two per objective. One must be **Automate warehouse logistics and ERP ingestion**, owner Sara Al-Mahmoud, status `AT_RISK`, under OBJ-03.
5. `data/kpis.ts` — 8 KPIs producing exactly the zone split **5 green · 2 amber · 1 red**. The red one is the spine of the demo:
   ```
   Warehouse order fulfilment speed · Operational Excellence
   owner: Sara Al-Mahmoud · target 85 · actual 52 · unit '%' · zone RED
   ```
   Its `history` is 12 monthly points sitting in the low 80s through month 7, then declining through months 8–12 to 52. Author the decline as a curve with one small false recovery, not a straight line — straight declines look synthetic.
6. `data/tasks.ts` — 6 tasks. One must be **Q3 operational logistics audit and process optimisation**, owner Sara Al-Mahmoud, `requirementRef: '3.2'`, status `IN_PROGRESS`, evidence `null`.
7. `data/proposals.ts` — two pending proposals:
   - **P-01, `DEVIATION`** — the on-stage one. Finding: fulfilment speed has fallen to 52%, a 33-point gap to target, sustained over two quarters. Root cause: the primary logistics supplier's average dispatch lag rose from 1.8 to 4.6 days after a depot consolidation in month 8. Proposed action: reroute Q4 fulfilment volume to the secondary provider and delegate a SAR 165,000 contingency to Sara Al-Mahmoud. Authority check: `AR-01`, requested 165,000, limit 187,500, **passes**, no escalation. Effects: KPI forecast 52 → 72 (`YELLOW`), create a task for Sara, initiative status `AT_RISK` → `ACTIVE`, budget delegation.
   - **P-02, `DEVIATION`** — the escalation example, left pending. Requests SAR 420,000, which **exceeds** `AR-01`'s limit, so `passes: false` and `escalatesToRuleId: 'AR-02'`. Its presence lets you answer "what if the agent overreaches" without clicking anything.
8. `data/documents.ts` — one fixture: *Regional Growth Strategy 2026 — Activation Report*, 120 pages, 1,847 chunks.
9. `data/copy.ts` — the four ingestion stage strings, the evidence verification string and verdict, and the toast strings. Everything a viewer reads during simulated processing lives here so it can be rewritten in one place during WP-23.

**Acceptance.**
- Zone counts computed from `kpis.ts` are exactly 5/2/1.
- `165000 < 187500` and `420000 > 187500` — the two authority checks are arithmetically true against `authority.ts`, not asserted in prose.
- No number in any fixture is a round hundred-thousand except the authority limits themselves.
- Every KPI's `ownerId`, `initiativeId` and every initiative's `objectiveId` resolves to a real record.

**Do not:** generate data procedurally, or add a twelfth objective with placeholder text.

---

## WP-06 — The demo store

**Context.** A single Zustand store holds the entire demo. Components never orchestrate sequences; they call one action and render whatever the store says. This is what makes the demo resettable and what keeps five screens consistent during the cascade.

**Tasks.**

1. Author `store/demoStore.ts` to this shape:

```ts
interface DemoStore {
  role: Role;
  chapter: Chapter;

  documents: IngestedDocument[];
  objectives: Objective[];
  initiatives: Initiative[];
  kpis: StrategicKPI[];
  tasks: Task[];
  proposals: AgentProposal[];
  authorityRules: AuthorityRule[];
  auditEvents: AuditEvent[];
  agentActivity: AgentLogEntry[];
  delegations: { personId: string; amount: number; ruleId: string }[];

  pipeline: { stage: number; label: string; progress: number } | null;
  verifying: string | null;      // taskId mid-verification
  resolving: string | null;      // proposalId mid-cascade

  ingestDocument(file?: File): Promise<void>;
  submitEvidence(taskId: string, fileName: string): Promise<void>;
  resolveProposal(id: string, decision: 'APPROVED' | 'REJECTED'): Promise<void>;
  setRole(role: Role): void;
  reset(): void;
  seed(chapter: Chapter): void;
}
```

2. Initial state = `PRE_INGEST`: objectives, initiatives, KPIs, tasks and proposals present but the boardroom **not yet provisioned** (`documents[0].ingestedAt === null`). The boardroom in this state shows an empty state inviting ingestion.
3. Actions are async and own their own staging. A component awaits the action; it never sequences steps itself.
4. Add selector helpers in the same file — `selectZoneCounts`, `selectAlignmentChain(kpiId)`, `selectVisibleKpis(role)`, `selectPendingProposals`. Screens use selectors, not raw array filtering.
5. `setRole` is synchronous and instant, and writes an audit event (role switches appear in the log — this is deliberate).

**Acceptance.**
- A scratch page can call every action and the state updates correctly.
- `selectAlignmentChain('kpi-warehouse')` returns objective, initiative, task, owner, authority rule and KPI, all resolved from IDs.
- No component imports a fixture file directly; everything flows through the store.

**Do not:** add persistence middleware, devtools middleware in the production build, or a second store.

---

## WP-07 — Sequence runner and audit derivation

**Context.** Rules 2 and 3 of §1.10 made real. One scheduler owns all simulated latency; one helper turns every mutation into an audit event. Together they are why the demo is rehearsable and why the governance screen is credible.

**Tasks.**

1. `lib/runSequence.ts`:

```ts
export interface SequenceStep {
  label: string;
  durationMs: number;
  onEnter?: () => void;     // mutate store at the start of this stage
}

export function runSequence(
  steps: SequenceStep[],
  onTick: (s: { stage: number; label: string; progress: number }) => void
): Promise<void>;
```
   - `progress` is 0→1 across the whole sequence, advancing smoothly via `requestAnimationFrame`, not stepping per stage.
   - The function is cancellable; `reset()` cancels any in-flight sequence.
   - This is the only file permitted to call `setTimeout`/`requestAnimationFrame` for timing.

2. `store/audit.ts`:

```ts
export function auditEvent(input: {
  actor: { type: 'HUMAN' | 'AGENT'; name: string };
  action: string; entity: string;
  previousState?: string | null; newState?: string | null;
}): AuditEvent;
```
   - IDs are sequential (`EV-0001`), not random.
   - Timestamps derive from a fixed demo epoch (`09:00` on the demo date) plus a monotonic offset counter, so a replay produces identical timestamps.

3. Wire `auditEvent` into every store mutation: ingestion completion, each extraction, evidence upload, verification verdict, proposal approval, each applied effect, proposal rejection, role switch.
4. Add an `agentActivity` append alongside audit events for anything an agent did, with the agent's code and a human-readable message.

**Acceptance.**
- Running the full happy path twice from `reset()` produces two identical `auditEvents` arrays, including timestamps.
- Calling `reset()` mid-ingestion stops the progress bar immediately and leaves no orphaned timers.
- Grepping the codebase finds `setTimeout` in exactly one file.

**Do not:** log to console as a substitute for audit events.

---

## WP-08 — Reset, seed routes and demo controls

**Context.** Live demos go wrong. This WP is the insurance policy, and it is also what makes rehearsal cheap — each beat of the arc can be practised in isolation without replaying the whole story.

**Tasks.**

1. `demo/script.ts` — define the state for each chapter:

   | Chapter | State |
   |---|---|
   | `PRE_INGEST` | Nothing ingested, boardroom empty, 2 proposals pending |
   | `INGESTED` | Document ingested, boardroom live, red KPI present, 2 proposals pending |
   | `FLAGGED` | As above, plus the deviation agent's feed entries present and the bell badge showing |
   | `RESOLVED` | P-01 approved, cascade applied, audit log populated |

2. `seed(chapter)` in the store applies a chapter wholesale, including a coherent audit history for chapters after `PRE_INGEST` — a seeded `RESOLVED` state must have an audit log that looks like the demo actually ran.
3. Route `#/seed/:chapter` seeds and then redirects to that chapter's natural screen.
4. `demo/DemoControls.tsx` — a small, low-contrast control fixed to the bottom-left: a reset button and a chapter jump. Visible but visually quiet. It is a demo tool, and its presence is honest.
5. Keyboard shortcuts: `Ctrl/Cmd + Shift + R` resets; `Ctrl/Cmd + Shift + 1..4` jumps to a chapter. Do not bind bare keys — a stray keypress during a demo must not change state.

**Acceptance.**
- Reset from any state returns to `PRE_INGEST` in under one second with no residual toasts, no in-flight animation and the bell badge back to 2.
- `#/seed/resolved` loads a state whose audit log reads as though the full demo had been performed.
- Rehearsing beat 4 alone takes two keystrokes.

**Do not:** hide the controls behind a konami code or an invisible click target — you will need them under pressure.

---

# Phase 2 — Executive Boardroom

**Goal:** the red-KPI story is legible end to end, with no agent features built yet.
**Gate to exit:** a viewer who knows nothing about the product can look at the boardroom, find the red KPI, open it, and explain what is wrong and who owns it.

---

## WP-09 — Boardroom: portfolio metric row

**Context.** The first thing seen after provisioning. Four figures that frame the whole portfolio in about three seconds.

**Tasks.**

1. Four `StatCard`s: **Active objectives** (12) · **Performance zones** (5 / 2 / 1 as three tinted figures in one card) · **Initiatives at risk** (count of `AT_RISK`) · **Decisions awaiting you** (pending proposals, only for `EXECUTIVE`).
2. All four derive from store selectors. None is hardcoded.
3. "Decisions awaiting you" is clickable and routes to `#/agents`.
4. In `PRE_INGEST`, the boardroom shows an empty state: a short line explaining no deliverable has been ingested yet, and a button routing to `#/intake`. Write it as an invitation to act, not an apology.

**Acceptance.** After the cascade in WP-18, the zone split reads 5/3/0 without any code in this WP changing.

---

## WP-10 — Boardroom: strategic portfolio heatmap

**Context.** The visual centrepiece. It has to make one red cell findable across a room in under two seconds without the rest of the grid looking like decoration.

**Tasks.**

1. A grid grouped by pillar — four pillar rows, KPI cells within each.
2. Each cell: KPI name, current value with unit, zone colour applied to a left edge bar and the value, not as a full-cell fill. Full fills make the board look like a warning panel; edge treatment keeps it readable.
3. Hover raises a 1px accent border; no colour change, no lift, no shadow.
4. Click opens the drawer from WP-11.
5. Role scoping: `MANAGER` sees only KPIs she owns, with a quiet line stating the view is scoped to her department.

**Acceptance.**
- The single red cell is identifiable at a glance on a projector at 1280×720.
- Keyboard: cells are tabbable and Enter opens the drawer.

**Do not:** animate cells on mount, or add a legend explaining the colours — the thresholds appear in the drawer where they matter.

---

## WP-11 — Boardroom: alignment chain drawer and KPI trend

**Context.** This is where the product's core idea becomes visible: every number traces upward to an objective and downward to a named person and an authority limit. It must render from store relationships rather than hand-written strings, because after the cascade runs it has to still be correct.

**Tasks.**

1. Open `ui/Drawer` on cell click, headed by the KPI name, its actual-versus-target figures, and a `ZoneBadge`.
2. Render the alignment chain as a vertical sequence with connector rules, each step showing its entity type and title:
   `Objective OBJ-03` → `Initiative` → `Task` → `Owner (person + title)` → `Authority rule AR-01 · limit SAR 187,500` → `KPI`.
   Built from `selectAlignmentChain(kpiId)`. Each step is clickable where a destination exists (owner → manager hub, rule → governance).
3. Beneath it, a Recharts line chart of the 12-month history:
   - Target drawn as a horizontal reference line at 85.
   - Zone bands as faint background regions at the 80 and 60 thresholds.
   - The points that fall below 60 marked, and the month of crossing labelled.
   - Accent colour for the line; zone colours only for the bands and the crossing marker.
4. A short footer strip naming the threshold rule in words: green at or above 80%, amber 60–79%, red below 60%.
5. **Post-cascade state:** once a forecast exists on the KPI, the drawer shows the actual and, beside it, a distinctly styled re-forecast figure with a one-line note saying which approved action produced it.

**Design decision to honour.** An approval cannot change measured history — it changes the outlook. Rendering 72% as a **re-forecast** rather than silently overwriting the actual is a small copy change that removes the most common objection a sceptical viewer raises. Build it this way.

**Acceptance.**
- Opening the drawer on the red KPI shows a complete six-step chain with no placeholder text.
- Re-opening it after the cascade shows actual 52% and re-forecast 72%, correctly attributed.
- The chart renders in under 100 ms and does not animate on open beyond the drawer's own slide.

---

# Phase 3 — Document Intake

**Goal:** the opening ninety seconds of the demo run unassisted.
**Gate to exit:** dropping the sample document and clicking through to the boardroom requires no narration to be comprehensible.

---

## WP-12 — Intake: dropzone and sample loader

**Context.** Two paths in: the sample button, used on stage; and a real dropzone, so a sceptical viewer can drop their own file and see the same thing happen. Nothing is read from a dropped file except its name and a page count derived from its size — be prepared to say so plainly if asked.

**Tasks.**

1. A large dropzone with a dashed `--rule` border, an active state on drag-over.
2. Primary action inside it: **Load sample report — Regional Growth Strategy 2026, 120 pages**.
3. Dropping a real file accepts it, shows its actual filename, and proceeds identically.
4. Below the zone, a short line naming what the platform accepts: strategy reports, authority matrices, policy manuals, board packs.
5. Available to `CONSULTANT` and `EXECUTIVE`; hidden from `MANAGER`.

**Acceptance.** Dropping a 4 MB PDF and clicking the sample button both lead to the same pipeline. No file content is read at any point.

---

## WP-13 — Intake: simulated RAG pipeline

**Context.** 4,200 ms is long enough to feel like real work and short enough to hold a room. The stage names must describe work the eventual product will actually do — never show a stage implying a capability that isn't on the roadmap.

**Tasks.**

1. Call `store.ingestDocument()`, which runs `runSequence` with four steps:

   | Stage | Duration | Label |
   |---|---|---|
   | 1 | 1,000 ms | Parsing document layout, tables and section hierarchies |
   | 2 | 1,500 ms | Chunking by section boundary and generating embeddings |
   | 3 | 1,000 ms | Intake agent: extracting objectives, KPIs and owners |
   | 4 | 700 ms | Mapping the alignment chain and authority limits |

2. Render with `ProgressStages`, plus a chunk counter climbing to **1,847** during stage 2 only, driven by the sequence's `progress` value.
3. Completed stages remain listed above the current one with a check, so the viewer can see what has already happened.
4. `onEnter` on stage 3 appends the Intake Agent's `agentActivity` entries; stage 4 sets `documents[0].ingestedAt` and moves `chapter` to `INGESTED`.
5. Audit events written for document ingestion and for each extraction batch.

**Acceptance.**
- The bar advances continuously, not in four jumps.
- The chunk counter lands exactly on 1,847 at the end of stage 2 and stops.
- A reset during stage 2 cancels cleanly with no console errors.

**Do not:** add a stage mentioning model names, token counts or GPU work.

---

## WP-14 — Intake: extraction tree with source citations

**Context.** This is the screen that earns the viewer's trust, and it is the single most under-specified part of the original brief. A wall of extracted JSON proves nothing. A traceable citation — *this figure came from page 47, section 3.2, and here is the passage* — proves the whole thesis.

**Tasks.**

1. Render an expandable tree of what was "extracted", grouped by objective:
   ```
   Objective  Expand regional market share by 25% by Q4 2027
     Initiative  Automate warehouse logistics and ERP ingestion
       Owner     Sara Al-Mahmoud · Head of Operations
       KPI       Operational productivity · target 85%
       Authority Capex limit SAR 187,500 (AR-01)
   ```
2. Each node shows a confidence figure (e.g. 0.94) and a source reference rendered as **p. 47 · §3.2**.
3. Clicking a source reference opens a side panel showing the source passage — a short authored paragraph of plausible consulting prose that visibly contains the extracted figure, with the matched span highlighted. Author three of these in `data/copy.ts`; the rest can reuse the nearest one.
4. Nodes with lower confidence (below 0.80) carry a quiet *needs review* marker. Include exactly one. A system that claims perfect extraction is less believable than one that flags its own uncertainty.
5. Counts at the top: objectives, initiatives, KPIs, owners, authority rules extracted.

**Acceptance.**
- At least one node is traceable to a visible passage containing the matching figure.
- Exactly one node is marked as needing review.
- Collapsing and expanding is instant, with no animation longer than 150 ms.

**Do not:** show raw JSON, chunk text dumps, or embedding vectors anywhere in the UI.

---

## WP-15 — Intake: provisioning handoff to boardroom

**Context.** The transition itself is a demo beat — the moment a document becomes a system. It should feel like a commitment, not a page change.

**Tasks.**

1. Primary action: **Provision Strategy OS and launch dashboard**.
2. On click: 600 ms with the button in a pending state, a toast reading *Workspace provisioned — 12 objectives, 8 KPIs and 6 owners are now live*, then route to `#/boardroom`.
3. Switch role to `EXECUTIVE` as part of the handoff, so the boardroom is seen through the right lens, and make the role switcher visibly reflect that.
4. On arrival, the objective that was just walked through in the tree is briefly highlighted in the heatmap — one 800 ms outline pulse, once.
5. Audit events for provisioning and the role change.

**Acceptance.** The path from the sample button to a populated boardroom takes under seven seconds of wall-clock time and involves three clicks.

---

# Phase 4 — Agent Command Centre and the Cascade

**Goal:** the moment the demo is built around.
**Gate to exit:** approving P-01 produces all six effects in the correct order, and every screen in the app is correct afterwards.

---

## WP-16 — Agent Centre: sub-agent activity feed

**Context.** The feed is what establishes that agents have been working in the background rather than performing on cue. It must already contain entries from ingestion by the time the viewer arrives.

**Tasks.**

1. Two-column layout: activity feed on the left, pending proposals on the right.
2. Feed entries: agent avatar/icon, agent name, timestamp, message, and a link to the related entity where one exists. Chronological, newest first.
3. Seeded entries at `FLAGGED` include the Intake Agent's ingestion work, the Deviation Agent's detection of the fulfilment drop, and a routine "no anomalies detected" sweep across the other seven KPIs — the absence of findings is itself reassuring.
4. Agent-authored text is set off by a hairline left rule in `--accent`, never a coloured bubble.
5. A small header strip showing the three agents and their current state (idle / active), bound to store state.

**Acceptance.** Arriving at the agent centre after ingestion shows at least six feed entries, at least three of which were generated by the ingestion run rather than seeded.

---

## WP-17 — Agent Centre: proposal card and authority check

**Context.** The proposal card is the product's argument in one component: the agent found something, explained why, proposed a specific action, and checked its own authority before asking. The authority check must be *computed* from `authorityRules`, not written into the card copy — if it is prose, a viewer who notices will discount everything else on screen.

**Tasks.**

1. `agents/ProposalCard.tsx` with four labelled regions: **Finding** · **Root cause** · **Proposed action** · **Authority check**.
2. `agents/AuthorityCheck.tsx` renders: the rule reference and role, the requested amount, the limit, and a pass/fail verdict. It recomputes `requestedAmount <= limit` at render time from the store's `authorityRules`. When it fails, it names the rule it escalates to and states that the action will route upward instead.
3. Two actions: **Approve action** (primary, accent) and **Reject or modify** (secondary).
4. Approval is available only to `EXECUTIVE`. For `MANAGER` and `CONSULTANT` the buttons are replaced by a line stating who holds the decision, with the person named.
5. Render both P-01 and P-02. P-02's failing check demonstrates the escalation path without anyone clicking it.

**Acceptance.**
- Editing `AR-01`'s limit in the fixture to 150,000 flips P-01's check to failing with no code change.
- As `MANAGER`, no approve button is reachable by keyboard or click.

---

## WP-18 — The cascade: declarative effects engine

**Context.** One click, then five visible consequences over roughly two seconds, staggered so the eye can follow them. The staggering is the point — an instantaneous update reads as a page refresh; a two-second sequence reads as a system doing work across departments.

**Tasks.**

1. `store/effects.ts` exports `applyEffect(state, effect): { next, audit }` handling all five `StateEffect` kinds generically. `resolveProposal('APPROVED')` maps over `proposal.effects` and applies each — no proposal-specific branching anywhere.
2. Stagger via `runSequence`:

   | Offset | Effect | Visible where |
   |---|---|---|
   | 0 ms | Button enters pending state, card dims | Agent centre |
   | 1,200 ms | Toast: *Approved. Authority verified against AR-01.* | Global |
   | 1,400 ms | KPI re-forecast 52 → 72, zone RED → YELLOW | Boardroom heatmap and drawer |
   | 1,600 ms | New task assigned to Sara Al-Mahmoud with a SAR 165,000 contingency | Manager hub |
   | 1,800 ms | Two audit rows written — one for the agent action, one for the human approval | Governance |
   | 2,000 ms | Proposal count decrements; agent feed logs completion | Top bar and feed |

3. Each applied effect writes its own audit event with real previous and new values.
4. The changed heatmap cell carries a single 800 ms outline pulse when the viewer next lands on the boardroom, so the change is findable if they were looking elsewhere.
5. Guard against double-submit: the button is disabled for the duration and the proposal cannot be resolved twice.

**Acceptance.**
- Approving P-01 while sitting on the agent centre, then navigating to the boardroom, governance and hub, shows all changes correctly on each.
- Approving, resetting, and approving again produces identical state both times.
- Adding a third proposal with a new `effects` array requires no change to `effects.ts`.

**Do not:** write a bespoke `handleApproveP01` function. If a proposal needs code, the effect kind is missing from the type union.

---

## WP-19 — Reject and modify path

**Context.** Worth the two hours. It answers "what if the agent is wrong" before anyone asks, and it makes the human-in-the-loop gate look like a real control rather than a rubber stamp.

**Tasks.**

1. **Reject or modify** opens a compact panel with: a reason selector (*insufficient evidence* · *wrong owner* · *amount too high* · *defer to next review*), an optional free-text note, and confirm/cancel.
2. Confirming sets the proposal to `REJECTED`, writes an audit event naming the reason and the rejecting human, appends an agent feed entry acknowledging the rejection, and decrements the badge. **No state effects are applied.**
3. Rejected proposals remain listed in a collapsed *Resolved* section, showing their outcome — they do not vanish.

**Acceptance.** Rejecting P-02 leaves every KPI, task and initiative untouched while producing a complete audit trail of the decision.

---

# Phase 5 — Manager Hub and Governance

**Goal:** close the loop — the work lands on a real person's desk, and the whole thing is auditable.
**Gate to exit:** the full six-minute arc runs from `reset()` with no operator intervention.

---

## WP-20 — Manager Hub and evidence verification

**Context.** Two jobs. It shows the downstream end of the cascade (a task appears without anyone being emailed), and it demonstrates the Evidence Verification Agent, which is the quiet proof that the platform closes tasks on evidence rather than self-report.

**Tasks.**

1. Visible primarily as `MANAGER`. Header addresses Sara by name with her title.
2. A list of her assigned tasks with due dates and statuses, ordered by urgency. After the cascade, the new contingency task appears at the top, visibly newer than the rest.
3. The active card is **Q3 operational logistics audit and process optimisation**, showing its requirement reference 3.2 and its linked initiative.
4. Evidence upload: a drop area plus a prepared action **Attach Q3_Logistics_Audit_Verification.pdf**.
5. On upload, run `submitEvidence` — 1,800 ms with an inline indicator reading *Evidence verification agent: checking document structure, signatures and requirement coverage*. Then a verdict badge naming the requirement satisfied: *Verified — satisfies requirement 3.2: independent audit sign-off present*.
6. Status advances `IN_PROGRESS` → `EVIDENCE_UPLOADED` → `VERIFIED`, each step its own audit event.
7. Include one task in `DRAFT` and one in `COMPLETED` so the lifecycle is visible as a range, not a single state.

**Acceptance.**
- The verification verdict names a specific requirement, not a generic success.
- Switching to `EXECUTIVE` after verification shows the task's new status reflected in the alignment chain drawer.
- The cascade-created task is present on the hub within 1,600 ms of approval.

---

## WP-21 — Governance: Matrix of Powers table

**Context.** The compliance half of the argument. It should read like a document an auditor would accept, which means plain typography, no cards, no icons.

**Tasks.**

1. `DataTable` with columns: **Rule** · **Role / title** · **Operational scope** · **Financial approval limit** · **Sign-off authority**, populated from `data/authority.ts`.
2. Uncapped renders as the word *Uncapped*, not a dash or infinity symbol.
3. The rule invoked by the most recent approval is highlighted with a left accent bar and a small note naming the action and amount that invoked it.
4. Above the table, one sentence explaining what the matrix governs, in the interface's voice.
5. Each rule links to the people it governs.

**Acceptance.** After approving P-01, AR-01 is highlighted and annotated with the SAR 165,000 delegation.

---

## WP-22 — Governance: immutable audit log feed

**Context.** This screen is entirely derived from WP-07's event stream. If it required its own data, the whole design has gone wrong. It is also the closing beat of the demo, so it has to be readable at a glance rather than dense.

**Tasks.**

1. `DataTable` with columns: **Timestamp** · **Actor** · **Action** · **Previous state** · **New state**.
2. Actor cell distinguishes human from agent with a small icon and the actor's name — agent rows are visually distinct but not colour-coded as warnings.
3. Newest first, with new rows landing via a 400 ms highlight fade. The newest row must be visible without scrolling.
4. A filter strip: all · agent actions · human actions · this session. Buttons only, no dropdown.
5. Empty previous/new states render as an em dash, not blank.
6. A line above the table stating the log is append-only and cannot be edited from the interface — which is literally true here, since nothing writes to it except the store.

**Acceptance.**
- Every action taken during a full demo run appears in order, including role switches.
- Two new rows land visibly when the cascade completes.
- The log after a seeded `RESOLVED` state is indistinguishable from one produced by actually running the demo.

---

# Phase 6 — Hardening

**Goal:** the difference between a prototype that works and one that survives a room.
**Gate to exit:** the demo runs twice end to end from a clean reset with no operator intervention and no console output.

---

## WP-23 — Copy pass

**Context.** Budget real time for this. The text inside the pipeline stages, the agent findings, the verification verdicts and the audit entries is what viewers actually read, and the first draft of it is always too generic to be convincing. This WP is writing, not engineering.

**Tasks.**

1. Rewrite every string in `data/copy.ts` against these rules: active voice; sentence case; plain verbs; no exclamation marks; no "successfully"; an action keeps the same name through the whole flow, so a button that says *Approve action* produces a toast that says *Approved*.
2. Agent findings must be specific enough to be falsifiable — name the supplier, the depot, the dispatch lag in days, the month it changed. A finding a viewer could argue with is a finding they believe.
3. Errors and empty states explain what happened and what to do, in the interface's voice. No apologies, no mood.
4. Remove every instance of "AI-powered", "seamlessly", "leverage", "robust" and "cutting-edge" from the UI.
5. Check every number shown against its fixture. A mismatch between the card copy and the data is the defect most likely to be caught by an audience.

**Acceptance.** Read every screen aloud. Anything that sounds like marketing rather than software gets rewritten.

---

## WP-24 — Role-scoping sweep

**Context.** Role switching is a headline feature, and the failure mode is subtle: a screen that forgot to scope, showing a manager data she should not see. Worth a dedicated pass across finished screens rather than trusting each WP.

**Tasks.**

1. For each of the three roles, walk all five routes and record what is visible.
2. Confirm: `MANAGER` cannot reach governance, sees only her own KPIs and tasks, and has no approval control anywhere. `CONSULTANT` can ingest and view but cannot approve or see the audit log. `EXECUTIVE` sees everything.
3. Confirm hash-typing a forbidden route redirects correctly for all three roles.
4. Confirm no approval control is reachable by keyboard tabbing for non-executives.
5. Confirm role switching mid-drawer, mid-pipeline and mid-cascade does not break state. If mid-sequence switching is unsafe, disable the switcher for the duration rather than attempting to handle it.

**Acceptance.** A 15-cell matrix of role × route, all cells verified and recorded in `README.md`.

---

## WP-25 — Rehearsal hardening and QA script

**Context.** Everything that makes a demo fail on stage, found deliberately in advance.

**Tasks.**

1. Write the QA script into `README.md` as a checklist following the six-minute arc, with the expected state at each beat.
2. Run it three times from `reset()`. Fix anything that requires the operator to think.
3. Verify: no console errors or warnings in a production build; no layout shift on any route; every route survives a hard refresh; the app works with the network disconnected.
4. Verify reset from each of: mid-ingestion, mid-verification, mid-cascade, drawer open, toast visible.
5. Tune timings against a real read-aloud. If the 4,200 ms ingestion feels slow when narrated, shorten stage 4 rather than adding stages.
6. Check the whole demo on a 1280×720 projector profile, from three metres. Anything unreadable at that distance gets bigger.
7. Add a `prefers-reduced-motion` pass — the cascade still applies, it just applies without staggered motion.

**Acceptance.** Two consecutive clean runs with the network adapter disabled.

---

## WP-26 — Build and offline fallback

**Context.** A local production build is sufficient and is the primary presentation path, so venue wi-fi cannot end the demo. Remote hosting is optional.

**Tasks.**

1. `npm run build`; verify the output is fully static with no runtime environment variables.
2. Confirm `vite preview` serves the built app correctly with hash routing on a hard refresh of every route.
3. Document in `README.md`: how to run the local production build, the keyboard shortcuts, the seed routes, and the six-minute run script.
4. Set the page title and favicon.

**Acceptance.** The built app runs from `dist/` with the machine offline, and every seed route works.

---

# Section 3 — Standing decisions the agent should not relitigate

| Decision | Why |
|---|---|
| No free-text chat anywhere | Someone will type into it live and there is nothing behind it. An absent feature is easier to defend than a broken one. |
| Approval sets a **re-forecast**, not a new actual | An approval cannot retroactively change measured history. This one word removes the most common objection. |
| Audit log is derived, not authored | It is cheap to build this way and it is the single most convincing detail in the product. |
| Proposals declare `effects[]` | A second demonstrable agent action costs one data object, not one code path. |
| Reset control is visible | You will need it under pressure, and its presence is honest about what this is. |
| Status colours mean only KPI status | If green appears anywhere decorative, the heatmap stops meaning anything. |
| Currency is SAR, figures are never round | Signals the market, and round numbers read as fixture data. |
| Light mode only, desktop only | Two fewer surfaces to keep consistent across five screens, for zero demo value. |
