# 55 — Evaluate OmniRoute versus direct and alternative gateways

Status: ready-for-human
Progress: blocked
Type: task
Phase: G0
Priority: P0
Blocked by: None
Owner: unassigned
Target: main

## Goal / Deliverable
Compare cheaper-inference/OmniRoute pinned release, omnilabs OmniRouter, OpenRouter, LiteLLM and native Jellyfish. Verify exact endpoint by text/image/video/audio, license, permitted free/commercial use, privacy, quota and async polling.

## Acceptance criteria
- [ ] Signed evaluation matrix with validated requests/mock/real distinction, provider license, owner signoff on chosen text pilot; no assumption 150 free models = free video.
- [ ] Route and task provenance remain reproducible, rights-safe and creator-only.
- [ ] Security, provider ToS, real-vs-mock and budget limits disclosed; no unapproved paid request.
- [ ] Test/verification outputs or honest blocker documented, plus commit SHA and reviewer decision.

## Technical reference / likely files
- `docs/filmforge/provider-gateway-evaluation.md`
- `docs/development/design/research/`

## Execution plan
1. Read `AGENTS.md`, `CONSTRAINTS.md`, [router design](../../../docs/filmforge/provider-routing-architecture.md), [implementation plan](../../../docs/filmforge/provider-implementation-plan.md), and source/test code listed above.
2. Verify `Blocked by` and status; map exact existing source functions before choosing new identifiers. Write the precise task-local spec and test.
3. **RED**: create focused failing test for the specific accept criterion; execute and capture failure.
4. **GREEN**: smallest code change; run same focused test and negative route case. Do not turn off checks.
5. Run impacted pytest/pylint and frontend typecheck/build if applicable, inspect diff and secret leaks, commit on `main` with `[feat]`/`[test]`/`[docs]` subject.
6. Put exact commit and verification commands in Comments; set `Progress: done` only after evidence. External real requests need owner approval and max spend in advance.

## Critical failure modes
- Unknown or non-commercial "free" tier MUST NOT be chosen for creator monetization.
- Asynchronous media creation with unknown provider state MUST NOT auto-retry on another route.
- Polling/outputs must remain bound to the same actual provider/gateway as the accepted job.
- No key/token/signed URL in public logs or UI; privacy scope explicitly checked.

## Comments
- 2026-11-23 — Added for **Creator-First multi-provider API roadmap**. OmniRoute is a candidate gateway, not a committed dependency. **No code implemented or real provider test claimed**.
- 2026-11-23 — Gateway research/matrix prepared in `docs/filmforge/g0-gateway-decision-evidence-2026-11-23.md` after Task54 source audit. Candidate recommendation **native direct baseline, optional local OmniRoute text-only pilot** (NOT selected or signed). Web source comparison covers cheaper-inference/OmniRoute pinned release, distinct OmniRouter, OpenRouter, LiteLLM and local adapters. OmniRoute `FREE_TIERS.md` indicates ToS-flagged entries can still be routed; its documented emergency fallback needs disabling/allowlisting before original IP data is sent. No gateway container, account key, commercial-rights validation, external text/media request, or cost measurement was executed. Source-level offline provider suite: 65 passed / pylint 10/10 (Task54).
  - **Human blocker**: owner must choose provider/gateway+release, allowed providers/regions for original scripts/reference material, explicit monthly/per-job spend cap (can be USD 0), current commercial rights/API quota evidence and privacy/retention policy; then authorize bounded text-only gateway test. No signoff inferred from request to implement. Task55 acceptance incomplete; G1 Tasks56-59 remain blocked by unresolved 55 / architecture owner-approval gate. Do not mark done or test external gateway until verified.
- 2026-11-23 — Bổ sung **3 unit/contract tests offline** tại `backend/tests/services/test_text_gateway_contract.py`: (1) text OpenAI-compatible tùy chỉnh `base_url` chỉ POST một lần tới HTTP mock và nhận kết quả, (2) HTTP 503 với `max_retries=0` chỉ phát sinh một request và không fallback, (3) provider disabled và text-only provider bị từ chối khi yêu cầu video. `cd backend && uv run --frozen pytest -q tests/services/test_text_gateway_contract.py --tb=short` exit 0, **3 passed in 1.67s**. Đây là characterization của transport hiện có, **không** kết nối OmniRoute thực, không có secrets, không chứng minh gateway license/terms/budget. Owner signoff vẫn là blocker; ticket tiếp tục `Status: ready-for-human`, `Progress: blocked`.
- 2026-11-23 — Preliminary gateway evaluation, 3 offline text mock tests and handoff committed on `main`: `5edbd3cc033096e70ee95bc3cd29cd227ae897c0`. This does not constitute owner approval; `Progress: blocked` remains.
