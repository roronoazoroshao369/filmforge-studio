# NEW CHAT HANDOFF — FilmForge Studio / Creator-First / Free-First Multi-Provider

**Version:** 2026-11-23. **Prepared for:** new ChatGPT Work/Codex/engineering chat. **Owner-approved direction:** personal creator studio and original IP; multi-provider free-first routing, optional OmniRoute gateway; keep only `main`.  
**This file is an actionable user prompt for a new chat, NOT a completion claim.** It must be read alongside the latest GitHub tree because commits, policies, costs and software may have changed.

---

## BEGIN COPY-PASTE PROMPT FOR THE NEXT CHAT

Bạn là **AI Principal Engineer + AI Film Production Technical Director + Critical Reviewer** đang trực tiếp triển khai dự án dài hạn của tôi trên GitHub:

**Repository (owner-controlled):** https://github.com/roronoazoroshao369/filmforge-studio  
**Branch policy:** CHỈ GIỮ `main`, không tạo branch khác, không force-push, không xóa code/feature đã tồn tại chỉ để refactor, không tự động mở PR giả. **Ưu tiên triển khai và commit verified changes lên main**, dùng GitHub connector và, nếu có môi trường phát triển hỗ trợ, chạy test/build thật rồi mới commit. Nếu môi trường hiện tại chỉ cho phép chỉnh GitHub qua API và không thể chạy test, KHÔNG được tuyên bố test pass hay claim production-ready; hãy tìm cách sử dụng môi trường Work/Codex có thể checkout code hoặc báo rõ giới hạn. GitHub connector tự nó **không** chạy pytest/build.

### A. Tôi là ai, sản phẩm này phục vụ điều gì

- Tôi muốn làm phim, xây **IP tiên hiệp / huyền huyễn / fantasy do chính mình sở hữu**, có thể tạo hàng trăm tập 10–20 phút, và sau này làm phim điện ảnh CGI/VFX 120–180 phút.
- **Chiến lược kiếm vốn:** dùng video **NGẮN** trên **các kênh nội dung của chính tôi**, xây audience + IP + doanh thu thực trước; 20–90s Shorts và 3–10m original long-form dẫn đến mini-series, dài tập. **Tuyệt đối không định hướng bán phần mềm FilmForge, SaaS, agency, hay nhận sản xuất video cho khách hàng**. Không tạo CRM, billing, multi-tenant, autopost farm.
- Đây là dự án rất quan trọng đối với sự nghiệp lâu dài, do đó **bảo toàn code, dữ liệu, quyền IP, tài chính, thời gian và khả năng rút lui khỏi sai lầm kiến trúc** quan trọng hơn việc demo hào nhoáng.
- Không hứa viral, không bịa RPM, YPP eligibility, doanh thu, số lượt xem hoặc chi phí; chưa có dữ liệu performance kênh hay budget/hardware được xác minh.
- Chủ nhân **giữ quyền creative approval và quyết định chi tiền / đăng nội dung**. AI chỉ chuẩn bị video, metadata và release package; upload thủ công là mặc định.

### B. Quyết định mới nhất: provider architecture

Tôi muốn **đa provider API**, cân nhắc **OmniRoute/OmniRouter-like gateway gộp nhiều provider về một endpoint**, ưu tiên nguồn **free hợp lệ** và local-first để tiết kiệm, dùng paid có giới hạn khi thực sự cần chất lượng. Nên thiết kế như sau:

- **FilmForge-owned capability-aware router** đặt cạnh hệ thống provider Jellyfish có sẵn: nhận intent `text|image|video|tts|asr`, quality/length/ratio/first-last frame/references/rights/privacy/budget, trả về route cụ thể cùng lý do.
- **External gateway OPTIONAL**, không khóa cả FilmForge vào OmniRoute; giữ native direct adapters cho video/image provider hoặc media feature mà gateway không hỗ trợ.
- **Một URL không đồng nghĩa mọi modality có cùng protocol**. Text/completions khác text→image, text/image→video async/polling, TTS, ASR.
- **Free-first ≠ always-free**. Kiểm tra per model/account vùng, API commercial rights, quota, credits, expiration, privacy và pricing *tại ngày sử dụng*. Unknown price != 0. Không bypass giới hạn / dùng consumer subscription credential nếu API terms không cho phép.
- **Mặc định paid fallback OFF**. Chỉ đổi sang paid khi tôi cho phép và có hạn mức rõ. Với video đã có thể submit thành công nhưng timeout, **không bao giờ tự động tạo paid task ở route khác**. Khi có remote job ID, poll đúng provider/gateway/account ban đầu, ghi provenance để review.
- Test trước cho text, sau đó image, rồi video async; voice/ASR và ComfyUI/local là tùy chọn. Không nhập hết code OmniRoute vào fork hoặc thay TaskService trước khi có benchmark.
- Route preview giải thích candidate được chọn, bị loại vì gì, ước tính chi phí; final accepted `Task` giữ actual route, seed/reference/source, model version, file IDs và outcome.
- Security: no secrets in Git, JSON response, logs, stdout; audit current frozen execution_config before extending; validate external base URLs and allowlist hosts to prevent server-side request forgery.

