# 06 — Specify series-season-episode mapping

Status: needs-triage
Progress: not-started
Type: task
Phase: M1
Priority: P1
Blocked by: 05
Owner: unassigned
Target: main

## Outcome
Design hierarchy and unique identity mapping into existing Project/Chapter/Sequence without loss.

## Acceptance criteria
- [ ] API contracts and additive migration plan with backward compatibility; no premature code.
- [ ] Existing Jellyfish behavior and ownership rules are preserved; no secrets or rights violations.
- [ ] Reviewer has linked commit SHA, exact verification output and any limitations below.

## Implementation approach
1. Read `AGENTS.md` and relevant source, tests, ADRs. Document unknowns before writing code.
2. Write a failing behavior/contract test for logic changes; implement the smallest vertical slice.
3. Run focused tests, impacted suites, style/type checks; review diff.
4. Commit on `main` with repository subject convention and record evidence in `## Comments`.

## Likely files / boundaries
- `backend/app/core/contracts/`
- `backend/app/models/`
- `docs/development/design/`

## Verification
- [ ] Focused test(s) and command recorded; for docs-only task use source/link/semantic review.
- [ ] Backend change: `cd backend && uv run pytest -q` (or scoped tests), `uv run pylint app`.
- [ ] Frontend change: `pnpm --dir front run typecheck`, `pnpm --dir front run build`.
- [ ] API contract change: OpenAPI client refreshed from current running backend.
- [ ] If remote paid provider: cost cap + test credential verified outside Git.

## Comments
- 2026-11-23 — Planned from FilmForge roadmap; **not started**. No test or build result claimed.
