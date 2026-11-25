"""Offline picture-only proof; no product export route or storage access."""

import hashlib
import json
import subprocess
from copy import deepcopy
from datetime import datetime, timezone

import pytest
from fastapi import HTTPException
from sqlalchemy import select

from app.models.directing import ActiveCut, CutTakeReference, DirectingRevision, Take
from app.models.studio import FileItem
from tests.directing.test_store import database, frozen, output, setup_story


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def clip(item_id, take_id, start=0, end=800, at=0):
    return dict(kind='media', id=item_id, take_id=take_id, timeline_start_ms=at,
                media_range=dict(source_in_ms=start, source_out_ms=end))


async def source_fixture(db, tmp_path):
    store, sequence, design, _, prompts = await setup_story(db)
    paths, takes = {}, []
    for i, color in enumerate(('red', 'blue'), 1):
        file_id = f'video{i}'
        path = tmp_path / f'{file_id}.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i',
                        f'color=c={color}:s=320x180:r=25:d=2', '-c:v', 'libx264',
                        '-pix_fmt', 'yuv420p', str(path)], check=True, timeout=30)
        file = await db.get(FileItem, file_id)
        file.duration_ms = 2000
        file.content_hash = digest(path)
        await output(db, prompts[i-1], f'task{i}', file_id)
        takes.append(await store.register_take(prompt_revision_id=prompts[i-1], task_id=f'task{i}', output_ordinal=0))
        paths[file_id] = path
    return store, sequence, design, takes, paths


