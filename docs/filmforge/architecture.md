# FilmForge architecture — decision record for future implementation

**Status:** proposed extensions, not deployed. **Existing runtime** = Jellyfish application; **future integration** = FilmForge additions.

## Source-of-truth ownership

- **Current Jellyfish**: `Project / Chapter / Sequence` (story scene), existing SceneVersion/ProductionUnit/SceneTakeRecord; `TaskService` is only writer for `Task` lifecycle, `TaskWorker` executes jobs, `FileItem` is immutable file identity. Consult `../development/reference/data-model.md` and `../development/architecture/task-execution.md`.
- **FilmForge planned**: `Series / Season / Episode` hierarchical identity, `StoryCanon` / `StoryEvent`, `AssetRevision`, `FilmShotPlan`, `ShotTakeLink`, `ReviewDecision`. Mapping to existing entities **must be validated in M0** before creating new tables. Do not introduce duplicate truth for `Take` / `Cut` or rewrite existing scene APIs.
- **Render backends**: external video API, ComfyUI service, Blender external executable. Their generated files are content-addressed or checksum-verified and recorded through existing file ownership model.

## Logical flow

1. Project/Series idea → screenplay/episode → approved story canon.
2. Approved canon + scene state + pinned asset revision → shot plan → storyboard approval.
3. Provider capability preflight and budget approval → TaskService submission → external worker (initial single coordinator).
4. Remote ID/result → immutable asset/media record → Take → QC evidence → human selection.
5. Selected Take → versioned Cut/Timeline → FFmpeg export / later OTIO interchange.

## Rules that must survive upstream updates

- `TaskService` is single writer of task status. Do not add a second job state machine by accident.
- One orchestrator process only until M5 architecture change; do not run several copies against the same DB.
- Existing worker resumes remote tasks **with recorded remote ID**; submit-time timeout without ID is a separate ambiguity and MUST NOT be retried blindly.
- Remote provider completed does not imply local file saved, validated, approved or delivered.
- Story time differs from commit time and generation time. Re-tcons preserve past snapshots.
- Scene, Sequence, Shot, ProductionUnit and Take are distinct identities. Keep original Jellyfish labels until approved mapping.
- Store files in object storage; keep model keys, token, signed URL out of public task DTO/log.

## Decision gates

| ADR | Decision | Current verdict |
|---|---|---|
| FF-001 | Fork Jellyfish over Toonflow/greenfield for M0 | Conditional, Go/No-Go after measured bootstrap |
| FF-002 | Modular monolith over microservices until measured need | Accepted planning principle |
| FF-003 | Existing DB/TaskService over replacing with Redis/Celery on M0 | Accepted planning principle |
| FF-004 | Blender/rig-first Xianxia; AI video as optional shot/VFX engine | Product strategy, evaluate in M3 |
| FF-005 | Main-only development and local Markdown tracker | User-directed; compensate with CI and evidence |

ADR history must live under `docs/development/adr/` if/when the decision is implemented; do not overwrite existing ADR numbers. This planning table is not a substitute for accepted ADRs.

## Explicit alternatives

**Toonflow foundation:** preferable if UI/3D previs is highest priority, but Vue/Bun integration into React/FastAPI is expensive. Test with a bounded spike if Jellyfish M0 fails.  
**OpenMontage/NodeTool:** useful architectural references; AGPL license warrants caution before copying code.  
**All-new app:** fallback only if dominant existing workflows must be replaced; demonstrate cost of adapting before rewriting.
