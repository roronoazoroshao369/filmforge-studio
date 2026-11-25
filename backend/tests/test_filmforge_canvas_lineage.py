"""S20 offline candidate lineage proof; no editorial adoption or provider calls."""
from copy import deepcopy

import pytest
from fastapi import HTTPException
from sqlalchemy import select

from app.models.directing import ActiveCut, CutTakeReference, DirectingRevision, Take
from app.models.generation_canvas import CanvasCurrentOutput, CanvasResultSet, CanvasRun, CanvasRunNode, GenerationCanvas
from app.models.studio import Chapter, FileItem, FileUsage, Project
from app.models.task import Task, TaskOutput
from app.services.directing.store import DirectingStore
from app.services.task_service import TaskService, utcnow
from tests.test_generation_canvas_runs import runtime
from tests.test_generation_canvas_images import image_storage
from tests.test_generation_canvas_video import setup_video


async def complete(runtime, task_id, file_id):
    async with runtime.sessions.begin() as db:
        db.add(FileItem(id=file_id, name=file_id, type='video', storage_key=file_id + '.mp4',
                        content_type='video/mp4', duration_ms=2000))
        await db.flush()
        service = TaskService(db)
        assert await service.claim(task_id, worker_id='offline-fixture')
        assert await service.add_output(task_id, ordinal=0, file_id=file_id)
        assert (await service.finish(task_id)).status == 'succeeded'


async def rows(db):
    models = (DirectingRevision, Take, ActiveCut, CutTakeReference, GenerationCanvas,
              CanvasRun, CanvasResultSet, CanvasRunNode, CanvasCurrentOutput, Task, TaskOutput, FileItem, FileUsage)
    return {model.__name__: sorted(
        (repr(tuple(deepcopy(getattr(row, col.name)) for col in model.__table__.columns))
         for row in await db.scalars(select(model)))) for model in models}


