import Box from "@mui/material/Box";
import { useStore } from "@/hooks/useStore";
import MenuBarControls from "./MenuBarControls";

export default function TouchControls() {
    const screenshotMode = useStore((state) => state.screenshotMode);
    return (
        <Box
            sx={{
                display: screenshotMode ? "none" : "block",
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 2,
            }}
        >
            <MenuBarControls />
        </Box>
    );
}
