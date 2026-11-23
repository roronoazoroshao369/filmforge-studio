# 05 — Record foundation GO / NO-GO ADR

Status: ready-for-human
Progress: not-started
Type: task
Phase: M0
Priority: P0
Blocked by: 02,03,04
Owner: unassigned
Target: main

## Outcome
Decide Jellyfish vs Toonflow bounded spike vs domain extraction from measured results.

## Acceptance criteria
- [ ] Signed decision, blockers and rollback path; M1 starts only on GO.
- [ ] Existing Jellyfish behavior and ownership rules are preserved; no secrets or rights violations.
- [ ] Reviewer has linked commit SHA, exact verification output and any limitations below.

## Implementation approach
1. Read `AGENTS.md` and relevant source, tests, ADRs. Document unknowns before writing code.
2. Write a failing behavior/contract test for logic changes; implement the smallest vertical slice.
3. Run focused tests, impacted suites, style/type checks; review diff.
4. Commit on `main` with repository subject convention and record evidence in `## Comments`.

## Likely files / boundaries
- `docs/development/adr/`
- `docs/filmforge/evidence/`

## Verification
- [ ] Focused test(s) and command recorded; for docs-only task use source/link/semantic review.
- [ ] Backend change: `cd backend && uv run pytest -q` (or scoped tests), `uv run pylint app`.
- [ ] Frontend change: `pnpm --dir front run typecheck`, `pnpm --dir front run build`.
- [ ] API contract change: OpenAPI client refreshed from current running backend.
- [ ] If remote paid provider: cost cap + test credential verified outside Git.

## Comments
- 2026-11-23 — Planned from FilmForge roadmap; **not started**. No test or build result claimed.
- 2026-11-23 — **Independent pre-decision technical QA only; NOT owner GO/NO-GO or an approved ADR.** Workspace `/home/devops/vibe/filmforge-studio` on clean `main` at `3a43b6f162746434938e2517509c60e957c3eec8` (matching `origin/main` at verification). This session reran `cd backend && $HOME/.local/bin/uv run --frozen pytest -q tests/services/test_text_gateway_contract.py tests/services/test_media_provider.py tests/services/test_task_worker.py tests/services/test_task_service.py tests/services/test_task_submission.py tests/services/test_media_execution_config.py tests/core/integrations/test_model_catalog.py --tb=short` => **exit 0, 68 passed in 10.41s**; `cd backend && $HOME/.local/bin/uv run --frozen pylint app` => **exit 0, 10.00/10**. HTTP/provider interactions in these tests are **MOCK ONLY**; no external requests, owner IP transfers or spend.
  - Post-fix **full backend run is prior-session evidence, not a fresh run here**: verified existing local `backend/.pytest_cache/filmforge-m0-02-full-20261123.log` ends `1485 passed, 62 skipped, 1 warning in 1372.59s`, with exit 0 recorded in Task 02. Previous frontend test/lint/typecheck/build evidence likewise remains in Task 02; not rerun in this review. The sole warning concerns Alembic legacy `path_separator` handling. Recent source commit `e9da7a65917f692421389f3eeb8ad68379b90d6b` changes only test fixtures for S3 public URL metadata; `3a43b6f1` changes tracker evidence only.
  - **Owner decision still required**: determine whether the foundation is GO for controlled local work or NO-GO; sign the ADR including rollback scope. Suggested rollback *for a future code-only change* is a reviewed `git revert` against a known-good SHA after verifying backups; database migrations, stored media and production data need a separately approved backup/restore procedure, never `git reset --hard`, volume deletion or blind rollback. Do not interpret this evidence as provider commercial/privacy approval, encrypted-at-rest credentials, CI on direct `main`, production readiness, or permission to activate M1/G1. Keep `Status: ready-for-human`, `Progress: not-started`.
