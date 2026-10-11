"use client";

import { useCallback, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ArticlesButton from "./Button";
import gameTextSx from "./gameTextSx";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useStore } from "@/hooks/useStore";
import { canAim, canShoot } from "@/util/poolGame";

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
    bgcolor: "background.paper",
    width: 50,
    height: 50,
    borderRadius: "50%",
    p: 1,
    touchAction: "none",
    userSelect: "none",
    transition: "opacity 200ms, scale 200ms",
    "&:hover, &:hover:not(.active)": {
        bgcolor: "background.paper",
        scale: "1.1",
    },
    "&.Mui-disabled": {
        bgcolor: "background.paper",
        borderStyle: "dashed",
    },
};

export default function MenuBarControls() {
    const aimingAllowed = useEightBallStore(canAim);
    const shootingAllowed = useEightBallStore(canShoot);
    const cueRotation = useEightBallStore((state) => state.cueRotation);
    const cuePower = useEightBallStore((state) => state.cuePower);
    const setNudge = useEightBallStore((state) => state.setNudge);
    const touchControls = useEightBallStore((state) => state.touchControls);
    const sidebar = useStore((state) => state.sidebar);
    const screenshotMode = useStore((state) => state.screenshotMode);
    const disabled = screenshotMode || !aimingAllowed;
    const shootDisabled = screenshotMode || !shootingAllowed;

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
        if (!shootDisabled) setNudge(true);
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
                        <ArticlesButton
                            aria-label="Rotate left"
                            disabled={disabled}
                            {...rotateLeftHandlers}
                            sx={floatingButtonSx}
                        >
                            <RotateLeftIcon />
                        </ArticlesButton>
                        <ArticlesButton
                            aria-label="Rotate right"
                            disabled={disabled}
                            {...rotateRightHandlers}
                            sx={floatingButtonSx}
                        >
                            <RotateRightIcon />
                        </ArticlesButton>
                    </Box>
                    <ArticlesButton
                        aria-label="Shoot"
                        disabled={shootDisabled}
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
                    </ArticlesButton>
                    <ArticlesButton
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
                    </ArticlesButton>
                    <ArticlesButton
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
                    </ArticlesButton>
                </Box>
            )}
            <Box
                sx={[
                    gameTextSx,
                    {
                        display: "flex",
                        alignItems: "center",
                        pointerEvents: "auto",
                        width: "fit-content",
                        bgcolor: "background.paper",
                        "& button": { touchAction: "none", userSelect: "none" },
                        "& .MuiButton-root": { p: 1 },
                    },
                ]}
            >
                <ArticlesButton
                    aria-label="Rotate left"
                    size="small"
                    disabled={disabled}
                    {...rotateLeftHandlers}
                >
                    <RotateLeftIcon />
                </ArticlesButton>
                <Chip
                    size="small"
                    label={cueRotation}
                    aria-label={`Rotation: ${cueRotation} degrees`}
                    sx={{ bgcolor: "background.paper" }}
                />
                <ArticlesButton
                    aria-label="Rotate right"
                    size="small"
                    disabled={disabled}
                    {...rotateRightHandlers}
                >
                    <RotateRightIcon />
                </ArticlesButton>
                <ArticlesButton
                    aria-label="Shoot"
                    size="small"
                    disabled={shootDisabled}
                    onClick={shoot}
                >
                    <LocalFireDepartmentIcon color="error" />
                </ArticlesButton>
                <ArticlesButton
                    aria-label="Increase power"
                    size="small"
                    disabled={disabled}
                    {...increasePowerHandlers}
                >
                    <KeyboardDoubleArrowUpIcon />
                </ArticlesButton>
                <Chip
                    size="small"
                    label={cuePower}
                    aria-label={`Power: ${cuePower}`}
                    sx={{ bgcolor: "background.paper" }}
                />
                <ArticlesButton
                    aria-label="Decrease power"
                    size="small"
                    disabled={disabled}
                    {...decreasePowerHandlers}
                >
                    <KeyboardDoubleArrowDownIcon />
                </ArticlesButton>
            </Box>
        </Box>
    );
}
