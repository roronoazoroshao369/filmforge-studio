# FilmForge local tracker — Creator-first strategy

**Date:** 2026-11-23. **Owner decision:** A, build exclusively for owner-operated channels and original film IP. **No B2B production service, SaaS or software sales.** Current content revenue unverified.

Source of truth: [roadmap](../../docs/filmforge/roadmap.md), [creator strategy](../../docs/filmforge/creator-first.md), [implementation plan](../../tasks/plan.md).

## Scheduling

**Active:** C0 **36–40** (experiment and rights review) in parallel with technical M0 **01–05** (baseline). **Next:** C1 **41–47**, C2 **48–53**. **Deferred:** original long-film tickets **06–35**, preserved intact for future re-triage. Numeric ID is stable identity, *not* global work priority.

## Ticket record protocol

Each ticket at `.scratch/filmforge-studio/issues/<NN>-<slug>.md` has:
- `Status` = `needs-triage` | `needs-info` | `ready-for-agent` | `ready-for-human` | `wontfix` (triage; as prescribed by `docs/agents/triage-labels.md`).
- `Progress` = `not-started` | `in-progress` | `blocked` | `done` (execution; never claim done without evidence).
- `Blocked by` = predecessor ticket IDs, or None. Ticket Comments collect human/agent feedback, verification commands and commit SHA.

Only approved source code and policy decisions are “Done”; current docs are planning artifacts, not validated product or channel traction. Do not rewrite historical tickets en masse to claim implementation or delete incomplete past work.

## Three evidence families

1. **Code evidence:** test/build output, license/NOTICE, git commit.
2. **Creative evidence:** actual original script, video asset rights, human editorial approval and publication URL where safe to share.
3. **Economic evidence:** owner-authorized budget, provider invoice/cost ledger, owner-supplied channel analytics and verified realized revenue; zero or unavailable is acceptable, invented RPM is not.

## Comments

- 2026-11-23 — Owner changed direction to personal content/IP revenue. Creator-first C0/C1/C2 now precedes long-series and cinematic expansion. All tasks pending.
