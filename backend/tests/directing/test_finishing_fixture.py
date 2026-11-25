"""Offline synthetic finishing proof; no application or provider execution."""
import json
import math
import struct
import subprocess
from copy import deepcopy

import pytest
from sqlalchemy import select

from app.models.directing import ActiveCut, CutTakeReference, DirectingRevision, Take
from app.models.studio import FileItem, FileUsage
from app.models.task import Task, TaskOutput
from tests.directing.picture_master_fixture import build_manifest, render_picture
from tests.directing.test_picture_master_fixture import clip, digest, source_fixture
from tests.directing.test_store import database, frozen


CUES = [(120, 640, 'DEMO A'), (1320, 1880, 'DEMO B')]


def decode(path, *args):
    return subprocess.check_output(['ffmpeg', '-v', 'error', '-nostdin', '-protocol_whitelist',
        'file,pipe', '-i', str(path), *args, '-'], timeout=30)


async def snapshot(db):
    models = (DirectingRevision, Take, ActiveCut, CutTakeReference, FileItem, FileUsage, Task, TaskOutput)
    return {model.__name__: sorted(repr(tuple(deepcopy(getattr(row, col.name))
        for col in model.__table__.columns)) for row in await db.scalars(select(model))) for model in models}


def rms(samples):
    return math.sqrt(sum(x*x for x in samples)/len(samples))


