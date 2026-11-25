"""Test-only synthetic picture master; not a production renderer or persisted authority."""

import hashlib
import subprocess

from sqlalchemy import select

from app.core.contracts.directing.production import SequenceCut
from app.models.directing import CutTakeReference
from app.models.studio import FileUsage
from app.models.task import Task, TaskOutput
from app.services.directing.media import probe_duration
from app.services.studio.files import require_available_file


def _hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


async def build_manifest(store, sequence_id, revision_id, paths, width, height):
    """Read confirmed fixture identities only; explicit 25fps frame grid and black gaps."""
    if (width, height) not in {(180, 320), (320, 180)}:
        raise ValueError('unsupported fixture profile')
    row = await store.revision(revision_id, kind='cut', sequence_id=sequence_id, confirmed=True)
    cut = SequenceCut.model_validate(row.payload)
    if not cut.items:
        raise ValueError('empty cut')
    segments, cursor = [], 0
    for item in sorted(cut.items, key=lambda i: i.timeline_start_ms):
        if item.kind != 'media':
            raise ValueError('planned item cannot be rendered')
        start, end, at = item.media_range.source_in_ms, item.media_range.source_out_ms, item.timeline_start_ms
        if any(v % 40 for v in (start, end, at)):
            raise ValueError('fixture requires 25fps frame alignment')
        take = await store.take(item.take_id, sequence_id=sequence_id)
        file = await require_available_file(store.db, file_id=take.file_id, expected_type='video', lock=False)
        task = await store.db.get(Task, take.task_id)
        output = await store.db.get(TaskOutput, (take.task_id, take.output_ordinal))
        ref = await store.db.scalar(select(CutTakeReference.take_id).where(CutTakeReference.revision_id == row.id, CutTakeReference.take_id == take.id))
        usage = await store.db.scalar(select(FileUsage.id).where(FileUsage.file_id == file.id, FileUsage.project_id == store.project_id).limit(1))
        if not task or task.project_id != store.project_id or task.status != 'succeeded' or not output or output.file_id != file.id or not ref or not usage:
            raise ValueError('missing project lineage')
        path = paths.get(file.id)
        if path is None or not path.is_file():
            raise ValueError('missing synthetic media')
        sha = _hash(path)
        if sha != file.content_hash:
            raise ValueError('source hash mismatch')
        with path.open('rb') as stream:
            actual = probe_duration(stream)
        if file.duration_ms != actual or end > actual:
            raise ValueError('source range exceeds measured duration')
        if at > cursor:
            segments.append(dict(kind='gap', timeline_start_ms=cursor, duration_ms=at-cursor))
        segments.append(dict(kind='media', item_id=item.id, take_id=take.id, file_id=file.id, sha256=sha,
                             source_in_ms=start, source_out_ms=end, timeline_start_ms=at, duration_ms=end-start))
        cursor = at + end - start
    return dict(project_id=store.project_id, sequence_id=sequence_id, revision_id=row.id, revision_version=row.version,
                width=width, height=height, fps=25, gap_policy='black', audio_policy='none', duration_ms=cursor, segments=segments)


def render_picture(manifest, paths, output):
    """Only trusted synthetic fixture manifest; no user paths, storage or API integration."""
    width, height = manifest['width'], manifest['height']
    args = ['ffmpeg', '-v', 'error', '-nostdin', '-filter_complex_threads', '1']
    filters, labels, index = [], [], 0
    for n, segment in enumerate(manifest['segments']):
        label = f'[s{n}]'
        labels.append(label)
        if segment['kind'] == 'gap':
            filters.append(f'color=c=black:s={width}x{height}:r=25:d={segment["duration_ms"]/1000}{label}')
        else:
            path = paths[segment['file_id']]
            if _hash(path) != segment['sha256']:
                raise ValueError('source hash changed before render')
            args.extend(['-protocol_whitelist', 'file,pipe', '-i', str(path)])
            start, end = segment['source_in_ms']//40, segment['source_out_ms']//40
            filters.append(f'[{index}:v]trim=start_frame={start}:end_frame={end},setpts=PTS-STARTPTS,'
                           f'scale={width}:{height}:force_original_aspect_ratio=decrease:force_divisible_by=2,'
                           f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,setsar=1{label}')
            index += 1
    filters.append(''.join(labels) + f'concat=n={len(labels)}:v=1:a=0[out]')
    subprocess.run(args + ['-filter_complex', ';'.join(filters), '-map', '[out]', '-an', '-r', '25',
                           '-c:v', 'libx264', '-threads', '1', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-n', str(output)],
                   check=True, timeout=30)