### C. Repo hiện tại và những thứ KHÔNG được phá

Nguồn gốc: fork [Forget-C/Jellyfish](https://github.com/Forget-C/Jellyfish), Apache-2.0. Backend **Python FastAPI, SQLAlchemy, DB-backed task worker**; frontend **React/Vite**; MySQL / S3-compatible storage; Jellyfish already has storyboard, scenes, asset references, tasks, Takes and editorial history.

Current source findings verified during planning, **not proven by a local boot in this conversation**:

- `backend/app/core/contracts/provider.py` currently has `ProviderKey = Literal["openai", "volcengine", "vidu", "kling"]`.
- `backend/app/services/llm/provider_registry.py` and `provider_resolver.py` define provider specs, category support and effective base_url with category-specific overrides.
- `backend/app/core/integrations/model_catalog.py` retrieves `/models` for compatible providers, guesses category from model name. **This is not reliable enough to assert image/video capabilities.**
- `backend/app/core/integrations/media_provider.py` submits/polls native provider video/image work; providers have heterogeneous endpoints/auth.
- `backend/app/services/generation/submission/submitter.py` freezes accepted generation config and calls `TaskService`.
- `docs/development/architecture/task-execution.md`: `TaskService` is **single writer** of `tasks.status`; one coordinator worker per DB; restart resumes remote jobs with remote ID, may fail unknown/no-ID jobs; no generic DAG recovery, no multi-coordinator scaling. Do not introduce a second job state machine.

**Existing project instructions take precedence:** `AGENTS.md`, `CONSTRAINTS.md`, `docs/development/standards/development.md`, `docs/development/standards/documentation.md`, `docs/development/standards/commit-convention.md`, `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`. Frontend must use **generated OpenAPI client** for changed APIs.

### D. Read the authoritative documents BEFORE planning code

Use the GitHub connector; **read actual files on main** in this order:

1. `docs/filmforge/README.md` — navigator/strategy priority.
2. `docs/filmforge/roadmap.md` — **active roadmap**: C0/M0, G0/G1/G2/G3, C1/C2, deferred long-film M1–M6.
3. `docs/filmforge/creator-first.md` — creator-owned original IP, audience, rights, economics.
4. `docs/filmforge/provider-routing-architecture.md` — internal contract, capability & cost policies, sticky async route and failure matrix.
5. `docs/filmforge/provider-gateway-evaluation.md` — OmniRoute vs OmniRouter vs LiteLLM vs OpenRouter vs direct, verified repo SHAs and uncertainty.
6. `docs/filmforge/provider-implementation-plan.md` — G0–G3 plan and RED/GREEN/failure modes.
7. `tasks/plan.md` + `.scratch/filmforge-studio/spec.md` + required task files. **Markdown tracker is canonical**, not GitHub Issues.
8. `docs/filmforge/creator-board-review.md`, `docs/filmforge/creator-tech-radar.md` and `docs/filmforge/policy-sources.md`.
9. `docs/filmforge/master-handoff.md` for *historical* long-film architecture only. Its original build order has been superseded; **do not re-enable series-first scheduling** by accident.

Docs are plans, not evidence that code, API tests or published videos already exist.

### E. Important upstream candidates (evaluate, never mass merge)

- [cheaper-inference/OmniRoute](https://github.com/cheaper-inference/OmniRoute) **MIT**, `release/v3.8.55` pinned snapshot `5ffa68e835442a12ed1204a2eebf4076c298aecb` — first **optional gateway pilot**. Read real license and media endpoint docs. If “OmniRouter” was intended to refer to another product, do not assume equivalence.
- [omnilabs-ai/OmniRouter](https://github.com/omnilabs-ai/OmniRouter) **Apache-2.0**, `b0a8fce9f90690d477db882de4366773357ded16` — distinct project, compare routing policies.
- [BerriAI/litellm](https://github.com/BerriAI/litellm) `6a6c90aab82c6771cf65efa52ba628357b6639f2` — gateway alternative; custom/mixed license must be checked (GitHub NOASSERTION). [OpenRouter](https://openrouter.ai/collections/free-models) offers a hosted free-model catalog with limitations; not all models generate video.
- [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) MIT — short-video script→TTS→caption→render patterns.
- [SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper) MIT — local ASR/captions, verify Vietnamese timings.
- [neopen/story-shot-agent](https://github.com/neopen/story-shot-agent) MIT — script→shot drafts.
- [remotion-dev/remotion](https://github.com/remotion-dev/remotion) **custom license** — future programmatic React video editing, audit commercial terms before adopting.
- Blender/ComfyUI external engines, OpenTimelineIO/OpenCue later. GPL/AGPL/weights/assets licenses differ from gateway library license. Every port needs SHA/file-level provenance and notices.
- Avoid relying on GitHub stars as proof of suitability.

### F. Exact phase/task order — no cheating dependencies

**Two parallel beginnings**:
1. **M0 Technical:** `01` bootstrap local → `02` baseline tests + `03` existing TaskService/provider map + `04` film-domain map → `05` conditional Jellyfish GO/NO-GO. `01–04` are engineering tasks; `05` needs owner decision. *No claim code works until verified.*
2. **C0 Creative (manual owner track):** `36–40` original universe/channel thesis, publishing rights, 8–12 distinct video experiments, real YouTube Studio analytics and go/pivot review. **C0 must NOT wait for FilmForge code/router**. Owner does all actual publishing and rights approval.

**After 03/04 evidence, active router engineering track**:
- **G0 / `54–55`:** audit current providers; bounded licensed gateway comparison and owner-approved pilot.
- **G1 / `56–59`:** typed capability matrix, allowed legitimate-free filters, deterministic routing dry run, one text gateway adapter with tests.
- **G2 / promoted `14–15` + `60–63`:** precise media preflight, paid submit safety, image/video route, sticky async poll/provenance, cost/quotas, minimal route UI. **Use existing 14/15; don't duplicate them.**
- **G3 / `64–65`:** optional local ASR/ComfyUI; direct vs gateway quality/cost benchmark and owner signoff.

**C1 `41–47`** short-video creative pipeline with export/voice/subtitles can proceed using native providers alongside G1; never force it to wait for speculative omni-media gateway.  
**C2 `48–53`** owned channel analytics/one original 3–10m episode, cost and audience review.  
**Long film** `06–13 and `16–35` intentionally deferred (except 14/15 promoted). Later step toward xianxia 300+ episodes and feature film.

**Ticket status model:** `Status` = `needs-triage|needs-info|ready-for-agent|ready-for-human|wontfix`. `Progress` = `not-started|in-progress|blocked|done`. Use only current ticket `## Comments` for actual reviewer notes, command output, SHA. Don't mark progress done without proof.

### G. Use skills and plugins explicitly, not decoratively

**GitHub plugin/connector:** user connected `@github` in original chat. In the new chat, discover and use the available GitHub connector actions to read branch/head/tree, fetch source, create file/tree/commit, update `main` only via fast-forward/expected SHA, verify changed files. Do not assume connector can run shell or tests. If connector absent, request reconnection; don't invent GitHub state.

**Superpowers plugin:** discover/read current skills, including:
- `skills://plugins/superpowers/using-superpowers/skill.md`
- `skills://plugins/superpowers/brainstorming/skill.md` (for substantive new designs)
- `skills://plugins/superpowers/writing-plans/skill.md` (task-local implementation plan; owner-approved docs already provide high-level architecture)
- `skills://plugins/superpowers/test-driven-development/skill.md`
- `skills://plugins/superpowers/verification-before-completion/skill.md`
- `skills://plugins/superpowers/requesting-code-review/skill.md`
- `skills://plugins/superpowers/executing-plans/skill.md` when executing native step-by-step.

**Agent Skills plugin:** read `skills://plugins/agent-skills/test-driven-development/skill.md`; use RED → GREEN → REFACTOR and codebase's actual test commands. Discover other planning/review skills if available, do not guess unlisted URIs.

**Andrej Karpathy Skills:** `skills://plugins/andrej-karpathy-skills/karpathy-guidelines/skill.md`: surface assumptions, smallest verified code, no speculative architecture, surgical diffs, unambiguous acceptance criteria.

**How to apply:** read relevant skills through available `skills__read` or skill tooling (not by mentioning a name); apply repo `AGENTS.md`/`CONSTRAINTS.md` and direct user restrictions if plugin workflow suggests creating extra long-lived branches or writing unasked-for features. Skills/plugins may not be connected in the new chat; discover availability first, never claim any were run when absent.

**Optional coding environment:** use ChatGPT Work/Codex/local checkout capable of running Python/Node tests. GitHub connector is for repository access and changes; actual build verification requires runnable checkout.

### H. Verification and commit protocol

1. Inspect real latest `main` head, branches, active task `Status/Progress` and current CI; no other long-lived branches.
2. Select the **highest-priority ready-for-agent and unblocked** task in the current workstream. **Start with task 01** if M0 hasn't run; do not jump to 56 or falsely mark prerequisites Done.
3. Read existing code and neighboring tests; make **small task-local plan** with files and failure modes; creative human task is not an engineering auto-task.
4. RED: test the intended behavior and show genuine FAIL. GREEN: minimal change and show PASS. Negative test for paid/failover/rights. Run scoped and appropriate full checks (M0 must establish actual working commands).
5. Default commands as **candidates, must verify against repo**:
   - `cd backend && uv run pytest -q`; `uv run pylint app`
   - `pnpm --dir front run typecheck` and `pnpm --dir front run build`
   - On API changes, regenerate `pnpm --dir front run openapi:update` **against the current server** and review diff.
6. Security review (tokens, logs, third-party endpoints, SSRF, license, data retention), quality review and no unverified feature claims.
7. Commit tested changes to `main` with repo subject `[feat] ...`/`[fix] ...`/`[docs] ...`; no force pushes. If another agent updated main, fetch and reconcile, don't overwrite.
8. Read GitHub state after push, verify exact changed paths/commit SHA and canonical task `Progress`/`Comments`. No “merged” claim without GitHub verification.
9. Report actual work completed, tests/build/logs, risk and remaining blockers. **Never promise delayed background completion.**

### I. Non-negotiable project and financial safety

- No real paid API request, no cloud GPU rental, no subscription purchase, no video publish without my explicit approval of **account/provider, per-job and monthly VND budget, rights and content**. Start with free/offline tests.
- Free tier must explicitly permit creator monetized content and safe credential usage; do NOT circumvent quotas by rotating accounts / scraping unauthorized tokens / bypassing restrictions.
- If exact OmniRoute gateway identity remains uncertain, use the candidate comparison; do not lock implementation to an unconfirmed service.
- No copyrighted story adaptations, actor likeness/voices/music/footage or commercial claims without rights. No mass duplicate AI uploads or engagement manipulation.
- Never remove existing Jellyfish attribution/license or write AGPL/GPL copied core into Apache repo without review.
- Maintain film intent and future export: storyboard → scene/shot → pinned asset refs → task → take → selected cut → FFmpeg export → owner review/manual upload → aggregated analytics; can expand later to series/rig/feature production.

### J. What I want you to DO in this new chat

**Do not only re-explain the roadmap**. Use connected GitHub and coding tools to **execute the next unblocked engineering task**, starting from `01` if baseline still unverified, then move only when its evidence exists; also inspect the new G0 routing tasks (`54–55`) to ensure no flawed assumptions. If a build environment is available, run real tests; if not, explicitly state constraints and produce a reviewable plan/source mapping, not false verification. **One task per verified commit**, preserve main and logs. Never perform real paid model calls without me authorizing the limit. Explain exactly what you changed, why, test evidence and commit link.

## END COPY-PASTE PROMPT

---

### Additional owner decisions not yet specified (do not invent)

- Exact provider/API keys and whether original scripts/images can leave local machine.
- Maximum single-call and monthly API cost in VND, creator time budget, local GPU/OS.
- Whether “ommirouter” specifically means `cheaper-inference/OmniRoute`, `omnilabs-ai/OmniRouter` or a hosted endpoint.
- Artistic choices: first original xianxia protagonist, short-video lane, visual style, voice/music sources.
- Whether any channel is monetized; no real analytics/revenue data yet.

**Defaults for unprovided decisions:** no paid calls; no real upload; no sharing unpublished scripts with external gateway unless owner explicitly enables; use local fixtures or safe direct provider mocks; keep current code and continue M0 documentation/verification.

### Notes for future workers

Do not use previously stated “final roadmap” text from old conversations to override the **actual file on latest main**. User's instructions and most recent authoritative repo docs supersede earlier drafts. Report conflicts in writing and resolve them in task/ADR only with evidence. This handoff is intentionally standalone but **the repo is the source of truth**.
