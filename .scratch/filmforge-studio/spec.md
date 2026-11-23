# FilmForge local tracker — spec and task order

**Status:** planned. Owner: FilmForge. Project: AI Film Production OS (Xianxia multi-episode first; cinematic feature later). Date: 2026-11-23.

Read `docs/filmforge/roadmap.md`, `docs/filmforge/master-handoff.md` and `tasks/plan.md`. Existing repository uses Markdown tracker under `.scratch/`; keep one source of task status here. Issue ticket filenames are sequential and immutable; do not delete unfinished tickets.

**Phase gates:** M0 baseline; M1 Canon; M2 60–90s cut; M3 3–5m Blender pilot; M4 2 episodes; M5 3–10 episodes; M6 cinematic conform. Never call a demo/fake provider result a verified real provider.

**Ticket format:** `Status` = `needs-triage | needs-info | ready-for-agent | ready-for-human | wontfix` (triage); `Progress` = `not-started | in-progress | blocked | done` (execution). `Blocked by` is a list of predecessor ticket numbers. `## Comments` holds human/agent notes and test evidence. Only set `Progress: done` with commit SHA and output/evidence. `Status` remains the triage label. No implementation done at planning time.

**Existing upstream:** Jellyfish Apache-2.0; preserve attribution and read `AGENTS.md` and `GLOSSARY.md`. No automatic mass merge of unrelated project trees.
