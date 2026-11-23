# FilmForge Studio — Creator-First Final Roadmap

**Decision date:** 2026-11-23  
**Approved product owner strategy:** **A — build films for personal creator-owned channels and original IP; never sell FilmForge software or accept client video production as the core business.**  
**Status:** roadmap/planning only; features not implemented. **Git branch:** `main` only. **Task status:** `.scratch/filmforge-studio/issues/`, per `docs/agents/triage-labels.md`.

## 0. The reason this product exists

FilmForge is a career-long independent filmmaking tool to create original animation, especially xianxia/fantasy. **Short video funds long video, but only when measurable audience and economics justify reinvestment.** Starting position: a solo creator with unknown channel performance, budget, hardware, and available time. Do not assume YouTube revenue or guaranteed virality.

**First customer = the creator (owner), first output = original videos published on owned channels, first moat = characters, stories, reusable film assets and an owned audience relationship.**

Success has three mutually reinforcing dimensions:
1. **Art:** original story/characters and an increasing body of IP under clear rights.
2. **Audience:** evidence of people choosing to watch and returning, not raw generated-video volume.
3. **Sustainability:** controllable cost and time; protect personal runway even when platform revenue is zero.

No B2B/client dashboard, SaaS tenancy, billing/payments, subscription plans, marketplace or auto-posting farm in the critical path.

## 1. Portfolio and distribution

**Primary:** one coherent original fantasy/xianxia universe, one flagship YouTube channel. Avoid launching five unrelated channels initially.

- **Discovery Shorts:** ~20–90 seconds: character reveal, duel, consequence, mystery, moral conflict or cliffhanger; narrative must be satisfying and different each time.
- **Narrative episodes:** initially ~3–10 minutes on the same channel, with actual arc, sound and editing.
- **Collections/compilations:** only when thoughtfully edited to add value, not duplicate reuploads.
- **Cross-post:** TikTok/other channels only after rights and regional feature eligibility are checked; do not assume their creator payouts exist in Vietnam.
- **Revenue:** YouTube Ads/Premium after eligibility; eligible fan funding and potential sponsorship/licensing of own IP as secondary options, not sold software/services.

**No empty template spam.** YouTube reviews overall channel originality, meaningful variation and creative value. AI assistance can be used, but each work must reflect a real story/editorial choice. See [policy source register](policy-sources.md).

## 2. Track ordering

M0 (existing repo baseline) and C0 (creator/market validation outside software) proceed **in parallel**. If a creator experiment can be done manually with existing tools, do **not** wait for a new FilmForge feature.

| Track | Goal/output | Evidence-based exit gate | Tickets |
|---|---|---|---|
| **C0: Creator validation** | Original universe, audience hypothesis, rights checklist; 8–12 manually produced/published experiments over ≥4 weeks | Real channel analytics, 48h/7d review by format, documented cost/time, editorial review; choose one content lane or pivot deliberately | **36–40** |
| **M0: Jellyfish foundation** | Reproducible FastAPI/React/worker baseline, test and license audit | Real commands/logs, Go/No-Go decision (not merely source review) | **01–05** |
| **C1: Creator Short Studio** | Shot-level story → reference → render → voice/captions → 9:16 export + metadata | 10 accepted videos / repeatable source manifest / 1-shot reshoot; genuine tested output, not mock | **41–47** |
| **C2: Owned-channel feedback loop** | Manual analytics import, measured experiments, short→longform bridge, mini-series light canon | Evidence from published work; repeat viewers or watch time improve relative to own baseline; financially safe plan | **48–53** |
| **M1/M2: Film-grade foundations** | Existing FilmForge tasks for canon, asset registry, take/cut and 60–90s film | Activate **after** C1/C2 proves creative workflow and needs deeper continuity; re-triage scope | **06–13, 16–18 (deferred); 14–15 promoted G2** |
| **M3: Animation pilot** | Blender/rig/scene bridge, repeatable 3–5min animation | Real reusable asset/scene provenance and approved cut | **19–23 (deferred)** |
| **M4: Cross-episode** | Strong World State Engine and 2-episode continuity | Two episodes, flashbacks/retcon work with pinned assets | **24–27 (deferred)** |
| **M5: Scale** | 3–10 episodes, recovery, distributed scheduler decision | Sustained production economics, backup restore, measured bottleneck | **28–31 (deferred)** |
| **M6: Feature film** | OTIO, CGI/VFX, color/audio/rights, feature-film preproduction | Technical conform of film sequence; **not** a claim that Hollywood-quality feature is achieved | **32–35 (deferred)** |

**IMPORTANT:** Original ticket IDs 06–35 are preserved for historical continuity, not abandoned or silently reordered. Their status remains triage and Progress remains not-started. Future M1–M6 sequencing is conditional; creator tasks 36–53 take priority after M0, even though their numeric IDs are higher.

## 2A. New priority: free-first multi-provider API routing (G0–G3)

