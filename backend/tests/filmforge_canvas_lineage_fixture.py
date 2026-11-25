"""Read-only offline candidate proof, not an application service or a Cut writer."""

from fastapi import HTTPException
from sqlalchemy import select

from app.models.generation_canvas import CanvasCurrentOutput, CanvasResultSet, CanvasRun, CanvasRunNode
from app.models.directing import Sequence
from app.models.studio import Chapter, FileUsage
from app.models.task import Task, TaskOutput
from app.services.generation_canvas.current_state import CanvasCurrentState
from app.services.generation_canvas.store import CanvasStore
from app.services.studio.files import require_available_file


def require(condition, reason):
    if not condition:
        raise HTTPException(422, reason)


async def resolve_candidate(db, project_id, canvas_id, card_id, ordinal):
    """Resolve exact current video lineage from persisted facts; never create adoption."""
    require(bool(project_id), 'project scope required')
    canvas = await CanvasStore(db, project_id).get(canvas_id)
    scene = await db.scalar(select(Sequence.id).join(Chapter, Chapter.id == Sequence.chapter_id).where(
        Sequence.id == canvas.sequence_id, Chapter.project_id == project_id))
    require(scene is not None, 'scene scope required')
    pointer = await db.get(CanvasCurrentOutput, (canvas_id, card_id))
    require(pointer is not None, 'missing current result')
    result = await db.get(CanvasResultSet, pointer.result_set_id)
    require(result is not None and (result.canvas_id, result.card_id) == (canvas_id, card_id),
            'foreign result')
    node = await db.get(CanvasRunNode, result.node_id)
    require(node is not None and (node.canvas_id, node.card_id, node.result_set_id, node.basis_hash) ==
            (canvas_id, card_id, result.id, result.basis_hash) and node.status == 'succeeded'
            and node.outputs == result.outputs and node.basis == result.basis, 'invalid node lineage')
    run = await db.get(CanvasRun, node.run_id)
    require(run is not None and run.canvas_id == canvas_id, 'foreign run')
    task = await db.get(Task, node.task_id) if node.task_id else None
    require(task is not None and (task.project_id, task.target_type, task.target_id, task.kind, task.status) ==
            (project_id, 'canvas_node', node.id, 'video_generation', 'succeeded'), 'invalid task lineage')
    view = await CanvasCurrentState(db, project_id).current_outputs(canvas)
    matches = [item for item in view.get(card_id, []) if item.source.position == ordinal]
    require(len(matches) == 1, 'missing or ambiguous position')
    item = matches[0]
    require(item.available and item.basis_current and item.result_set_id == result.id
            and item.modality == 'video' and item.file_id
            and (item.source.canvas_id, item.source.card_id, item.source.port_id) ==
            (canvas_id, card_id, 'video'), 'stale or unavailable video')
    output = await db.get(TaskOutput, (task.id, ordinal))
    require(output is not None and output.file_id == item.file_id, 'task output mismatch')
    await require_available_file(db, file_id=item.file_id, expected_type='video', lock=False)
    usage = await db.scalar(select(FileUsage.id).where(
        FileUsage.file_id == item.file_id, FileUsage.project_id == project_id,
        FileUsage.usage_kind == 'canvas_history',
        FileUsage.source_ref == f'{canvas_id}:{node.id}:{ordinal}').limit(1))
    require(usage is not None, 'missing scoped history usage')
    return dict(project_id=project_id, sequence_id=scene, canvas_id=canvas_id, card_id=card_id, run_id=run.id,
                node_id=node.id, task_id=task.id, result_set_id=result.id, ordinal=ordinal,
                file_id=item.file_id)