@pytest.mark.asyncio
async def test_picture_profiles_keep_lineage_and_gap(tmp_path):
    from tests.directing.picture_master_fixture import build_manifest, render_picture

    async with database(tmp_path) as sessions:
        async with sessions.begin() as db:
            store, sequence, _, takes, paths = await source_fixture(db, tmp_path)
            prior = await frozen(store, sequence, 'cut', {'items': [clip('prior', takes[0].id)]})
            cut = await frozen(store, sequence, 'cut', {'items': [clip('b', takes[1].id, 400, 1200, 1200),
                                                                  clip('a', takes[0].id)]})
            before = [(r.id, deepcopy(r.payload), r.version) for r in (prior, cut)]
            take_before = [(t.id, t.file_id, t.version, deepcopy(t.annotation)) for t in takes]
            hashes = {k: digest(v) for k, v in paths.items()}
            file_before = [(f.id, f.storage_key, f.duration_ms, f.content_hash) for f in [await db.get(FileItem, k) for k in paths]]
            active = (await db.get(ActiveCut, sequence)).revision_id
            refs = set((await db.execute(select(CutTakeReference.revision_id, CutTakeReference.take_id))).all())
            for width, height in [(180, 320), (320, 180)]:
                manifest = await build_manifest(store, sequence, cut.id, paths, width, height)
                assert manifest['revision_id'] == cut.id and manifest['project_id'] == 'p1'
                assert [(s['kind'], s['timeline_start_ms'], s['duration_ms']) for s in manifest['segments']] == [('media', 0, 800), ('gap', 800, 400), ('media', 1200, 800)]
                media = [s for s in manifest['segments'] if s['kind'] == 'media']
                assert [(s['item_id'], s['take_id'], s['file_id'], s['sha256'], s['source_in_ms'], s['source_out_ms']) for s in media] == [
                    ('a', takes[0].id, 'video1', hashes['video1'], 0, 800), ('b', takes[1].id, 'video2', hashes['video2'], 400, 1200)]
                master = tmp_path / f'master-{width}x{height}.mp4'
                render_picture(manifest, paths, master)
                probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(master)], timeout=30))
                assert len(probe['streams']) == 1
                video = probe['streams'][0]
                assert (video['codec_type'], video['width'], video['height'], video['r_frame_rate'], int(video['nb_frames'])) == ('video', width, height, '25/1', 50)
                assert float(probe['format']['duration']) == 2.0
                assert video['time_base'] == '1/12800'
                for at, channel in [('0.4', 0), ('1.0', None), ('1.6', 2)]:
                    pixel = subprocess.check_output(['ffmpeg', '-v', 'error', '-ss', at, '-i', str(master), '-frames:v', '1', '-vf', 'crop=2:2:(iw-2)/2:(ih-2)/2', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], timeout=30)[:3]
                    assert len(pixel) == 3
                    if channel is None:
                        assert max(pixel) < 12
                    else:
                        assert pixel[channel] > 200 and all(v < 25 for i, v in enumerate(pixel) if i != channel)
                manifest['output_sha256'] = digest(master)
                master.with_suffix('.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
                print(f'{master.name}: {width}x{height}, 25fps, 50 frames, 2s, no audio, sha256={digest(master)}')
            assert {k: digest(v) for k, v in paths.items()} == hashes
            for fid, storage_key, duration, sha in file_before:
                file = await db.get(FileItem, fid, populate_existing=True)
                assert (file.storage_key, file.duration_ms, file.content_hash) == (storage_key, duration, sha)
            for rid, payload, version in before:
                row = await db.get(DirectingRevision, rid, populate_existing=True)
                assert (row.payload, row.version) == (payload, version)
            for tid, file_id, version, annotation in take_before:
                row = await db.get(Take, tid, populate_existing=True)
                assert (row.file_id, row.version, row.annotation) == (file_id, version, annotation)
            assert (await db.get(ActiveCut, sequence, populate_existing=True)).revision_id == active
            assert set((await db.execute(select(CutTakeReference.revision_id, CutTakeReference.take_id))).all()) == refs


@pytest.mark.asyncio
@pytest.mark.parametrize('case, message', [('missing', 'missing'), ('foreign', 'project'), ('planned', 'planned'),
    ('overlap', 'overlap'), ('range', 'duration'), ('draft', 'confirmed'), ('deleted', 'File deleted'),
    ('empty', 'empty'), ('unaligned', 'frame'), ('tampered', 'hash'), ('foreign_take', 'project')])
async def test_picture_manifest_rejects_invalid_sources(tmp_path, case, message):
    from app.services.directing.store import DirectingStore
    from tests.directing.picture_master_fixture import build_manifest

    async with database(tmp_path) as sessions:
        async with sessions.begin() as db:
            store, sequence, design, takes, paths = await source_fixture(db, tmp_path)
            item = clip('a', takes[0].id)
            items = [item]
            if case == 'planned':
                items = [dict(kind='planned', id='card', design_revision_id=design, shot_id='s1', estimated_duration_ms=800, timeline_start_ms=0)]
            if case == 'empty':
                items = []
            cut = await store.save_revision(sequence, kind='cut', payload={'items': items})
            if case != 'draft':
                cut = await store.confirm_revision(cut.id, expected_version=cut.version, actor_id='author')
            # Simulate corrupt persisted legacy data only inside this disposable DB.
            if case == 'overlap':
                cut.payload = {'items': [item, clip('b', takes[1].id, at=400)]}
            if case == 'range':
                cut.payload = {'items': [clip('a', takes[0].id, end=2400)]}
            if case == 'unaligned':
                cut.payload = {'items': [clip('a', takes[0].id, end=801)]}
            if case == 'deleted':
                (await db.get(FileItem, 'video1')).deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)
            if case == 'missing':
                paths.pop('video1')
            if case == 'tampered':
                paths['video1'] = paths['video2']
            if case == 'foreign_take':
                other = await DirectingStore(db, 'p2').create_sequence(chapter_id='ch2', title='foreign', position=0)
                takes[0].sequence_id = other.id
            if case == 'foreign':
                store = DirectingStore(db, 'p2')
            await db.flush()
            with pytest.raises((ValueError, HTTPException), match=message):
                await build_manifest(store, sequence, cut.id, paths, 180, 320)
            assert not list(tmp_path.glob('master-*.mp4'))
