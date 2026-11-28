# 46 — Reuse takes and cuts for editable short assembly

Status: needs-triage
Progress: not-started
Type: task
Phase: C1
Priority: P1
Blocked by: 42,43,44
Owner: unassigned
Target: main

## Goal / output
Dùng Jellyfish Take và clip adoption để lắp bản dựng ngắn, tái render một shot mà không phá approved cut và history.

## Acceptance criteria
- [ ] Test reshoot one shot leaves previous take + prior cut immutable; export checksum and source lineage recorded.
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

- 2026-11-28 — S31 docs-only re-triage: owner requests critical-path acceleration and GitHub-only; full #46 remains needs-triage/not-started and dependencies 42,43,44 unchanged. Independent offline regression next, using existing fixed-record Take/Cut services and synthetic media; see [current handoff](../../../docs/filmforge/session-handoff.md). Source confirms explicit candidate registration, draft/confirmation CAS and canvas_history vs candidate_take split. No runtime implementation, test run, product acceptance, or approval in this session.

- 2026-11-28 — S32 prepared [unapplied regression patch](../../../docs/filmforge/evidence/s32-reshoot-regression.patch) against 0261608d86c8f1c65afb0b694c59163edcfa6a8e; source context checked, no executable checkout (git DNS exit 128), no dispatch action. No test executed, no actual render, no product acceptance, no owner gate. Keep original status/progress/dependencies; next session apply/check/run focused and aggregate before main test-file delivery. See [handoff](../../../docs/filmforge/session-handoff.md).
