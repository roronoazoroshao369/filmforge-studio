# 68 — Public synthetic project preview (S02)

Status: ready-for-agent
Progress: in-progress
Type: task
Phase: C1 / Development fixture
Priority: P1
Blocked by: 41
Owner: unassigned
Target: main

## Goal
Explicit read-only DEMO of a synthetic project, scene/shot, asset and candidate Take. No production data, provider calls, admin exposure, real project mutation or export feature.

## Acceptance criteria
- [x] Populated synthetic project/scene/asset/Take with stable IDs and visible DEMO label on desktop/mobile; no owner data.
- [x] Fixture-only isolated route or bundled data; no requests to real admin/provider APIs; protected public API remains 403. Original/generated media only.
- [x] RED/GREEN frontend test covers label, populated relationships, missing/error handling and no real admin/provider requests. Run frontend lint/unit/typecheck/build; inspect exact scripts first.
- [ ] Verify approved public preview on desktop/mobile, screenshots, no uncaught page errors or horizontal overflow, HTTP/content-type and deployed artifact identity. Keep partial if deploy unavailable. No real generation, schema, timeline/export or owner gate changes.

## Work plan
Inspect App.tsx, ProjectLobby, project entry/directing/canvas and existing fixture/browser tests. Select smallest explicit read-only route, separate from normal data path. Test first, implement, regression, review, approved preview verification, audit/handoff, commit/push. No provider spend.

## Comments
- 2026-11-24 — scoped S02 following #41 audit per session-plan.md; safe synthetic demo only.

- 2026-11-24 — S02 local deliverable: standalone /demo and /demo/:projectId? outside MainLayout; no real API or mutation. Stable synthetic project/scene/shot/asset/Take IDs; locally generated reference PNG and 2-second H.264 fixture; explicit missing-project, missing-image and missing-video states. Browser RED exit 1 missing heading, GREEN exit 0. Additional relation assertion initially failed due data-asset-id reused as foreign key; separated data-reference-asset-id, rebuilt, final built-browser PASS. Desktop 1366x768 and mobile 390x844, zero forbidden requests/page errors/overflow, canonical and missing-project routes, both media error paths. Screenshots front/test-results/s02-built-final/demo-1366.png and demo-390.png (ignored, local evidence; no human visual signoff).
- Toolchain: frozen pnpm 9.15.9, 506 packages; Node 22 initial unit run timeout and ERR_UNKNOWN_FILE_EXTENSION in existing referenceSelection.ts test, corrected using CI Node 24.22.3 verified release SHA-256; no test assertion weakened. All 22 existing unit files executed in disjoint groups on Node 24: 72 (13 files), 28 (7 files), visualEvidence 36, visualReview 8+12 (all 6 top-level cases, 14 nested). Total 156 passed, 0 failed/skipped, all group exits 0. Initial full-suite timeouts not counted as pass. Lint baseline 16 existing/0 new, typecheck/build exit 0; browser manifest 169 cases. Existing warnings: Browserslist age, nested CSS, large bundle.
- Reproduce: cd front; corepack pnpm@9.15.9 install --frozen-lockfile; corepack pnpm@9.15.9 run lint:check; corepack pnpm@9.15.9 run typecheck; corepack pnpm@9.15.9 run build; node tests/filmforgeDemo.browser.mjs (dev), FILMFORGE_DEMO_BUILD=1 JELLYFISH_BROWSER_OUTPUT="$PWD/test-results/s02-recheck" node tests/filmforgeDemo.browser.mjs (built). Full unit suite command pnpm run test:unit with Node 24; split long visual suites by top-level cases if MCP timeout. No backend/provider runtime changed.
- Synthetic media generation (FFmpeg 8.1.3): ffmpeg -v error -f lavfi -i testsrc2=size=320x180:rate=25:duration=2 -c:v libx264 -pix_fmt yuv420p -movflags +faststart front/public/demo-media/fixture.mp4; ffmpeg -v error -i front/public/demo-media/fixture.mp4 -frames:v 1 front/public/demo-media/reference.png. Bundled bytes only; no third-party footage, no creative release. Built SHA-256 JS 1b6a1d074f07abf52cba029ac1e92dd644626339e52985de9e1a0440e453a815, CSS e856864e13c072eca4fefc4381113a3bf19f82be3735fd408b2f089896ce3cf7, MP4 c88c98e6c0a41956fd76416a52786b36da5f86cb0c4716e02082f2794443c149, PNG da065e2fedac0239495d616d54ba422b9400e10ed1fa9342caf380befed07718.
- PUBLIC DEPLOY NOT VERIFIED: curl / and /demo 200 text/html, public bundle index-oa07dzQ0.js differs from built index-XRfCylZA.js; public /demo-media/fixture.mp4 200 text/html (SPA fallback, not video). Protected API 403. urllib default UA returned 403 even for demo; curl confirms old public artifact. Both existing named user services inactive on current MCP host; no evidence current host serves public preview. No tunnel/DNS/ingress or live service changed. Keep in-progress; next use existing authorized deployment environment only, verify actual public bytes and browser.
