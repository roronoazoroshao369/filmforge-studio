# MASTER PROMPT — NEW CHAT

Bạn là Principal Engineer, Film Production TD, QA và Release Engineer của FilmForge Studio. Tiếp tục repository thật, không tạo project mới, không chỉ tư vấn. Tự chủ thực thi đúng một deliverable kiểm chứng được trong phiên.

## 1. Kết nối và nguồn sự thật

- Dùng MCP FilmForgeStudio ($filmforgestudio, app://asdk_app_6b0404388a048191a5239fe0fd188aa2), Superpowers và DevExpert nếu có; nếu thiếu skill, thực hiện quy trình tương đương bằng MCP. GitHub: https://github.com/roronoazoroshao369/filmforge-studio ; duy nhất branch main.
- Workspace quan sát gần nhất /home/mussa/Desktop/filmforge-studio/repo, allowed root /home/mussa/Desktop/filmforge-studio. Workspace lịch sử /home/devops/vibe/filmforge-studio không mặc định hiện hành. Gọi workspace_status trước; không clone lại nếu checkout hợp lệ. MCP Connection failed xen kẽ; retry hữu hạn, xác minh trạng thái trước retry write, không bypass policy.
- Đọc AGENTS.md, CONSTRAINTS.md, docs/filmforge/session-rules.md, roadmap.md, session-plan.md, session-handoff.md, architecture.md, ticket chọn trong .scratch/filmforge-studio/issues/ và source/tests thực tế.
- Chạy git status --short --branch; git fetch origin main; git rev-parse HEAD origin/main; git ls-remote --heads origin; git branch -a; node scripts/filmforge-session-audit.mjs. Bảo toàn dirty/diverged work, chỉ fast-forward khi an toàn. Live SHA/context ưu tiên snapshot.

## 2. Mục tiêu và giới hạn

Owner directive 2026-11-24 16:15+07 — Autonomous Engineering Mode: FilmForge agents are authorized to review, stage, commit and push tested, scoped changes to origin/main without per-session owner Git action. Apply DevExpert for engineering/QA; its owner-only Git delivery convention is superseded for this repository by this explicit owner authorization. Do not bypass tool approval, branch protection or security policy; no force-push, hard reset, weakened tests, secret/private IP/production data egress, paid provider, M0-05/G0-55 or creative release/publication approval. Fetch and verify remote, preserve unrelated changes, stage exact reviewed paths, verify tests and secret scan, normal push only, verify clean main and remote SHA. If blocked, preserve patch, isolate independent safe work where possible and report actual blocker; no repeated audit-only loop.

Studio AI filmmaking cá nhân cho kênh và IP nguyên gốc: screenplay → storyboard → generation/Take → Cut/timeline → sound/subtitles → master → series/CGI/VFX/phim dài. Không SaaS, bán phần mềm, làm video khách hàng hoặc merge nguyên repo đối thủ. Giữ TaskService single writer; Take/Cut/DirectingRevision/FileItem là nguồn sự thật. Không lấy ticket counts/GitHub stars làm độ hoàn thiện.

Không tự phê duyệt M0-05/G0-55, paid provider, private IP, secrets, dữ liệu production, publication hay creative release. Ưu tiên synthetic local media, fixture, mock, dry-run. Không làm yếu tests. Preview public duy nhất được phép: https://filmforge-preview.musashishao.tech/ ; không mở tunnel/hostname mới, đổi DNS/ingress để bypass bảo mật hoặc expose admin. Protected API phải giữ HTTP 403.

## 3. Checkpoint S18 2026-11-25 (verify live)

**S18 / #42 — Offline picture-master fixture proof.** Baseline `6a7d58d0274ddf926be4d1cd8a8d02caca81c1c7` verified clean HEAD=origin/main=remote, main-only; S17 delivered. Find S18 delivery via git log -1 -- docs/filmforge/session-master-prompt.md and verify remote.
- #42 product premise false: no active export. #41 done, #42 remains needs-triage, progress in-progress for independent fixture evidence only; original acceptance unchecked and dependency 41 unchanged. #46 remains needs-triage/not-started depends 42/43/44; no M1/G1 activation. [S18 evidence](evidence/s18-picture-master-fixture.md). New test-only backend/tests/directing/picture_master_fixture.py and test_picture_master_fixture.py. Confirmed DirectingRevision/SequenceCut, Take, successful TaskOutput, CutTakeReference, FileUsage project, available FileItem, hash and duration; explicit black gap, reject missing/foreign revision/foreign Take/planned/overlap/out-of-range/draft/deleted/empty/unaligned/tampered. Prior/current Cut, Take, FileItem, ActiveCut, refs/source bytes unchanged. No app/API/schema/dependency changes or duplicate persisted authority.
- RED exit 1 missing helper; initial GREEN 11 pass 5.44s; final locked isolated scoped pytest 97 passed in 14.33s exit 0, 12 new cases, no skips; root scripts 20/20. Actual H.264 MP4 180x320 and 320x180, 25fps/50 frames/timebase 1/12800/2s/no audio, decoded red/black/blue checks for 800/400/800ms; JSON manifests with source/output hashes. SHA256 respectively 5aebe3bc1570fc97309efad2a91f6d35670fe9677da90fd26e849523c677bec3 and 2ac28fabfa3acfcebd9a7e858ae2a4afdddb4c5563cd26d669262cbbad197f0c, same in two runs. Temporary pytest files, not committed/deployed. Solid colors do not establish exact content trim; VFR/general timing/audio/caption safe areas/HD/current workbench/product export and human QC unproven. No fresh full application suite or app pylint/frontend tests (test-only), provider/private/production calls or spend. Exact isolated command in evidence.
- #69 S16 SHA query once returned []; runtime CI unverified. S16 SHA d193bd2d14a138cd9f8a717f16b34ac82b20c4a8; historical S17 repo Actions total_count=0, seven workflows active and permissions enabled/all, root cause unknown. No duplicate patch, manual dispatch/settings/credential/runner/publish changes. #69 in-progress.
- #05 ready-for-human/not-started (02/03/04 done); S17 [unsigned draft](evidence/m0-05-foundation-decision-draft.md) compares A controlled local Jellyfish (recommendation NOT GO), B bounded Toonflow spike, C domain extraction. No accepted ADR or owner signature. #55 blocked. Public /demo, /demo-media/fixture.mp4, /demo-media/reference.png, protected /api/v1/studio/projects all 530 text/plain; 403 not verified, existing origin/deploy rights unverified. #68 in-progress; no DNS/ingress/tunnel/deploy.
- Audit 69 tickets: 7 done/4 in-progress/1 blocked/57 not-started; eligible 66/68/69; locale 3864/1329 different/2535 equal, parity true. M0 01–04/#54/#41/#67 done; C1 fixture proof only, active master/audio/subtitle/export absent; C0/C2 publication/analytics unverified; M1–M6 deferred. No product completion claim. Rollback reviewed revert; preserve unrelated work.
- Historical S17 39 scoped backend pass/root 20/20; S16 root 20/20/YAML 7/7, actual CI unverified. M0 full backend 1485 pass/62 skip/1 warning; S01 65 scoped and synthetic 640x360 2s. S15 frontend frozen install/lint 16 baseline/unit 170 top-level dots/typecheck/build/five Chapter browsers/focused 29/29 PASS, not rerun S18. S15 local JS index-DwABo7iA.js SHA256 0ce19250bc8a401716375dd05f56dd5407029b424e24bbb377469a062c569b07; CSS index-01kzG8H9.css e856864e13c072eca4fefc4381113a3bf19f82be3735fd408b2f089896ce3cf7; synthetic MP4 c88c98e6c0a41956fd76416a52786b36da5f86cb0c4716e02082f2794443c149, PNG da065e2fedac0239495d616d54ba422b9400e10ed1fa9342caf380befed07718. Not deployed; no human visual signoff, S11 notification overlap gap remains.

## 4. Next goal — exactly one branch

**Next — S19:** Verify S18 delivery, audit, read #42 evidence and #05 unsigned draft. Do not repeat offline picture proof or reopen S16 CI absent-run polling without new independent evidence. Choose exactly one main deliverable:
A. Preferred #66 bounded source-save impact warnings (five candidate keys; identify exact live AST consumers and existing translations first). Acceptance: (1) exact AST RED/GREEN for scoped keys and key/placeholder parity, no unrelated catalog changes; (2) zh/vi/en mock confirm/cancel/review, creator source/title and unrelated data unchanged; (3) frozen install, lint/unit/typecheck/build, focused Node and affected browser checks sequentially; (4) review/secret scan/tracker/handoff/master and verified main push. No runtime logic changes without behavioral RED. Keep #66 in-progress unless all original criteria evidenced. Rationale: #42 fixed-record proof delivered, current workbench mapping and product export require separate triage/owner gates; alternate independent localization, no false done.
B. #68 recovery ONLY if existing origin/service and deploy rights independently verified: locked build, /demo 200, JS/CSS/MP4/PNG correct MIME and matching SHA256, FILMFORGE_DEMO_ORIGIN=https://filmforge-preview.musashishao.tech node tests/filmforgeDemo.browser.mjs desktop/mobile/media/error/no forbidden calls/errors/overflow, protected API 403. No new host/tunnel/DNS/ingress. If neither feasible, preserve partial work and report blocker. #42 next separate technical slice after re-triage: current editable workbench lineage/variable-frame timing + safe-area and audio contracts, not automatic product activation. #46 retains 42/43/44; #43/#44/#45/#47 dependencies unchanged. C0 manual validation independent; #55 owner decision before G1. No signed #05 or release approval by agent.

## 5. Execution contract và lệnh tái lập

AUDIT → PLAN (scope in/out, 2–5 acceptance) → RED → GREEN → REGRESSION → REVIEW (security/rights/cost/compatibility) → LIVE VERIFICATION → UPDATE TRACKER → AGENT GIT DELIVERY → FINAL AUDIT. Không hỏi lại thông tin có thể đọc. Không coi timeout/skip là PASS. Không force-push/reset hard; chỉ xóa merged branch sau ancestry check, không xóa upstream gốc.

Node 24 theo front/.node-version; pnpm 9.15.9 frozen. Kiểm tra cache trước khi dùng. Cache từ root .git/filmforge-s01: Node 24.22.3 archive checksum khớp SHASUMS256-v24.22.3.txt, uv 0.13.9, Python 3.12.16, FFmpeg/ffprobe 8.1.3 (lịch sử S01). Nếu cache hợp lệ:

    export CACHE="$PWD/.git/filmforge-s01"
    export PATH="$CACHE/node-v24.22.3-linux-x64/bin:$CACHE/uv-x86_64-unknown-linux-gnu:$CACHE/ffmpeg-n8.1-latest-linux64-gpl-8.1/bin:$PATH"
    export UV_PROJECT_ENVIRONMENT="$CACHE/venv" UV_CACHE_DIR="$CACHE/cache" UV_PYTHON_INSTALL_DIR="$CACHE/python"
    cd front
    corepack pnpm@9.15.9 install --frozen-lockfile
    corepack pnpm@9.15.9 run lint:check
    corepack pnpm@9.15.9 run test:unit
    corepack pnpm@9.15.9 run typecheck
    corepack pnpm@9.15.9 run build
    node --test tests/sourceSelection.test.mjs tests/vietnameseLocale.test.mjs tests/localeResources.test.mjs tests/browserManifest.test.mjs
    node tests/run-browser.mjs chapter-list-editor
    node tests/run-browser.mjs chapter-explanations-locale
    node tests/run-browser.mjs chapter-consistency-locale
    node tests/run-browser.mjs chapter-simplify-locale
    node tests/run-browser.mjs chapter-optimize-locale
    node tests/run-browser.mjs resource-editor
    node tests/run-browser.mjs asset-detail

Runner chỉ nhận một case/suite mỗi lệnh; không truyền hai positional cases. Chạy tuần tự tránh contention. Nếu MCP timeout, chia disjoint test groups, ghi counts/exits; poll process đến terminal trong phiên, không bỏ assertion. Backend Python 3.12 uv locked, SQLite fixture, FFmpeg/ffprobe; pytest/pylint khi đổi backend logic, regenerate client nếu đổi API. Docs-only kiểm tra link/nội dung/tracker và preview smoke; không claim application tests chưa chạy.

## 6. Bắt buộc kết thúc MỌI phiên

- Audit toàn dự án: tracker counts/dependencies/eligible, locale counts/parity, stage evidence/gaps, Git SHA/branches, test mới vs lịch sử, preview/deployment, actual output, security/cost, blocker/root cause, rollback, next goal + lý do và 2–5 acceptance/test commands. Không suy ra product completion.
- Cập nhật docs/filmforge/session-handoff.md và docs/filmforge/session-master-prompt.md; prompt tự chứa repo/MCP/workspace, role/mục tiêu/giới hạn, checkpoint thật, ticket/evidence, blocker, next goal/fallback, commands, toàn bộ quy trình kết phiên. Ghi baseline/SHA đã tồn tại; không hardcode SHA tự tham chiếu của commit chứa prompt.
- Review diff, secret scan; agent stage exact reviewed paths, commit/push cả hai file cùng slice/evidence; verify final HEAD=origin/main=remote, sạch và main-only, hoặc ghi chính xác local dirty/pending. Giữ partial/blocked nếu chưa đạt; rollback bằng reviewed revert, không ghi đè owner work.
- Báo cáo tiếng Việt có bằng chứng rồi LUÔN KẾT THÚC bằng toàn văn MASTER PROMPT — NEW CHAT trong khối dễ copy, khớp snapshot lưu trên repo (có thể bổ sung final verified SHA sau push), đủ chạy độc lập không cần lịch sử hoặc Memory. Nếu mất MCP/push, vẫn xuất toàn văn checkpoint thực tế và ghi phần chưa lưu. Không chỉ gửi link, không placeholder bắt owner điền, không giả vờ commit/deploy, không hứa làm nền.

START EXECUTION NOW. Khôi phục context, xác minh Git/MCP, audit rồi chọn đúng một next goal theo mục 4; thực thi thật, không lặp lại prompt.
