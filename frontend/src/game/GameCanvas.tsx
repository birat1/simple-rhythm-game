import React, { useRef, useEffect, useState } from "react";

interface Note {
    time: number;
    lane: number;
}

interface Beatmap {
    bpm: number;
    lanes: number;
    notes: Note[];
}

interface Props {
    beatmap: Beatmap;
    audioUrl: string;
}

const laneWidth = 100;
const noteHeight = 20;
const speed = 200;

const GameCanvas: React.FC<Props> = ({ beatmap, audioUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [audio] = useState(new Audio(audioUrl));
    const [startTime, setStartTime] = useState<number | null>(null);

    useEffect(() => {
        audio.play();
        setStartTime(performance.now() / 1000);
    }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "q") console.log("Lane 0 pressed");
            if (e.key === "w") console.log("Lane 1 pressed");
            if (e.key === "o") console.log("Lane 2 pressed");
            if (e.key === "p") console.log("Lane 3 pressed");
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    useEffect(() => {
        let animationId: number;

        const render = () => {
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx || startTime === null) return;

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            const currentTime = performance.now() / 1000 - startTime;

            // Draw lanes
            for (let i = 0; i < beatmap.lanes; i++) {
                ctx.fillStyle = "#222";
                ctx.fillRect(i * laneWidth, 0, laneWidth - 2, ctx.canvas.height);
            }

            // Draw notes
            beatmap.notes.forEach((note) => {
                const y = (note.time - currentTime) * speed + ctx.canvas.height / 2;
                if (y > -noteHeight && y < ctx.canvas.height) {
                    ctx.fillStyle = "red";
                    ctx.fillRect(note.lane * laneWidth + 10, y, laneWidth - 20, noteHeight);
                }
            });

            animationId = requestAnimationFrame(render);
        };

        animationId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationId);
    }, [startTime]);

    return <canvas ref={canvasRef} width={400} height={600} />;
};

export default GameCanvas;