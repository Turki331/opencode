# Agent Instructions

## Repository State

- This repository is currently a planning skeleton, not a runnable app. There is no `package.json`, source tree, test runner, or local OpenCode config yet.
- `strategy-os-implementation-plan.md` is the implementation source of truth. Work one WP per session, respect its dependency list, do not improvise out-of-scope features, and use the WP ID in commits (for example, `WP-07: sequence runner and audit derivation`).
- The root `README.md` is currently only a placeholder; do not infer setup commands from it until the scaffold is created.

## Planned Scaffold

- WP-01 uses Vite React TypeScript: `npm create vite@latest . -- --template react-ts`.
- The planned runtime dependencies are `zustand`, `recharts`, `framer-motion` (only for the drawer and cascade reveals), `lucide-react`, and `react-router-dom`; use plain CSS with custom properties, plus `prettier` and `eslint` for tooling.
- Once scaffolded, the required scripts are `npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`, and `npm run lint`. The plan deliberately does not add a testing framework.
- Use strict TypeScript with `noUncheckedIndexedAccess` and `noUnusedLocals`, plus the `@/*` to `src/*` path alias.
- Local npm development and preview are sufficient; remote hosting is optional and not a project requirement.

## Product Constraints

- The app is a 100% client-side static demo: no backend, API/network calls, database, auth, model inference, or persistence beyond the browser tab. Do not add `.env`, an API client, `api/`, or real PDF parsing.
- All demo behavior is scripted fixture data and deterministic state transitions. Never use `Math.random()` or `Date.now()`; timestamps use a fixed demo epoch.
- All simulated latency goes through `src/lib/runSequence.ts`; components must not call `setTimeout` or orchestrate sequences themselves. `reset()` must cancel in-flight work.
- Use one Zustand store. Every state mutation writes an audit event; proposal behavior is represented by declarative `effects[]`, not proposal-specific handlers.
- Use hash routing for `/intake`, `/boardroom`, `/hub`, `/agents`, and `/governance`; seed routes are `#/seed/:chapter`.
- Keep status colors reserved for KPI status, use SAR currency with specific non-round fixture figures, and keep the product light-mode and desktop-first. Do not add free-text chat.

## Verification

- After WP-01 exists, run `npm run lint` and `npm run typecheck`; run `npm run build` for production verification and `npm run preview` to inspect the static build.
- Before completion, verify the relevant WP acceptance criteria. For timing/audit changes, confirm `setTimeout` exists only in `src/lib/runSequence.ts` and that reset/replay remains deterministic.

## GitHub Automation

- `.github/workflows/opencode.yml` is manually triggered by an issue or pull-request comment containing `/oc` or `/opencode`; it is not a normal build/test CI workflow.
