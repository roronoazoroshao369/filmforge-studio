# 12 — Approve storyboard shot plan as typed artifact

Status: needs-triage
Progress: not-started
Type: task
Phase: M2
Priority: P1
Blocked by: 04,09
Owner: unassigned
Target: main

## Outcome
Define FilmShotPlan linked to existing production unit and render inputs, approval gate before generation.

## Acceptance criteria
- [ ] Unapproved plans cannot schedule a paid render; approved versions keep source lineage.
- [ ] Existing Jellyfish behavior and ownership rules are preserved; no secrets or rights violations.
- [ ] Reviewer has linked commit SHA, exact verification output and any limitations below.

## Implementation approach
1. Read `AGENTS.md` and relevant source, tests, ADRs. Document unknowns before writing code.
2. Write a failing behavior/contract test for logic changes; implement the smallest vertical slice.
3. Run focused tests, impacted suites, style/type checks; review diff.
4. Commit on `main` with repository subject convention and record evidence in `## Comments`.

## Likely files / boundaries
- `backend/app/core/contracts/directing/`
- `backend/app/services/directing/`

## Verification
- [ ] Focused test(s) and command recorded; for docs-only task use source/link/semantic review.
- [ ] Backend change: `cd backend && uv run pytest -q` (or scoped tests), `uv run pylint app`.
- [ ] Frontend change: `pnpm --dir front run typecheck`, `pnpm --dir front run build`.
- [ ] API contract change: OpenAPI client refreshed from current running backend.
- [ ] If remote paid provider: cost cap + test credential verified outside Git.

## Comments
- 2026-11-23 — Planned from FilmForge roadmap; **not started**. No test or build result claimed.
