# FilmForge — final outcome roadmap

**Date:** 2026-11-23. **Status:** planned. **Target branch:** `main` only. **Tracking:** `.scratch/filmforge-studio/`.

## North star

**Chi phí/công sức trên mỗi phút footage được duyệt, có continuity đúng, có nguồn gốc tái dựng được.** Không dùng GitHub stars, số provider hoặc số agent làm tiêu chí hoàn thành.

**Track A (ưu tiên):** hoạt hình tiên hiệp nhiều season/episode, tái sử dụng nhân vật/rig, environment, trang phục, motion, pháp khí, voice và world state xuyên tập. **Track B (sau):** feature-film 120–180 phút, hybrid CGI/VFX/AI, editorial roundtrip, sound, color, rights.

**Non-goals đến hết M2:** 300 tập tự động, render farm, microservices, thay toàn bộ UI, đổi MySQL sang PostgreSQL, học model foundation, đảm bảo identity tuyệt đối.

## Milestone table

| Milestone | Đầu ra thực tế | Critical exit gate | Tasks |
|---|---|---|---|
| **M0 — Foundation / GO-NO-GO** | Fork có bằng chứng chạy và kiểm thử; map domain; legal scan | API/Worker/UI, fake media flow và tests có logs; quyết định Go/No-Go ghi bằng văn bản | 01–05 |
| **M1 — World & Asset Canon** | Series/Season/Episode, immutable canon state, asset/rig revision | Flashback và retcon không làm sai state cũ; asset version cũ không mất | 06–11 |
| **M2 — One usable film cut** | Storyboard approval → provider → take → selected cut → MP4 | Pilot 60–90 s, 10–15 shot; reshoot một shot không phá cut; kiểm chứng 2 providers thực nếu có keys | 12–18 |
| **M3 — Animation-first pilot** | Blender scene/rig bridge, playblast, hybrid effect, reproducible render | 3–5 phút tiên hiệp; 1 rig dùng nhiều shot, costume revision; render manifest | 19–23 |
| **M4 — Cross-episode continuity** | World events, dependency invalidation, QA, benchmark | Hai tập chia sẻ assets nhưng flashback dùng đúng state cũ; report chi phí/take | 24–27 |
| **M5 — Production scale** | Batch 3–10 tập, backup/restore, worker capacity, scheduler decision | Không mất job/asset; test recovery; chỉ scale khi đo thấy bottleneck | 28–31 |
| **M6 — Cinematic feature readiness** | OTIO editorial, color/audio/VFX handoff, rights/provenance | Conform 1 sequence CGI/AI từ sources; round-trip editorial; không tự nhận phim Hollywood đã hoàn thành | 32–35 |

**Không có ngày hoàn thành cố định khi chưa đo năng suất trên M0–M2.** Các con số là *exit target*, không phải cam kết performance.

## Definition of Done (mỗi task)

1. User-visible outcome hoặc contract rõ ràng; thay đổi giới hạn trong phạm vi task.
2. Test mới fail trước fix và pass sau fix nếu có logic/behavior thay đổi; test liên quan, lint/typecheck/build có kết quả thực.
3. Chỉ dùng API client sinh từ OpenAPI; giữ contract TaskService single-writer.
4. Không bỏ qua test hoặc hạ gate để chuyển xanh; không commit secret/provider key hoặc model weights.
5. Cập nhật source provenance/license nếu port module; lưu evidence `docs/filmforge/evidence/<milestone>/<task-id>.md` (chỉ tạo khi chạy thật).
6. Review trên diff, commit vào main bằng tiêu đề `[feat] ...` / `[docs] ...`, cập nhật task Comments và trạng thái.

## M0: Foundation — decision gate

**Goal:** Chứng minh fork chạy được trước khi thiết kế engine mới.
- Ghi SHA upstream/fork, setup env mà không commit credentials.
- Local Docker MySQL + RustFS, migrate/seed trên database trống; API `/health`, UI và worker.
- Chạy baseline backend `uv run pytest -q` và `uv run pylint app`, frontend `pnpm --dir front run typecheck` và `pnpm --dir front run build`; ghi exit code/logs, không suy đoán pass.
- Dùng fixture/fake provider nếu repo hỗ trợ; không chi tiền ở PR đầu.
- Kiểm tra danh nghĩa `Project → Chapter → Sequence → SceneVersion/ProductionUnit → Task/Take → Cut` và sự kiện/asset đã có.

**No-Go:** baseline không thể tái lập hoặc yêu cầu sửa phá contract upstream; tạo spike Toonflow hoặc isolated domain shell, ghi ADR, **không tiếp tục M1 một cách mù quáng**.

## M1: Series / World / Asset contracts