**Owner direction:** Use multiple model/provider APIs, optionally route through a **single external endpoint** (OmniRoute candidate) to reduce cost. “Free” requires validated commercial rights, API entitlement, quota and quality. **Do not** assume one router generates text, image, video and speech with identical semantics. This is a **proposed architecture**, not a shipped feature.

**Decision:** FilmForge keeps a **replaceable internal routing policy** + existing vendor-direct adapters. OmniRoute is a configurable outside gateway (first evaluated for script/text) rather than FilmForge's only transport. Capability preflight, free/paid policy, budgets and sticky async job routing stay **inside FilmForge**. Implementation must build on Jellyfish's ProviderRegistry/base URL/FrozenGenerationConfig/TaskService; don't rebuild the task worker.

| Milestone | Goal and smallest useful output | Exit gate | IDs / parallelism |
|---|---|---|---|
| **G0 — Gateway due diligence** | Audit current provider code; compare OmniRoute / OmniRouter / LiteLLM / OpenRouter / direct; choose legitimate free-first pilot | Tested matrix by modality, rights, terms, privacy, license, URL and owner approval; not marketing model counts | **54–55** after technical 03/04 |
| **G1 — Text router first** | Typed capabilities, commercial free eligibility, deterministic policy dry-run, **one** gateway text endpoint with direct fallback | Offline RED/GREEN tests; no surprise paid call; text+script routing demo; credentials redacted; gateway replaceable | **56–59** |
| **G2 — Safe image/video routing** | Add only verified image/video endpoints; async route pinned from submit through poll/output; cost caps and route-preview UI | No unsupported model call; paid timeout does not double-submit; free-only never falls back to paid; human approves spend | **promoted 14–15, new 60–63** |
| **G3 — Real benchmark / local option** | Assess faster-whisper/ComfyUI local workers and measure direct vs gateway outcomes | Proven real API (if owner authorized), quality/cost/rights/latency report, rollback path. No real-call evidence = not verified | **64–65** |

**Execution order:** C0 creator experiment **36–40** and M0 baseline **01–05** can proceed independently. After baseline 03/04, G0/G1 run alongside C1 short-video workflow (41–47); **do not block publishing an original short because a universal gateway is incomplete**. G2 only after G1 test evidence and human budget approval. G3 optional before C2 expansion. Series 06–13 and 16–35 remain long-horizon; **14 and 15 explicitly promoted**.

**Route scoring (hard constraints first):** verified commercial rights → supported modality & precise features → enabled legitimate API quota → privacy/region → free/local first if meets artistic quality → cost estimate and owner budget approval → health/latency → explicit route manifest. A provider that can **analyze** a video is not necessarily capable of **generating** one. Unknown price != free. Free cloud API credits are not perpetual and do not authorize multi-account evasion.

**Failure policy:** Before submit, alternatives can be re-selected within owner-defined allowlist. After remote create may have occurred, record uncertain outcome; **no blind paid retry/fallback**. Once job ID exists, poll the **same gateway/provider/account**, not another endpoint. Existing Jellyfish TaskService remains sole task writer and single coordinator unless future approved ADR.

**Measures:** approved output per true total cost, cost of rejected takes, free-tier quota spent, route pass rate, unsupported preflight blocks, unknown paid outcomes, duplicated paid jobs (target zero), 9:16 video acceptance, manual quality and rights signoff.

**Detailed contracts:** [routing architecture](provider-routing-architecture.md), [gateway evaluation](provider-gateway-evaluation.md), [implementation plan](provider-implementation-plan.md), [new-chat handoff](new-chat-handoff.md).

## 3. C0 — Channel / concept validation

**Goal:** discover which original xianxia narrative format is worth making, before building costly automation.

- One creator-owned IP hypothesis: world premise, protagonist, character silhouettes, recurring stakes, visual art direction, music/voice constraints.
- Test **three creative hypotheses** with 8–12 total original uploads across ≥4 weeks. Suggested categories: character revelation, a self-contained micro-story, and serial mystery/cliffhanger. Do not post near-duplicates.
- Keep each release manifest: script version, source footage rights, asset/model version, production minutes, direct cost, editorial QA, post URL/date.
- Check at 48h and 7d (allow time-zone and release-age normalization); record actual impressions/shown-in-feed, viewed vs swiped, average view duration, average percentage viewed, followers gained and returning viewers when available. Never fabricate unavailable metrics.
- Decide **continue / change hook / change format / pause**. 8–12 uploads cannot prove causality or guarantee a revenue model: treat results as directional evidence, not statistical certainty.
- No requirement for YPP or revenue to call C0 a learning success. No paid tooling subscriptions or public releases without owner approval and rights check.

**Exit evidence:** ≥8 published distinct original videos, dataset, 3 structured format tests, one retrospective and explicit creator approval. If platform policy blocks content, review rights/originality instead of seeking growth hacks.

## 4. M0 — Reproducible foundation

Tickets 01–05 remain unchanged. Execute as a parallel tech workstream. Do not add YouTube upload automations into Jellyfish before current backend task/FFmpeg/scene capabilities are understood. Preserve single `TaskService` writer and one coordinator per database.

