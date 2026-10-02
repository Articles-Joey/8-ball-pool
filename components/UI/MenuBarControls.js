"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useStore } from "@/hooks/useStore";

function useHeldControl(action, disabled) {
    const intervalRef = useRef(null);
    const stop = useCallback(() => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }, []);
    const start = useCallback(() => {
        if (disabled || intervalRef.current !== null) return;
        intervalRef.current = setInterval(action, 100);
    }, [action, disabled]);

    useEffect(() => {
        if (disabled) stop();
        return stop;
    }, [disabled, stop]);
    useEffect(() => {
        window.addEventListener("blur", stop);
        return () => window.removeEventListener("blur", stop);
    }, [stop]);

    return {
        onPointerDown: (event) => {
            if (event.button !== 0 || disabled) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            start();
        },
        onPointerUp: stop,
        onPointerCancel: stop,
        onLostPointerCapture: stop,
        onBlur: stop,
        onKeyDown: (event) => {
            if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                start();
            }
        },
        onKeyUp: stop,
    };
}

const floatingButtonSx = {
    pointerEvents: "auto",
    bgcolor: "white",
    color: "black",
    width: 50,
    height: 50,
    borderRadius: "50%",
    opacity: 0.8,
    touchAction: "none",
    userSelect: "none",
    transition: "opacity 200ms, scale 200ms",
    "&:hover": { bgcolor: "white", opacity: 1, scale: "1.1" },
    "&.Mui-disabled": {
        bgcolor: "white",
        color: "text.disabled",
        opacity: 0.4,
    },
};

export default function MenuBarControls() {
    const searchParams = useSearchParams();
    const gameId = searchParams.get("game_id");
    const peerId = useEightBallStore((state) => state.peerId);
    const currentTurn = useEightBallStore((state) => state.currentTurn);
    const cueRotation = useEightBallStore((state) => state.cueRotation);
    const cuePower = useEightBallStore((state) => state.cuePower);
    const setNudge = useEightBallStore((state) => state.setNudge);
    const touchControls = useEightBallStore((state) => state.touchControls);
    const sidebar = useStore((state) => state.sidebar);
    const screenshotMode = useStore((state) => state.screenshotMode);
    const disabled =
        screenshotMode || Boolean(gameId && peerId !== currentTurn);

    const rotateLeft = useCallback(() => {
        const state = useEightBallStore.getState();
        state.setCueRotation(
            state.cueRotation >= 360 ? 0 : state.cueRotation + 1,
        );
    }, []);
    const rotateRight = useCallback(() => {
        const state = useEightBallStore.getState();
        state.setCueRotation(
            state.cueRotation <= 0 ? 360 : state.cueRotation - 1,
        );
    }, []);
    const increasePower = useCallback(() => {
        const state = useEightBallStore.getState();
        state.setCuePower(Math.min(100, state.cuePower + 1));
    }, []);
    const decreasePower = useCallback(() => {
        const state = useEightBallStore.getState();
        state.setCuePower(Math.max(0, state.cuePower - 1));
    }, []);
    const rotateLeftHandlers = useHeldControl(rotateLeft, disabled);
    const rotateRightHandlers = useHeldControl(rotateRight, disabled);
    const increasePowerHandlers = useHeldControl(increasePower, disabled);
    const decreasePowerHandlers = useHeldControl(decreasePower, disabled);
    const shoot = () => {
        if (!disabled) setNudge(true);
    };
    const sidePosition = {
        "@media (min-width: 992px)": { left: sidebar ? 300 : 0 },
    };

    return (
        <Box
            onContextMenu={(event) => event.preventDefault()}
            sx={{ pointerEvents: "none" }}
        >
            {touchControls && (
                <Box>
                    <Box
                        sx={{
                            m: 2,
                            bottom: 50,
                            position: "fixed",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            justifyContent: "center",
                            "@media (min-width: 992px)": {
                                left: sidebar ? "calc(50% + 150px)" : "50%",
                            },
                        }}
                    >
                        <IconButton
                            aria-label="Rotate left"
                            disabled={disabled}
                            {...rotateLeftHandlers}
                            sx={floatingButtonSx}
                        >
                            <RotateLeftIcon />
                        </IconButton>
                        <IconButton
                            aria-label="Rotate right"
                            disabled={disabled}
                            {...rotateRightHandlers}
                            sx={floatingButtonSx}
                        >
                            <RotateRightIcon />
                        </IconButton>
                    </Box>
                    <IconButton
                        aria-label="Shoot"
                        disabled={disabled}
                        onClick={shoot}
                        sx={{
                            ...floatingButtonSx,
                            m: 2,
                            bottom: 50,
                            position: "fixed",
                            right: 0,
                            width: 75,
                            height: 75,
                        }}
                    >
                        <LocalFireDepartmentIcon
                            color="error"
                            sx={{ fontSize: 32 }}
                        />
                    </IconButton>
                    <IconButton
                        aria-label="Increase power"
                        disabled={disabled}
                        {...increasePowerHandlers}
                        sx={{
                            ...floatingButtonSx,
                            m: 2,
                            bottom: 110,
                            position: "fixed",
                            left: 0,
                            ...sidePosition,
                        }}
                    >
                        <KeyboardDoubleArrowUpIcon />
                    </IconButton>
                    <IconButton
                        aria-label="Decrease power"
                        disabled={disabled}
                        {...decreasePowerHandlers}
                        sx={{
                            ...floatingButtonSx,
                            m: 2,
                            bottom: 50,
                            position: "fixed",
                            left: 0,
                            ...sidePosition,
                        }}
                    >
                        <KeyboardDoubleArrowDownIcon />
                    </IconButton>
                </Box>
            )}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "auto",
                    width: "fit-content",
                    bgcolor: "background.paper",
                    "& button": { touchAction: "none", userSelect: "none" },
                }}
            >
                <IconButton
                    aria-label="Rotate left"
                    size="small"
                    disabled={disabled}
                    {...rotateLeftHandlers}
                >
                    <RotateLeftIcon />
                </IconButton>
                <Chip
                    size="small"
                    label={cueRotation}
                    aria-label={`Rotation: ${cueRotation} degrees`}
                    sx={{ bgcolor: "black", color: "white" }}
                />
                <IconButton
                    aria-label="Rotate right"
                    size="small"
                    disabled={disabled}
                    {...rotateRightHandlers}
                >
                    <RotateRightIcon />
                </IconButton>
                <IconButton
                    aria-label="Shoot"
                    size="small"
                    disabled={disabled}
                    onClick={shoot}
                >
                    <LocalFireDepartmentIcon color="error" />
                </IconButton>
                <IconButton
                    aria-label="Increase power"
                    size="small"
                    disabled={disabled}
                    {...increasePowerHandlers}
                >
                    <KeyboardDoubleArrowUpIcon />
                </IconButton>
                <Chip
                    size="small"
                    label={cuePower}
                    aria-label={`Power: ${cuePower}`}
                    sx={{ bgcolor: "black", color: "white" }}
                />
                <IconButton
                    aria-label="Decrease power"
                    size="small"
                    disabled={disabled}
                    {...decreasePowerHandlers}
                >
                    <KeyboardDoubleArrowDownIcon />
                </IconButton>
            </Box>
        </Box>
    );
}