- Domain thêm **Series/Season/Episode** (mapping rõ đến Project/Chapter, không duplicating authority).
- Story canon tách asserted fact/approved fact/retcon; event có `effective_episode`, `effective_scene`, `recorded_at`; flashback/branch xử lý bằng story-time.
- Asset identity và AssetRevision bất biến; model/rig/voice/wardrobe/prop có checksum, file ID và rights metadata.
- Ứng dụng chỉ expose một canonical writable service mỗi aggregate; read projections được cache nhưng không là source of truth.
- Gate: truy vấn đúng trạng thái nhân vật trước/sau đột phá và trong hồi tưởng; sửa asset mới không đổi pinned references cũ.

## M2: Pilot 60–90s — vertical delivery

- Duyệt screenplay/storyboard/keyframe trước render trả phí.
- Identity `FilmShot` không trùng `Sequence` hoặc danh tính production unit hiện tại; mapping được duyệt trong M0.
- Submit/poll/cancel đúng semantics provider; lưu provenance và selected take; cut version độc lập với take.
- Capability preflight **fail closed** nếu model không hỗ trợ first/last frame, multi-reference hoặc duration.
- Budget estimate + reserve + reconcile; trường hợp timeout after submission phải đánh dấu unknown và ưu tiên reconcile, không tự tạo lại paid request.
- Gate: ≥10–15 shot, ≥1 recurring character, accepted cut MP4, một shot reshoot không làm mất history. **2 real providers chỉ được đánh dấu verified với chứng cứ từ cả hai**.

## M3: Animation pilot 3–5 phút

- Blender subprocess/API bridge external, không merge GPL code vào lõi.
- Ingest một rig/character asset và scene file có version; generate playblast và still references.
- Deterministic shot assembly trên pinned rig, camera, action, environment; VFX video model tùy chọn.
- Gate: cùng rig qua nhiều shot; thay wardrobe revision và xem dependency; pipeline recover sau crash.

## M4: Episode 2 / continuity

- StoryEvent/episode-state timeline và rule checking: realm, outfit, pháp bảo, quan hệ, vết thương, cảnh.
- Shot dependency graph chỉ invalidate những shot bị ảnh hưởng; không tự rerender hàng loạt khi chưa duyệt.
- Human + machine review với evidence cho kết luận; auto score là signal, không phải sự thật.
- Gate: hai tập độc lập về cut, liên tục về canon/rig; test flashback/retcon.

## M5: Multi-episode and operational scale

- Sản xuất 3–10 tập và đo: `approved_minute_cost`, `asset_reuse_ratio`, `reshoot_rate`, `mean_fix_time`, queue wait, GPU occupancy.
- Archive + object-store retention, restore sample project, quotas.
- Single worker hiện tại không scale ngang. Thêm distributed orchestration **chỉ sau** benchmark và ADR lease ownership, idempotency, remote-job reconciliation, retry/cancel semantics.
- OpenCue/render farm là option khi Blender render trở thành bottleneck đo được.

## M6: Feature film readiness

- OpenTimelineIO exchange; preserve clip source, handles, timebase/fps, cut history.
- Color pipeline OCIO, audio stems, subtitles, rights/consent and deliverables.
- Test CGI/VFX/AI hybrid conform cho một sequence trước khi lên kế hoạch 120–180 phút.
- Dựa vào kỹ sư/đạo diễn/đội VFX để đánh giá cinematic quality, không claim Hollywood qua unit tests.

## Quality and financial gates

| Metric | Cách đo | Trước khi scale |
|---|---|---|
| Approved-minutes cost | Total provider+render+human operation spend / approved duration | Có log theo take và cut; target thiết lập sau pilot |
| Character/state continuity | Sampled shots qua reviewer và rule results | Có false-positive/false-negative report |
| Asset reuse | Accepted shots sử dụng pinned shared asset / eligible shots | Không giảm do regenerate không cần thiết |
| Render safety | Paused/restarted/timeout paid jobs and reconciliation | Không tự retry paid create khi outcome chưa rõ |
| Editorial correctness | Source frame ranges, duration, FPS, timecode round-trip | So sánh source/cut manifest, no silent drift |

## Key risks

**R1:** upstream changes phá domain → pin SHA và backward-compatible additive migration.  
**R2:** prompt-only continuity drift → rig/asset as canonical representation.  
**R3:** unknown provider submission double bill → reconcile-first, finite reservation.  
**R4:** license or actor-voice rights → provenance ledger and human release gate.  
**R5:** scope explosion → mỗi task có gate; không mở M+1 khi M chưa pass.  
**R6:** main-only removes code-review isolation → enforce commits, CI, backup tags and explicit reversions.
