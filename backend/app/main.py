import shutil
from pathlib import Path
from typing import Annotated

from app.api import tracks
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tracks.router)

@app.get("/")
def read_root() -> dict:
    """Root endpoint for testing."""
    return {"message": "Simple Rhythm Game API"}
