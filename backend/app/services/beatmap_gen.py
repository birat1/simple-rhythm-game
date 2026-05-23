import json
from pathlib import Path

import librosa
import numpy as np

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploaded_tracks"
UPLOAD_DIR.mkdir(exist_ok=True)

def generate_beatmap(file_path: str, title: str = "Song", difficulty: str = "normal") -> dict:
    """Generate a beatmap from an audio file."""
    # Load audio
    y, sr = librosa.load(file_path)

    # Detect main beats
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)

    # Detect onsets
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)

    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]

    notes = []

    def lane_for_beat(index: int, time: float) -> int:
        energy_index = min(int(time * sr / 512), len(rms) - 1)
        lane = (index % 4 + (1 if rms[energy_index] > np.median(rms) else 0)) % 4
        return lane

    # Add main beats
    for i, t in enumerate(beat_times):
        lane = lane_for_beat(i, t)
        notes.append({"time": float(t), "lane": lane})

        if difficulty in ["normal", "hard"] and i < len(beat_times) - 1:
            sub_time = t + (beat_times[i + 1] - t) / 2
            sub_lane = (lane + 1) % 4
            notes.append({"time": float(sub_time), "lane": sub_lane})

    if difficulty == "hard":
        median_rms = np.median(rms)
        for t in onset_times:
            energy_index = min(int(t * sr / 512), len(rms) - 1)
            if rms[energy_index] > median_rms:
                lane = int(t * 1000) % 4
                notes.append({"time": float(t), "lane": lane})

    notes.sort(key=lambda x: x["time"])

    beatmap = {
        "trackId": Path(file_path).stem,
        "title": title,
        "bpm": int(tempo.item()),
        "lanes": 4,
        "notes": notes,
    }

    json_path = UPLOAD_DIR / f"{Path(file_path).stem}_beatmap.json"
    with json_path.open("w") as f:
        json.dump(beatmap, f)

    return beatmap
