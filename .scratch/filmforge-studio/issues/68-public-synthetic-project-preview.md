# 68 — Public synthetic project preview (S02)

Status: ready-for-agent
Progress: not-started
Type: task
Phase: C1 / Development fixture
Priority: P1
Blocked by: 41
Owner: unassigned
Target: main

## Goal
Explicit read-only DEMO of a synthetic project, scene/shot, asset and candidate Take. No production data, provider calls, admin exposure, real project mutation or export feature.

## Acceptance criteria
- [ ] Populated synthetic project/scene/asset/Take with stable IDs and visible DEMO label on desktop/mobile; no owner data.
- [ ] Fixture-only isolated route or bundled data; no requests to real admin/provider APIs; protected public API remains 403. Original/generated media only.
- [ ] RED/GREEN frontend test covers label, populated relationships, missing/error handling and no real admin/provider requests. Run frontend lint/unit/typecheck/build; inspect exact scripts first.
- [ ] Verify approved public preview on desktop/mobile, screenshots, no uncaught page errors or horizontal overflow, HTTP/content-type and deployed artifact identity. Keep partial if deploy unavailable. No real generation, schema, timeline/export or owner gate changes.

## Work plan
Inspect App.tsx, ProjectLobby, project entry/directing/canvas and existing fixture/browser tests. Select smallest explicit read-only route, separate from normal data path. Test first, implement, regression, review, approved preview verification, audit/handoff, commit/push. No provider spend.

## Comments
- 2026-11-24 — scoped S02 following #41 audit per session-plan.md; safe synthetic demo only.
