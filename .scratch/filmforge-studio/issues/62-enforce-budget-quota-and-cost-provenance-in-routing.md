# 62 — Enforce budget quota and cost provenance in routing

Status: needs-triage
Progress: not-started
Type: task
Phase: G2
Priority: P1
Blocked by: 15,57,59
Owner: unassigned
Target: main

## Goal / Deliverable
Add explicit owner-approved per-request/month caps, estimated vs invoiced charges, rate-limit/credit status, no automatic free→paid switch. Reuse cost ledger from creator ticket 49 when available.

## Acceptance criteria
- [ ] Unit tests for free 429 no paid fallback, unknown price consent gate, credit expiry, cancelled job possibly billed, no unbounded retry.
- [ ] Route and task provenance remain reproducible, rights-safe and creator-only.
- [ ] Security, provider ToS, real-vs-mock and budget limits disclosed; no unapproved paid request.
- [ ] Test/verification outputs or honest blocker documented, plus commit SHA and reviewer decision.

## Technical reference / likely files
- `backend/app/services/llm/`
- `backend/app/services/generation/`
- `backend/tests/`

## Execution plan
1. Read `AGENTS.md`, `CONSTRAINTS.md`, [router design](../../../docs/filmforge/provider-routing-architecture.md), [implementation plan](../../../docs/filmforge/provider-implementation-plan.md), and source/test code listed above.
2. Verify `Blocked by` and status; map exact existing source functions before choosing new identifiers. Write the precise task-local spec and test.
3. **RED**: create focused failing test for the specific accept criterion; execute and capture failure.
4. **GREEN**: smallest code change; run same focused test and negative route case. Do not turn off checks.
5. Run impacted pytest/pylint and frontend typecheck/build if applicable, inspect diff and secret leaks, commit on `main` with `[feat]`/`[test]`/`[docs]` subject.
6. Put exact commit and verification commands in Comments; set `Progress: done` only after evidence. External real requests need owner approval and max spend in advance.

## Critical failure modes
- Unknown or non-commercial "free" tier MUST NOT be chosen for creator monetization.
- Asynchronous media creation with unknown provider state MUST NOT auto-retry on another route.
- Polling/outputs must remain bound to the same actual provider/gateway as the accepted job.
- No key/token/signed URL in public logs or UI; privacy scope explicitly checked.

## Comments
- 2026-11-23 — Added for **Creator-First multi-provider API roadmap**. OmniRoute is a candidate gateway, not a committed dependency. **No code implemented or real provider test claimed**.
