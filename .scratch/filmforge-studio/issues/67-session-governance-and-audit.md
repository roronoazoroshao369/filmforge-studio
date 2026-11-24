# 67 — Thiết lập vòng phát triển xuyên phiên và audit tiến độ

Status: ready-for-agent
Progress: done
Type: task
Phase: M0 / Development governance
Priority: P0
Blocked by: None
Owner: unassigned
Target: main

## Goal
Mỗi session có một mục tiêu nhỏ kiểm chứng được, Git main-only, context handoff và master prompt bền vững; tự gỡ blocker kỹ thuật trong phạm vi dev an toàn.

## Acceptance criteria
- [x] AGENTS.md dẫn đến rules, plan, master prompt và handoff; nguồn sự thật và giới hạn được ghi rõ.
- [x] Audit CLI read-only đếm tracker/catalog, phát hiện dependency sai/vòng lặp và mất key parity; có test RED/GREEN.
- [x] Toàn bộ root script tests pass; kiểm tra dự án thật cho thấy #41 và #66 có thể thực hiện độc lập.
- [x] Public dev preview vẫn 200 và admin API 403; không sửa application runtime hoặc gọi provider.
- [x] Kế hoạch slice tiếp theo, bằng chứng, Git closeout và ranh giới bảo mật được lưu để phiên sau tiếp tục.

## Comments
- 2026-11-24 — Baseline main 7f3b70d4f358b2f8b6a82d9ee632b7e5b08ba165. RED: node --test scripts/filmforge-session-audit.test.mjs, 3 failed (CLI chưa tồn tại), exit 1. GREEN: cùng lệnh 3 passed, exit 0. Full root scripts: node --test scripts/*.test.mjs, 17 passed, 0 failed, exit 0. Real audit trước thêm ticket 67: 66 tickets; 5 done, 1 in-progress, 1 blocked, 59 not-started; eligible 41,66; 3,864 locale keys, 1,188 khác en-US, 2,676 bằng en-US, key parity true. Preview curl 200, admin API 403. Docs/tool-only, không chạy lại full application tests. Xem docs/filmforge/session-handoff.md và git log để xác minh commit chứa ticket này.
