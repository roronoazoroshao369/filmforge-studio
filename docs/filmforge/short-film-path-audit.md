# Short-film path audit — S01 / #41

Baseline: `91e6ace04fd5b7d3f760c5369690c3e0bd49d701` (2026-11-24). Source audit + synthetic media only. No application change, provider call, private media, paid usage or production data.

| Capability | Classification | Source and existing test evidence (tests not run unless stated) |
| --- | --- | --- |
| Scene/storyboard | Supported in source | [App routes](../../front/src/App.tsx#L59-L64); [directing API](../../backend/app/api/v1/routes/studio/directing.py#L116-L288): objects, storyboard candidate/apply/restore, continuity; sequence creation/update lines 346–356. |
| Generation/Take | Supported in source | [Production API](../../backend/app/api/v1/routes/studio/directing.py#L435-L470), [Take model](../../backend/app/models/directing.py#L147-L179), [register_take](../../backend/app/services/directing/store.py#L617-L649), [TaskService.finish](../../backend/app/services/task_service.py#L216); [Take API test](../../backend/tests/directing/test_api.py#L27). No live model call. |
| Cut/provenance | Partial | [SequenceCut](../../backend/app/core/contracts/directing/production.py#L266-L315): planned/media items, unique IDs, no overlap, deliberate gaps. [ActiveCut/CutFrame](../../backend/app/models/directing.py#L253-L279), [range checks](../../backend/app/services/directing/store.py#L587-L604), [partial cut test](../../backend/tests/directing/test_store.py#L83). No UI-to-master proof. |
| Media | Supported, isolated real proof | [media.py](../../backend/app/services/directing/media.py#L9-L75), [media tests](../../backend/tests/directing/test_media.py#L15-L146): actual duration, PNG frame, thumbnail, half-open boundary. |
| Storage/playback | Supported in source | [FileItem](../../backend/app/models/studio_prompts_files_timeline.py#L44), [storage](../../backend/app/core/storage.py#L127-L218), [range response](../../backend/app/services/studio/files.py#L207), [file availability](../../backend/app/services/studio/files.py#L270); [range tests](../../backend/tests/directing/test_media.py#L30-L50), [storage test](../../backend/tests/services/test_storage_integration.py#L28). No live storage call. |
| Master export | Missing in inspected active path | [Retired route test](../../backend/tests/directing/test_api.py#L161-L193) expects export 404. No scene_export matches in backend/app. [Historical delivery doc](../development/architecture/directing-edit-delivery.md) explicitly describes retired contracts; not active capability. |
| Voice/music/captions | Partial design / missing proven assembly | [ReferenceBinding](../../backend/app/core/contracts/directing/production.py#L33-L64) audio references, [DialogueCue](../../backend/app/core/contracts/directing/production.py#L259-L283) planned offset explicitly not a real audio track. No demonstrated voice/music/subtitle master flow. |

## Actual evidence

- New allowed root /home/mussa/Desktop/filmforge-studio contained only MCP metadata. Cloned existing GitHub main into child repo; no new upstream. git fetch origin main, git rev-parse HEAD origin/main, git ls-remote --heads origin main, git status --short --branch, git branch -a: exit 0; all three SHAs matched baseline, clean, only main. Intermittent MCP transport recovered with bounded retries.
- node scripts/filmforge-session-audit.mjs: exit 0, 67 tickets (6 done, 1 in-progress, 1 blocked, 59 not-started), eligible 41/66; 3864 locale keys, 1188 different, 2676 equal, parity true.
- curl public preview: 200 text/html; protected /api/v1/studio/projects 403; exit 0. No browser/API fixture/DB/storage tests. Frontend-only preview is not authenticated production studio.
- Host Node 22.22.1, Python 3.14.4; uv, ffmpeg, ffprobe and backend virtualenv not found. Full/focused pytest not run on host. Prior historical results are not new passes.
- Independent sandbox Python 3.13.5, FFmpeg/ffprobe 7.1.5: copied media.py, git hash-object matched workspace/GitHub blob d361c97a3cbad2e3fd99d552ec02be57585617be. Synthetic testsrc2 640x360, 25fps, 50 frames, H.264, 2.000 seconds; final assertions exit 0: duration and exclusive end 2000ms, rewind, distinct PNG at 0 and 1000ms, thumbnail 480x270, [361,1199) start 400/end 1160ms, last frame 1960ms, empty [361,399) rejected. Initial transcription failed hash/assertion; corrected exact copy passed, no upstream code/test changed. Isolated proof only.

Reproduction from backend directory with Python and FFmpeg/ffprobe installed (temporary synthetic file, auto-cleaned):

```sh
python - <<'PY'
import importlib.util, pathlib, struct, subprocess, tempfile
s = importlib.util.spec_from_file_location("media", "app/services/directing/media.py")
m = importlib.util.module_from_spec(s)
s.loader.exec_module(m)
with tempfile.TemporaryDirectory() as d:
    p = pathlib.Path(d) / "fixture.mp4"
    subprocess.run(["ffmpeg","-v","error","-f","lavfi","-i",
                    "testsrc2=size=640x360:rate=25:duration=2","-c:v","libx264",
                    "-pix_fmt","yuv420p","-movflags","+faststart",str(p)],check=True)
    subprocess.run(["ffprobe","-v","error","-show_entries",
                    "stream=codec_name,width,height,nb_frames,r_frame_rate:format=duration",
                    "-of","json",str(p)],check=True)
    with p.open("rb") as f:
        assert m.probe_duration(f)==2000 and f.tell()==0
        assert m.probe_duration(f,exclusive_end=True)==2000
    b=p.read_bytes()
    a=m.extract_frame(b,0)
    assert a.startswith(b"\x89PNG") and a!=m.extract_frame(b,1000)
    assert struct.unpack(">II",m.extract_frame(b,1000,thumbnail=True)[16:24])==(480,270)
    assert m.extract_boundary_frame(b,361,1199,"start")[1]==400
    assert m.extract_boundary_frame(b,361,1199,"end")[1]==1160
    assert m.extract_boundary_frame(b,361,2000,"end")[1]==1960
    try: m.extract_boundary_frame(b,361,399,"end")
    except ValueError: pass
    else: raise AssertionError("empty interval accepted")
PY
```

## Minimal assembly proposal — not implemented

Resolve confirmed immutable cut revision through existing project-scoped Store. Sort real MediaCutItems by timeline_start_ms; preserve item, Take, immutable file IDs, source_in/out_ms, timeline start and measured duration. Reject empty cut, planned placeholders, missing/cross-project/non-video/unavailable media, out-of-bounds ranges and overlap. Explicit black/silent gap policy; no implicit compaction. Pin output profile, inputs and revision; no untrusted paths, URLs or shell strings. Never mutate Take, ActiveCut, source files or TaskService lifecycle. Candidate pure builder backend/app/services/directing/assembly_manifest.py and test backend/tests/directing/test_assembly_manifest.py: ordering/gaps, rejection cases, stable unaffected items after replacement. Re-triage #46/#18/#33 before code.

## Historical next goal (before continuation)

Provision isolated dependency-locked backend test environment; no production DB. Confirm FFmpeg/ffprobe. Run `cd backend && uv run pytest -q tests/directing/test_media.py tests/directing/test_api.py tests/directing/test_store.py tests/directing/test_retired_routes.py`. Acceptance: real media cases execute (no skip masking), scoped Take media API fixture and retired export 404, store project isolation pass; record counts/exits, audit, update ticket. No provider or timeline changes. If host privileges/dependencies block, use approved isolated runner and keep #41 open.

## S01 continuation — verification completed (2026-11-24)

Baseline main `3dcb47f120398430597692cfe7c74d47bade27a7`. On current MCP host, no application source, test, dependency lock or production configuration changed.

- Isolated tools under repo-local Git metadata. uv 0.13.9 archive SHA-256 `a7fbaff2b9a271d85c1bdb540941090fd1ce011797b4abeb48e4dcd39c2471d5`; FFmpeg-Builds Linux64 8.1 GPL archive SHA-256 `0a2b0a203cadd8ab6b999f61234acec4e83d90dd16587dde0db3c5c7ad1ea554`; both matched release metadata. FFmpeg/ffprobe `n8.1.3-39-g660b5aa7db-20261123`. uv sync --project backend --locked --group dev --python 3.12: exit 0, CPython 3.12.16, 85 resolved, 84 installed.
- First pytest invocation exited 2 because relative --project backend and --directory backend resolved incorrectly; absolute paths corrected, no test/config change.
- Successful exact command from repository root, with isolated HOME, SQLite and no inherited credentials (root/backend .env absent):

```sh
env -i HOME="$PWD/.git/filmforge-s01/test-home" \
 PATH="$PWD/.git/filmforge-s01/ffmpeg-n8.1-latest-linux64-gpl-8.1/bin:/usr/bin:/bin" \
 UV_CACHE_DIR="$PWD/.git/filmforge-s01/cache" \
 UV_PYTHON_INSTALL_DIR="$PWD/.git/filmforge-s01/python" \
 UV_PROJECT_ENVIRONMENT="$PWD/.git/filmforge-s01/venv" \
 DATABASE_URL="sqlite+aiosqlite:///$PWD/.git/filmforge-s01/test.sqlite" \
 AWS_EC2_METADATA_DISABLED=true PYTHONDONTWRITEBYTECODE=1 \
 .git/filmforge-s01/uv-x86_64-unknown-linux-gnu/uv run \
 --project "$PWD/backend" --locked --no-sync --directory "$PWD/backend" \
 pytest -q -ra tests/directing/test_media.py tests/directing/test_api.py \
 tests/directing/test_store.py tests/directing/test_retired_routes.py
```

Output: 65 passed in 23.67s, exit 0, zero failures/skips. Real FFmpeg tests and ASGI/SQLite fixtures cover Take media, retired export 404, project isolation, range playback, revision/cut constraints. Storage/provider mocks where specified by tests; no full backend/live provider claim.

- Re-ran exact synthetic Python snippet above on current MCP host: exit 0; ffprobe H.264 640x360 25/1 fps 50 frames 2.000000 seconds; all assertions pass. Temporary clip auto-cleaned.
- Public curl frontend 200 text/html, protected /api/v1/studio/projects 403, exit 0; no new browser or deploy for docs-only scope.
- #41 source/fixture audit now meets technical criteria. No creative release, production DB, paid calls or live storage; no downstream owner gates changed. Next [#68 synthetic preview](../../.scratch/filmforge-studio/issues/68-public-synthetic-project-preview.md). Re-triage #42/#46 against missing active export.
