# FilmForge session-sized implementation plan

> **For agentic workers:** Use Superpowers writing-plans/executing-plans and DevExpert; native MCP execution, main-only, one bounded deliverable per session. Create the detailed test-first mini-plan for the next slice from live source before coding.

**Goal:** Từ screenplay nguyên gốc đến master phim chỉnh sửa được, qua từng slice nhỏ có bằng chứng.
**Architecture:** Giữ Jellyfish React/FastAPI/TaskService/Take/Cut; tích hợp engine qua adapter, không merge app nguyên khối.
**Tech stack:** React/Vite, Python/FastAPI/SQLAlchemy, MySQL/RustFS, FFmpeg/ffprobe; engine tùy chọn sau audit.
**Spec:** [roadmap](roadmap.md), [architecture](architecture.md), [session rules](session-rules.md).

## Global constraints

Main-only; no secret/paid provider/private IP egress by default; fixture-first dev preview; preserve existing task/media ownership and licenses. Each session owns one independently verifiable result and closes with project audit/handoff. Scope is ≤5 source files where practical, not a limit on necessary tests/docs. Do not promise fixed session count for unknown implementation.

## Execution queue — ordered by evidence, not ticket ID

| Session goal | Existing ticket(s) | Acceptance / boundary |
|---|---|---|
| S00 — session infrastructure | 67 | Read-only audit CLI detects invalid tracker dependencies/key parity, reports counts; rules, plan, handoff, master prompt discoverable; no application changes. |
| S01 — short-film path audit | 41 | Source-map exact scene/Take/Cut/media/API capabilities; classify supported/partial/missing; demo local FFmpeg probe using generated fixture; identify smallest assembly contract, no paid request. |
| S02 — public fixture project | 68 | Browser opens public preview with clearly labeled synthetic project, scenes/assets/takes; mock or isolated allowlisted API only; no admin or external calls. Desktop/mobile screenshots, no JS page errors. |
| S03 — Chapter vi-VN slice | 66 | AST + dynamic TASK_COPY audit, RED/GREEN, locale parity, browser switch/reload and creator text preserved. Continue 66 in later small groups until complete. |
| S04 — Directing/storyboard vi-VN slice | 66 | Approved terms, dynamic keys, errors, browser desktop/mobile and zh/en regression. |
| S05 — Canvas/remaining vi-VN slices | 66 | Separate nodes/inspector/media/settings/dialog groups; explicit exceptions; full regression, public QA and ticket close only when all criteria met. |
| S06 — direct-main CI design and validation | 02 follow-up / scoped ticket | Verify main trigger/path filters in controlled runner, no unapproved compute spend, no workflow bypass. |
| S07 — editorial contract | 46, 18, 33 | Re-triage before coding; map existing Cut to immutable local-media assembly manifest; reject invalid durations/order/missing media, preserve source. |
| S08 — minimal picture master | 42, 46, 18 | Synthetic clips, ordered trims, reproducible MP4, ffprobe duration/resolution; replace one shot non-destructively. |
| S09 — sound/subtitle | 45, 33 | Local dialogue/music/captions, timing, track separation, export, fixture rights. |
| S10 — editorial workspace | 46 | Shot list/take selection/trim/reorder preview, undo or versioned edits; local fixtures, browser tests. |
| S11 — short-film release proof | 47, 18, 35 | 60–90s synthetic or authorized original master, 9:16/16:9 profiles, manifest and QC; distinguish technical export from human-approved film. |
| S12+ — generation and scale | 55–65, 06–35, 48–53 | Safe provider contracts and dry-runs when allowed; approved live generation only after actual entitlement/rights/budget; episode/canon/Blender/OTIO later as roadmap gates pass. |

S labels are scheduling suggestions, not new tracker tickets or claims of completion. S01 #41 audit done (65 scoped backend tests; see [audit](short-film-path-audit.md)). S02 #68 is a scoped synthetic demo independent of owner business/creative decision; downstream product/provider gates unchanged. Alternate production critical-path and localization slices; do not wait for all translations or channel revenue to perform offline technical audits. C0 creator experiments run independently.

## Mini-plan template for each session

1. Read handoff, git fetch, audit; choose ticket and inspect actual files/interfaces.
2. Write exact acceptance and out-of-scope; identify test file and failing assertions (or source/link checks for docs).
3. Run RED; implement minimal change; GREEN and affected regression; review security, rights, provider cost, compatibility.
4. Verify artifact/live browser where applicable; record actual results; commit/push tested slice; safely clean merged branches.
5. Audit whole project, update ticket and handoff; verify final SHA/clean tree. Next session starts from newly observed facts, not this schedule alone.

## Review focus

Dirty/diverged main: preserve user commits. Stale handoff: verify against source. Dependency cycle/missing ticket: audit fails rather than hiding it. Equal locale values: not automatically missing or translated. Public preview with API forbidden: label fixture and retain admin denial. Failed tests: do not call green. No credentials or GPU: use synthetic local pipeline, no false live-provider claims.
