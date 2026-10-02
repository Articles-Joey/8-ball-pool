"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Slider from "@mui/material/Slider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import ArticlesModal from "./ArticlesModal";
import ArticlesButton from "./Button";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useStore } from "@/hooks/useStore";

const controls = [
    ["Increase Power", "Arrow Up"],
    ["Decrease Power", "Arrow Down"],
    ["Rotate Left", "Arrow Left"],
    ["Rotate Right", "Arrow Right"],
];

export default function GameSettingsModal({ show, setShow }) {
    const [tab, setTab] = useState("Visuals");
    const darkMode = useStore((state) => state.darkMode);
    const toggleDarkMode = useStore((state) => state.toggleDarkMode);
    const graphicsQuality = useEightBallStore((state) => state.graphicsQuality);
    const setGraphicsQuality = useEightBallStore(
        (state) => state.setGraphicsQuality,
    );

    return (
        <ArticlesModal
            show={show}
            setShow={setShow}
            title="Game Settings"
            centered={false}
            contentSx={{ p: 0 }}
            footerOverride={(close) => (
                <Box sx={{ display: "flex", gap: 2 }}>
                    <ArticlesButton
                        variant="outline-dark"
                        onClick={close}
                    >
                        Close
                    </ArticlesButton>
                    <ArticlesButton
                        variant="outline-danger"
                        onClick={close}
                    >
                        Reset
                    </ArticlesButton>
                </Box>
            )}
        >
            <Tabs
                value={tab}
                onChange={(_, value) => setTab(value)}
                variant="scrollable"
                aria-label="Settings categories"
            >
                {["Visuals", "Controls", "Audio", "Chat"].map((item) => (
                    <Tab
                        key={item}
                        value={item}
                        label={item}
                    />
                ))}
            </Tabs>
            <Divider />
            <Box sx={{ p: 1 }}>
                {tab === "Visuals" && (
                    <>
                        <Box sx={{ mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={Boolean(darkMode)}
                                        onChange={toggleDarkMode}
                                    />
                                }
                                label="Dark Mode"
                            />
                            <Box sx={{ fontSize: "0.875rem", mt: 1 }}>
                                Dark Mode changes the game&apos;s color scheme
                                to be easier on the eyes in low light
                                environments.
                            </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ mb: 1 }}>Quality</Box>
                        {["Low", "Medium", "High"].map((option) => (
                            <ArticlesButton
                                key={option}
                                active={graphicsQuality === option}
                                onClick={() => setGraphicsQuality(option)}
                            >
                                {option}
                            </ArticlesButton>
                        ))}
                    </>
                )}
                {tab === "Controls" &&
                    controls.map(([action, key]) => (
                        <Box
                            key={action}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderBottom: 1,
                                borderColor: "divider",
                                pb: 0.5,
                                mb: 0.5,
                            }}
                        >
                            <Box>{action}</Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                }}
                            >
                                <Chip
                                    size="small"
                                    label={key}
                                />
                                <ArticlesButton small>
                                    Change Key
                                </ArticlesButton>
                            </Box>
                        </Box>
                    ))}
                {tab === "Audio" &&
                    ["Game Volume", "Music Volume"].map((label) => (
                        <Box key={label}>
                            <Box>{label}</Box>
                            <Slider
                                aria-label={label}
                                defaultValue={50}
                            />
                        </Box>
                    ))}
                {tab === "Chat" && (
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        {[
                            "Game chat panel",
                            "Censor chat",
                            "Game chat speech bubbles",
                        ].map((label) => (
                            <FormControlLabel
                                key={label}
                                control={<Switch />}
                                label={label}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </ArticlesModal>
    );
}
