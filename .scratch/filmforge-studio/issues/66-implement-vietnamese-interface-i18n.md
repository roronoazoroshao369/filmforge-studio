# 66 — Triển khai giao diện tiếng Việt và bộ chuyển ngôn ngữ

Status: ready-for-agent
Progress: in-progress
Type: task
Phase: M0 / UI localization
Priority: P1
Blocked by: None
Owner: unassigned
Target: main

## Goal / Deliverable
Bổ sung vi-VN vào i18next và Ant Design; chuyển ngôn ngữ ngay, lưu lựa chọn và giữ zh-CN/en-US không hồi quy. Việt hóa năm namespace hiện hữu theo từng nhóm màn hình, thống kê chính xác phần chưa dịch.

## Acceptance criteria
- [ ] Menu ba ngôn ngữ hoạt động tại các màn hình chính và canvas.
- [ ] Lưu/khôi phục `jellyfish_language`, xử lý storage lỗi, fallback mã lạ, đồng bộ `html[lang]`.
- [ ] Ant Design locale theo ngôn ngữ; ngày/giờ định dạng vi-VN.
- [ ] Năm catalog vi-VN giữ key và placeholder parity; UI labels domain-safe, không dịch nội dung user-generated.
- [ ] RED → GREEN, lint/unit/typecheck/build, browser QA desktop/mobile, regression zh/en.
- [ ] Audit toàn bộ 3.864 khóa UI; không đánh dấu done khi còn giá trị chưa Việt hóa hoặc chưa nghiệm thu browser.

## Technical reference
- `front/src/i18n.ts`, `front/src/main.tsx`, `front/src/layouts/MainLayout.tsx`
- `front/src/locales/{zh-CN,en-US,vi-VN}`
- `front/tests/localeResources.test.mjs`, `front/tests/appearancePreferences.browser.mjs`, `front/tests/run-browser.mjs`

