# 42 — Add portrait export profile with safe areas

Status: needs-triage
Progress: in-progress
Type: task
Phase: C1
Priority: P1
Blocked by: 41
Owner: unassigned
Target: main

## Goal / output
Bổ sung preset 9:16 (và tùy chọn 16:9) vào pipeline export sẵn có; giữ frame rate, timebase, media identity và caption safe zone.

## Acceptance criteria
- [ ] Xuất MP4 9:16 test từ fixture, ffprobe width/height/audio đúng, 16:9 cũ không regression.
- [ ] No selling the FilmForge product or client video services; work contributes to creator-owned original channel / IP.
- [ ] Rights, spend and personal data safeguards are recorded; no “done” without owner/evidence.

## Work plan
1. Read `AGENTS.md`, [creator roadmap](../../../docs/filmforge/roadmap.md) and the relevant source/previous ticket evidence.
2. Identify source of truth, user-visible vertical slice, compatibility limits and likely files.
3. For code behavior changes write a failing contract/regression test before implementation; for content experiment capture real artifacts before conclusions.
4. Run scoped checks, inspect diff, record output and owner creative approval (if required).
5. Commit on `main` with valid subject and append actual SHA/checks in `## Comments`. Set `Progress: done` only after evidence.

## Likely scope (audit before editing)
- `backend/app/services/directing/`
- `backend/tests/`
- `front/src/`

## Verification
- [ ] Check dependencies and re-triage.
- [ ] Evidence specific to this ticket exists and is reproducible or externally linkable where safe.
- [ ] Code if modified: relevant `pytest`/`pylint`/`pnpm typecheck`/`pnpm build` and OpenAPI when applicable.
- [ ] Media if created: ffprobe, human story/quality/rights review; never claim unrun real provider tests.
- [ ] Owner sign-off for publications, creative positioning and spending.

## Comments
- 2026-11-23 — New Creator-First backlog after owner chose personally owned channel monetization, not SaaS or customer production. **Planning only**; no work completed.

- 2026-11-25 — S18 independent test-only re-triage: #41 done, original premise of existing active export false. Retain needs-triage for product scope; progress in-progress for completed offline proof only, original acceptance unchecked, dependency 41 unchanged. [Evidence and exact commands](../../../docs/filmforge/evidence/s18-picture-master-fixture.md). RED exit 1 missing helper, initial GREEN 11/11, final 97 scoped pytest pass in 14.33s exit 0 (12 new), root 20/20. Two real synthetic H.264 masters 180x320 and 320x180, 25fps/50 frames/2s/no audio, manifest and immutable source checks; no app/API changes, current workbench integration/audio/caption safe areas/creative signoff remain missing. #46 unchanged, no owner gate/spend/production/preview changes. Find delivery with git log -1 -- this ticket.
