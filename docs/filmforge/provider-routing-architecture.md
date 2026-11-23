# Provider Routing Architecture — FilmForge (proposed, NOT implemented)

**Version:** 2026-11-23 · **Status:** approved direction for planning; implementation requires tickets and RED/GREEN tests.  
**Related:** [roadmap](roadmap.md), [gateway evaluation](provider-gateway-evaluation.md), [implementation plan](provider-implementation-plan.md), [task tracker](../../.scratch/filmforge-studio/spec.md).

## Decision

**Hybrid capability-aware routing, free-first where legally available, with a replaceable optional external gateway**. One FilmForge internal API/contract, **not** one assumption that every service speaks an OpenAI-compatible media API. Native Jellyfish direct adapters remain supported.

User intent: FilmForge is for **owner-produced original videos** on owned channels; not SaaS, sales, client requests or content-farm autoposting. Cost control is important but quality and rights are hard constraints.

### Two layers (do not confuse them)

1. **FilmForge routing policy** (our code): task intent, capability contract, candidates, eligibility, quality floor, rights, budget, dry-run decision and immutable actual-route provenance.
2. **Transport/inference gateway** (optional service): OmniRoute / LiteLLM / OpenRouter / direct vendor SDK; may expose a convenient base URL but can differ by modality, polling semantics, credentials and pricing.

Recommendation: keep **text/script agents** the first low-risk gateway pilot. Image/video/audio routing follows only after verifying actual API wire formats. OmniRoute as a **candidate**, not a hard requirement.

## Observed Jellyfish code facts, read 2026-11-23

- `backend/app/core/contracts/provider.py`: `ProviderKey` currently literal openai / volcengine / vidu / kling.
- `backend/app/services/llm/provider_registry.py` and `provider_resolver.py`: registered provider metadata, category support and category-specific base URL override already exist.
- `backend/app/core/integrations/model_catalog.py`: GET `/models` for compatible endpoints, falls back to built-in catalogs, classifies by naming heuristics (a source of **false capability positives**; must preflight).
- `backend/app/core/integrations/media_provider.py`: direct vendor submit/poll boundaries for specific providers.
- `backend/app/services/generation/submission/submitter.py`: routes through `TaskService`, freezes effective config at acceptance and chooses direct/remote mode.
- `docs/development/architecture/task-execution.md`: `TaskService` is single task state writer, **one** worker coordinating database; queued task/remote-id recovery; no arbitrary DAG multi-worker recovery.

**Therefore do not replace TaskService, database, FFmpeg or existing provider registry during routing MVP.** Extend mapping via tests and additive methods. Do not copy OmniRoute's own task status into the film `tasks` table.

## Logical topology

~~~text
FilmForge UI: original script / shot / take / approve / export
      │
FilmForge API + TaskService (single writable task lifecycle)
      │ immutable accepted request + actual route manifest
      ▼
Provider Policy Selector
  ├─ capability preflight  (text,image,video,tts,asr)
  ├─ rights/terms + commercial output permission
  ├─ free/local/paid eligibility + quota/health
  ├─ quality constraints + explicit user choice
  ├─ preflight max spend + per-project cap
  └─ transparent choice / manual override
      │
      ├── native Jellyfish adapters (existing providers)
      ├── OpenAI-compatible text gateway (OmniRoute pilot)
      ├── optional image/media gateway ONLY if verified
      └── local inference (Whisper/faster-whisper, optional ComfyUI)
      │
      ▼
Output/remote job → original TaskService / FileItem / Take / Cut
      │
Approved review → FFmpeg export → manual creator publication
~~~

## Canonical internal contracts (design proposal, not yet runtime code)

Define logically, then map to existing `contracts` and `models`. Avoid creating unrelated new lifecycle tables in M0. Suggested typed records:

- `CreativeTaskRequirements`: `kind` in `text|image|video|tts|asr`; `min_quality_tier`; `max_cost_per_request`; `max_latency_seconds`; dimensions/aspect; duration; fps; reference images/video; first/last frame; subject refs; audio/voice lang; style/IP/rights constraints; `allow_paid_fallback` defaults **false**; `privacy_mode`.
- `ProviderCapability` (explicit, versioned, tested): provider/gateway/model IDs; supported task kinds, model modalities and input/output shape; sync/async; duration/resolution/aspect/refs; languages; media formats; poll/cancel endpoints; callback support; ID semantics; quota/latency; rights flags; region.
- `RouteCandidate`: actual provider + model + gateway path, capabilities version, pricing data time & currency, health/quota, terms-verified date and provenance.
- `RouteDecision`: job context, selected candidate, rejected alternatives with **reason codes** (`unsupported|rights_unknown|quota_exhausted|price_unknown|budget_exceeded|quality_below_floor|unhealthy|not_configured`), fallback candidates and owner approval.
- `RouteExecutionSnapshot`: **immutable actual** gateway/provider/model IDs, API version, endpoint identifier (no secrets), credential reference policy, model capability version, submitted request digest, idempotency key if supported, remote job ID once known, cost estimate and charged amount separately.
- `ProviderUsageRecord`: exact outcome, tokens/images/seconds/frames, currency, estimated vs invoiced spend, free-credit balance snapshots and credits consumption if available, refunded/unknown status.

