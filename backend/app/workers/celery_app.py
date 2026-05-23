from celery import Celery

celery_app = Celery(
    "beatmap_tasks",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/1",
    include=["app.workers.tasks"],
)
