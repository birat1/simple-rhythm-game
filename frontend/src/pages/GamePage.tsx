import React, { useEffect, useState } from "react";
import GameCanvas from "../game/GameCanvas";

interface Note {
    time: number;
    lane: number;
}

interface Beatmap {
    bpm: number;
    lanes: number;
    notes: Note[];
}

const GamePage: React.FC = () => {
    const [beatmap, setBeatmap] = useState<Beatmap | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(3);
    const [countdownStarted, setCountdownStarted] = useState(false);
    const [difficulty, setDifficulty] = useState<"normal" | "hard">("normal");

    // Poll celery task until beatmap is ready 
    useEffect(() => {
        if (!taskId) return;

        const interval = setInterval(async () => {
            const res = await fetch(`http://localhost:8000/status/${taskId}`);
            const data = await res.json();

            if (data.status === "SUCCESS") {
                setBeatmap(data.result);
                clearInterval(interval);
                setCountdown(3);
                setCountdownStarted(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [taskId]);

    // Countdown logic
    useEffect(() => {
        if (!countdownStarted || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdownStarted, countdown]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`http://localhost:8000/upload?difficulty=${difficulty}`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();

        setTaskId(data.task_id);
        setAudioUrl(URL.createObjectURL(file));
        setBeatmap(null);
        setCountdownStarted(true);
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {!taskId && (
                <>
                    <input type="file" accept="audio/*" onChange={handleFileUpload} />
                    <div style={{ marginTop: "10px" }}>
                        <label>
                            Difficulty:
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "normal" | "hard")}>
                                <option value="normal">Normal</option>
                                <option value="hard">Hard</option>
                            </select>
                        </label>
                    </div>
                    <p>Upload a track to start</p>
                </>
            )}

            {taskId && !beatmap && <p>Generating beatmap...</p>}

            {beatmap && countdownStarted && countdown > 0 && (
                <h2 style={{ fontSize: "48px", color: "red" }}>{countdown}</h2>
            )}

            {beatmap && countdownStarted && countdown === 0 && audioUrl && (
                <GameCanvas beatmap={beatmap} audioUrl={audioUrl} />
            )}
        </div>
    );
};

export default GamePage;