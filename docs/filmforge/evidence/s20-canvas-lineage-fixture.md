# S20 — Current-workbench video candidate lineage (test-only)

2026-11-25 (Asia/Ho_Chi_Minh). Baseline 89b31da5c324b74ca58e566f00aa88efc5699364, clean main = origin/main = remote. Ticket #42 independent evidence only; #41 done, original export acceptance unchecked, status needs-triage/in-progress and dependency unchanged. No application/API/schema/dependency change.

## Source map and boundary

- SceneCanvasService._scene scopes project/chapter/sequence; create_canvas fixes confirmed source excerpt. SceneStoryboardService.apply_storyboard saves reviewed document through CAS; this is not Cut adoption.
- CanvasStore.get enforces project scope/kind. GenerationCanvas has sequence_id and document/revision; CanvasRun and CanvasRunNode carry card, execution basis/hash and task identity.
- TaskService is the single writer. settlement.sync_task_fact creates CanvasResultSet on successful completion, uses TaskOutput ordinal and FileItem, records project-scoped canvas_history FileUsage (canvas:node:ordinal). CanvasCurrentOutput advances only when the current basis can run and matches. CanvasCurrentState.current_outputs re-evaluates freshness and file availability.
- CanvasHistoricalContent.prepare_content returns content.video with origin; saving content is not editorial approval. generation/media_execution.deliver_media branches canvas_node to canvas_history and directing_unit to DirectingStore.register_take (confirmed prompt revision and matching task.input_snapshot.prompt_revision_id). No legitimate current canvas-to-confirmed Take/Cut bridge established by inspected paths; do not invent prompt, Cut, or second persisted authority. Historical fixed-record routes are distinct, not all absent.
- Future editorial adoption requires explicit approval and pinned identities, source trim/range/timebase/timeline placement, CAS/history/review and audio/subtitle/export contracts. Current pointer is not approval.

## Proof

backend/tests/filmforge_canvas_lineage_fixture.py resolves project, sequence, canvas, card, run, node, task, result set, ordinal, file from existing records; validates current basis, available video, exact TaskOutput and canvas_history FileUsage; no write. backend/tests/test_filmforge_canvas_lineage.py uses real canvas ASGI precheck/run and TaskService claim/add_output/finish, isolated SQLite, mock storage, synthetic file metadata. Scene created using DirectingStore and attached to fixture canvas directly. No provider, worker delivery callback or real candidate video byte validation; delivery_status not independently verified. Corrupt records constructed only in disposable test DB.

12 cases: valid, rerun preserves old rows and historical content origin, foreign project, foreign scene, stale basis after CAS edit, missing pointer, missing ordinal, withdrawn file, non-video, foreign usage, wrong TaskOutput, wrong result card. Invalid cases assert exact error detail. Snapshots of 12 tables unchanged by resolver; no ORM writes. Historical DirectingRevision/Take/ActiveCut/CutTakeReference tables are empty in this fixture; separate S18 regression exercises populated history. Helper's extra checks are not a production security fix.

RED missing helper: 1 failed in 1.05s, exit 1. First implementation run: 1 failed in 1.30s (existing runtime fixture had scene kind but no actual sequence, corrected fixture rather than weaken scope). Initial GREEN 8 passed in 4.40s exit 0 (proc_13342174). Expanded 12 cases and aggregate regression 162 passed in 43.65s exit 0 (proc_6a83e43d; log .git/filmforge-s01/s20-regression.log), no reported skips; SQLite scope, MySQL excluded. Root scripts 20/20, locale resource/interpolation tests 21/21, both exit 0, no skip. Historical S18 picture fixture reran in aggregate; no newly collected output SHA. No app/pylint/full backend/frontend build or browser rerun for test-only scope.

## Reproduce from repository root

Verify cache, no real .env, and isolated fixture configuration first. Python 3.12.16, uv 0.13.9; cached tools from S01.

```sh
ROOT="$PWD"
env -i HOME="$ROOT/.git/filmforge-s01/test-home" \
 PATH="$ROOT/.git/filmforge-s01/ffmpeg-n8.1-latest-linux64-gpl-8.1/bin:/usr/bin:/bin" \
 UV_CACHE_DIR="$ROOT/.git/filmforge-s01/cache" \
 UV_PYTHON_INSTALL_DIR="$ROOT/.git/filmforge-s01/python" \
 UV_PROJECT_ENVIRONMENT="$ROOT/.git/filmforge-s01/venv" \
 DATABASE_URL="sqlite+aiosqlite:///$ROOT/.git/filmforge-s01/test.sqlite" \
 AWS_EC2_METADATA_DISABLED=true PYTHONDONTWRITEBYTECODE=1 \
 "$ROOT/.git/filmforge-s01/uv-x86_64-unknown-linux-gnu/uv" run \
 --project "$ROOT/backend" --locked --no-sync --directory "$ROOT/backend" \
 pytest -q -ra -x tests/test_filmforge_canvas_lineage.py tests/test_generation_canvas_output_context.py \
 tests/test_generation_canvas_saved_media.py tests/test_generation_canvas_historical_content.py \
 tests/test_generation_canvas_retirement.py tests/directing/test_scene_canvas_summaries.py \
 tests/directing/test_storyboard_media.py tests/directing/test_store.py tests/directing/test_media.py \
 tests/directing/test_contracts.py tests/directing/test_retired_routes.py \
 tests/directing/test_picture_master_fixture.py tests/services/test_task_service.py -k "not mysql"
node --test scripts/*.test.mjs
(cd front && node --test tests/localeResources.test.mjs tests/vietnameseLocale.test.mjs)
```

Public preview smoke: /demo, /demo-media/fixture.mp4, /demo-media/reference.png, /api/v1/studio/projects all HTTP 530 text/plain; 403 not verified, cause/origin/deploy rights unverified. No deployment or DNS/ingress/tunnel change. #68/#69 remain in progress; no repeated Actions poll. No provider/private IP/production data/spend or owner gate change. Rollback by reviewed revert of exact commit, preserving unrelated work. Find delivery SHA via git log -1 -- docs/filmforge/evidence/s20-canvas-lineage-fixture.md.
