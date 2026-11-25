# S18 / #42 — Offline picture-master fixture proof

Date 2026-11-25 (+07). Baseline `6a7d58d0274ddf926be4d1cd8a8d02caca81c1c7`, verified clean main = origin/main = remote. #41 is done; #42 assumes an existing export pipeline, but [active-path audit](../short-film-path-audit.md) and retired-route regression show it is absent. [Fixed records](../../development/architecture/directing-fixed-records.md) describe readable fixed revisions, not the current editable workbench save model. Independent test-only scope is permitted by session rules; product implementation remains needs-triage, #42 in-progress for evidence only, original acceptance/dependencies unchanged. #46 depends on 42/43/44, remains needs-triage/not-started. #05 unsigned, #55 blocked, no M1/G1 or creative release.

## Scope and result

- New test-only [fixture helper](../../../backend/tests/directing/picture_master_fixture.py) and [contract/integration tests](../../../backend/tests/directing/test_picture_master_fixture.py). No app/API/schema/dependency/config changes. Read a confirmed `DirectingRevision` via `DirectingStore`, validate `SequenceCut`, resolve project/sequence-scoped `Take`, successful `Task` and matching `TaskOutput`, `CutTakeReference`, project `FileUsage`, available video `FileItem`, local source hash and measured duration. Manifest derives from these records and is not a new persisted authority.
- Fixture-only fixed 25fps grid, 40ms frame alignment, contain/pad, explicit black gaps, no audio stream. Two 320x180 2s red/blue synthetic sources; unordered cut resolves A [0,800), gap [800,1200), B [1200,2000) using source [400,1200). No arbitrary user paths or provider/storage access; subprocess argv, file/pipe protocol restriction, timeout, no overwrite, hash recheck before render. No external or private media. Corrupt persisted cases are deliberately constructed only in disposable SQLite to exercise rejection, not an example for production writers.
- RED: pytest -q -x tests/directing/test_picture_master_fixture.py, exit 1, ModuleNotFoundError for not-yet-created fixture helper, 1 failed in 0.19s. GREEN initial: 11 passed in 5.44s, exit 0. Final focused+regression: 97 passed in 14.33s, exit 0, no skip; 12 new cases (one two-profile proof, 11 rejection cases). Missing local source, wrong project revision, foreign Take, planned, overlap, range exceeds measured duration, draft, deleted, empty, unaligned and wrong source hash reject. Prior and current Cut payload/version, Take ID/file/version/annotation, FileItem key/duration/hash, ActiveCut and CutTakeReference unchanged; source bytes unchanged. Real FFmpeg/ffprobe and three decoded RGB center samples verify red/black/blue and preserved gap. Test-only; no fresh full application suite, app pylint, frontend build or browser necessary for unchanged application. Root scripts 20/20, 0 fail/skip; public smoke four endpoints HTTP 530 text/plain, current 403 unverified. #69 S16 SHA run query returned []; no new settings/dispatch.

| Output (pytest tmp_path, not committed or deployed) | Dimensions | Frames / timebase | Duration / audio | SHA256 |
| --- | --- | --- | --- | --- |
| master-180x320.mp4 | 180x320 | 50 at 25fps / 1/12800 | 2.0s / none | 5aebe3bc1570fc97309efad2a91f6d35670fe9677da90fd26e849523c677bec3 |
| master-320x180.mp4 | 320x180 | 50 at 25fps / 1/12800 | 2.0s / none | 2ac28fabfa3acfcebd9a7e858ae2a4afdddb4c5563cd26d669262cbbad197f0c |

Each MP4 is H.264 with a sibling JSON manifest carrying source IDs, ranges, source SHA256, profile, gap/audio policy and output SHA256. Output hashes matched both runs on this host; no portability/determinism claim across FFmpeg versions. Source clips are solid colors: timing and placement proven, not frame-accurate content trim across changing footage. VFR, general timebase conversion, audio/mix, captions/safe areas, 720p/1080p, current-workbench mapping, product export and human visual/rights/release acceptance remain unproven. Do not expose fixture renderer as a production API. No new spend, provider/private/production data, deployment or owner approval. Rollback via reviewed revert of containing commit; preserve unrelated work.

## Reproduce from repository root

Existing cached Python 3.12.16, uv 0.13.9, FFmpeg/ffprobe 8.1.3; no sync, isolated HOME/SQLite, no inherited credentials. Verify cache and absence of .env first.

```sh
ROOT="$PWD"
env -i HOME="$ROOT/.git/filmforge-s01/test-home" \
 PATH="$ROOT/.git/filmforge-s01/ffmpeg-n8.1-latest-linux64-gpl-8.1/bin:/usr/bin:/bin" \
 UV_CACHE_DIR="$ROOT/.git/filmforge-s01/cache" \
 UV_PYTHON_INSTALL_DIR="$ROOT/.git/filmforge-s01/python" \
 UV_PROJECT_ENVIRONMENT="$ROOT/.git/filmforge-s01/venv" \
 DATABASE_URL="sqlite+aiosqlite:///$ROOT/.git/filmforge-s01/test.sqlite" \
 AWS_EC2_METADATA_DISABLED=true PYTHONDONTWRITEBYTECODE=1 \
 "$ROOT/.git/filmforge-s01/uv-x86_64-unknown-linux-gnu/uv" run \
 --project "$ROOT/backend" --locked --no-sync --directory "$ROOT/backend" \
 pytest -q -ra -s tests/directing/test_picture_master_fixture.py tests/directing/test_store.py \
 tests/directing/test_media.py tests/directing/test_contracts.py tests/directing/test_retired_routes.py \
 tests/services/test_task_service.py
node --test scripts/*.test.mjs
```
