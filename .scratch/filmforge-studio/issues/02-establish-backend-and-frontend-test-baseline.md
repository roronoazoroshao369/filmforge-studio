# 02 — Establish backend and frontend test baseline

Status: ready-for-agent
Progress: in-progress
Type: task
Phase: M0
Priority: P0
Blocked by: 01
Owner: unassigned
Target: main

## Outcome
Run upstream backend pytest/pylint, frontend typecheck/build and CI status; classify existing failures.

## Acceptance criteria
- [ ] Exact commands, exit codes and top failure causes captured; no tests disabled.
- [ ] Existing Jellyfish behavior and ownership rules are preserved; no secrets or rights violations.
- [ ] Reviewer has linked commit SHA, exact verification output and any limitations below.

## Implementation approach
1. Read `AGENTS.md` and relevant source, tests, ADRs. Document unknowns before writing code.
2. Write a failing behavior/contract test for logic changes; implement the smallest vertical slice.
3. Run focused tests, impacted suites, style/type checks; review diff.
4. Commit on `main` with repository subject convention and record evidence in `## Comments`.

## Likely files / boundaries
- `backend/tests/`
- `front/tests/`
- `.github/workflows/`

## Verification
- [ ] Focused test(s) and command recorded; for docs-only task use source/link/semantic review.
- [ ] Backend change: `cd backend && uv run pytest -q` (or scoped tests), `uv run pylint app`.
- [ ] Frontend change: `pnpm --dir front run typecheck`, `pnpm --dir front run build`.
- [ ] API contract change: OpenAPI client refreshed from current running backend.
- [ ] If remote paid provider: cost cap + test credential verified outside Git.

## Comments
- 2026-11-23 — Planned from FilmForge roadmap; **not started**. No test or build result claimed.
- 2026-11-23 — **Started after Task 01 completed** at `6bedc0f7942235040b5cfb8ad48742d39d1ffec0`; scope = reproducible pytest/Pylint, frontend TypeScript/build/unit/lint and browser preflight, classify failures without skipping tests or changing lint thresholds.
  - Clean `main` checkout baseline at `a41f3e4a3b5c8a8a935601bfe4303897acd7b11e`; Python 3.12.3, Node 24.21.0, uv 0.11.16, pnpm 9.5.0. `uv sync --group dev --frozen`, `pnpm --dir front install --frozen-lockfile` exit 0.
  - PASS to date: backend `tests.preflight` and `--media`, `uv run --frozen pylint app` exit 0 (10.00/10); frontend `typecheck` and `build` exit 0. First `lint:check` exit 1 at `DashboardTab.tsx:7:1` `consistent-type-imports` (pre-existing on clean main).
  - First `pnpm --dir front run test:unit` exit 1 in visualReview tests. Isolated controlled fixture proves underlying **runner dependency error**: Playwright package demands `chromium_headless_shell-1248`, but host only has older browser revisions. Evidence shows `behavior.status=passed`, `evidence.status=failed`, `reviewTemplate=false` due executable missing. Installing the exact Playwright Chromium browser, then rerun full frontend unit tests before concluding any application regression.
  - `uv run --frozen pytest -q` still running; capture final exit code and test counts before closing task. No application source changed or tests disabled; baseline facts and upstream failures will be recorded here.
- 2026-11-23 — **First code fix, one-line import-only change**: `front/src/pages/aiStudio/project/ProjectWorkbench/tabs/DashboardTab.tsx:7` imported `useChapters` as runtime value although it is referenced only by TypeScript `ReturnType<typeof useChapters>`; switch to `import type`. No runtime logic, contract, provider behavior or tests changed.
  - **Lint RED (pre-fix):** `pnpm --dir front run lint:check` => exit `1`, `src/pages/aiStudio/project/ProjectWorkbench/tabs/DashboardTab.tsx:7:1 @typescript-eslint/consistent-type-imports`.
  - **GREEN (post-fix):** same `lint:check` => exit `0`, `PASS lint 存量基线：16 项已知问题，0 项新增`; `pnpm --dir front run typecheck` => exit `0`; `pnpm --dir front run build` => exit `0`, Vite `3536` modules, non-blocking CSS nesting / chunk-size warnings. `git diff --check` => exit `0`; diff limited to one import line.
  - Correct Playwright Chromium v1248 installed (`pnpm --dir front exec playwright install chromium` exit `0`); frontend unit tests re-running with matching browser, final counts not yet asserted. Backend full pytest still running at the time of this commit; no all-tests-pass assertion. Task remains `in-progress`.
