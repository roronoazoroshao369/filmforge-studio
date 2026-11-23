# Provider Gateway Evaluation — OmniRoute / OmniRouter / alternatives

**2026-11-23 research snapshot; not executed locally.** These similar names are **different products**. The owner said “ommirouter” without a canonical URL; therefore no single external provider is irrevocably selected. FilmForge's internal contract must remain gateway-agnostic.

## Candidate shortlist

| Candidate | Verification / role | Verdict |
|---|---|---|
| [cheaper-inference/OmniRoute](https://github.com/cheaper-inference/OmniRoute), `release/v3.8.55` at `5ffa68e835442a12ed1204a2eebf4076c298aecb` | MIT license file verified, large model/provider catalog; docs claim OpenAI-compatible text and some image/audio/video endpoints | **First external gateway to run bounded, local pilot**; audit actual video job response/polling behavior and permitted credential methods |
| [omnilabs-ai/OmniRouter](https://github.com/omnilabs-ai/OmniRouter) `b0a8fce9f90690d477db882de4366773357ded16` | Apache-2.0; different router focused on evaluating/compiling routing policies, earlier version has text/image model API | Compare policy ideas; not assumed drop-in media API |
| [OpenRouter](https://openrouter.ai/) | Commercial aggregated provider API; official [free models](https://openrouter.ai/collections/free-models) and [model catalog](https://openrouter.ai/models) | Candidate **text** route; some output modalities available; no claim every free model can generate video |
| [BerriAI/litellm](https://github.com/BerriAI/litellm) `6a6c90aab82c6771cf65efa52ba628357b6639f2` | Proxy SDK/gateway with retries, health routing and budget controls | Compare gateway API and licensing (GitHub reports NOASSERTION; **license audit required**); optional not mandatory |
| **Native existing Jellyfish adapters** | OpenAI, Volcengine, Vidu, Kling; model metadata and per-category base URL present in repo | **Keep as baseline**, especially non-compatible async media and polling |
| **Local inference** | faster-whisper for ASR; optional ComfyUI via API if GPU/weights/rights permit | Low cloud spend but not zero operating cost; integrate only when useful |

## What we know / what we do NOT know

- OmniRoute's README/documentation advertises one endpoint across many providers, optional free tiers, image/audio and some video paths. **Do not equate claims with verified installed behavior.**
- At least some documented video routes are specific (ComfyUI/SD WebUI or vendor-specific schemas). Their async semantics may not match Jellyfish. Need exact request/response smoke plus polling/cancel tests.
- “150+ free providers” marketing claim is **not** verified usable, commercially licensed film-generation capacity. Filter each model/account and permitted output rights independently.
- OpenRouter `:free` offerings emphasize language/reasoning and some multimodal **inputs**. A model accepting video inputs for analysis does **not** generate finished video. Check output modality explicitly.
- Routing all video through an external gateway may add a second failure/privacy point, degrade source provenance and remove access to vendor-specific features. Keep vendor-direct escape hatch.

## Evaluation scorecard (ticket 55)

For each candidate measure/provide evidence:
1. Local startup, maintenance and auth stability; exact tested version/commit.
2. Endpoint compatibility **by modality**: text, image, video, speech, transcription; async create/poll/result/cancel.
3. Correct preservation of model-specific options (frames, audio, aspect, duration, input refs).
4. Commercial rights, quota, prices, key/OAuth terms, privacy/data retention and region.
5. Healthcheck, 429 rate limiting, bounded backoff, routing reason logs, provider pinning.
6. Full economics: gateway fees + provider price/credits + local compute + editing time.
7. Exit strategy: swap back to native provider adapter and re-open prior Take/Cut and task history.
8. License & supply-chain dependencies; vulnerability checks; avoid copying entire gateway source.

Result: `ADOPT FOR TEXT ONLY` / `ADOPT FOR VERIFIED MEDIA ENDPOINTS` / `DIRECT ONLY` / `REJECT`, with evidence.

## Official references

- [OmniRoute GitHub](https://github.com/cheaper-inference/OmniRoute), [OmniRoute provider reference](https://github.com/cheaper-inference/OmniRoute/blob/release/v3.8.55/docs/reference/PROVIDER_REFERENCE.md).
- [LiteLLM retries/fallbacks](https://docs.litellm.ai/docs/router/learn/reliability), [LiteLLM budget caveats](https://docs.litellm.ai/docs/proxy/users).
- [OpenRouter free collection](https://openrouter.ai/collections/free-models), [OpenRouter support](https://openrouter.ai/support).
- [Omnilabs OmniRouter](https://github.com/omnilabs-ai/OmniRouter).

**Review note:** Don't use personal consumer ChatGPT/Claude/Gemini app subscriptions as an inferred API entitlement. Third-party OAuth or “free proxy” access must comply with provider's explicit API/content/commercial terms.
