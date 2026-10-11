"use client";

import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ArticlesButton from "./Button";
import gameTextSx from "./gameTextSx";
import Box from "@mui/material/Box";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { actorId } from "@/util/poolGame";

export default function WinnerModal() {
    const state = useEightBallStore();
    const player = state.participants.find((p) => p.id === state.winner);
    const requested = state.rematchRequests.includes(actorId(state));
    const close = () => useEightBallStore.setState({ showWinner: false });
    return (
        <Dialog
            open={Boolean(state.winner && state.showWinner)}
            onClose={close}
            fullWidth
            maxWidth="sm"
            aria-labelledby="winner-title"
            sx={gameTextSx}
        >
            <DialogTitle id="winner-title">
                {player?.name || "Player"} wins!
            </DialogTitle>
            <DialogContent>
                <Box sx={{ fontSize: "3rem", textAlign: "center", my: 1 }}>
                    🏆
                </Box>
                {state.mode === "multiplayer" && (
                    <Box sx={{ fontWeight: 700, mb: 1 }}>
                        {state.winner === state.peerId
                            ? "You won the rack."
                            : "Your opponent won the rack."}
                    </Box>
                )}
                <Box>{state.winReason}</Box>
                {requested && (
                    <Box sx={{ mt: 2 }}>
                        Rematch requested. Waiting for your opponent.
                    </Box>
                )}
                {state.networkError && (
                    <Box sx={{ mt: 2 }}>{state.networkError}</Box>
                )}
            </DialogContent>
            <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
                <ArticlesButton
                    component={Link}
                    href="/"
                >
                    Back to lobby
                </ArticlesButton>
                <ArticlesButton onClick={close}>View table</ArticlesButton>
                <ArticlesButton
                    disabled={
                        state.networkBusy ||
                        requested ||
                        (state.mode === "multiplayer" && !state.connected)
                    }
                    onClick={() => state.requestGameAction({ type: "rematch" })}
                >
                    {state.mode === "local"
                        ? "Play again"
                        : requested
                          ? "Rematch requested"
                          : "Request rematch"}
                </ArticlesButton>
            </DialogActions>
        </Dialog>
    );
}
