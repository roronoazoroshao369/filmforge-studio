# 39 — Capture channel analytics and production ledger

Status: ready-for-agent
Progress: not-started
Type: task
Phase: C0
Priority: P0
Blocked by: 38
Owner: unassigned
Target: main

## Goal / output
Thiết lập schema nguồn dữ liệu đo nội dung và chi phí: 48h/7d snapshots, format, runtime, production hours, provider spend, rights; có thể dùng CSV thủ công trước.

## Acceptance criteria
- [ ] >=8 bản ghi thực; số liệu thiếu dùng null; ẩn thông tin cá nhân, không bịa RPM; một ví dụ phương pháp tính cost/approved-minute.
- [ ] No selling the FilmForge product or client video services; work contributes to creator-owned original channel / IP.
- [ ] Rights, spend and personal data safeguards are recorded; no “done” without owner/evidence.

## Work plan
1. Read `AGENTS.md`, [creator roadmap](../../../docs/filmforge/roadmap.md) and the relevant source/previous ticket evidence.
2. Identify source of truth, user-visible vertical slice, compatibility limits and likely files.
3. For code behavior changes write a failing contract/regression test before implementation; for content experiment capture real artifacts before conclusions.
4. Run scoped checks, inspect diff, record output and owner creative approval (if required).
5. Commit on `main` with valid subject and append actual SHA/checks in `## Comments`. Set `Progress: done` only after evidence.

## Likely scope (audit before editing)
- `docs/filmforge/creator-first.md`
- `creator-analytics.csv`

## Verification
- [ ] Check dependencies and re-triage.
- [ ] Evidence specific to this ticket exists and is reproducible or externally linkable where safe.
- [ ] Code if modified: relevant `pytest`/`pylint`/`pnpm typecheck`/`pnpm build` and OpenAPI when applicable.
- [ ] Media if created: ffprobe, human story/quality/rights review; never claim unrun real provider tests.
- [ ] Owner sign-off for publications, creative positioning and spending.

## Comments
- 2026-11-23 — New Creator-First backlog after owner chose personally owned channel monetization, not SaaS or customer production. **Planning only**; no work completed.