## Comments
- 2026-11-23 — Mở ticket độc lập với gate M0-05/G0-55. Bắt đầu từ `main` HEAD `81ca78ad4b981c49bd227531d903336ba4859a38`, working tree clean, trùng `origin/main`; 3.864 key trong `en-US/ui.json`. Không gọi provider thật hoặc public backend.
- 2026-11-23 — Thực hiện slice vi-VN: i18next + menu + Ant Design locale + 5 catalog; giữ nguyên key Trung và behavior mặc định zh-CN. Bốn namespace structured: common 7, layout 26, settings 10, notFound 2 leaves có parity. UI: 3.864/3.864 keys hiện diện, 386 giá trị Việt hóa khác en-US, **3.478 giá trị tiếng Anh chưa Việt hóa**, 0 placeholder mismatches. Các giá trị chưa dịch giữ fallback en-US trong vi catalog **chỉ để giữ parity, không tính là đã dịch**. Nội dung creator-generated không bị sửa; chưa dịch đủ tất cả màn hình.
- 2026-11-23 — RED: `cd front && node --test tests/vietnameseLocale.test.mjs` exit 1, 3/3 failed vì thiếu vi resources/registry (sau khi sửa lỗi cú pháp của chính test). GREEN: `cd front && node --test tests/vietnameseLocale.test.mjs tests/localeResources.test.mjs` exit 0, 5/5 passed. Manifest `node --test front/tests/browserManifest.test.mjs` exit 0 sau khi đăng ký case với default suite.
- 2026-11-23 — Node `24.21.0` (front/.node-version = 24), pnpm `9.15.9`. `pnpm --dir front run lint:check` exit 0 (16 lỗi baseline cũ, 0 lỗi mới); `pnpm --dir front run test:unit` exit 0 sau sửa manifest; `pnpm --dir front run typecheck` exit 0; `pnpm --dir front run build` exit 0 (cảnh báo cũ: CSS nesting / Browserslist / chunk >500 kB).
- 2026-11-23 — `node front/tests/run-browser.mjs vietnamese-locale` exit 0: preflight passed, case passed. **Mock API**, Chromium headless: zh-CN → vi-VN → en-US → vi-VN, refresh/persistence, invalid storage, storage blocked, html[lang], Ant Design RangePicker placeholder, role/settings/not-found, user canvas name nguyên dạng, keyboard, desktop 1366×768, mobile 390×844 (DOM không overflow). Ảnh chụp: `front/test-results/browser-h4P1CC/vietnamese-locale/home-vi-{1366x768,390x844}.png` (đã chụp, **chưa có signoff hình ảnh thủ công**).
- 2026-11-23 — Hai browser suite cũ `appearance-preferences`, `task-center-locale` **exit 1 tại navigation đầu tiên** do timeout 8.000 ms trong cold Vite startup; chưa tới assert hồi quy, không tự tăng timeout hoặc che fail. Browser suite mới kiểm tra hai ngôn ngữ cũ trên home/settings nhưng chưa thay thế full regression của các suite cũ. `git diff --check` exit 0; secret scan `vi-VN/ui.json` có 0 findings. Không gọi provider trả phí, API admin công khai, migration hoặc secrets. Cloudflare preview chưa được kiểm tra.
- 2026-11-23 — Blockers: 3.478 UI values chưa Việt hóa, thiếu browser QA thật cho canvas/workbench/management/lab/Takes/Cuts, chưa review ảnh thủ công và hai suite cũ chưa chạy thông suốt. **Progress giữ in-progress, không đánh dấu done**.
- 2026-11-23 — Feature/test commit trên `main`: `d628e4d51f388f282f2368c2d9b464034de0ebe9` (`[feat] bổ sung tiếng Việt và kiểm thử chuyển ngôn ngữ`), **push origin/main thành công**, `git ls-remote --heads origin main` xác nhận remote trùng SHA. 14 files, 4.177 insertions, 10 deletions, không force-push. Đây là **partial i18n slice**, không phải nghiệm thu đủ 3 ngôn ngữ trên toàn bộ ứng dụng.
- 2026-11-23 (tiếp tục) — Việt hóa theo ngữ cảnh các màn hình dự án, quản lý file, Task Center, navigation, provider/model settings và experiment labs. `vi-VN/ui.json`: 895/3.864 giá trị khác en-US (23,16%), **2.969 còn dùng giá trị tiếng Anh**, 0 lỗi interpolation, key parity 100%. Trong nhóm màn hình nói trên, automated AST audit literal `uiText()` không còn thiếu bản dịch, trừ các token giống nhau có chủ đích (Video, delimiter, syntactic label); không suy diễn ra 100% UI coverage toàn ứng dụng. RED trước khi thêm các chuỗi mô hình/lab đã fail; GREEN `node --test front/tests/vietnameseLocale.test.mjs front/tests/browserManifest.test.mjs` pass 10/10 exit 0.
- 2026-11-23 (tiếp tục) — Browser Playwright **mock API**: `vietnamese-locale` pass (~26s), `appearance-preferences` pass (~81s), `task-center-locale` pass (~13s), tất cả preflight pass; giải quyết cold navigation và inotify `ENOSPC` bằng `domcontentloaded`, HMR off và không file watch cho case static. Coverage mới gồm trang /projects và /files; desktop 1366×768/mobile 390×844, keyboard, persist, disabled storage, user-generated unchanged. `lint:check` exit 0 (16 baseline, 0 new), `typecheck` exit 0, `build` exit 0 (Browserslist/CSS-nesting/large chunks warnings).
- 2026-11-23 (tiếp tục) — `pnpm --dir front run test:unit` chạy toàn phần **exit 1** vì 1 test `checkCommands.test.mjs` timeout preflight 60.000 ms dưới tải đồng thời với visual-review (520715 ms test duration); **không tính cả suite pass**. Chạy riêng `node --test front/tests/checkCommands.test.mjs` **6/6 pass, exit 0**, và các bài test locale/manifest pass độc lập. Lỗi hạ tầng/concurrency cần theo dõi; không sửa lỏng assertion. Public preview HTTP 200, API admin GET `/api/v1/studio/projects` HTTP 403 ở lần kiểm tra đầu; static front Vite preview + tunnel có sẵn, không thay DNS/backend. Không có bằng chứng signoff tất cả màn hình; ticket vẫn in-progress.
- 2026-11-23 (release evidence) — Commit feature/test `[feat] mở rộng Việt hóa dự án và phòng thử nghiệm` **`bbb0f744f2f3c11da0795291c4c5a90d2766d084`** đã push origin/main (không force), `git ls-remote` trùng local HEAD. Frontend artifact built Node 24.21.0 có `/assets/index-BVS9-rPr.js`, SHA-256 local = **`ccb181a60d4c7d6708edefc581e7411b98f87b2b08d432bfc9b16c81a5ed1edb`**, SHA-256 public Cloudflare preview **trùng khớp**, HTML HTTP 200, public admin API GET 403. Browser **trên URL public** PASS: chuyển vi-VN, refresh, `/projects`, `/files`, mobile 390px không tràn ngang, không JS page errors, **API mock trong browser** nên không chứng minh backend chức năng. Frontend preview qua Vite+Tunnel hiện hữu (không phải pipeline CI/CD production bảo đảm uptime). `test:unit` toàn phần vẫn 1 lỗi hạ tầng được ghi rõ; chạy isolated checkCommands 6/6 pass; focused browser/locale và build xanh. Chưa đạt nghiệm thu dịch 100%; giữ `in-progress`.
