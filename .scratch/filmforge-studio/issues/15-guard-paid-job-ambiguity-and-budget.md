# 15 — Guard paid job ambiguity and budget

Status: needs-triage
Progress: not-started
Type: task
Phase: G2 (promoted from M2)
Priority: P0
Blocked by: 03,14
Owner: unassigned
Target: main

## Outcome
Add submission intent/unknown outcome rule, reconciliation policy and per-project budget checks while keeping TaskService writer.

## Acceptance criteria
- [ ] Timeout after remote create cannot auto-resubmit; state and billing evidence covered by tests.
- [ ] Existing Jellyfish behavior and ownership rules are preserved; no secrets or rights violations.
- [ ] Reviewer has linked commit SHA, exact verification output and any limitations below.

## Implementation approach
1. Read `AGENTS.md` and relevant source, tests, ADRs. Document unknowns before writing code.
2. Write a failing behavior/contract test for logic changes; implement the smallest vertical slice.
3. Run focused tests, impacted suites, style/type checks; review diff.
4. Commit on `main` with repository subject convention and record evidence in `## Comments`.

## Likely files / boundaries
- `backend/app/services/task_service.py`
- `backend/app/task_worker.py`

## Verification
- [ ] Focused test(s) and command recorded; for docs-only task use source/link/semantic review.
- [ ] Backend change: `cd backend && uv run pytest -q` (or scoped tests), `uv run pylint app`.
- [ ] Frontend change: `pnpm --dir front run typecheck`, `pnpm --dir front run build`.
- [ ] API contract change: OpenAPI client refreshed from current running backend.
- [ ] If remote paid provider: cost cap + test credential verified outside Git.

## Comments
- 2026-11-23 — Planned from FilmForge roadmap; **not started**. No test or build result claimed.

- 2026-11-23 — **Scheduling adjustment:** brought this existing paid submission/idempotency task forward to G2; gateway-specific sticky polling is task 61, not a duplicate replacement. Source behavior unchanged; test implementation pending.
