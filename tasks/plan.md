# Implementation Plan — FilmForge Studio

**Source of truth for stage gates:** [Final roadmap](../docs/filmforge/roadmap.md).  
**Spec/handoff:** [Master handoff](../docs/filmforge/master-handoff.md).  
**Task tracker:** [Local tracker](../.scratch/filmforge-studio/spec.md), individual tasks in `.scratch/filmforge-studio/issues/` per existing `docs/agents/issue-tracker.md`. No duplicated `tasks/todo.md` checklist.

## Architecture and dependency order

Jellyfish main baseline → domain/entity mapping → canonical world/asset state → shot selection/approvals → provider and task safety → 60–90s film → Blender/rig reuse → cross-episode state → multi-episode throughput → cinematic editorial.

All planned capabilities are **pending**, not shipped. Each task is a vertical slice and lands as an independently reviewable commit on main; dependency IDs appear in its ticket. The individual file/scope suggestions are hypotheses until M0 mapping.

## Roadmap task index

| Phase | IDs | Checkpoint |
|---|---|---|
| M0 foundation | 01–05 | Reproducible backend/frontend/worker baseline, GO/NO-GO |
| M1 canon/assets | 06–11 | Episode state, flashback, immutable pinned asset revision |
| M2 film cut | 12–18 | 60–90 s approved cut, safe render, reshoot one shot |
| M3 Blender | 19–23 | 3–5 min shot sequence reusing one rig |
| M4 continuity | 24–27 | Two episodes, state/asset continuity benchmark |
| M5 scale | 28–31 | 3–10 episodes, backup, worker go/no-go |
| M6 feature readiness | 32–35 | OTIO + color/audio/VFX conform and rights gate |

## Checkpoint policy

Stop after 2–3 tasks to run affected tests + review diffs; after every milestone run demo and capture evidence. M0 blocker ⇒ no M1. Provider capability gating ⇒ before paid smoke. Character rigs and file provenance ⇒ before continuous episode scale. No multi-worker until testable lease/reconciliation design.

## Work sequence

- Select lowest-number ticket with `Progress: not-started` and `Status: ready-for-agent` whose dependencies are done; triage others before assigning.
- Record current baseline and implementation plan in ticket Comments.
- Implement test-first under local conventions.
- Verify and record SHA/test commands/evidence.
- Update `Progress` of that ticket; preserve its triage `Status`. Repeat only on explicit subsequent work authorization.

## No hidden assumptions

Unknowns remain: GPU/OS, API entitlements, target animation aesthetic (2D, 3D, hybrid), budget per approved minute, sound/voice licensing, animation team capacity. Defaults favor 3D rig-first pilot and **no paid requests** until confirmed.
