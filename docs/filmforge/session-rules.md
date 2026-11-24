# FilmForge — Quy tắc thực thi xuyên phiên

Hiệu lực: 2026-11-24. Phạm vi: mọi coding agent trên FilmForge. Owner đã yêu cầu tự chủ thực thi từng mục tiêu nhỏ, main-only, kiểm thử live public trong giai đoạn dev và bàn giao xuyên phiên. Không suy diễn quyền chi tiền, xuất dữ liệu riêng tư hoặc thay đổi production.

## Autonomous Engineering Mode (owner directive 2026-11-24)

Owner directive 2026-11-24 16:15+07 — Autonomous Engineering Mode: FilmForge agents are authorized to review, stage, commit and push tested, scoped changes to origin/main without per-session owner Git action. Apply DevExpert for engineering/QA; its owner-only Git delivery convention is superseded for this repository by this explicit owner authorization. Do not bypass tool approval, branch protection or security policy; no force-push, hard reset, weakened tests, secret/private IP/production data egress, paid provider, M0-05/G0-55 or creative release/publication approval. Fetch and verify remote, preserve unrelated changes, stage exact reviewed paths, verify tests and secret scan, normal push only, verify clean main and remote SHA. If blocked, preserve patch, isolate independent safe work where possible and report actual blocker; no repeated audit-only loop.

## Nguồn sự thật và ưu tiên

1. `AGENTS.md`, `CONSTRAINTS.md`, tài liệu này; các ràng buộc an toàn luôn giữ nguyên.
2. [Roadmap](roadmap.md), [kế hoạch session](session-plan.md), [architecture](architecture.md).
3. [Handoff hiện hành](session-handoff.md), [master prompt](session-master-prompt.md), tracker `.scratch/filmforge-studio/issues/`.
4. Git/source/test/runtime mới nhất ưu tiên hơn mọi snapshot. Tài liệu handoff cũ là lịch sử; không chép lại kết luận đã lỗi thời.
5. Dùng Superpowers và DevExpert khi có: kế hoạch nhỏ, TDD, debug có nguyên nhân, review, verify rồi release. Nếu skill không có, thực hiện tương đương bằng MCP; không coi việc thiếu skill là blocker. Không cài hook toàn máy nếu không cần.

## Hợp đồng một session

- Khởi động bằng MCP FilmForgeStudio; kiểm tra workspace, branch, working tree, remote SHA, fetch. Chỉ fast-forward khi an toàn. Không ghi đè dirty work của người khác.
- Chạy `node scripts/filmforge-session-audit.mjs` trước khi chọn việc. So sánh với handoff; xác minh lại tình trạng preview.
- Chọn đúng một deliverable nhỏ, có ticket, phạm vi in/out và 2–5 assertion nghiệm thu. Ưu tiên đường găng để xuất phim, không tối ưu vì đẹp code. Ticket lớn như #66 được chia slice; slice xong không có nghĩa ticket done.
- Đọc source/test thực tế, chốt plan nhỏ, RED → GREEN → regression → review. Docs-only dùng kiểm tra nội dung, link, dependency; không bắt buộc chạy build không liên quan.
- Chạy test liên quan, frontend lint/unit/typecheck/build và browser nếu đổi frontend; backend test/pylint nếu đổi backend; hợp đồng API đổi thì regenerate client. Ghi exit code, counts, SHA và phạm vi mock/real. Không làm yếu assertion.
- Review diff, secret scan, kiểm tra remote mới nhất, commit đúng convention và push origin/main. Nếu divergence, bảo toàn thay đổi, tích hợp có kiểm thử; không force-push/reset --hard.
- Chỉ xóa branch đã hợp nhất và không có worktree/commit riêng: kiểm tra ancestry với origin/main sau fetch, dùng git branch -d; remote origin chỉ xóa ref đã xác minh và thuộc phạm vi. Không xóa upstream của dự án gốc.
- Nếu thay đổi runtime, build và deploy preview đã được cho phép, kiểm tra HTTP, content-type, hash artifact, browser desktop/mobile, console, bảo mật. Docs/tool-only kiểm tra preview smoke, không rebuild vô ích.
- Audit toàn dự án cuối phiên: tracker counts/dependency/eligible, locale counts/parity, stage evidence và gap, git SHA/branches, preview, test mới vs lịch sử, actual output/cost. Không dùng số ticket hay số khác en-US làm % sản phẩm.
- Ghi handoff **trước khi kết thúc**, kèm next slice có acceptance/test commands, lý do chọn, blocker và hướng xử lý; commit/push handoff cùng slice hoặc commit evidence riêng. Không hardcode SHA của chính commit chứa file; ghi SHA baseline và dùng git log để tìm commit chứa handoff. Kiểm tra lại HEAD=origin/main=remote, working tree sạch. Nếu chưa đạt, ghi trạng thái thật và không đánh dấu done.

## Master prompt bắt buộc khi kết phiên (owner directive 2026-11-24)

