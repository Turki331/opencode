# Autonomous Strategy OS

Client-side demonstration of a strategy execution workspace. The app uses
scripted fixture data only. It has no backend, network calls, authentication,
database, or persistence beyond the browser tab.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

For the production-like local presentation:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173`. Remote hosting is optional.

## Routes

| Route          | Screen                       |
| -------------- | ---------------------------- |
| `#/intake`     | Document Intake              |
| `#/boardroom`  | Executive Boardroom          |
| `#/hub`        | Manager Execution Hub        |
| `#/agents`     | AI Agent Command Centre      |
| `#/governance` | Matrix of Powers & Audit Log |

Seed routes jump directly to a rehearsal chapter:

```text
#/seed/pre_ingest
#/seed/ingested
#/seed/flagged
#/seed/resolved
```

The store scratch page is available at `#/scratch` for exercising ingestion,
evidence verification, proposal resolution, reset, and seed actions.

## Demo Controls

- `Ctrl/Cmd + Shift + R`: reset to `PRE_INGEST` and return to Document Intake
- `Ctrl/Cmd + Shift + 1`: seed `PRE_INGEST`
- `Ctrl/Cmd + Shift + 2`: seed `INGESTED`
- `Ctrl/Cmd + Shift + 3`: seed `FLAGGED`
- `Ctrl/Cmd + Shift + 4`: seed `RESOLVED`

Role switching is disabled while ingestion, evidence verification, workspace
provisioning, or proposal resolution is active.

## Six-Minute Rehearsal

Run this sequence from a clean reset. Expected states are included so a failed
beat can be identified without narration.

1. Reset the demo. The role is `EXECUTIVE`, the chapter is `PRE_INGEST`, the boardroom is empty, and two proposals are pending.
2. Open Document Intake and click **Load sample report — Regional Growth Strategy 2026, 120 pages**. The four-stage pipeline runs for 4,200 ms and reaches 1,847 indexed chunks.
3. Review the extracted structure. `OBJ-03` is expanded by default, its source citation opens a passage, and exactly one node says **Needs review**.
4. Click **Provision Strategy OS and launch dashboard**. After 600 ms, the workspace toast appears, the role is `EXECUTIVE`, and the boardroom opens with the `OBJ-03` heatmap cell highlighted once.
5. Open the red warehouse KPI. The alignment drawer shows the six-step chain, actual `52%`, target `85%`, and the 12-month trend.
6. Open AI Agent Command Centre. The activity feed is newest first, both proposals are pending, and the authority check is computed from the Matrix of Powers.
7. Approve P-01. Over 2,000 ms, the KPI receives a re-forecast of `72%`, the contingency task appears, the initiative becomes active, the delegation is recorded, and the proposal leaves the pending queue.
8. Open Manager Execution Hub. The new contingency task is first. Upload `Q3_Logistics_Audit_Verification.pdf`; the verification takes 1,800 ms and ends with the requirement 3.2 verdict.
9. Open Governance. AR-01 is highlighted with the latest `SAR 165,000` delegation. The audit log is newest first and includes the human and agent actions.

## QA Checklist

Run the rehearsal at least three times from reset. Before acceptance, verify:

- Two consecutive complete runs produce the same visible state and audit ordering.
- Reset during ingestion, evidence verification, proposal resolution, drawer open, and toast display leaves no stale state.
- All five route hashes survive a hard refresh in `vite preview`.
- `#/seed/resolved` opens Governance with a coherent audit history and the approved cascade state.
- Manager cannot access Intake or Governance and cannot reach approval controls.
- Consultant can access Intake, Boardroom, and Agent Centre but cannot access Governance or approval controls.
- Executive can access all five routes and approval controls.
- The layout is readable at 1280×720 and remains usable on a narrow viewport.
- With `prefers-reduced-motion: reduce`, the drawer and toast do not slide or enter, and sequence effects still apply without staggered delays.
- The production build runs from `dist/` with the network adapter disabled.

## Role-Scoping Matrix

| Role         | Document Intake      | Executive Boardroom | Manager Execution Hub   | Agent Command Centre | Governance              |
| ------------ | -------------------- | ------------------- | ----------------------- | -------------------- | ----------------------- |
| `EXECUTIVE`  | Visible              | Visible             | Visible                 | Visible              | Visible                 |
| `MANAGER`    | Redirects to `#/hub` | Visible, scoped     | Visible                 | Visible, read-only   | Redirects to `#/hub`    |
| `CONSULTANT` | Visible              | Visible, read-only  | Redirects to `#/intake` | Visible, read-only   | Redirects to `#/intake` |

Approval controls render only for `EXECUTIVE`. Manager and Consultant views do
not expose approval buttons through navigation or keyboard focus.
