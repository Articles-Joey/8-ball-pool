import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { canAim, canShoot } from "@/util/poolGame";

export default function KeyboardControls() {
    const disableAimingTools = useEightBallStore((state) => !canAim(state));

    const keys = useRef({});

    const setNudge = useEightBallStore((state) => state.setNudge);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (
                e.target.closest?.(
                    "input, textarea, select, button, [role='dialog'], [contenteditable='true']",
                )
            )
                return;
            keys.current[e.code] = true;

            if (disableAimingTools) return;

            if (e.code === "Space" || e.code === "Enter") {
                e.preventDefault();
                if (e.repeat || !canShoot(useEightBallStore.getState())) return;
                setNudge(true);
            }
        };
        const handleKeyUp = (e) => {
            keys.current[e.code] = false;
        };
        const clearKeys = () => {
            keys.current = {};
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", clearKeys);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", clearKeys);
        };
    }, [setNudge, disableAimingTools]);

    useEffect(() => {
        if (disableAimingTools) keys.current = {};
    }, [disableAimingTools]);

    useFrame((_state, delta) => {
        if (disableAimingTools) return;

        const { cueRotation, cuePower, setCueRotation, setCuePower } =
            useEightBallStore.getState();

        const fineControl = keys.current["KeyZ"];
        let rotationChange = 0;
        if (keys.current["ArrowLeft"] || keys.current["KeyA"])
            rotationChange += 1;
        if (keys.current["ArrowRight"] || keys.current["KeyD"])
            rotationChange -= 1;

        if (rotationChange !== 0) {
            const isShiftPressed =
                keys.current["ShiftLeft"] || keys.current["ShiftRight"];
            const rotationSpeed = fineControl || isShiftPressed ? 20 : 100; // degrees per second
            setCueRotation(
                (cueRotation + rotationChange * rotationSpeed * delta + 360) %
                    360,
            );
        }

        let powerChange = 0;
        if (keys.current["ArrowUp"] || keys.current["KeyW"]) powerChange += 1;
        if (keys.current["ArrowDown"] || keys.current["KeyS"]) powerChange -= 1;

        if (powerChange !== 0) {
            const powerSpeed = fineControl ? 20 : 100; // power units per second
            setCuePower(
                Math.max(
                    0,
                    Math.min(100, cuePower + powerChange * powerSpeed * delta),
                ),
            );
        }
    });

    return null;
}
