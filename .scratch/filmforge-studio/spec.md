# FilmForge local tracker — Creator-first strategy

**Date:** 2026-11-23. **Owner decision:** A, build exclusively for owner-operated channels and original film IP. **No B2B production service, SaaS or software sales.** Current content revenue unverified.

Source of truth: [roadmap](../../docs/filmforge/roadmap.md), [creator strategy](../../docs/filmforge/creator-first.md), [implementation plan](../../tasks/plan.md).

## Scheduling

**Active:** C0 **36–40** (creative experiment) in parallel with technical M0 **01–05**. **Engineering next after 03/04:** G0 **54–55** → G1 **56–59** → G2 **promoted 14–15 + 60–63** → optional G3 **64–65**. C1 **41–47** runs with G1/G2 if useful, C2 **48–53** after published evidence. **Deferred film:** 06–13 and 16–35; numeric ID is stable identity, not global priority. Numeric ID is stable identity, *not* global work priority.

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

## Routing-specific invariants

- Free-tier entitlement, commercial rights and quota are validated per model/account/region/date. Never bypass free quota/ToS, assume API from a consumer subscription, or silently switch to paid model.
- OmniRoute is an optional gateway, not a replaced TaskService. Async image/video submit, polling and completion remain pinned to selected route; unknown paid create state must not auto-create a second job.
- Refer to `docs/filmforge/provider-routing-architecture.md` and `docs/filmforge/provider-implementation-plan.md`. All G tasks not-started; no live provider tests yet.
