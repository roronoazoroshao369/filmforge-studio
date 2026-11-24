# FilmForge — Context handoff hiện hành

**Ngày:** 2026-11-24. **S02 / #68:** local implementation and regression PASS; public deployment blocked/unverified. Baseline `e928e38600cf670214c23a9f37e315d0f4d82f3f`; find commit with `git log -1 -- docs/filmforge/session-handoff.md`.

- MCP working copy /home/mussa/Desktop/filmforge-studio/repo; intermittent connection failures, bounded retries. Baseline HEAD=origin/main=remote, clean, only main.
- [#68 evidence](../../.scratch/filmforge-studio/issues/68-public-synthetic-project-preview.md): route /demo outside MainLayout, stable linked synthetic entities, generated local MP4/PNG, read-only missing/error states. Source front/src/pages/FilmForgeDemoPage.tsx and App.tsx; registered browser test. No real API/data/paid calls or backend change.
- RED missing heading exit 1; GREEN dev and built exit 0. Final built desktop/mobile screenshots under front/test-results/s02-built-final; no forbidden requests, page errors or overflow. Node 24.22.3 (CI major 24), pnpm frozen 9.15.9. All 22 unit files via disjoint groups: 156 passed, no fail/skips, exit 0 each; initial Node 22 import error and MCP timeouts resolved without weakening tests. Lint baseline 0 new, typecheck/build PASS; existing build warnings retained. Manifest 169 cases. SHA-256 artifact hashes and commands in #68.
- Public /demo and / HTTP 200 HTML; public JS index-oa07dzQ0.js != new index-XRfCylZA.js; /demo-media/fixture.mp4 returns HTML instead of MP4. Protected API 403. Existing named preview services inactive on current host; do not create new tunnel, change DNS/ingress or expose admin. Local built proof is not public deploy. Keep #68 in-progress.
- Baseline audit 68 tickets, 7 done, 1 in-progress, 1 blocked, 59 not-started, eligible 66/68. After #68 progress update verify audit 7 done, 2 in-progress, 1 blocked, 58 not-started. Locale 3864 keys, 1188 different, 2676 equal, parity true; not percentage of product. M0 01–04 and #41/#54/#67 done; #05/#55 gates unchanged. Master/audio/export missing, creator evidence not verified, M1–M6 deferred.
- Next goal: #68 deployment continuation only on existing authorized preview host/service. Verify actual deployment path/permissions, build locked source, compare public JS/CSS/MP4/PNG bytes against local SHA, confirm correct content-type, run FILMFORGE_DEMO_ORIGIN=https://filmforge-preview.musashishao.tech node tests/filmforgeDemo.browser.mjs with zero forbidden calls/errors, confirm protected 403; then close #68. If same blocker persists, keep #68 in-progress and execute independent #66 Chapter localization slice (read ticket, AST/dynamic TASK_COPY, RED/GREEN, locale parity, browser and regression). Do not change owner gates or spend.
- Governance follow-up 2026-11-24 (baseline e9aebabf4f44fbece2dfff63ba3e68a601284131): owner requires full copy-ready New Chat master prompt at the end of every session, including partial/blocked; refresh persisted [master prompt](session-master-prompt.md) and handoff, commit/push, then emit full prompt in final report. See [rules](session-rules.md). No change to S02 delivery or next-goal ordering. Public smoke in governance follow-up: frontend 200 text/html, protected API 403; no runtime change.
- Rollback via reviewed revert of S02 changes only; no migrations. Preserve repo-local tool caches and ignored screenshots; no binaries except synthetic fixture media committed. No new provider cost.

---

## Prior S01 handoff (historical)

**Ngày:** 2026-11-24. **S01 continuation / #41:** technical audit done. Baseline `3dcb47f120398430597692cfe7c74d47bade27a7`; find containing commit via git log -1 -- docs/filmforge/session-handoff.md.

- Working copy /home/mussa/Desktop/filmforge-studio/repo; baseline HEAD=origin/main=remote, clean, only main. Intermittent MCP transport; verify state before retrying writes.
- [Audit and exact commands](short-film-path-audit.md): isolated uv 0.13.9, CPython 3.12.16, FFmpeg/ffprobe 8.1.3, checksums verified, locked 85 resolved/84 installed. First pytest exit 2 due relative paths; corrected absolute paths. Four scoped pytest suites **65 passed in 23.67s**, exit 0, zero skipped/fail. Synthetic reproduction exit 0; H.264 640x360 25fps 50 frames 2s. ASGI/SQLite fixture, no production DB/provider/live storage. No application code changes.
- #41 done within source/fixture audit; no final master export. [#68 S02](../../.scratch/filmforge-studio/issues/68-public-synthetic-project-preview.md) ready for agent after #41; downstream gates unchanged.
- Baseline audit exit 0: 67 tickets, 6 done, 2 in-progress, 1 blocked, 58 not-started; eligible 41/66. Measured after close/add (audit exit 0): 68 total, 7 done, 1 in-progress, 1 blocked, 59 not-started; eligible 66/68. Locale 3864 keys, 1188 different, 2676 equal, parity true. Counts not product readiness.
- M0 01–04 done, 05 pending; #54 done, #55 blocked; #66 active. C1 audit done, export/audio master absent; C0/C2 creator metrics unavailable; M1–M6 deferred. Prior full-app results remain historical. Public curl 200 text/html, protected API 403; no new runtime deployment or browser test.
- Next goal S02/#68: explicit read-only DEMO, populated project/scene/asset/Take relationships; no real admin/provider requests or mutations; RED/GREEN plus frontend lint/unit/typecheck/build; public browser desktop/mobile, no errors/overflow, HTTP/artifact identity, protected 403. Inspect actual source/test scripts first. Keep partial if deploy unavailable. No owner GO/schema/timeline/export changes.
- Rollback reviewed revert docs/tracker only. Keep isolated tool cache for subsequent sessions; no binaries committed. No extra branch observed.

---

## Prior S01 partial handoff (historical)

**Ngày:** 2026-11-24 (Asia/Ho_Chi_Minh). **S01 / #41:** partial — source audit + isolated real media proof. Baseline `91e6ace04fd5b7d3f760c5369690c3e0bd49d701`. Find commit containing this handoff via `git log -1 -- docs/filmforge/session-handoff.md`.

- New MCP working copy: `/home/mussa/Desktop/filmforge-studio/repo`, existing GitHub main cloned within allowed root; original /home/devops/vibe path outside current scope. Intermittent transport; bounded retries. Baseline HEAD=origin/main=remote, clean, only main.
- [Audit deliverable](short-film-path-audit.md): source/test map, exact blob synthetic media proof, proposed assembly contract. #41 in-progress, API fixture regression missing. No app changes.
- Baseline audit CLI exit 0: 67 tickets; 6 done, 1 in-progress, 1 blocked, 59 not-started; eligible 41/66. Locale 3864 keys, 1188 different, 2676 equal, parity true. Post-update CLI exit 0: 6 done, 2 in-progress, 1 blocked, 58 not-started; eligible 41/66; locale unchanged. Node script regression: 17 pass, 0 fail, 0 skipped, exit 0. Counts not product readiness.
- M0 01–04 done, 05 pending; #54 done, #55 blocked; #66 active. C1 master/export/audio not proven; C0/C2 actual creator analytics unavailable; M1–M6 deferred. No gate, spend or publication approval changed.
- Public curl exit 0: frontend 200 text/html, protected API 403. No browser/fixture regression or runtime deploy. Host missing uv/FFmpeg/ffprobe/venv; standalone helper proof only. Historical full app tests remain historical.
- Next goal: finish #41 before S02. Isolated locked backend env, real media tests, Take API fixture + retired export 404 + store isolation pass, exact commands in audit. Audit and commit verified changes, keep ticket open until criteria met. No paid calls or private data.
- Rollback: reviewed revert docs only; no migrations/runtime change. No extra branch observed; check ancestry before any cleanup.

---

## Prior S00 handoff (historical)

# FilmForge — Context handoff hiện hành

**Ngày:** 2026-11-24 (Asia/Ho_Chi_Minh). **Session S00:** #67, thiết lập quy trình xuyên phiên. **Baseline:** main `7f3b70d4f358b2f8b6a82d9ee632b7e5b08ba165`. Commit chứa handoff này tìm bằng `git log -1 -- docs/filmforge/session-handoff.md`; xác minh SHA mới bằng live Git, không lấy baseline làm HEAD hiện tại.

## 1. Kết quả và quyết định

- Quy tắc bắt buộc: [session-rules.md](session-rules.md); kế hoạch [session-plan.md](session-plan.md); prompt chat mới [session-master-prompt.md](session-master-prompt.md). AGENTS.md và docs index liên kết.
- Chủ sở hữu yêu cầu dev tự chủ, mỗi phiên một goal nhỏ, main-only, audit toàn dự án và handoff, public dev test. Duy trì public frontend/synthetic demo; không expose admin, secrets, private data, hoặc paid provider khi chưa được duyệt.
- #41 chỉ là audit source và synthetic fixture, không còn phụ thuộc #05/#40; các gate thực sự của downstream vẫn giữ nguyên.
- #67 hoàn thành phạm vi governance; #66 vẫn in-progress, #05 và #55 không bị ký thay owner.

## 2. Files và kiểm chứng

- scripts/filmforge-session-audit.mjs, scripts/filmforge-session-audit.test.mjs: read-only tracker/locale report. RED 3 failed (CLI missing), GREEN 3 pass. Full `node --test scripts/*.test.mjs`: 17 pass, 0 fail, exit 0. Node 24.21.0.
- AGENTS.md, docs/filmforge/{session-rules,session-plan,session-master-prompt,session-handoff,README,agent-execution,roadmap}.md, tasks/plan.md, tracker spec và tickets 41/67: vận hành và ordering.
- `node scripts/filmforge-session-audit.mjs`: xem kết quả cuối phiên bên dưới. CLI không thay test placeholder parity, full QA hoặc xác nhận trạng thái runtime.
- curl public frontend HTTP 200, admin GET /api/v1/studio/projects HTTP 403. Chỉ smoke HTTP trong session S00; không chạy lại live Playwright/full app tests do không thay runtime. Không gọi provider, không thay database, không phát sinh phí.
- Bằng chứng lịch sử từ #02/#66: backend full 1485 pass, 62 skipped; frontend lint/unit/typecheck/build và 5 browser suites PASS; public Playwright zh/vi/en switch, persistence và mobile PASS. Đây là kết quả phiên trước, không phải test mới S00.

## 3. Audit toàn dự án

| Stage | Tình trạng | Gap tiếp theo |
|---|---|---|
| M0 foundation | #01–04 done; #05 pending | Foundation product GO/ADR; CI main-only còn thiếu |
| UI localization #66 | In progress | 2,676 giá trị bằng en-US chưa phân loại đầy đủ; Chapter/Directing/Canvas QA còn thiếu |
| C1 short-film production | Source có project/chapter/scene/storyboard/canvas/Task/Take/Cut | #41 audit sẵn sàng; timeline/export/audio chưa chứng minh; old chapter composition retired |
| G0/G1/G2/G3 | #54 done; #55 blocked; phần còn lại chưa làm | Offline dry-run có thể đề xuất slice độc lập; live provider entitlement/rights/budget chưa có |
| C0/C2 creator | Chưa có bằng chứng công bố/analytics | Human creative approval và số liệu thật |
| M1–M6 film/series/CGI | Deferred | Chưa có master hoàn chỉnh, continuity nhiều tập, rig/OTIO/conform |
| S00 governance #67 | Done | Duy trì audit mỗi phiên |

Tracker thực đo sau S00 bằng audit CLI: 67 tickets: 6 done, 1 in-progress, 1 blocked, 59 not-started; eligible 41,66. Locale 3,864 keys; 1,188 khác en-US, 2,676 giống en-US; key parity true. Không suy ra product completion từ những số này.

## 4. Next session — S01 / #41 (một goal)

Audit luồng sản xuất phim ngắn hiện có, không làm timeline editor trong phiên này. Đọc source và test ở backend/app/services/directing/, backend/app/api/v1/routes/studio/directing.py, backend/app/models/directing.py, front/src/App.tsx, front/src/pages/aiStudio/directing/, generationCanvas và docs/development/architecture/directing-edit-delivery.md. So sánh route/model thực tế với docs; dùng synthetic fixture media ngắn không có private IP.

Acceptance:
1. Bảng supported/partial/missing, file:line hoặc API/test cụ thể cho scene/shot, Take/Cut, export, audio/captions, storage.
2. Chạy FFmpeg tạo synthetic local clip trong thư mục tạm riêng; ffprobe và existing probe helper kiểm tra duration/frame, không gọi API ngoài. Không nhầm fixture với full-film export.
3. Đề xuất contract assembly tối thiểu từ existing Cut; chỉ định test và files cho S02/next slice; chưa tạo schema/timeline mới.
4. Ghi #41 evidence, audit lại project, cập nhật handoff, commit/push main và verify. Chỉ đánh dấu #41 done nếu đủ tiêu chí audit; human approval các feature downstream không suy diễn.

Commands: git status/fetch/ls-remote; node scripts/filmforge-session-audit.mjs; inspect source/tests; ffmpeg -version; ffprobe -version; focused existing media tests sau khi tìm chính xác test path. Chạy scope checks phù hợp. Nếu #41 gặp hạ tầng, tự xử lý hoặc chọn #66 Chapter slice theo plan (ghi lý do).

## 5. Rollback và cleanup

Docs/tool-only: reviewed git revert commit khi cần; không hard reset/force-push. Không có migration hoặc change production. Branch chỉ main tại baseline; xác minh lại remote trước xóa branch đã merge. Không xóa refs upstream. Public services giữ hoạt động; không tắt tiến trình của project khác. Chỉ dọn fixture tự tạo.
