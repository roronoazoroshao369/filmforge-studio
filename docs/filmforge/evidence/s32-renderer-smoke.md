# S32 continuation — renderer-only smoke (2026-11-28)

## Boundary and actual execution

Baseline `913380748906e5124a1723a0f149a7aed9106677`. GitHub source `backend/tests/directing/picture_master_fixture.py` Git blob `ed82439fc153578bd8f2528e8e5f9d02351128a4` was copied into a disposable local directory; `git hash-object` matched exactly. Only its original `_hash` and `render_picture` function bodies were loaded through Python AST (no app imports). Synthetic manually constructed renderer inputs do not assert any persisted Cut/Take/TaskOutput identity. No application checkout, database, build_manifest, pytest, provider, private data, network media, payment or deployment used. Local Python 3.13.5; FFmpeg and ffprobe 7.1.5-0+deb13u1; not the locked S01 runtime. Both historical checkout paths absent; git ls-remote failed DNS, exit 128; baseline GitHub Actions list total_count=0. No patch application to backend.

## Terminal evidence

```text
Git blob verified: ed82439fc153578bd8f2528e8e5f9d02351128a4
Source hashes: {"video1": "001dacce535216faed3232ede56e9d4ceca65e155375369c567f56c5176fae0a", "video2": "b8039a4f2836b96e8b34c71a9785c6708bdad63975fc38696cd9f17b1a51c084", "video3": "93116194ddeb4d38f6413e5260aa2ab01698d6eff073e7dfcde00a26a117464c"}
reshoot-a.mp4: 320x180 H264 25fps 50 frames 2s; all 200 center pixels checked; SHA256=35eaa06d49633d2452fe8556bd6b8c6a09b9fd7d499949bfa31d89b612421ee7
reshoot-b.mp4: 320x180 H264 25fps 50 frames 2s; all 200 center pixels checked; SHA256=33ae1abde22f2fc0a26aeebd2949646603d39cab5d3fc6b408c7a91dab5a9246
Distinct output hashes, unchanged source hashes, tampered manifest hash rejected: PASS (renderer only)
renderer_smoke_exit=0
```

## Reproduction

In a fresh disposable directory copy the exact source blob above from the authorized repository; verify its hash. Run the following equivalent standalone checks (no ORM imports, no persisted authority). Encoded hashes may differ across FFmpeg builds; verify content, timing and within-run hash invariants. Do not use this as a substitute for the integration patch.

```python
import ast
import hashlib
import json
import subprocess
from pathlib import Path
from copy import deepcopy

root = Path.cwd()
source = root / 'picture_master_fixture.py'
expected = 'ed82439fc153578bd8f2528e8e5f9d02351128a4'
assert subprocess.check_output(['git', 'hash-object', str(source)], text=True).strip() == expected
parsed = ast.parse(source.read_text())
selected = [n for n in parsed.body if isinstance(n, ast.FunctionDef) and n.name in {'_hash', 'render_picture'}]
assert [n.name for n in selected] == ['_hash', 'render_picture']
exec(compile(ast.Module(body=selected, type_ignores=[]), str(source), 'exec'))

paths = {}
for i, color in enumerate(('red', 'blue', 'lime'), 1):
    fid = f'video{i}'
    path = root / f'{fid}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-f', 'lavfi', '-i',
                    f'color=c={color}:s=320x180:r=25:d=2', '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-n', str(path)], check=True, timeout=30)
    paths[fid] = path
hashes = {k: _hash(p) for k, p in paths.items()}
assert len(set(hashes.values())) == 3

def media(fid, start, end, at):
    return dict(kind='media', file_id=fid, sha256=hashes[fid],
                source_in_ms=start, source_out_ms=end,
                timeline_start_ms=at, duration_ms=end-start)

a = dict(scope='renderer-only synthetic input; not persisted cut or lineage',
         width=320, height=180, fps=25, segments=[
             media('video1', 200, 1000, 0),
             dict(kind='gap', timeline_start_ms=800, duration_ms=400),
             media('video2', 400, 1200, 1200)])
b = deepcopy(a)
b['segments'][0] = media('video3', 200, 1000, 0)
output_hashes = []
for label, manifest, first_channel in zip(('a', 'b'), (a, b), (0, 1)):
    movie = root / f'reshoot-{label}.mp4'
    render_picture(manifest, paths, movie)
    probe = json.loads(subprocess.check_output(
        ['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(movie)],
        timeout=30))
    assert len(probe['streams']) == 1
    v = probe['streams'][0]
    assert (v['codec_type'], v['codec_name'], v['width'], v['height'],
            v['r_frame_rate'], int(v['nb_frames'])) == ('video', 'h264', 320, 180, '25/1', 50)
    assert float(probe['format']['duration']) == 2.0
    pixels = subprocess.check_output(
        ['ffmpeg', '-v', 'error', '-i', str(movie), '-vf', 'crop=2:2:(iw-2)/2:(ih-2)/2',
         '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-threads', '1', '-'], timeout=30)
    assert len(pixels) == 50 * 12
    for frame in range(50):
        channel = first_channel if frame < 20 else (None if frame < 30 else 2)
        for offset in range(frame * 12, (frame + 1) * 12, 3):
            pixel = pixels[offset:offset+3]
            if channel is None:
                assert max(pixel) < 12
            else:
                assert pixel[channel] > 200 and all(x < 25 for j, x in enumerate(pixel) if j != channel)
    manifest['output_sha256'] = _hash(movie)
    movie.with_suffix('.json').write_text(json.dumps(manifest, indent=2)+'\n')
    output_hashes.append(_hash(movie))
    print(movie.name, _hash(movie))
assert output_hashes[0] != output_hashes[1]
assert {k: _hash(p) for k, p in paths.items()} == hashes
bad = deepcopy(a)
bad['segments'][0]['sha256'] = '0'*64
try:
    render_picture(bad, paths, root / 'must-not-exist.mp4')
except ValueError as e:
    assert str(e) == 'source hash changed before render'
else:
    raise AssertionError('hash mismatch was not rejected')
assert not (root / 'must-not-exist.mp4').exists()
```

## Remaining acceptance

The fixture confirms only renderer response to supplied hashes and segment order/timing/color. Flat colors cannot prove exact temporal source trims or pixel identity over the whole frame. The actual SQLite regression, source-to-manifest lineage, candidate idempotency, revision CAS, ActiveCut immutability, relevant aggregate suite, and current-canvas adoption/product export remain unverified. Keep [unapplied integration patch](s32-reshoot-regression.patch) and original #46 fields/acceptance. No binary media committed; reproduction uses synthetic assets only.