## 5. C1 — The actual MVP

**Input:** original short script or scene from a pinned world/character *lite bible* (no full 300-episode event store required).

**Vertical flow:** idea → hook/storyboard → human scene approval → visual references/takes → voice and safe sound/music → captions → vertical (and optional landscape) edit → preview/technical QA → publish package → **owner manually publishes**.

Requirements:
- **Story beats and hook:** first seconds communicate intention/conflict; not defaulted to cliché AI slop.
- **Reusable references:** one character identity, outfit/color and voice reference pinned per video; avoid building complex 3D rig before needed.
- **Take selection:** 1-shot reshoot with history; retain exact prompt/model/reference/cost and input/output file IDs. Reuse Jellyfish `TaskService`/Take/cut contracts.
- **Editing and captions:** audio intelligibility, correct Vietnamese subtitles and timing, 9:16 safe title areas, FPS and loudness preflight; optional 16:9 alternative if footage permits.
- **Human release gate:** originality, rights, AI disclosure if applicable, copyright claims, metadata/title, policy checklist; never auto-post by default.
- **Provider choice:** **only one actual paid provider in first end-to-end integration**, second only after costs and quality justify it. Fake provider tests prove contracts, not external service reliability.
- **Cost accounting:** per accepted output, including generation attempts, rejected takes, voice, render/cloud, and time; €/$/VND entered with source FX/date if conversion used.

**Exit evidence:** repeatable 10 approved original shorts of distinct substance, 1-shot selective reshoot, publishable format, source manifests, no rights red flags, measured production minutes / accepted minute. Published releases remain owner-controlled.

## 6. C2 — Independent creator learning/monetization loop

- Import creator-owned YouTube Studio analytics from manual CSV first (and only owner-provided data). Do not scrape or assume private analytics are accessible.
- Review each 48h and 7d cohort; content age, format, duration and audience-source differ, so do not compare Shorts and long-form on raw views alone.
- Analyze first-seconds hook/retention and viewers' movement to episodes. Preserve baseline and sample size. Split tests are editorial proposals, not causal proof absent randomization.
- Publish a **3–10 minute original narrative** with meaningful plot, then create a teaser Shorts funnel using same IP. No mere reupload compilation.
- Track revenue **only when actually paid/verified in account**. Before eligibility, report revenue as 0 / unverified, not estimated RPM. Calculate contribution profit = realized platform and partnership earnings − provider spend − tool fees − hosting − music/asset licenses − other direct costs; report creator labor separately at an explicit opportunity cost.
- Every 4-week cycle: continue/pivot/stop-loss; avoid platform dependence and personal burnout. Future animation/Blender investment requires consistent creative performance *and* sustainable runway, not an arbitrary monthly view count.

**Exit evidence:** 10+ releases and one bridge episode, retrospective with metrics, manual editorial verdict, consent/rights audit, and written personal runway decision. Do not treat C2 as guaranteed positive cash flow.

## 7. Production expansion criteria (career horizon)

**Xianxia long-running series** remains the core creative ambition, but advanced World State / rigs / render farms start **when the same characters/story need it**. One premium short can prove composition, not 300-episode durability. Move from 2–3 linked shorts to a 3–10 minute episode, then a multi-episode pilot, then 3–10 episodes, then scale. At every gate, require proven audience interest, controlled costs and non-destructive reusable assets.

**Hollywood-style feature film** remains a distant cinematic research goal. Need sound design, acting, continuity, editorial, licensing and VFX quality; software alone never guarantees it.

## 8. Never compromise

- No misleading “full autopilot earnings” claims; no ads/sponsor income assumed.
- No fake view/engagement automation, content scraping or repost without rights.
- No copying web novels, movie footage, voices, music, character likenesses without verified permission.
- YouTube **2027** planned YPP ads/Premium threshold makes shorts-only economics especially fragile; see official policy references.
- No code merger based on GitHub stars alone; audit dependency and media/model licenses separately.
- No money spent on provider keys, cloud GPU or subscriptions without owner-defined budget cap.
- Protect personal finances: avoid committing essential living funds to unproven video generation experiments.

## 9. Active queue / governance

**Now:** C0 tickets **36–40** (creator experiments) parallel with M0 tickets **01–05** (technical baseline). After 03/04, **G0 54–55** and **G1 56–59** become active; the router must not delay creative learning.  
**Next:** C1 tickets **41–47** after GO and content hypotheses, in parallel with G1. G2 = **14–15 + 60–63** after gates, G3 = **64–65** optional; then C2 tickets **48–53** with realized data.  
**Later:** resume **06–13, 16–35** individually only on explicit evidence and creator sign-off. Tasks **14–15** are specifically promoted to G2.

Read [creator strategy](creator-first.md), [expert council](creator-board-review.md), [technical radar](creator-tech-radar.md), [policy sources](policy-sources.md), [task plan](../../tasks/plan.md). Status: `Status` is triage; `Progress` is execution; completion requires exact commit SHA + tests + actual content artifact/reviewer evidence.
