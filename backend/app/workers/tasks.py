from app.services.beatmap_gen import generate_beatmap
from app.workers.celery_app import celery_app


@celery_app.task
def generate_beatmap_task(file_path: str, title: str, difficulty: str = "normal") -> dict:
    """Generate beatmap asynchronously."""
    beatmap = generate_beatmap(file_path, title, difficulty)
    return beatmap
