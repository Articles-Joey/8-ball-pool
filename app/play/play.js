"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import useFullscreen from "@articles-media/articles-dev-box/useFullscreen";
import GameMenu from "@articles-media/articles-dev-box/GameMenu";
import LeftPanelContent from "@/components/UI/LeftPanel";
import TouchControls from "@/components/UI/TouchControls";
import { useStore } from "@/hooks/useStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";

const GameCanvas = dynamic(() => import("@/components/Game/GameCanvas"), {
    ssr: false,
});

export default function GamePage() {
    const showMenu = useStore((state) => state.showMenu);
    const sceneKey = useStore((state) => state.sceneKey);
    const sidebar = useStore((state) => state.sidebar);
    const touchControlsEnabled = useTouchControlsStore(
        (state) => state.enabled,
    );
    const { isFullscreen } = useFullscreen();

    return (
        <Box
            className={[
                "game-page",
                showMenu && "menu-open",
                isFullscreen && "fullscreen",
                sidebar && "show-sidebar",
            ]
                .filter(Boolean)
                .join(" ")}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
            sx={{ position: "relative", display: "flex" }}
        >
            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{ style: "Bar", menuBarButtonPosition: "Left" }}
                sidebarConfig={{ style: "Static Panel" }}
            />
            <Box
                sx={{
                    position: "relative",
                    width: "100vw",
                    minWidth: 0,
                    height: "100vh",
                    "& canvas": {
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        left: 0,
                        top: 0,
                    },
                }}
            >
                {touchControlsEnabled && <TouchControls />}
                <GameCanvas key={sceneKey} />
            </Box>
        </Box>
    );
}