@pytest.mark.asyncio
@pytest.mark.parametrize('case, reason', [
    ('valid', None), ('rerun', None), ('foreign-project', 'Canvas not found'), ('foreign-scene', 'scene scope required'),
    ('stale', 'stale or unavailable video'), ('missing-pointer', 'missing current result'),
    ('missing-position', 'missing or ambiguous position'), ('withdrawn', 'stale or unavailable video'),
    ('non-video', 'stale or unavailable video'), ('foreign-usage', 'missing scoped history usage'),
    ('wrong-output', 'task output mismatch'), ('foreign-result', 'foreign result'),
])
async def test_current_candidate_lineage_is_read_only(runtime, image_storage, case, reason):
    from tests.filmforge_canvas_lineage_fixture import resolve_candidate

    async with runtime.sessions.begin() as db:
        db.add(Project(id='foreign', name='Foreign fixture', style='真人都市'))
        db.add(Chapter(id='fixture-chapter', project_id=runtime.project_id, index=1,
                       title='Synthetic scene', raw_text='Synthetic action'))
        await db.flush()
        scene = await DirectingStore(db, runtime.project_id).create_sequence(
            chapter_id='fixture-chapter', title='Synthetic scene', position=0)
        (await db.get(GenerationCanvas, runtime.canvas_id)).sequence_id = scene.id
    accepted, _ = await setup_video(runtime)
    task_id = accepted['task_ids'][0]
    file_id = 'candidate-video'
    await complete(runtime, task_id, file_id)
    state = (await runtime.client.get(runtime.url + '/runtime')).json()['data']
    current = state['current_outputs']['v'][0]
    node = state['runs'][0]['nodes'][0]
    assert current['basis_current'] and current['available']
    assert node['result_set_id'] == current['result_set_id']
    if case == 'rerun':
        async with runtime.sessions() as db:
            prior = await rows(db)
        old_run, old_node, old_result = accepted['run_id'], node['id'], node['result_set_id']
        preview = (await runtime.client.post(runtime.url + '/precheck', json={'card_id': 'v'})).json()['data']
        assert preview['can_run']
        response = await runtime.client.post(runtime.url + '/runs', json={'request_id': 'rerun',
            'preview_token': preview['preview_token']})
        assert response.status_code == 200, response.text
        accepted = response.json()['data']
        task_id, file_id = accepted['task_ids'][0], 'replacement-video'
        await complete(runtime, task_id, file_id)
        state = (await runtime.client.get(runtime.url + '/runtime')).json()['data']
        node = next(run for run in state['runs'] if run['id'] == accepted['run_id'])['nodes'][0]
        assert node['result_set_id'] != old_result
        assert state['current_outputs']['v'][0]['result_set_id'] == node['result_set_id']
        historical = await runtime.client.get(runtime.url + f'/runs/{old_run}/nodes/{old_node}/outputs/0/content')
        assert historical.status_code == 200, historical.text
        card = historical.json()['data']
        assert (card['type'], card['file_id'], card['origin']['node_id']) == ('content.video', 'candidate-video', old_node)
        async with runtime.sessions() as db:
            after = await rows(db)
            for model in ('CanvasRun', 'CanvasResultSet', 'CanvasRunNode', 'Task', 'TaskOutput', 'FileItem', 'FileUsage'):
                assert set(prior[model]) <= set(after[model])
    if case == 'stale':
        document = (await runtime.client.get(runtime.url)).json()['data']['document']
        document['cards'][-1]['config']['seed'] = 19
        response = await runtime.client.put(runtime.url, json={'request_id': 'new-seed',
            'expected_revision': 2, 'document': document})
        assert response.status_code == 200, response.text
        assert not (await runtime.client.get(runtime.url + '/runtime')).json()['data']['current_outputs']['v'][0]['basis_current']
    async with runtime.sessions.begin() as db:
        file = await db.get(FileItem, file_id)
        if case == 'missing-pointer':
            await db.delete(await db.get(CanvasCurrentOutput, (runtime.canvas_id, 'v')))
        elif case == 'withdrawn':
            file.delete_requested_at = utcnow()
        elif case == 'non-video':
            file.type = 'image'
        elif case == 'foreign-scene':
            db.add(Chapter(id='foreign-chapter', project_id='foreign', index=1, title='Foreign scene'))
            await db.flush()
            foreign_scene = await DirectingStore(db, 'foreign').create_sequence(
                chapter_id='foreign-chapter', title='Foreign scene', position=0)
            (await db.get(GenerationCanvas, runtime.canvas_id)).sequence_id = foreign_scene.id
        elif case == 'foreign-usage':
            usage = await db.scalar(select(FileUsage).where(FileUsage.file_id == file.id,
                FileUsage.project_id == runtime.project_id, FileUsage.usage_kind == 'canvas_history'))
            assert usage is not None
            usage.project_id = 'foreign'
        elif case == 'foreign-result':
            (await db.get(CanvasResultSet, node['result_set_id'])).card_id = 'foreign-card'
        elif case == 'wrong-output':
            # Deliberate corruption in disposable SQLite, never a supported writer.
            db.add(FileItem(id='different', name='different', type='video', storage_key='different.mp4'))
            await db.flush()
            (await db.get(TaskOutput, (task_id, 0))).file_id = 'different'
    async with runtime.sessions() as db:
        before = await rows(db)
        project = 'foreign' if case == 'foreign-project' else runtime.project_id
        if case in ('valid', 'rerun'):
            candidate = await resolve_candidate(db, project, runtime.canvas_id, 'v', 0)
            assert candidate == dict(project_id=project, sequence_id=scene.id, canvas_id=runtime.canvas_id,
                card_id='v', run_id=accepted['run_id'], node_id=node['id'], task_id=task_id,
                result_set_id=node['result_set_id'], ordinal=0, file_id=file_id)
        else:
            with pytest.raises(HTTPException) as error:
                await resolve_candidate(db, project, runtime.canvas_id, 'v', 1 if case == 'missing-position' else 0)
            assert error.value.detail == reason
        assert not db.new and not db.dirty and not db.deleted
        assert await rows(db) == before
        assert not any(before[model] for model in ('DirectingRevision', 'Take', 'ActiveCut', 'CutTakeReference'))
