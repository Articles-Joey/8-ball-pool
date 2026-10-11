"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import ArticlesButton from "./Button";
import gameTextSx from "./gameTextSx";
import { useEightBallStore } from "@/hooks/useEightBallStore";

export default function PeerDetails() {
    const state = useEightBallStore();
    const [copied, setCopied] = useState(false);
    return (
        <Paper
            variant="outlined"
            sx={[gameTextSx, { p: 1.5, borderRadius: 2 }]}
        >
            <Box sx={{ fontWeight: 700, mb: 1 }}>Multiplayer room</Box>
            <Box
                role="status"
                sx={{ fontSize: "0.85rem", mb: 1 }}
            >
                {state.peerStatus === "connecting"
                    ? "Connecting…"
                    : state.connected
                      ? "Two players connected"
                      : state.isHost && state.phase !== "finished"
                        ? "Waiting for an opponent"
                        : state.peerStatus === "disconnected"
                          ? "Room disconnected"
                          : "Not connected"}
            </Box>
            <TextField
                label="Room code"
                value={state.roomCode}
                size="small"
                fullWidth
                slotProps={{ input: { readOnly: true } }}
            />
            {state.isHost && (
                <ArticlesButton
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={async () => {
                        try {
                            const url = new URL(
                                "/play",
                                window.location.origin,
                            );
                            url.searchParams.set("game_id", state.roomCode);
                            await navigator.clipboard.writeText(url.toString());
                            setCopied(true);
                        } catch {
                            useEightBallStore.setState({
                                networkError:
                                    "Copy the room code above and share it with your opponent.",
                            });
                        }
                    }}
                >
                    {copied ? "Invite copied" : "Copy invite link"}
                </ArticlesButton>
            )}
            {state.networkError && (
                <Alert
                    severity="warning"
                    sx={{ mt: 1 }}
                >
                    {state.networkError}
                </Alert>
            )}
            {!state.isHost &&
                !state.connected &&
                state.phase !== "finished" && (
                    <ArticlesButton
                        fullWidth
                        onClick={() => state.retryPeerConnection?.()}
                    >
                        Retry connection
                    </ArticlesButton>
                )}
            {state.connected && (
                <ArticlesButton
                    fullWidth
                    variant="outline-danger"
                    onClick={() =>
                        state.leavePeerSession?.(
                            "You left the room and forfeited this rack.",
                        )
                    }
                >
                    Leave room
                </ArticlesButton>
            )}
            <ArticlesButton
                component={Link}
                href="/"
                fullWidth
                sx={{ mt: 0.5 }}
            >
                Back to lobby
            </ArticlesButton>
            <Box sx={{ fontSize: "0.75rem", mt: 1 }}>
                Two players per room. The host synchronizes the table and
                settles every shot.
            </Box>
        </Paper>
    );
}
