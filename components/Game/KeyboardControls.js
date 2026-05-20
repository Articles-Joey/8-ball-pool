import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useFrame } from "@react-three/fiber";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useMemo } from "react";

export default function KeyboardControls() {

    let searchParams = useSearchParams()
    let searchParamsObject = Object.fromEntries(searchParams.entries());
    let { game_id } = searchParamsObject;

    const peerId = useEightBallStore(state => state.peerId);
    const currentTurn = useEightBallStore(state => state.currentTurn);

    const disableAimingTools = useMemo(() => {

        if (!game_id) {
            return false;
        } else {
            return peerId !== currentTurn;
        }

    }, [game_id, peerId, currentTurn])

    const keys = useRef({});

    const setNudge = useEightBallStore(state => state.setNudge);

    useEffect(() => {
        const handleKeyDown = (e) => {
            keys.current[e.code] = true;

            if (disableAimingTools) return;

            if (e.code === 'Space' || e.code === 'Enter') {
                setNudge(true);
            }
        };
        const handleKeyUp = (e) => {
            keys.current[e.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [setNudge, disableAimingTools]);

    useFrame((_state, delta) => {
        if (disableAimingTools) return;

        const { cueRotation, cuePower, setCueRotation, setCuePower } = useEightBallStore.getState();

        let rotationChange = 0;
        if (keys.current['ArrowLeft'] || keys.current['KeyA']) rotationChange += 1;
        if (keys.current['ArrowRight'] || keys.current['KeyD']) rotationChange -= 1;

        if (rotationChange !== 0) {
            const isShiftPressed = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
            const rotationSpeed = isShiftPressed ? 20 : 100; // degrees per second
            setCueRotation((cueRotation + rotationChange * rotationSpeed * delta + 360) % 360);
        }

        let powerChange = 0;
        if (keys.current['ArrowUp'] || keys.current['KeyW']) powerChange += 1;
        if (keys.current['ArrowDown'] || keys.current['KeyS']) powerChange -= 1;

        if (powerChange !== 0) {
            const powerSpeed = 100; // power units per second
            setCuePower(Math.max(0, Math.min(100, cuePower + powerChange * powerSpeed * delta)));
        }
    });

    return null;
}