Mọi session, kể cả docs-only, partial, blocked, mất MCP hoặc không push được, phải bàn giao bằng **MASTER PROMPT — NEW CHAT** đầy đủ ở cuối báo cáo tiếng Việt. Không thay bằng link, câu “tiếp tục” hay lời hứa gửi sau. New Chat phải chạy được mà không cần lịch sử hội thoại hoặc Memory.

1. Sau khi đo kết quả và xác định next goal, cập nhật cả [handoff](session-handoff.md) và [master prompt](session-master-prompt.md). Master prompt là bản copy-ready độc lập: repo/MCP/workspace đã quan sát (xác minh lại khi khởi động), role/mục tiêu/quy tắc, checkpoint SHA đã có, status/tickets và evidence, blocker/giới hạn, một next goal có điều kiện fallback, 2–5 acceptance và lệnh test/verify, quy trình kết phiên bắt buộc này. Không placeholder bắt owner điền, không secrets/private data. Phân biệt snapshot lịch sử với kết quả mới.
2. Commit/push prompt cùng handoff; kiểm tra main, remote SHA, clean tree. Tránh SHA tự tham chiếu trong file (ghi baseline hoặc commit đã có, hướng dẫn đọc live Git). Khối prompt trả trong chat có thể bổ sung final verified SHA sau push, còn nội dung hành động phải khớp snapshot lưu trên repo.
3. Báo cáo cuối cùng phải có trạng thái thật, audit, Git/preview/next goal, sau đó toàn văn prompt trong một khối copy được. Nếu không thể cập nhật file/push, nêu rõ điều chưa lưu và vẫn xuất prompt hoàn chỉnh dựa trên checkpoint thực tế. Không coi session đã bàn giao đủ nếu thiếu prompt hiển thị.

## Autonomous unblock — không tạo gate giả

| Loại | Hành động |
|---|---|
| Môi trường, tool, watcher, timeout, fixture, build, test runner | Tự điều tra log, tái hiện, giả thuyết, sửa nhỏ, test lại; không hỏi owner từng bước. |
| Thiếu thông tin có thể đọc từ repo/MCP/docs | Tự tra cứu nguồn; giả định có thể đảo ngược phải ghi rõ. |
| Ticket bị chặn bởi quyết định không liên quan đến phần audit/fixture | Tách hoặc sửa dependency có lý do, giữ acceptance gốc và lịch sử; chỉ giải phóng công việc offline không xâm phạm gate thật. |
| Không có key, GPU hoặc provider được duyệt | Dùng fixture/synthetic local media, mock HTTP, dry-run, hoặc chọn slice độc lập; báo chính xác phần chưa có bằng chứng. |
| Mất MCP, conflict, lỗi lặp | Kiểm tra kết nối, đọc diff, thử tối đa vài giả thuyết khác biệt, bảo toàn trạng thái, chuyển phương án an toàn; nếu không thể tiếp tục ghi checkpoint. |
| Chi phí, quyền sử dụng IP, secrets, dữ liệu production, công bố nội dung | Không tự cấp quyền; dùng phương án offline/fixture để tiến triển. Không ký creative approval hoặc gate provider thay owner. |

Quyền dev tự chủ của owner không đồng nghĩa full GO M0-05 hay G0-55; không cần hai gate này cho audit đọc mã, i18n, test fixture hoặc tài liệu độc lập. Gate thật chỉ chặn hành động mà nó bảo vệ. Không tự tuyên bố đã có credential, license hoặc ngân sách. Mặc định không phát sinh phí.

## Public dev preview

Owner cho phép duy trì frontend public tại https://filmforge-preview.musashishao.tech/ để test. Ưu tiên demo project synthetic/owned-public, fixture API hoặc backend test cô lập chỉ với allowlisted routes, không có secrets, provider thật, dữ liệu người dùng, chức năng admin hay write production. Không expose admin API trực tiếp, không bỏ authentication để tiện test. Route hiện hành /api trả 403; muốn demo phong phú thì cung cấp fixture ở lớp riêng, không thay ingress bảo vệ backend. Mọi fixture phải có nhãn DEMO; tách rõ HTTP public thật và mock API. Không mở tunnel/hostname khác khi không cần.

## Definition of Done của một session

Deliverable chạy được theo tiêu chí, bằng chứng RED/GREEN/regression đúng phạm vi, diff review, cập nhật ticket và audit/handoff, push main thành công, branch cleanup an toàn, smoke preview. Nếu có phần chưa đạt: ghi partial/blocked cụ thể và kế hoạch tiếp nối; không tuyên bố toàn milestone done. Mỗi session chỉ một mục tiêu chính; audit/handoff là công việc kết phiên, không phải milestone sản phẩm. Definition of Done của bàn giao còn yêu cầu master prompt lưu trên repo và toàn văn prompt trong báo cáo cuối; nếu không thể lưu, phải nêu blocker và vẫn xuất prompt.

## Handoff format

Ngày giờ; baseline SHA; ticket/slice; mục tiêu/acceptance; files; commands/exits; mock/real; actual outcome; tracker/catalog/stage audit; git/deploy/security; blockers/root cause; next ticket/slice + 2–5 acceptance + commands; rollback. Không sao chép bí mật hoặc nội dung sáng tạo private.
