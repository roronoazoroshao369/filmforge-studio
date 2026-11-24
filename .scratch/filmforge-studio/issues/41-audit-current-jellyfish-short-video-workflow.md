# 41 — Audit current Jellyfish short-video workflow

Status: ready-for-agent
Progress: done
Type: task
Phase: C1
Priority: P1
Blocked by: 03,04
Owner: unassigned
Target: main

## Goal / output
Kiểm tra hiện tại Jellyfish đã có clip export, voice, music, captions, cuts, file storage, API/worker; lập bảng gap thay vì giả định cần code mới.

## Acceptance criteria
- [x] Bảng supported/partial/missing trên mã và test; API/FFmpeg flow hiện hữu được demo; đề xuất phần nhỏ nhất cần xây.
- [x] No selling the FilmForge product or client video services; work contributes to creator-owned original channel / IP.
- [x] Rights, spend and personal data safeguards are recorded; no “done” without owner/evidence.

## Work plan
1. Read `AGENTS.md`, [creator roadmap](../../../docs/filmforge/roadmap.md) and the relevant source/previous ticket evidence.
2. Identify source of truth, user-visible vertical slice, compatibility limits and likely files.
3. For code behavior changes write a failing contract/regression test before implementation; for content experiment capture real artifacts before conclusions.
4. Run scoped checks, inspect diff, record output and owner creative approval (if required).
5. Commit on `main` with valid subject and append actual SHA/checks in `## Comments`. Set `Progress: done` only after evidence.

## Likely scope (audit before editing)
- `backend/app/services/directing/`
- `backend/app/core/contracts/`
- `front/src/`

## Verification
- [x] Check dependencies and re-triage.
- [x] Evidence specific to this ticket exists and is reproducible or externally linkable where safe.
- [x] (N/A: no application code change) Code if modified: relevant `pytest`/`pylint`/`pnpm typecheck`/`pnpm build` and OpenAPI when applicable.
- [x] (Synthetic technical fixture only) Media if created: ffprobe, human story/quality/rights review; never claim unrun real provider tests.
- [ ] Owner sign-off for publications, creative positioning and spending. Not applicable to technical audit; remains mandatory downstream.

## Comments
- 2026-11-23 — New Creator-First backlog after owner chose personally owned channel monetization, not SaaS or customer production. **Planning only**; no work completed.

- 2026-11-24 — Scope clarified by autonomous dev direction: read-only source audit and synthetic local fixture demo do not depend on 05 foundation product GO or 40 creator-market approval. Those gates still apply to downstream feature activation/creative acceptance; no real provider or publication. Keep Progress not-started until execution.

- 2026-11-24 — S01 partial: [audit evidence](../../../docs/filmforge/short-film-path-audit.md). Exact blob synthetic media verification and public HTTP smoke passed; API fixture regression not executed; keep open. No owner gate/spend/runtime change.

- 2026-11-24 — Baseline 3dcb47f120398430597692cfe7c74d47bade27a7; 65 scoped pytest passed in 23.67s, exit 0, zero skipped. Synthetic FFmpeg/ffprobe PASS; public frontend 200, protected API 403. [Exact commands](../../../docs/filmforge/short-film-path-audit.md). Done for technical audit only. Find containing commit with git log -1 -- .scratch/filmforge-studio/issues/41-audit-current-jellyfish-short-video-workflow.md. Next #68.
