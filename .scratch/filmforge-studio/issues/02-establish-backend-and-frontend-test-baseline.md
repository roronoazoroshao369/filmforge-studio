# 02 — Establish backend and frontend test baseline

Status: ready-for-agent
Progress: done
Type: task
Phase: M0
Priority: P0
Blocked by: 01
Owner: unassigned
Target: main

## Outcome
Run upstream backend pytest/pylint, frontend typecheck/build and CI status; classify existing failures.

## Acceptance criteria
- [x] Exact commands, exit codes and top failure causes captured; no tests disabled.
- [x] Existing Jellyfish behavior and ownership rules are preserved; no secrets or rights violations.
- [x] Reviewer has linked commit SHA, exact verification output and any limitations below.

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
- [x] Focused test(s) and command recorded; for docs-only task use source/link/semantic review.
- [x] Backend change: `cd backend && uv run pytest -q` (or scoped tests), `uv run pylint app`.
- [x] Frontend change: `pnpm --dir front run typecheck`, `pnpm --dir front run build`.
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
- 2026-11-23 — **M0-02 reproducible baseline final evidence**. Source fix commit `4333161f2628c5c9a4a319e11ca8371ce0eff10a` already on `main`; this final commit additionally changes **only** R04 video test fixture argument `-copyts` and tracker notes.
  - **Backend full baseline BEFORE R04 fixture correction:** `cd backend && uv run --frozen pytest -q` => exit `1`, **1479 passed, 62 skipped, 3 failed, 1 warning in 1446.32s** (1544 total collected). Failed cases: `tests/test_dev.py::test_api_reload_with_open_event_stream_becomes_responsive` and both variants `tests/test_generation_canvas_post_video_checks.py::test_r04_sends_audio_free_video_and_validates_evidence_ranges` (`qwen3-vl-plus`, `qwen3.8-omni-flash`). No tests deselected, xfailed, or disabled by this work. One warning is Alembic missing explicit `path_separator`; not fatal.
  - **Failure 1 / environment:** Uvicorn WatchFiles failed to detect fixture edit while a streaming response remained open on shared host. On same code `WATCHFILES_FORCE_POLLING=true uv run --frozen pytest -q tests/test_dev.py::test_api_reload_with_open_event_stream_becomes_responsive --tb=short` => exit `0`, `1 passed in 7.45s`. Vite `dev` on same host also hit watcher `ENOSPC`; polling is a runner workaround, **not** an application-source fix or a full green suite claim.
  - **Failures 2–3 / deterministic fixture portability:** test's FFmpeg command synthesizes video with `setpts=PTS+0.2/TB` and asserts `video_range.start_ms == 200`, but FFmpeg `6.1.1` MP4 muxing produced packet min PTS `0` without `-copyts` (packet end `3200`). Independent `ffprobe`/source `_video_sequence` probe reproduced `(0,3200)`; `-copyts` preserves intended `(200,3200)` with 30 frames. Added `'-copyts'` to **only fixture creation command** in `backend/tests/test_generation_canvas_post_video_checks.py`; never modified production video timing or lowered assertions. **RED full suite** both failed; **GREEN focused** `cd backend && uv run --frozen pytest -q 'tests/test_generation_canvas_post_video_checks.py::test_r04_sends_audio_free_video_and_validates_evidence_ranges' --tb=short` => exit `0`, **2 passed in 12.05s**.
  - **Other backend checks:** `uv run --frozen python -m tests.preflight` and `--media` exit `0`; `uv run --frozen pylint app` exit `0`, score `10.00/10`. M0-03 media/task focused suite `29 passed`; M0-04 directing focused suite `11 passed`. Full 1544-case suite **not re-run** after fixture change/polling workaround; do not assert overall green.
  - **Frontend:** `pnpm --dir front run test:unit` FIRST exit `1` because Playwright Chromium headless shell v1248 absent (test fixture `reviewTemplate` undefined as consequence); `pnpm --dir front exec playwright install chromium` exit `0`; exact full frontend unit suite rerun exit `0` with compatible browser. `pnpm --dir front run lint:check` pre-fix exit `1` (type-only import line 7), post-fix exit `0` (`16` known baseline issues, `0` new); `pnpm --dir front run typecheck` exit `0`; `pnpm --dir front run build` exit `0` (3536 modules, CSS nesting/bundle warnings). Browser preview/Playwright smoke HTTP200 with React render, no JS page errors or API 4xx/5xx.
  - **CI coverage:** GitHub Actions `actions/runs?branch=main` => `total_count:0` and commit combined statuses empty on direct `main`; PR/merge_group-only workflow triggers do NOT check direct main commits. This is a governance gap to resolve without violating main-only or creating branches. No credentials/rights violations, provider spend, automatic publishing, force push, new branch or migration.
  - **Ticket completion means failures classified and the small fixture/import issues repaired, NOT a wholly green full backend suite.** Re-run `WATCHFILES_FORCE_POLLING=true uv run --frozen pytest -q` on controlled CI runner before declaring an all-green release.
