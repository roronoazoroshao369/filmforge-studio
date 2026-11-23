# 51 — Deliver one original 3–10min narrative episode

Status: needs-triage
Progress: not-started
Type: task
Phase: C2
Priority: P2
Blocked by: 44,50
Owner: unassigned
Target: main

## Goal / output
Tạo một tập 3–10 phút cùng IP với Shorts, có arc hoàn chỉnh, music/audio rõ và nguồn tư liệu đủ quyền; tạo teaser dẫn người xem đến tập.

## Acceptance criteria
- [ ] Export 16:9/hybrid and 9:16 teaser manifest, editorial QA, shared character ref, public link only with owner permission.
- [ ] No selling the FilmForge product or client video services; work contributes to creator-owned original channel / IP.
- [ ] Rights, spend and personal data safeguards are recorded; no “done” without owner/evidence.

## Work plan
1. Read `AGENTS.md`, [creator roadmap](../../../docs/filmforge/roadmap.md) and the relevant source/previous ticket evidence.
2. Identify source of truth, user-visible vertical slice, compatibility limits and likely files.
3. For code behavior changes write a failing contract/regression test before implementation; for content experiment capture real artifacts before conclusions.
4. Run scoped checks, inspect diff, record output and owner creative approval (if required).
5. Commit on `main` with valid subject and append actual SHA/checks in `## Comments`. Set `Progress: done` only after evidence.

## Likely scope (audit before editing)
- `docs/filmforge/evidence/C2/`
- `backend/app/services/directing/`

## Verification
- [ ] Check dependencies and re-triage.
- [ ] Evidence specific to this ticket exists and is reproducible or externally linkable where safe.
- [ ] Code if modified: relevant `pytest`/`pylint`/`pnpm typecheck`/`pnpm build` and OpenAPI when applicable.
- [ ] Media if created: ffprobe, human story/quality/rights review; never claim unrun real provider tests.
- [ ] Owner sign-off for publications, creative positioning and spending.

## Comments
- 2026-11-23 — New Creator-First backlog after owner chose personally owned channel monetization, not SaaS or customer production. **Planning only**; no work completed.
