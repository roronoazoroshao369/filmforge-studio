# FilmForge Provider Router — Implementation Plan (G0–G3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkboxes for tracking. **Current state: design/planning, not execution permission to make paid calls.**

**Goal:** Capability-aware multi-provider routing with legal free-first selection, deterministic direct/gateway fallbacks, no double paid video submission and provider-cost provenance for creator-owned AI films.

**Architecture:** Extend Jellyfish provider registry/config and existing `TaskService`, using independent policy selector (pure testable logic) plus one gateway adapter initially for text. Media backends remain native until each gateway endpoint passes contract and async job tests. Store immutable actual-route metadata server-side within existing transaction rules.

**Tech Stack:** Python/FastAPI/Pydantic/SQLAlchemy, Jellyfish async task worker and MySQL/RustFS, React/Vite frontend, external HTTP APIs (OmniRoute candidate), pytest + pylint; frontend generated OpenAPI client.

**Spec:** [provider routing architecture](provider-routing-architecture.md), [gateway selection](provider-gateway-evaluation.md), [creator roadmap](roadmap.md). **Task tracker:** `.scratch/filmforge-studio/issues/54–65`.

## Global constraints

- Only `main` long-lived branch; commit small verified vertical changes, no force-push; existing `AGENTS.md` and `CONSTRAINTS.md` take precedence.
- Preserve `TaskService` as **only** writer of `Task` and one coordinator until a separate M5 ADR; no new independent task state machine.
- No unknown-price-as-free, no silent paid fallback and no free-tier quota evasion.
- No secrets in UI DTO, errors, test fixtures or Git. Provider key/OAuth commercial usage must be authorized.
- No unsupported video capability guessing from model name alone. Async poll same actual selected provider/gateway as submit.
- Baseline M0 tests and provider architectural mapping precede code changes; C0 original video experiments are independent.
- Each code task uses RED test → failing check → smallest change → GREEN → relevant suites → review → commit SHA/Comments. Provider money tests are **owner-opt-in with explicit cap**.

## File ownership map — confirm during G0 audit, not preemptive refactor

- `backend/app/core/contracts/provider.py` — current fixed provider identifiers; future typed routing requirements should extend safely.
- `backend/app/services/llm/provider_registry.py` + `provider_resolver.py` — existing provider registry and effective endpoints.
- `backend/app/core/integrations/model_catalog.py` — model discovery; capability metadata must not be inferred only from names.
- `backend/app/core/integrations/media_provider.py` — existing image/video submit and poll.
- `backend/app/services/generation/submission/submitter.py` — preflight and freeze actual route when submitting through `TaskService`.
- `backend/app/services/task_service.py` + `backend/app/task_worker.py` — guard against a second task state owner; preserve recovery behavior.
- `backend/tests/` — use neighboring test fixtures and current conventions, don't invent precise test paths until G0.
- `front/src/` + `front/src/services/generated/` — minimal policy UI, only via OpenAPI generated client when contract changes.
- `docs/development/architecture/task-execution.md` — if behavior changes, document actual new semantics, not aspirational ones.

## Review Focus (write these into the owning ticket tests)

1. **Timeout after paid submit succeeded remotely**: no auto-second create; retained route/id or unknown outcome. Ticket 61.
2. **Free-only policy then HTTP 429**: must not call paid fallback. Ticket 58.
3. **Image input requiring references sent to text-only model**: preflight rejects before network. Ticket 56/60.
4. **Configuration changes after accepted job**: polling remains on original credential/provider/endpoint. Ticket 61.
5. **Unknown price / non-commercial rights / data-sharing restriction**: route excluded or explicit human approval, no $0 assumption. Ticket 57/62.

## G0 — audit & bounded gateway choice

**54: Audit source** → list existing `Provider/Model` models, endpoints and state transitions, identify extension point; **evidence:** source-level matrix + runtime tests.  
**55: Compare gateway candidates** → validate OmniRoute startup/API, direct alternative, license/privacy; **evidence:** documented *text* trial and media schema assessment; **decision:** a signed recommendation.

## G1 — pure policy + text route

**56: Canonical capability matrix** → create schema and validation in existing contract package; test first_frame/ratio/async negative cases; map known native adapters.  
**57: Rights + free eligibility** → reject unknown terms/price, missing commercial rights and exhausted quota with reason codes; no default paid consent.  
**58: Pure router dry-run** → deterministic candidate sorting, explain rejected routes, 429 bounded fallback only when safe; **unit test offline**.  
**59: Text gateway pilot** → one legitimate OmniRoute/OpenRouter configuration behind existing provider registry; compare with direct provider path; test redaction/timeout, keep UI minimal.

## G2 — media + sticky lifecycle

**60: Image and async video capability integration** → keep vendor adapters, verify gateway schemas independently; no new raw catch-all video POST. Promote existing task **14** for capability preflight before spend.  
**61: Sticky async remote job and ambiguous submit protection** → extend task snapshot semantics per ADR, keep `TaskService` writer; promote existing task **15**. Regression tests for unknown submit, cancel, restart and poll endpoint pinning.  
**62: Budget/quota/quality gates** → per-job and per-month cap, free-only policy, price unknown handling, estimate vs invoiced; no double-charge assumptions.  
**63: Minimal creator route selector UI** → default free-first, choose quality override, show cost/capabilities/rights, preview route without submitting; generated OpenAPI client and typecheck.

## G3 — economic benchmark & ops

**64: Local ASR/ComfyUI optional adapters** → only if hardware and rights support; local inference has cost; no mandatory GPU bootstrap.  
**65: Benchmark and release gate** → compare native direct vs gateway for one text workflow, then image, then a **single authorized** paid/free video provider with cap. Report quality, reliability, cost and acceptance. Owner decides gateway deployment. C1 short production may use direct adapters if gateway is not ready.

## Cross-dependency ordering with original tickets

- M0 **01–05** and C0 **36–40** continue in parallel.
- **54** after 03/04; **55–59** after 54 as specified in ticket docs.
- **14** capability and **15** paid-job ambiguity are **promoted from deferred** for G2; do not create duplicate implementations.
- C1 **41–47** remains an independent production stream and must not block on speculative multi-modal router completion.
- No task 06–13, 16–35 automatically becomes active from G1; feature and long-series milestones remain evidence-gated.

## How to execute any code task

- [ ] Read spec / target ticket / current code; identify exact changed files and invariant.
- [ ] Write **one** failing focused test for requirement and execute it, capture FAIL.
- [ ] Implement minimum in existing architecture, execute again, capture PASS.
- [ ] Add one realistic negative/failure-mode test from matrix; prove fail→pass.
- [ ] Run affected backend pytest, `uv run pylint app`; frontend typecheck/build for UI/API change.
- [ ] Review security/rights/commissions/license and Git diff; record test outputs and commit SHA.
- [ ] Update Comments, Progress; stop at task boundary. Do not claim real gateway provider tested from mocks.

**Self-review:** Design maps to 12 ticket IDs and existing 14/15; API signatures/file paths require G0 source audit, so do not invent implementation-level function signatures in this architectural stage. The implementation agent must write a precise task-local RED/GREEN plan after code reconnaissance.
