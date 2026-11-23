# 54 — Audit existing provider and task boundaries

Status: ready-for-agent
Progress: done
Type: task
Phase: G0
Priority: P0
Blocked by: 03,04
Owner: unassigned
Target: main

## Goal / Deliverable
Produce a source-and-test map for ProviderRegistry, model catalog, provider config resolution, TaskService, media submit/poll, export and sensitive snapshots. Record files/actual behavior before design changes.

## Acceptance criteria
- [x] Source-level contract matrix and current test command output (or explicit inability); duplicate abstractions identified; current single-worker and retry boundaries documented.
- [x] Route and task provenance remain reproducible, rights-safe and creator-only.
- [x] Security, provider ToS, real-vs-mock and budget limits disclosed; no unapproved paid request.
- [x] Test/verification outputs or honest blocker documented, plus commit SHA and reviewer decision.

## Technical reference / likely files
- `backend/app/core/contracts/provider.py`
- `backend/app/services/llm/provider_registry.py`
- `backend/app/core/integrations/media_provider.py`
- `docs/development/architecture/task-execution.md`

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
- 2026-11-23 — G0 source audit completed against `main` @ `d1fad0cb6142bc98531224d823994f233ae096b0`. Authoritative, 10-row source/contract/extension matrix and risk review in `docs/filmforge/g0-provider-task-source-audit-2026-11-23.md`. Identified five registered provider types (one text-only), four native media adapter keys, dynamic text-provider config versus frozen media config, non-authoritative name-based discovery, single TaskService worker, ambiguous POST->ID persistence gap, existing output/Take/Cut ownership and secret-at-rest audit gap. No new provider request and no behavior change.
  - Direct FilmForgeStudio MCP execution: `cd backend && uv sync --group dev --frozen` exit 0; `uv run --frozen pytest -q tests/services/test_media_provider.py tests/services/test_task_worker.py tests/services/test_task_service.py tests/services/test_task_submission.py tests/services/test_media_execution_config.py tests/core/integrations/test_model_catalog.py --tb=short` exit 0, **65 passed in 10.61s**; `uv run --frozen pylint app` exit 0, **10.00/10**. Earlier first attempt named two nonexistent test files and failed; corrected explicit suite above. Test evidence is fixture-only, never a real gateway test. Reviewer decision: audit evidence accepted; G1 still gated by Task55 owner signoff.
