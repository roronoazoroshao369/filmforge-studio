# Technology Radar — creator-owned short video first, cinematic later

**Snapshot: 2026-11-23 GitHub metadata and project descriptions; SHA pinned below.** “Use” means *evaluate/adapt an idea/API*, **not merged or implemented**. GitHub stars are ecosystem reach, not technical fit or legal permission.

## Technology adoption shortlist

| Priority | Repo / pinned commit | Stars (approx.) / license | Exact reusable slice | Non-goal / caveat |
|---|---|---|---|---|
| **P0** | [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) `3482168e8958a73c48656634c750a5ce459224df` | 145k / MIT | Script→visual source→TTS→captions→music→FFmpeg output orchestration, config/asset selection | Do **not** copy one-click “mass volume” editorial philosophy. Prefer port limited stateless assembly utilities only after audit |
| **P0** | [faster-whisper](https://github.com/SYSTRAN/faster-whisper) `6cb639e70786aea42b9233006ae60eaf07190bdb` | 27k / MIT | Local ASR→word/time-aligned text to human-corrected captions | Need transcription QC, Vietnamese support tests, model-weight license review |
| **P0** | [PenShot](https://github.com/neopen/story-shot-agent) `54fea30a2d8aea9f47f069545c97899077b5eb20` | 244 / MIT | Scene/shot breakdown as isolated pre-production adapter | Avoid making LLM unapproved director; produce typed draft |
| **P0** | [Jellyfish](https://github.com/Forget-C/Jellyfish) `b1d8add653a97ebe89c2eb8cc7b712af800b8f3c` | 7.3k / Apache-2.0 | Film projects, Take, canvas, TaskService and current FFmpeg export | Already forked; audit existing flow **before importing duplicate render code** |
| **P1 evaluate** | [Remotion](https://github.com/remotion-dev/remotion) `970849fc1921ed7e0c3175132fe9580e8875ab2f` | 75k / **custom commercial license** | React video templates, typography/animated subtitles, programmatic variants | Personal commercial media may be permitted under current free tier; check current **Remotion-specific terms** at adoption; not MIT; don't vendor package source blindly |
| **P1 evaluate** | [ShortGPT](https://github.com/RayVentura/ShortGPT) `3df4e0f7a422bf7386565d498bf4521a2544c614` | 8.2k / MIT | Automation pipeline patterns, script/voice/edit integration | Experimental; last pushed 2025-02, stale dependencies/architecture; study, don't base product on it |
| **P1 conditional** | [AI-Youtube-Shorts-Generator](https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator) `8c9ac3103a137e53669aeebfc2af8dbdd810c35a` | 6.5k / MIT | Reframe/scene detection/caption logic from *creator-owned* longform footage | Useful only after own longform library exists; never steal video clips |
| **P1 conditional** | [auto-editor](https://github.com/WyattBlue/auto-editor) `d55b328fb6da0e7d856e78f92a8f28a97dc77f9a` | 6.1k / Unlicense | Silence/tempo-aware local rough cuts, evaluation CLI | Cuts might damage dramatic pauses; editorial approval required |
| **P1 future** | [Toonflow](https://github.com/HBAI-Ltd/Toonflow-app) `eecf51547af47eb504822186bd3f2dee369125ff` | 22.6k / MIT | Infinite canvas, character references, 3D previs | Vue/Bun UI mismatch; **do not merge entire frontend** into React |
| **P1 future** | [LumenX](https://github.com/alibaba/lumenx) `f2a02e23171447c939e7d8e1386b24d17049bbf1` | 1.5k / MIT | Model capability/adapters and story pipeline patterns | Provider APIs can differ or become stale; contract tests required |
| **P2 external** | [ComfyUI](https://github.com/Comfy-Org/ComfyUI) `5ea159fa614bca9fb38a25a099189d6d0b4f3597` | 148k / GPL-3.0 | Local AI inference through **API**, not permissive code merger | GPU/weights/usage rights; not a creator dashboard |
| **P2 caution** | [MoneyPrinterV2](https://github.com/FujiwaraChoki/MoneyPrinterV2) `a734fa924adb9ffe5ab8472aa5526e469e42a8b5` | 32.5k / AGPL-3.0 | Observe general automation UX only | Direct code merge triggers AGPL analysis; no automatic uploads/revenue promises |

**Additional tools:** [FFmpeg](https://github.com/FFmpeg/FFmpeg) remains first-choice external encoder/editor already in upstream. Official FFmpeg distribution is generally LGPL, but builds with GPL-enabled components have additional obligations; inspect binaries and build flags. OpenAI Whisper MIT is fallback/background reference; faster-whisper is the first local ASR evaluation. Fish-Speech models and Remotion contain license details beyond metadata; require explicit code/weight/output review.

## What to cherry-pick in order

1. **No code imported on planning commit.** Evaluate actual Jellyfish FFmpeg/text/video paths first.
2. Apply creator pipeline learnings from MoneyPrinterTurbo to a single **approved** original 9:16 video flow.
3. Integrate faster-whisper via isolated local worker/CLI for subtitles if upstream lacks robust caption timing. Human correction required.
4. Add original story-to-shot drafts from PenShot/Drama Skills as typed data; never autopublish AI drafts.
5. Evaluate Remotion *only* if existing FFmpeg composition is insufficient for animated typography/templates, and after license check.
6. Keep 3D Blender/ComfyUI/long-series systems deferred until creator performance and narrative IP justify them.

## Adoption protocol for any external repo

- Record upstream URL + full commit SHA + exact files copied + license/NOTICE.
- Test dependency, CLI/API compatibility, security, rights to generated assets and model weights.
- Prefer adapter/API/subprocess to copying independent app UIs.
- Use a small isolated spike and tests; port only the minimum code required for actual creator ticket.
- Upstream project feature list ≠ function working in this local repo.
- Do not add GPU / web services / auto-upload background daemons before measurable need.

## Licensing sources

- [Remotion pricing/license](https://www.remotion.dev/docs/license/pricing), [Remotion FAQ](https://www.remotion.dev/docs/license/faq) — custom terms, personal commercial use conditional on eligibility.
- [FFmpeg legal](https://www.ffmpeg.org/legal.html) — LGPL/GPL build conditions.
- [YouTube originality and reuse policy](https://support.google.com/youtube/answer/1311392) — original meaning and creative variation are required, independent of open-source licenses.
