# Creator-First Strategy — own channels, own IP, own career

**Status:** approved strategic intent, implementation and income unproven. Owner makes creative and spending decisions; FilmForge is a personal production tool, not a customer-facing app.

## Product thesis

Instead of “make 1000 videos automatically”, optimize for **distinct stories released sustainably** and a transition from discovery Shorts to recurring original series. Let audiences discover the universe before spending months coding the universe engine.

## Solo creator operating system

A small repeatable cycle (not an upload bot):
1. **Ideas** — collect original ideas; choose one scene conflict and target feeling.
2. **Script** — hook, promise, turn, consequence/payoff, optional next-episode question. Author signs off.
3. **Style bible lite** — original world rules, protagonist, costume reference, color palette, reference rights. Keep stable across releases.
4. **Storyboard** — shot list and references, approved before costly generations.
5. **Media** — existing Jellyfish provider and local/commercial tools; select takes, no blind retries.
6. **Editorial** — subtitles, audio, pacing, aspect safe zone, title/thumbnail/description.
7. **Release gate** — owner checks original rights, music, voices, factual/deceptive implications and GenAI disclosure; manual upload.
8. **Analytics** — owner exports only own metrics from YouTube Studio; analyze cohort by publish date and format.
9. **Learn** — document one real change per video and update hypothesis, not secretly change ten variables.

## Suggested content experiment (not a revenue forecast)

**Four-week / 8–12 distinct uploads.** Use one IP universe and test three different storytelling approaches, not three unrelated genres:
- “một quyết định khó” micro-drama with payoff,
- “chiêu thức/pháp bảo” spectacle with character consequence,
- “bí ẩn/đột phá” serial hook with coherent plot.

A simple editorial checklist: Is there a subject? A visible action? A choice/stake? An outcome? Clear, original images/sound? Would a viewer understand without reading the prompt? Avoid fake sensationalism and recycled templates.

**Funnel:** Short teaser → 3–10-minute original story → later 2+ episode arc → eventually xianxia season. Do not build 3D assets for every one-off test; create reusable assets only for returning characters. One clear channel promise beats multiple unrelated channels.

## Creator analytics contract

Per published video: `video_id`, `channel_id`, `release_time` (UTC), `format`, `duration_seconds`, `experiment_id`, `topic`, `story_arc`, `hook_variant`, `production_minutes`, `provider_spend`, `asset_rights`, `script_version`, `edit_manifest_hash`, `publish_url`, `data_source`, `snapshot_at`.

Per metric snapshot, **only if available**: `impressions` / `shown_in_feed`, `views`, `engaged_views`, `viewed_vs_swiped`, `avg_view_duration`, `avg_percentage_viewed`, `returning_viewers`, `watch_hours`, `subscriber_delta`, `realized_revenue`.

Reporting:
- Acknowledge delayed/finalized analytics and metric definitions.
- Normalize by release age (48h/7d), compare within same format/length and distinguish impressions from retention.
- Track quality comments and recurring-viewer signals, but don't use small samples to assert cause.
- Never train on or expose private viewers' details without consent; aggregated channel data suffices.

## Personal finance safety

Log **real** costs for each video: provider submissions/retries/rejected outputs, sound, software, infrastructure, asset rights and manual editing time. Record revenue only from verified payouts/statements; before eligibility classify income as “not available”, do not hallucinate a Shorts RPM. Calculate cash burn and labor burden. Owner sets a maximum monthly experiment budget and a maximum sustainable weekly workload *before* subscribing to models/cloud.

Suggested decision rule: keep the process if it is enjoyable, rights-safe and showing credible viewer retention improvement within a budget the owner can afford **even with zero revenue**; adjust format if retention is weak; pause spend when costs or life commitments exceed the agreed cap. There is no automatic “quit career” recommendation based on one viral video.

## Growth is not the same as automatic monetization

As of 2026-11-23, Google official policy lists Vietnam in expanded YPP locations. Existing ads thresholds may differ for channels already eligible. On 2027-02-01, new YPP applicants for ads/Premium need 1k subs plus 8k watch hours/year **or** 20M qualified Shorts views/90 days; Shorts Creator Pool payouts require 10M qualified views/90 days each payout period. The earlier expanded/fan-funding tier at 500 subs remains. Current rules must be rechecked at monetization time; see [policy sources](policy-sources.md).

## Long-term creative assets to preserve from day 1

The film domain spine stays `project → episode/source → story scene → approved shot plan → task → take → adopted cut → export`. Keep a lightweight `Original IP Bible` and a file manifest linking voice, music, visual assets and rights. Preserve provenance before making a complex lore/event database. This is how shorts can grow into a series rather than becoming disposable content.

## Boundaries: this is NOT a product business

No SaaS plans, other creators' multi-tenant workspaces, client CRM, invoices for client video jobs, API product pricing, app marketplace or content farm. Monetization from *your own content* may later include platform ads/Premium, eligible audience memberships and collaborations/licensing of original IP; those do not make FilmForge a software product for sale.

**This file and the updated roadmap override the revenue-first B2B/short-only possibilities discussed in earlier historical handoff documents.**
