# 55 — Evaluate OmniRoute versus direct and alternative gateways

Status: ready-for-agent
Progress: not-started
Type: task
Phase: G0
Priority: P0
Blocked by: 54
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
