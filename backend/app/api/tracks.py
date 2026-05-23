from pathlib import Path
from typing import Annotated

from app.workers.celery_app import celery_app
from app.workers.tasks import generate_beatmap_task
from fastapi import APIRouter, File, UploadFile

router = APIRouter()
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploaded_tracks"
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload")
async def upload_track(file: Annotated[UploadFile, File()], difficulty: str = "normal") -> dict:
    """Upload a track and generate a beatmap."""
    file_path = UPLOAD_DIR / file.filename

    with file_path.open("wb") as buffer:
        buffer.write(await file.read())

    task = generate_beatmap_task.delay(str(file_path), title=file.filename, difficulty=difficulty)

    return {
        "task_id": task.id,
        "status": "processing",
    }

@router.get("/status/{task_id}")
def get_task_status(task_id: str) -> dict:
    """Get the status of a beatmap generation task."""
    task = celery_app.AsyncResult(task_id)

    return {
        "task_id": task_id,
        "status": task.status,
        "result": task.result,
    }
