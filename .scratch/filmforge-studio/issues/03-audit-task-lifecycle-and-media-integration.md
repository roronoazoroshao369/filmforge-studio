# 03 — Audit task lifecycle and media integration

Status: ready-for-agent
Progress: done
Type: task
Phase: M0
Priority: P0
Blocked by: 01
Owner: unassigned
Target: main

## Outcome
Trace TaskService writer, provider submit/poll, file outputs and video take flow using fixture.

## Acceptance criteria
- [x] Contract map includes restart unknown ID limitation, current provider keys and file ownership.
- [x] Existing Jellyfish behavior and ownership rules are preserved; no secrets or rights violations.
- [x] Reviewer has linked commit SHA, exact verification output and any limitations below.

## Implementation approach
1. Read `AGENTS.md` and relevant source, tests, ADRs. Document unknowns before writing code.
2. Write a failing behavior/contract test for logic changes; implement the smallest vertical slice.
3. Run focused tests, impacted suites, style/type checks; review diff.
4. Commit on `main` with repository subject convention and record evidence in `## Comments`.

## Likely files / boundaries
- `backend/app/services/task_service.py`
- `backend/app/task_worker.py`
- `backend/app/core/integrations/`

## Verification
- [x] Focused test(s) and command recorded; for docs-only task use source/link/semantic review.
- [ ] Backend change: `cd backend && uv run pytest -q` (or scoped tests), `uv run pylint app`.
- [ ] Frontend change: `pnpm --dir front run typecheck`, `pnpm --dir front run build`.
- [ ] API contract change: OpenAPI client refreshed from current running backend.
- [ ] If remote paid provider: cost cap + test credential verified outside Git.

## Comments
- 2026-11-23 — Planned from FilmForge roadmap; **not started**. No test or build result claimed.
- 2026-11-23 — **M0 Task 03 source/fixture audit completed**, checked against current main source at `4333161f2628c5c9a4a319e11ca8371ce0eff10a`; upstream reference: `docs/development/architecture/task-execution.md`. No media submit, no paid provider request, no schema or production data change.
  - **Current state authority:** `backend/app/models/task.py` `tasks.status` is `queued -> running -> succeeded|failed|cancelled`; `stage` / `remote_status` are observations, not separate terminal authorities. `backend/app/services/task_service.py` is sole Task lifecycle writer: `submit` snapshots and protects input files, `claim` atomically acquires work, `record_submission` persists immutable nonempty remote ID, `record_poll_result` tracks GET observations, `add_output` protects immutable ordinal/file identities, `finish` atomically publishes business DB facts and terminal state, cancel wins.
  - **Submission and restart:** `backend/app/services/generation/submission/submitter.py` freezes model/provider/base URL/credential in private `execution_config` when accepting the task. `backend/app/task_worker.py` calls `MediaProvider.submit` exactly once (POST); `backend/app/core/integrations/media_provider.py` does not retry create; `TaskService.record_submission` commits returned remote ID before polling. On restart `interrupt_previous_workers` preserves `running` remote tasks *with* persisted ID and re-polls the SAME ID; running direct tasks or remote tasks without ID are failed as interrupted, not auto-requeued. A timed-out POST or worker loss **between external acceptance and local ID commit can leave an orphaned/unknown remote job**. This architecture has no automatic reconciliation or exactly-once guarantee. Do not auto-submit again or paid-fallback; manual provider reconciliation is needed before any explicit retry.
  - **Current media ProviderKey:** `backend/app/core/contracts/provider.py`: `openai | volcengine | vidu | kling`. The `provider_registry` supports metadata but the media adapter is NOT an arbitrary dynamic multi-provider router. Do not claim planned OmniRoute/free-first routing is shipped or infer video support from text model names.
  - **Output ownership/Take/Cut:** `backend/app/services/generation/media_execution.py` downloads provider output, validates content type, writes deterministic storage key `generated/{task_id}/{ordinal}`, creates `FileItem` plus `TaskOutput` after storage, and `deliver_media` runs within `TaskService.finish`. `task_inputs` and `task_outputs` reference `files` with delete restrictions. For directing video, `DirectingStore.register_take` (`backend/app/services/directing/store.py`) registers one unreviewed candidate `directing_takes` per unique `(task_id, output_ordinal)`, validates project/prompt and file type, writes `FileUsage`, **does not auto-adopt into Cut**. Confirmed versioned `directing_revisions`, `directing_cut_take_references` and `directing_cut_frames` own editorial adoption. No new Shot/Cut/Task state table warranted by this audit.
  - **Security/consent review for G0:** frozen `execution_config` includes supplier credentials in the DB; verify encryption/access/log retention/redaction and credential-rotation/revocation policy before adding gateway routing. Do not expose private frozen config through DTO/logs; preserve signed URL handling, permission checks, provider legal quota, no silent paid fallback, no autonomous retry after ambiguous POST.
  - **Verification (isolated fixture, no remote spend):** `cd backend && uv run --frozen pytest -q tests/services/test_media_provider.py tests/services/test_task_worker.py tests/services/test_task_service.py --tb=short` => exit `0`, **29 passed in 3.32s**. Focused fixtures cover create-failure no POST retry/missing ID rejection, one GET per poll, restart reusing original ID, cancellation/terminal invariants and atomic publication. `uv run --frozen pylint app` => exit `0`, rating 10.00/10 (recorded in M0-01). Full suite baseline with unrelated failures is tracked under M0-02, not misrepresented here.
  - **Status:** source audit/contract map only; no implementation or fresh provider API capability tests. Linked audited source revision: `4333161f2628c5c9a4a319e11ca8371ce0eff10a`; exact audit commit to be recorded in next tracker note.
- Audit evidence commit on `main`: `48abb265849095b47f36a149aebb693cb5d7fa80` (`[docs] kiểm chứng M0-03 vòng đời task và ranh giới media Take/Cut`); verified focused 29/29 passed as recorded above.