@pytest.mark.asyncio
@pytest.mark.parametrize('width,height', [(180, 320), (320, 180)])
async def test_finished_master_timing_caption_pixels_and_source_history(tmp_path, width, height):
    from tests.directing.finishing_fixture import finish_master

    async with database(tmp_path) as sessions:
        async with sessions.begin() as db:
            store, seq, _, takes, paths = await source_fixture(db, tmp_path)
            await frozen(store, seq, 'cut', {'items': [clip('prior', takes[0].id)]})
            cut = await frozen(store, seq, 'cut', {'items': [
                clip('b', takes[1].id, 400, 1200, 1200), clip('a', takes[0].id)]})
            before = await snapshot(db)
            hashes = {k: digest(v) for k, v in paths.items()}
            manifest = await build_manifest(store, seq, cut.id, paths, width, height)
            picture = tmp_path / 'picture.mp4'
            render_picture(manifest, paths, picture)
            picture_hash = digest(picture)
            target = tmp_path / f'finished-{width}x{height}.mp4'
            finish_master(manifest, picture, picture_hash, CUES, target)

            probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error',
                '-show_streams', '-show_format', '-of', 'json', str(target)], timeout=30))
            assert len(probe['streams']) == 2
            video, audio = probe['streams']
            assert (video['codec_name'], video['width'], video['height'], video['r_frame_rate'],
                    video['time_base'], int(video['nb_frames'])) == ('h264', width, height, '25/1', '1/12800', 50)
            assert (audio['codec_name'], audio['sample_rate'], audio['channels']) == ('aac', '48000', 1)
            assert float(video['start_time']) == float(audio['start_time']) == 0
            assert float(video['duration']) == float(audio['duration']) == float(probe['format']['duration']) == 2.0

            raw = decode(target, '-map', '0:a:0', '-f', 'f32le', '-ac', '1', '-ar', '48000')
            samples = [v[0] for v in struct.iter_unpack('<f', raw)]
            assert 96000 <= len(samples) <= 97024  # AAC frame padding, not timeline duration
            assert max(abs(x) for x in samples) < 0.5
            for frame in range(50):
                level = rms(samples[frame*1920:(frame+1)*1920])
                if 20 <= frame < 30:
                    assert level < 0.015, (frame, level)
                else:
                    assert 0.07 < level < 0.18, (frame, level)
            for start, end, expected in [(100, 700, 440), (1300, 1900, 660)]:
                window = samples[start*48:end*48]
                crossings = sum(a <= 0 < b for a, b in zip(window, window[1:]))
                assert abs(crossings / ((end-start)/1000) - expected) < 5

            frames = decode(target, '-map', '0:v:0', '-f', 'rawvideo', '-pix_fmt', 'gray')
            assert len(frames) == width*height*50
            all_bounds = []
            for frame in range(50):
                pixels = frames[frame*width*height:(frame+1)*width*height]
                bright = [i for i, p in enumerate(pixels) if p > 220]
                visible = 3 <= frame < 16 or 33 <= frame < 47
                assert bool(bright) == visible, frame
                if visible:
                    xs, ys = [i % width for i in bright], [i // width for i in bright]
                    bounds = (min(xs), min(ys), max(xs), max(ys))
                    all_bounds.append(bounds)
                    assert bounds[0] >= width//10 and bounds[2] < width-width//10
                    assert bounds[1] >= height//10 and bounds[3] < height-(height//5 if height>width else height//10)
                if 20 <= frame < 30:
                    assert max(pixels) <= 8
            # Re-encoding may differ, but the picture's central region must retain the shot.
            rgb = decode(target, '-map', '0:v:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24')
            for frame, channel in [(5, 0), (40, 2)]:
                offset = (frame*width*height + (height//2)*width + width//2)*3
                color = rgb[offset:offset+3]
                assert color[channel] > 200 and all(v < 30 for i, v in enumerate(color) if i != channel)

            assert digest(picture) == picture_hash
            assert {k: digest(v) for k, v in paths.items()} == hashes
            assert await snapshot(db) == before
            assert not db.dirty and not db.new and not db.deleted
            print(f'{target.name}: sha256={digest(target)} caption_bounds={sorted(set(all_bounds))} samples={len(samples)}')


@pytest.mark.parametrize('cues,reason', [
    ([(121, 640, 'DEMO A')], 'frame grid'),
    ([(640, 1320, 'DEMO A')], 'media segment'),
    ([(120, 640, 'DEMO A'), (600, 760, 'DEMO B')], 'overlap'),
    ([(120, 640, 'DEMO:bad')], 'fixture text'),
    ([(1320, 2040, 'DEMO B')], 'timeline'),
])
def test_invalid_caption_contract_rejected_before_output(tmp_path, cues, reason):
    from tests.directing.finishing_fixture import finish_master

    manifest = {'width': 180, 'height': 320, 'fps': 25, 'duration_ms': 2000, 'segments': [
        {'kind': 'media', 'timeline_start_ms': 0, 'duration_ms': 800},
        {'kind': 'gap', 'timeline_start_ms': 800, 'duration_ms': 400},
        {'kind': 'media', 'timeline_start_ms': 1200, 'duration_ms': 800}]}
    target = tmp_path/'finished.mp4'
    with pytest.raises(ValueError, match=reason):
        finish_master(manifest, tmp_path/'missing.mp4', '', cues, target)
    assert not target.exists()
    assert not target.with_suffix('.wav').exists()


@pytest.mark.parametrize('case,reason', [('tampered', 'picture hash'), ('segment', 'segment timeline')])
def test_finishing_rejects_invalid_picture_or_segment_before_writing(tmp_path, case, reason):
    from tests.directing.finishing_fixture import finish_master

    manifest = {'width': 180, 'height': 320, 'fps': 25, 'duration_ms': 2000, 'segments': [
        {'kind': 'media', 'timeline_start_ms': 0, 'duration_ms': 800},
        {'kind': 'gap', 'timeline_start_ms': 800, 'duration_ms': 400},
        {'kind': 'media', 'timeline_start_ms': 1200, 'duration_ms': 800}]}
    picture = tmp_path/'picture.mp4'
    picture.write_bytes(b'synthetic sentinel')
    expected = digest(picture)
    if case == 'tampered':
        picture.write_bytes(b'changed sentinel')
    else:
        manifest['segments'][1]['timeline_start_ms'] = 840
    target = tmp_path/'finished.mp4'
    with pytest.raises(ValueError, match=reason):
        finish_master(manifest, picture, expected, CUES, target)
    assert not target.exists()
    assert not target.with_suffix('.wav').exists()


def test_finishing_never_overwrites_existing_target(tmp_path):
    from tests.directing.finishing_fixture import finish_master

    manifest = {'width': 180, 'height': 320, 'fps': 25, 'duration_ms': 2000, 'segments': [
        {'kind': 'media', 'timeline_start_ms': 0, 'duration_ms': 800},
        {'kind': 'gap', 'timeline_start_ms': 800, 'duration_ms': 400},
        {'kind': 'media', 'timeline_start_ms': 1200, 'duration_ms': 800}]}
    picture, target = tmp_path/'picture.mp4', tmp_path/'finished.mp4'
    picture.write_bytes(b'synthetic sentinel')
    target.write_bytes(b'prior master')
    with pytest.raises(FileExistsError):
        finish_master(manifest, picture, digest(picture), CUES, target)
    assert target.read_bytes() == b'prior master'
    assert not target.with_suffix('.wav').exists()
