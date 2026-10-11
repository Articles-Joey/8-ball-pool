import { Suspense } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useRouter, useSearchParams } from "next/navigation";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import { useStore } from "@/hooks/useStore";
import PeerDetails from "./PeerDetails";
import DebugPanel from "./DebugPanel";
import GameStatus from "./GameStatus";

export default function LeftPanelContent() {
    const searchParams = useSearchParams();
    const debug = useStore((state) => state.debug);

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
            <GameStatus summaryOnly />
            {searchParams.get("game_id") && (
                <Suspense>
                    <PeerDetails />
                </Suspense>
            )}
            {debug && <DebugPanel />}
        </Box>
    );
}
