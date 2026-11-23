# 04 — Map upstream film domain and duplication hazards

Status: ready-for-agent
Progress: done
Type: task
Phase: M0
Priority: P0
Blocked by: 01
Owner: unassigned
Target: main

## Outcome
Inspect Project/Chapter/Sequence/production unit/take/cut and existing user-visible flows.

## Acceptance criteria
- [x] Entity map and migration touchpoints reviewed; no duplicate Shot or Cut table proposed without need.
- [x] Existing Jellyfish behavior and ownership rules are preserved; no secrets or rights violations.
- [x] Reviewer has linked commit SHA, exact verification output and any limitations below.

## Implementation approach
1. Read `AGENTS.md` and relevant source, tests, ADRs. Document unknowns before writing code.
2. Write a failing behavior/contract test for logic changes; implement the smallest vertical slice.
3. Run focused tests, impacted suites, style/type checks; review diff.
4. Commit on `main` with repository subject convention and record evidence in `## Comments`.

## Likely files / boundaries
- `backend/app/models/directing.py`
- `docs/development/reference/data-model.md`

## Verification
- [x] Focused test(s) and command recorded; for docs-only task use source/link/semantic review.
- [ ] Backend change: `cd backend && uv run pytest -q` (or scoped tests), `uv run pylint app`.
- [ ] Frontend change: `pnpm --dir front run typecheck`, `pnpm --dir front run build`.
- [ ] API contract change: OpenAPI client refreshed from current running backend.
- [ ] If remote paid provider: cost cap + test credential verified outside Git.

## Comments
- 2026-11-23 — Planned from FilmForge roadmap; **not started**. No test or build result claimed.
- 2026-11-23 — **M0 Task 04 entity/migration audit completed** against source at `48abb265849095b47f36a149aebb693cb5d7fa80` and `docs/development/reference/data-model.md` / `docs/development/architecture/directing-foundation.md`. No new Shot, Take, Cut, scene-version or task state tables added; no migration executed on existing data.
  - **Persisted chain in source:** `backend/app/models/studio_projects.py`: `Project (projects)` -> `Chapter (chapters)` by project_id. `backend/app/models/directing.py`: `Sequence (directing_sequences)` by chapter_id; `DirectingRevision (directing_revisions)` owns immutable/confirmed typed payloads for design, plan, prompt, review, cut, etc; `Take (directing_takes)` references the unique `TaskOutput(task_id,ordinal)`, prompt/plan revisions, unit identity, video FileItem; `CutTakeReference (directing_cut_take_references)` indexes cut-to-take identity; `ActiveCut (directing_active_cuts)` is selected confirmed revision; `CutFrame (directing_cut_frames)` references cut revision/take/file; `SeamReview` tracks human review. `backend/app/models/task.py` TaskInput/TaskOutput preserve execution and file identities. `FileUsage` protects editorial assets, no automatic adoption of Take into Cut.
  - **Shot vs physical scene:** `directing_sequences` is a story sequence, **not** `scenes` location/setting asset. Organized shots and production units are typed revision payload identities (`backend/app/core/contracts/directing/scene_storyboard.py`), not a reason to recreate legacy `Shot`/ShotDetail state tables. Existing scene assets, generated canvas and project/chapter history remain separate domains.
  - **Migration touchpoints:** `backend/alembic/versions/68e14fd0c209_initial_schema.py` and `174afba8895d_provider_configuration.py`, initial fresh-db head verified by Task 01. SQLAlchemy `Base.metadata.tables` introspection on Python 3.12 found **56 currently mapped tables**, including `projects`, `chapters`, `directing_sequences`, `directing_revisions`, `directing_takes`, `directing_active_cuts`, `generation_canvases`, `task_inputs`, `task_outputs`, `tasks`. No table for `SceneVersionRecord`, `SceneTakeRecord`, `SceneDeliveryRecord` was registered.
  - **Important documentation/implementation discrepancy:** `docs/development/reference/data-model.md` calls `Project -> Chapter -> Sequence -> SceneVersionRecord -> production unit -> Task -> SceneTakeRecord -> timeline / delivery` the “current main path”, but the checked `backend/app/models` has no `SceneVersionRecord`, `SceneTakeRecord` or `SceneDeliveryRecord` models, and the metadata exposes no corresponding tables. Do **not** assume the newer version/take/delivery workflow is implemented merely from this document; distinguish currently implemented legacy directing revision/Take/Cut from proposed/currently undocumented application code before designing G0/G2. Resolve doc-vs-code truth in a separate implementation/ADR decision rather than inventing duplicate tables.
  - **Verification:** `cd backend && uv run --frozen pytest -q tests/directing/test_scene_storyboard.py tests/directing/test_division_versions.py --tb=short` => exit `0`, **11 passed in 28.89s**. SQLAlchemy `Base.metadata.tables` introspection succeeded on fresh installed dependencies and did not mutate database. `git` checkout was clean on `main` at audit source revision; no app code touched. The broader Task 02 suite is tracked separately.
  - **Conclusion:** duplication hazards mapped; schema/API additions require new explicit spec, MySQL migration review and tests, preserving project/sequence/take/cut/file referential ownership. Linked source revision `48abb265849095b47f36a149aebb693cb5d7fa80`; this docs-only audit commit SHA is recorded in GitHub and will be appended in a follow-up note.
- Audit evidence commit on `main`: `a250f7dd43e6a4e3914e928e9ac0505578e3a6e3` (`[docs] đối chiếu M0-04 entity map và sai lệch tài liệu schema`); focused 11/11 passed and mapped schema discrepancy above.
