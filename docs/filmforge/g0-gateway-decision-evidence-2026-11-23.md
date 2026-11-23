# G0 / Task 55 — gateway decision evidence (2026-11-23)

> **Status: preliminary research; OWNER SIGN-OFF PENDING.** The creator has authorized continued engineering through a project-bound MCP, not provider spend, account/OAuth access, original script disclosure or a production gateway cutover. No gateway package has been installed or invoked. No live paid/free provider request is claimed.

## Strict comparison: actual need vs advertised compatibility

| Route | Verified scope of evidence | Local pilot / API calls | Risk and conditional recommendation |
| --- | --- | --- | --- |
| **Native direct Jellyfish** | Actual checked source `backend/app/core/integrations/media_provider.py`, `provider_resolver.py`, provider bootstrap and TaskService; offline 65-case regression | **65 passed** on current FilmForgeStudio MCP, no external calls | **KEEP / baseline.** Four native media adapters; direct text runtime, existing accepted jobs. Preserve single TaskService writer and ability to bypass any gateway. |
| **cheaper-inference/OmniRoute** (`release/v3.8.55`, prior evaluation pinned commit `5ffa68e835442a12ed1204a2eebf4076c298aecb`) | Official GitHub [project](https://github.com/cheaper-inference/OmniRoute), [v3.8.55 README](https://github.com/cheaper-inference/OmniRoute/blob/release/v3.8.55/README.md), [free-tier terms notes](https://github.com/cheaper-inference/OmniRoute/blob/release/v3.8.55/docs/reference/FREE_TIERS.md), [environment reference](https://github.com/cheaper-inference/OmniRoute/blob/release/v3.8.55/docs/reference/ENVIRONMENT.md) | **NOT RUN**, no installed gateway, no key; advertised OpenAI-compatible chat API is not a passed wire test | **CONDITIONAL TEXT-ONLY PILOT**, behind explicit owner provider/region/privacy/spend decisions and pinned supply-chain verification. Reject assumption that cataloged free models all allow commercial video. |
| **omnilabs-ai/OmniRouter** | [GitHub project](https://github.com/omnilabs-ai/OmniRouter); a distinct codebase, documentation describing LLM/chat and image interfaces, not FilmForge asynchronous video guarantees | **NOT RUN** | **REFERENCE ONLY** pending proven production compatibility; cannot replace Jellyfish native async media. |
| **OpenRouter** | [Official free model collection](https://openrouter.ai/collections/free-models), [model catalog](https://openrouter.ai/models), [terms](https://openrouter.ai/terms) | **NOT RUN**; no user account/API entitlement verified | **OPTIONAL TEXT CANDIDATE**, never assume `:free` means suitable for monetized original IP, unlimited quotas, output-video support or data privacy. |
| **LiteLLM** | [Official docs](https://docs.litellm.ai/docs/router/learn/reliability), [proxy budget docs](https://docs.litellm.ai/docs/proxy/users), [source](https://github.com/BerriAI/litellm) | **NOT RUN**; deployment/license/dependency audit not completed | **HOLD** as extra layer not presently needed. Router retry/fallback configuration could cause duplicate external media requests if mistaken for idempotent text handling. |
| **Self-hosted/local** | Conceptual options faster-whisper ASR, optional ComfyUI; no machine GPU, model weight license or throughput evidence | **NOT RUN** | **DEFER** until hardware/rights/quality measurement; cloud API spend $0 does not imply zero local cost. |

## New caution from current official OmniRoute docs

1. `FREE_TIERS.md` at `release/v3.8.55` says some provider entries flagged `tos` remain available for default routing/combo/fallback and the flag can be informational only. **FilmForge must enforce its own verified commercial rights/ToS eligibility**, not consume OmniRoute labels uncritically.
2. `ENVIRONMENT.md` at the evaluated branch documents an **emergency fallback** setting (`OMNIROUTE_EMERGENCY_FALLBACK`) with a documented enabled default. Before any test with original content, pin its configuration and explicitly disable all gateway fallback/routing paths not on the owner-reviewed allowlist. “Fallback to free” can be unlawful, cross-border, privacy-incompatible or simply outside quota.
3. Large free-tier/token numbers aggregate different accounts/providers/pools; they are marketing/catalog evidence, not an entitlement for this creator/account. A vision/video *input* modality or `videos` route entry is not proof of commercially permitted video *generation*, remote-ID polling, cancel, reference frames or duration.
4. Code license of an open gateway (MIT/Apache etc.) is separate from **each model's weights license, API provider terms, output commercialization and privacy conditions**. Neither license category by itself grants unlimited model access or monetization rights.
5. External gateway routes add another data processor for original stories, character references and video assets. Default policy: **no external content sent** without per-provider/region approval, and **no paid calls** without a numeric cap and explicit approval. Native direct path remains available.

## Modality / async acceptance checklist — NOT YET VERIFIED

| Capability | Native current adapter | OmniRoute text candidate | Gateway image | Gateway video | Gateway TTS/ASR |
| --- | --- | --- | --- | --- | --- |
| Text chat streaming/timeout | Source plus fixture verified | Docs suggest compatibility, **needs controlled mock wire + owner-approved live call** | n/a | n/a | n/a |
| Image creation, references, editing | Native vendor-specific paths source/test verified | n/a | **unknown; verify actual model-specific API** | n/a | n/a |
| Video creation + async job ID | Native vendor-specific paths source/test verified | n/a | n/a | **unknown; must verify submit ID/poll/result/cancel, sticky route** | n/a |
| Commercial rights / regional API quota | **unknown per account** | **unknown per account** | **unknown** | **unknown** | **unknown** |
| Privacy/retention & fallback allowlist | Direct endpoints known; account terms unverified | **unverified** | **unverified** | **unverified** | **unverified** |
| Cost/quota actual availability | Account-dependent, not measured | **unknown**, cannot price $0 | **unknown** | **unknown** | **unknown** |

## Owner decision gate before Task 55 can be `done` / G1 begins

Required **recorded** answers (no answer is implied by requesting implementation):
- **Deployment**: Keep native/direct default and allow **OmniRoute local text-only pilot** as optional? Or direct-only / OpenRouter / other? Specific software release/commit and license review if chosen.
- **Original IP data recipients**: Which vendor accounts, data regions and retention/training policies may receive original scripts? Which may receive reference images/voice samples? **None** until explicit allowlist.
- **Cost**: numeric per-job and monthly spend cap (can be `$0`), currency, prepaid credits vs paid fallback; paid fallback **off** by default.
- **Provider rights**: proof of personal account API access, current commercial output license, model-region eligibility and quota documentation. Unknown => no route.
- **Acceptance**: sign off on fallback disabled except a reviewed, capability/rights-matched allowlist, no automatic replay after ambiguous media POST, and direct escape hatch.

## Evaluation verdict

**RECOMMENDATION, NOT OWNER APPROVAL**: `KEEP NATIVE / CONDITIONAL TEXT-ONLY LOCAL GATEWAY PILOT`. No external media routing. Do not add OmniRoute as a mandatory runtime dependency. No account-bound real request without owner authorization. Owner sign-off remains the blocker for G1 Task 56 per `docs/filmforge/provider-routing-architecture.md` approval gate and Task 55 acceptance criteria.

**Verification transparency:** existing source-level provider/media/task mock tests passed (65/65) via FilmForgeStudio MCP at initial source SHA `d1fad0c...`. Online documentation was compared 2026-11-23. No OmniRoute Docker process, HTTP API smoke, key connection or provider-specific ToS evidence was obtained; those remain **UNVERIFIED**.

## Offline text transport characterization — implemented (not a real gateway)

`backend/tests/services/test_text_gateway_contract.py` adds three fixture tests: configurable compatible-text `/v1/chat/completions` endpoint, explicit zero-retry on mocked HTTP 503, and rejected disabled/text-only-media configurations. Results: **3 passed in 1.67s** with Python 3.12 on the new FilmForgeStudio MCP workspace. No external HTTP, no user model credentials or original script; this is evidence that the **existing** ChatOpenAI text interface can target a compatible endpoint, **not** evidence OmniRoute actually interoperates or is legally entitled. Commercial/privacy approval and bounded live smoke remain unperformed.
