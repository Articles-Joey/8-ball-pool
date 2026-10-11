"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import ArticlesButton from "./Button";
import gameTextSx from "./gameTextSx";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import {
    ballGroup,
    canAim,
    canControl,
    canShoot,
    isOnEight,
    isOut,
    POCKETS,
} from "@/util/poolGame";

export default function GameStatus({ summaryOnly = false }) {
    const state = useEightBallStore();
    const active = state.participants.find((p) => p.id === state.currentTurn);
    const controls = canControl(state);
    const aiming = canAim(state);
    const request = state.requestGameAction;
    const onEight = isOnEight(state);

    return (
        <Paper
            variant="outlined"
            sx={[gameTextSx, { p: 1.5, borderRadius: 2 }]}
        >
            <Box sx={{ fontWeight: 700, mb: 0.5 }}>
                {state.mode === "local" ? "Local Play" : "Multiplayer"}
            </Box>
            {state.participants.map((player) => {
                const group = state.sides[player.id];
                const remaining = state.ballPositions.filter(
                    (b) => !isOut(b) && ballGroup(b.ball) === group && group,
                );
                return (
                    <Box
                        key={player.id}
                        sx={{ py: 0.5 }}
                    >
                        <Box
                            sx={{
                                fontWeight:
                                    player.id === state.currentTurn ? 700 : 400,
                            }}
                        >
                            {player.id === state.currentTurn ? "▶ " : ""}
                            {player.name}
                            {state.mode === "multiplayer" &&
                            player.id === state.peerId
                                ? " (You)"
                                : ""}
                            {state.scores[player.id]
                                ? ` · ${state.scores[player.id]} wins`
                                : ""}
                        </Box>
                        <Box sx={{ fontSize: "0.8rem" }}>
                            {group
                                ? `${group === "solids" ? "Solids" : "Stripes"} · ${remaining.length ? `${remaining.length} left (${remaining.map((b) => b.ball).join(", ")})` : "On the 8 ball"}`
                                : "Open table"}
                        </Box>
                    </Box>
                );
            })}
            <Box
                role="status"
                aria-live="polite"
                sx={{ fontSize: "0.85rem", mt: 1 }}
            >
                {state.phase === "shooting"
                    ? `${active?.name || "Player"} is shooting…`
                    : state.phase === "finished"
                      ? "Rack finished."
                      : state.phase === "waiting"
                        ? "Waiting for a second player…"
                        : `${active?.name || "Player"}'s turn${state.mode === "multiplayer" && !controls ? " — waiting for opponent" : ""}`}
            </Box>
            {summaryOnly ? null : (
                <>
                    <Box sx={{ fontSize: "0.8rem", my: 1 }}>
                        {state.message}
                    </Box>
                    {state.mode === "multiplayer" &&
                        state.phase === "waiting" &&
                        state.roomCode && (
                            <Box
                                sx={{
                                    fontSize: "0.85rem",
                                    my: 1,
                                    userSelect: "all",
                                }}
                            >
                                Room code: <b>{state.roomCode}</b>
                            </Box>
                        )}
                    {state.networkError && (
                        <Alert
                            severity="warning"
                            sx={{ my: 1, fontSize: "0.8rem" }}
                        >
                            {state.networkError}
                        </Alert>
                    )}
                    {state.mode === "multiplayer" &&
                        !state.isHost &&
                        !state.connected &&
                        state.phase === "waiting" && (
                            <ArticlesButton
                                fullWidth
                                disabled={state.peerStatus === "connecting"}
                                onClick={() => state.retryPeerConnection?.()}
                            >
                                Retry connection
                            </ArticlesButton>
                        )}
                    {state.lastFoul && state.phase !== "shooting" && (
                        <Alert
                            severity="warning"
                            sx={{ my: 1, fontSize: "0.8rem" }}
                        >
                            {state.lastFoul}
                        </Alert>
                    )}
                    {state.phase === "placing" && (
                        <>
                            <Box sx={{ fontSize: "0.8rem", mb: 1 }}>
                                {controls
                                    ? "Tap or click the felt to place the cue ball. "
                                    : "The other player is placing the cue ball. "}
                                {state.ballInHand === "head"
                                    ? "Use the bottom quarter, behind the head string."
                                    : "Place it anywhere clear of other balls and pockets."}
                            </Box>
                            <ArticlesButton
                                fullWidth
                                disabled={!controls || !state.placementValid}
                                onClick={() =>
                                    request({ type: "confirm-placement" })
                                }
                            >
                                Confirm cue ball
                            </ArticlesButton>
                        </>
                    )}
                    {state.phase === "break-choice" && (
                        <Box sx={{ display: "grid", gap: 0.5 }}>
                            <ArticlesButton
                                disabled={!controls}
                                onClick={() =>
                                    request({
                                        type: "break-choice",
                                        choice: "accept",
                                    })
                                }
                            >
                                Accept table
                                {state.breakDecision?.needsHand
                                    ? " with ball in hand"
                                    : " in position"}
                            </ArticlesButton>
                            {state.breakDecision?.canTakeHand &&
                                !state.breakDecision?.needsHand && (
                                    <ArticlesButton
                                        disabled={!controls}
                                        onClick={() =>
                                            request({
                                                type: "break-choice",
                                                choice: "hand",
                                            })
                                        }
                                    >
                                        Take ball in hand
                                    </ArticlesButton>
                                )}
                            {state.breakDecision?.kind !== "foul" && (
                                <ArticlesButton
                                    disabled={!controls}
                                    onClick={() =>
                                        request({
                                            type: "break-choice",
                                            choice: "rerack",
                                        })
                                    }
                                >
                                    New rack — I break
                                </ArticlesButton>
                            )}
                            {state.breakDecision?.kind === "illegal" && (
                                <ArticlesButton
                                    disabled={!controls}
                                    onClick={() =>
                                        request({
                                            type: "break-choice",
                                            choice: "opponent-rerack",
                                        })
                                    }
                                >
                                    New rack — opponent breaks
                                </ArticlesButton>
                            )}
                        </Box>
                    )}
                    {state.phase === "aiming" && !state.breakPending && (
                        <>
                            <FormControlLabel
                                label="Play a safety"
                                control={
                                    <Checkbox
                                        checked={state.safety}
                                        disabled={!aiming}
                                        onChange={(event) =>
                                            request({
                                                type: "safety",
                                                value: event.target.checked,
                                            })
                                        }
                                    />
                                }
                            />
                            {onEight && !state.safety && (
                                <Box sx={{ display: "grid", gap: 1, mb: 1 }}>
                                    <Box sx={{ fontSize: "0.8rem" }}>
                                        Choose a pocket for the 8 ball.
                                    </Box>
                                    <FormControl
                                        size="small"
                                        fullWidth
                                        disabled={!aiming}
                                    >
                                        <InputLabel id="called-pocket-label">
                                            8-ball pocket
                                        </InputLabel>
                                        <Select
                                            labelId="called-pocket-label"
                                            label="8-ball pocket"
                                            value={state.calledPocket ?? ""}
                                            MenuProps={{
                                                slotProps: {
                                                    paper: { sx: gameTextSx },
                                                },
                                            }}
                                            onChange={(event) =>
                                                request({
                                                    type: "call",
                                                    ball: 8,
                                                    pocket: event.target.value,
                                                })
                                            }
                                        >
                                            {POCKETS.map((pocket, index) => (
                                                <MenuItem
                                                    key={index}
                                                    value={index}
                                                >
                                                    {pocket.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}
                        </>
                    )}
                    {state.phase === "aiming" && (
                        <>
                            <Box
                                component="details"
                                sx={{ mb: 1 }}
                            >
                                <Box
                                    component="summary"
                                    sx={{
                                        cursor: "pointer",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    Aim {Math.round(state.cueRotation)}° · Power{" "}
                                    {Math.round(state.cuePower)}
                                </Box>
                                <Box sx={{ px: 1, pt: 1 }}>
                                    <Box sx={{ fontSize: "0.8rem" }}>
                                        Cue angle
                                    </Box>
                                    <Slider
                                        aria-label="Cue angle"
                                        min={0}
                                        max={359}
                                        step={1}
                                        disabled={!aiming}
                                        value={state.cueRotation}
                                        onChange={(_, value) =>
                                            state.setCueRotation(value)
                                        }
                                    />
                                    <Box sx={{ fontSize: "0.8rem" }}>
                                        Shot power
                                    </Box>
                                    <Slider
                                        aria-label="Shot power"
                                        min={1}
                                        max={100}
                                        step={1}
                                        disabled={!aiming}
                                        value={state.cuePower}
                                        onChange={(_, value) =>
                                            state.setCuePower(value)
                                        }
                                    />
                                </Box>
                            </Box>
                            <ArticlesButton
                                fullWidth
                                disabled={!canShoot(state)}
                                onClick={() => state.setNudge(true)}
                            >
                                {state.breakPending
                                    ? "Break"
                                    : state.safety
                                      ? "Shoot safety"
                                      : "Shoot"}
                            </ArticlesButton>
                        </>
                    )}
                    {state.networkBusy && (
                        <Box sx={{ fontSize: "0.8rem", mt: 1 }}>
                            Waiting for the host…
                        </Box>
                    )}
                    {state.phase === "finished" && (
                        <ArticlesButton
                            fullWidth
                            onClick={() =>
                                useEightBallStore.setState({ showWinner: true })
                            }
                        >
                            View result
                        </ArticlesButton>
                    )}
                    {state.mode === "local" && (
                        <Box sx={{ fontSize: "0.75rem", mt: 1 }}>
                            Pass the device when the turn changes.
                        </Box>
                    )}
                </>
            )}
        </Paper>
    );
}