**This is a design proposal, not permission to create every table immediately.** Prefer existing `Provider`, `Model`, `Task`, `TaskInput`, `TaskOutput`, `FileItem`, `SceneTakeRecord`. Map in ticket 54 and ADR prior to schema changes.

## Routing algorithm: correctness > free label

1. Remove unconfigured, disallowed terms or unknown-commercial-rights providers. Treat “free” as a **time-stamped claim requiring verification**, never a timeless constant.
2. Filter strict capabilities (task kind, ratio, reference, frames, language, duration, output format, polling protocol). **No “model name contains video” inference as authoritative.**
3. Remove quota/rate-limited/unhealthy routes. Distinguish *quota unknown* from free quota available.
4. Reject candidates exceeding current owner-approved per-job and rolling-period budget. Unknown pricing => require explicit human approval; never treat unknown as $0.
5. Respect configured creative quality floor. If remaining candidates include an allowed free/local route, prefer it; otherwise present approved paid options, **do not silently pay**.
6. Deterministic tie-break among eligible candidates (stable cost, capability quality evidence, recent healthy latency, explicit creator preference), log reason.
7. **Freeze actual route** before a paid/async submit. After successful async submit, polling and result fetching must target the **same provider/gateway account and model**.
8. If no valid candidate, return a **clear preflight failure or approval-required state**. Do not substitute a lower-capability model invisibly.

Allow free-only, local-preferred, balanced and quality-first **user policy presets**, but do not proliferate UI or knobs until evaluation proves need.

## Retry and fallback safety table

| Phase / outcome | Allowed behavior | Forbidden behavior |
|---|---|---|
| **Pre-submit rejection** (capability/quota/credentials known) | Choose another eligible route after policy checks | Repeatedly hammer free endpoints or bypass quota/terms |
| **Text transient 429/5xx** | Bounded retry/fallback only if semantically safe and within explicit budget; log all attempts | Infinite retries, leaked prompts/rights across privacy-incompatible providers |
| **Image/video submit with confirmed rejection/no job created** | One alternate route if supported and approved | Automatic paid escalation without permission |
| **Submit timeout / lost response / uncertain remote creation** | Mark **unknown outcome**, reconcile with idempotency key/status if supported, ask owner before new paid create | Blind second submit to another gateway/provider |
| **Remote job ID confirmed** | Poll **pinned** original route; bounded backoff, keep task history | Load-balance polling across different provider accounts |
| **Remote success but local save failed** | Resume/repair delivery if safe and existing task model allows; preserve original output ID | Create another paid job to replace a missing download |
| **Cancel** | Signal remote if API permits; local cancel != remote stop/billing reversed | Claim provider money was refunded without invoice evidence |

IMPORTANT: Jellyfish currently marks some interrupted direct/no-ID tasks failed. **Do not claim recoverable unknown submit already exists.** Tickets must establish actual behavior and acceptance tests before changing it.

## Cost and secret security

- “Free tier” may be one-time signup credits, usage caps, non-commercial access or training-opt-in, not a free unlimited API.
- A local model's API spend can be zero but disk, RAM/GPU electricity, maintenance and quality opportunity cost are not zero.
- Protect secrets at rest/in transit. Current source freezes sensitive execution config server-side; explicitly **audit retention/access/encryption** before putting more credentials into snapshots. Never print raw tokens, signed URLs or full auth headers.
- Public repo gets *only placeholders and tests*. Auth through legitimate API keys or explicitly permitted OAuth; never automate subscription-login scraping, rotate accounts to evade limits or use third-party “free” routes that violate ToS.
- 3rd party gateway exposes scripts/prompts/images to additional operator: require owner approval and data/privacy classification before route selection.
- Track actual billed spend (not only API price list) and **max spend per request and month**. No automatic paid fallback from zero-cost candidate.
- Provider failures must preserve editorial work and accepted cut; generation success ≠ human approval.

## Acceptance test matrix

- Capability: 9:16 video model does not support 1st/last frame -> excluded before submit.
- Rights: free non-commercial model cannot render monetized original video -> excluded.
- Cost: free route 429, paid fallback disabled -> no paid call; explicit approval enables finite cap only.
- Pricing: price unknown -> approval required; no $0 assumption.
- Sticky job: submit via gateway A, poll must use A even when B healthier.
- Ambiguity: submit timed out after provider created remote job -> no double paid create.
- Secret redaction: task DTO/log/output does not expose API keys or signed media URLs.
- Reshoot: selected shot alone regenerated; old take and cut remain intact.
- Local: free local ASR fails -> use human correction/fail cleanly; no surprise paid call.
- Versioning: route selected at submission remains fixed after provider config is edited.
- Offline: no internet credentials -> fake-provider contract tests run and pass; mark real integrations unverified.
- Policy: blocked terms/free-tier abuse never selected; no automated account rotation.

## Explicit anti-goals (until revenue evidence)

Do not build a new universal proxy from scratch, rewrite the React UI, spin up five microservices, add new job scheduler, auto-publish YouTube videos, route user data to every gateway by default, or treat a textual LLM `/v1/chat/completions` as a video job API.

**Approval gate:** Before writing implementation for G1, owner selects a monthly max spend and permits which providers/regions may receive original scripts or character reference assets. Defaults = no paid calls, no external prompt/image disclosures unless explicitly enabled.
