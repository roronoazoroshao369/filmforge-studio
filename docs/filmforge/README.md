# FilmForge Studio — Personal Creator / Original IP Mode

**STRATEGY UPDATE 2026-11-23 — CURRENT AND AUTHORITATIVE**

FilmForge is a **personal creator-owned short-video and original-IP production tool**. It is **not** a SaaS product, app for sale, agency, or tool for producing videos for customers. Short creative videos on the owner's own channel come first; recurring original characters and audiences finance later xianxia series and feature films **if evidence and personal resources justify expansion**.

**Start here in this order:**
1. [Creator-First Final Roadmap](roadmap.md) — stages C0/C1/C2, technical M0 in parallel, future film milestones gated.
2. [Creator Strategy](creator-first.md) — storytelling, analytics, financial safeguards and original IP.
3. [Simulated Specialist Board](creator-board-review.md) — 10 roles, dissent and conditional verdict.
4. [Technology Radar](creator-tech-radar.md) — prioritized GitHub repos, commit SHA and license boundaries.
5. [2026/2027 Platform Rules](policy-sources.md) — YouTube official policy references.
6. [Local task tracker](../../.scratch/filmforge-studio/spec.md) — 01–53 with dependencies/statuses, creator tasks 36–53 now priority.
7. [Implementation plan](../../tasks/plan.md), [agent guide](agent-execution.md), [main-only workflow](main-only-workflow.md).

**Master handoff v1** is historical context for the long-film destination; [read its strategic override](master-handoff.md). C0 original content testing and M0 repository baseline run in parallel; current software capabilities are still unverified.

---

# FilmForge Studio — nguồn điều phối tài liệu

**Status: PLANNED / NOT YET IMPLEMENTED.** Repository là fork Jellyfish. Chưa xác minh bootstrap hoặc provider thực tế; không được nhầm tài liệu mục tiêu với khả năng đã chạy.

FilmForge là AI Film Production OS, ưu tiên sản xuất series hoạt hình tiên hiệp hàng trăm tập bằng asset/rig tái sử dụng; định hướng thứ hai là pipeline CGI/VFX + AI cho phim điện ảnh 120–180 phút.

## Tài liệu theo thứ tự đọc

1. [Master handoff v1](master-handoff.md) — lý do, phản biện đa vai trò, repo, domain và rủi ro. Đây là **snapshot tham khảo**, không tự ghi đè trạng thái thực tế của source code.
2. [Final roadmap](roadmap.md) — milestone, exit gates, thứ tự triển khai và đo lường. **Tài liệu điều phối có hiệu lực**.
3. [Architecture and decisions](architecture.md) — ranh giới hiện tại / tương lai, data ownership.
4. [Upstream provenance](upstreams.md) — nguồn code/references và chính sách license.
5. [Main-only workflow](main-only-workflow.md) — làm việc trực tiếp với main và bảo vệ lịch sử.
6. [Agent execution guide](agent-execution.md) — lệnh, quy trình Spec → Plan → Test → Implement → Verify → Record.
7. [Implementation plan](../../tasks/plan.md) — index nhiệm vụ và dependency.
8. [Local tracker](../../.scratch/filmforge-studio/spec.md) — task IDs, nội dung và Comments.

## Repo hiện trạng tại thời điểm lập kế hoạch

- Source tree trên `main` tương ứng Jellyfish SHA `b1d8add653a97ebe89c2eb8cc7b712af800b8f3c`.
- Backend: FastAPI, SQLAlchemy, MySQL production, React/Vite frontend, RustFS/S3 object store, một database-backed worker coordinator.
- Worker hiện tại **không hỗ trợ nhiều coordinator cùng DB**; không thay nó trước M0.
- `codex/0718` ở commit `508f2c7ecea61b544623393a498d9c7f255e0697`, là **ancestor** của main, không có commit mới cần merge. Cleanup được ghi trong tài liệu workflow.
- Không có PR hay issue khi kiểm tra ban đầu.
- Bảo toàn LICENSE Apache-2.0 và notices của upstream.

## Quy tắc cập nhật

**Đừng đánh dấu milestone Done trừ khi có bằng chứng**: commit SHA + test output + demo/artifact + người review. Các quyết định ảnh hưởng domain và worker phải có ADR trước khi mã hóa. Mọi thay đổi giữ nguyên data và behavior hiện có, trừ migration/ADR đã duyệt.
