# Coding agent execution contract

**Current session policy (2026-11-24):** [session rules](session-rules.md), [session plan](session-plan.md), [handoff](session-handoff.md) and [master prompt](session-master-prompt.md) govern session execution. One small goal, independently verifiable; public fixture QA and technical self-unblock are authorized. Older ordering below is historical where inconsistent.

> **Owner strategy override (2026-11-23):** FilmForge creates videos for **owner-controlled channels and original IP only**, not B2B, client projects or SaaS. Read [creator roadmap](roadmap.md), [creator creative strategy](creator-first.md), [policy register](policy-sources.md) and [technology radar](creator-tech-radar.md) before selecting tasks. Creator C0 tickets 36–40 run parallel to M0 01–05. Creator C1 41–47, C2 48–53 precede long-series tasks 06–35. No auto-upload and no paid request without owner-approved budget. Never confuse creating a script/video with actually publishing/monetizing it.
>
> **Routing strategy 2026-11-23:** C0/M0 first; after M0 tasks 03/04 execute G0 `54–55`, then G1 `56–59`, G2 `14–15 plus 60–63`, optional G3 `64–65`. Start router development with **text pilot**, verify media per modality; OmniRoute is optional. Full [routing spec](provider-routing-architecture.md), [implementation plan](provider-implementation-plan.md) and [new-chat handoff](new-chat-handoff.md). No free tier/rights assumption, no automatic paid fallback or double remote job creation; no keys/logged secrets.

**Agent ticket selection:** highest-priority **unblocked and triaged** ticket in active streams, **not lowest numeric ticket**. `ready-for-human` creative and publication tasks are human-owned; agent can draft/review but cannot publish or declare creative approval. Preserve `Status` triage labels; update `Progress` only with evidence.


**Scope: documentation/roadmap committed; implementation pending.** Read [master handoff](master-handoff.md), [roadmap](roadmap.md), [architecture](architecture.md), `AGENTS.md`, `CONSTRAINTS.md` and the specific tracker ticket before editing.

## Command baseline (from Jellyfish; verify in M0)

~~~bash
# repository root
cp deploy/compose/.env.example deploy/compose/.env
cp backend/.env.example backend/.env
cp front/.env.example front/.env
docker compose --env-file deploy/compose/.env -f deploy/compose/docker-compose.yml   up --build -d mysql rustfs backend-migrate backend-seed-system-data

# backend, separate terminals; only ONE worker coordinator per database
cd backend
uv sync --group dev
uv run python -m app.dev api
uv run python -m app.dev worker
uv run pytest -q
uv run pylint app

# frontend, repository root
pnpm --dir front install
pnpm --dir front run typecheck
pnpm --dir front run build
~~~

Commands are runbook candidates, not evidence that they passed. Never create env with real keys in commits. Use fresh DB for baseline migration, back up existing data before migration.

## Each ticket cycle

1. **Read** source, relevant ADR and existing tests. State assumption/unknown.
2. **Spec** exact public contract and migration impact. For behavior changes write a failing test first.
3. **Implement** smallest vertical change; do not copy whole upstream repo.
4. **Verify** focused test, then impacted suite; record pass/fail and environment (OS, Python, Node, DB).
5. **Review** code, permissions, logging, costs, licenses; maintain main-only safety.
6. **Commit and record** exact SHA, evidence file, status and human approval.

## Safety boundaries

- No code change without a task ID; no product feature in M0 audit-only ticket.
- Do not run paid cloud provider smoke tests without explicit spend cap.
- Do not alter or delete upstream Jellyfish functionality just to fit new domain objects.
- No second task lifecycle writer or multiple workers sharing one DB until an approved redesign.
- Do not mark “verified” based on README, generated fixtures or mock provider tests.
- Never mark progress as complete without logs and reproducible proof.
- For uncertain real-world persons, intellectual property, voices and images, require documented usage rights.

## Agent handoff starter

> Read `AGENTS.md`, `docs/filmforge/README.md`, `docs/filmforge/roadmap.md` and `tasks/plan.md`. Identify the highest-priority unblocked, triaged ticket among active C0 (36–40), M0 (01–05) and, after prerequisites, G0/G1 (54–59) streams under `.scratch/filmforge-studio/issues/`. First read creator strategy and distinguish human-owned creative tasks from agent tasks. Report existing behavior, affected files, tests, costs, rights and planned acceptance criteria. Implement **only that ticket** using test-first workflow, commit to main after verification, and append commit SHA / test results to its `## Comments`; set `Progress: done` only after evidence, preserving its triage `Status`. Do not advance another ticket without explicit authorization.
