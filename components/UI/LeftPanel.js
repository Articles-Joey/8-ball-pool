import { Suspense, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useRouter, useSearchParams } from "next/navigation";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useStore } from "@/hooks/useStore";
import PeerDetails from "./PeerDetails";
import DebugPanel from "./DebugPanel";

export default function LeftPanelContent() {
    const searchParams = useSearchParams();
    const debug = useStore((state) => state.debug);
    const resetPeer = useEightBallStore((state) => state.resetPeer);
    const setResetPeer = useEightBallStore((state) => state.setResetPeer);

    useEffect(() => {
        setResetPeer(false);
    }, [resetPeer, setResetPeer]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Paper
                variant="outlined"
                sx={{ borderRadius: 1 }}
            >
                <Box sx={{ p: 1, display: "flex", flexWrap: "wrap" }}>
                    <GameMenuPrimaryButtonGroup
                        useStore={useStore}
                        type="GameMenu"
                        useRouter={useRouter}
                    />
                </Box>
            </Paper>
            <Paper
                variant="outlined"
                sx={{ p: 1, borderRadius: 1 }}
            >
                <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    Break to determine side
                </Box>
                <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    Stripes turn
                </Box>
                <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    Solids turn
                </Box>
            </Paper>
            {searchParams.get("game_id") && (
                <Suspense>{!resetPeer && <PeerDetails />}</Suspense>
            )}
            {debug && <DebugPanel />}
        </Box>
    );
}
