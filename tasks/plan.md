# FilmForge Implementation Plan — creator-owned IP first

**Authoritative current strategy:** [creator-first roadmap](../docs/filmforge/roadmap.md). **Detailed creator intent:** [creator-first](../docs/filmforge/creator-first.md). **Expert simulation:** [council](../docs/filmforge/creator-board-review.md). **Candidate technology:** [tech radar](../docs/filmforge/creator-tech-radar.md).

**Tracker:** local `.scratch/filmforge-studio/issues/` per repo `docs/agents/issue-tracker.md`; do not create duplicate `tasks/todo.md` or GitHub issues without owner decision. `Status` is triage label; `Progress` is separate execution status. No code feature has been implemented by this roadmap update.

## Two safe parallel streams

- **Creator/market stream:** **36 → 37 → 38 → 39 → 40**. Owner tests original concepts with existing tools *before* engineering. Manual publishing; no subscriptions without a cap.
- **Foundation stream:** **01 → 02,03,04 → 05**. Verify Jellyfish locally, code conventions and Go/No-Go. This is not a prerequisite to the no-code creator experiments.

## Next feature stream, only after evidence

- **C1 Short Studio:** **41–47**, with functional dependencies in each ticket. Goals: approved script/shot, 9:16 original-video output, safe captions/voice, human approval, real cost ledger.
- **C2 audience/episode bridge:** **48–53**, manual analytics import, creative experiments, 3–10-minute original episode, lite Bible, 4-week economics and creator sign-off.
- **Future original series/feature film:** retain **06–35**, but **defer**, then re-triage individually after C2. Old M1/M2/M3 titles in Master Handoff are historical — they are not active scheduling priority anymore.

## Active task index

| Phase | IDs | Evidence needed |
|---|---|---|
| M0 technical baseline | 01–05 | API/Worker/UI/tests reproducible, recorded Go/No-Go |
| C0 original channel | 36–40 | 8–12 distinct uploads, 4-week structured review |
| C1 short-video factory (creator-only) | 41–47 | 10 approved 9:16 video outputs, project manifest and budget |
| C2 creator feedback | 48–53 | Real creator analytics, 3–10 minute story, continuation gate |
| M1/M2 future film foundation | 06–18 | Retriage after C2 and owner go |
| M3/M4/M5/M6 long film | 19–35 | Later stage technical gates and available resources |

## Single-ticket execution

Choose the **highest-priority unblocked** ticket in active streams; ID order does **not** override phase priorities. Do not start `needs-triage` tickets before categorization; `ready-for-human` needs owner creative/release decision. Write spec, failing tests for behavior changes, smallest code, run appropriate checks, inspect diff, commit on `main`, record exact SHA/evidence and `Progress: done`. Recompute dependencies when advancing future phases. M0 applies existing `TaskService` ownership and single-worker constraints.

## Scope exclusions

No SaaS accounts, subscription billing, client-commission workflow, ecommerce, 100/day bot, scraping platform footage, automatic publishing, distributed GPU farm or expensive full World State Engine during C0–C1. Personal work capacity, budget and platform eligibility remain unverified; agents must not infer them or pay for services.
