"use client";

import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import BugReportIcon from "@mui/icons-material/BugReport";
import ArticlesButton from "@/components/UI/Button";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useState } from "react";
import { useStore } from "@/hooks/useStore";

function DebugDropdown({ id, label, Icon, children }) {
    const [anchorElement, setAnchorElement] = useState(null);
    const isOpen = Boolean(anchorElement);

    const closeMenu = () => {
        setAnchorElement(null);
    };

    return (
        <>
            <ArticlesButton
                aria-controls={isOpen ? id : undefined}
                aria-expanded={isOpen ? "true" : undefined}
                aria-haspopup="menu"
                endIcon={<KeyboardArrowDownIcon />}
                fullWidth
                id={`${id}-button`}
                onClick={(event) => {
                    setAnchorElement(event.currentTarget);
                }}
                size="small"
                startIcon={<Icon fontSize="small" />}
                sx={{
                    justifyContent: "flex-start",
                    "& .MuiButton-endIcon": {
                        marginLeft: "auto",
                    },
                }}
                variant="contained"
            >
                {label}
            </ArticlesButton>
            <Menu
                anchorEl={anchorElement}
                anchorOrigin={{
                    horizontal: "left",
                    vertical: "bottom",
                }}
                id={id}
                marginThreshold={0}
                onClose={closeMenu}
                open={isOpen}
                slotProps={{
                    list: {
                        "aria-labelledby": `${id}-button`,
                        style: {
                            margin: 0,
                            padding: 0,
                        },
                    },
                    paper: {
                        sx: {
                            maxHeight: 600,
                            margin: 0,
                            width: 200,
                        },
                    },
                }}
                transformOrigin={{
                    horizontal: "left",
                    vertical: "top",
                }}
            >
                {children(closeMenu)}
            </Menu>
        </>
    );
}

export default function DebugPanel() {
    const reloadScene = useStore((state) => state.reloadScene);
    const cueRotation = useEightBallStore((state) => state.cueRotation);
    const cuePower = useEightBallStore((state) => state.cuePower);
    const debug = useEightBallStore((state) => state.debug);
    const setDebug = useEightBallStore((state) => state.setDebug);
    const ballPositions = useEightBallStore((state) => state.ballPositions);
    const setBallPositionsUpdated = useEightBallStore(
        (state) => state.setBallPositionsUpdated,
    );
    const setResetCameraRequest = useEightBallStore(
        (state) => state.setResetCameraRequest,
    );
    const [showBallPositions, setShowBallPositions] = useState(false);
    return (
        <Box
            sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
            }}
        >
            <Box
                sx={{
                    p: 1,
                }}
            >
                <Box
                    sx={{
                        fontSize: "0.875rem",
                        color: "text.secondary",
                    }}
                >
                    Debug Controls
                </Box>

                <Box
                    sx={{
                        fontSize: "0.875rem",
                        border: 1,
                        borderColor: "divider",
                        p: 1,
                    }}
                >
                    <Box>Rotation Angle: {cueRotation}</Box>
                    <Box>Power: {cuePower}/100</Box>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box>
                        <ArticlesButton
                            size="sm"
                            onClick={reloadScene}
                            sx={{
                                width: "50%",
                            }}
                        >
                            <RestartAltIcon
                                fontSize="inherit"
                                sx={{
                                    mr: 0.5,
                                }}
                            />
                            Reload Game
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            onClick={() => setResetCameraRequest(true)}
                            sx={{
                                width: "50%",
                            }}
                        >
                            <RestartAltIcon
                                fontSize="inherit"
                                sx={{
                                    mr: 0.5,
                                }}
                            />
                            Reset Camera
                        </ArticlesButton>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                        }}
                    >
                        <Box
                            sx={{
                                width: "50%",
                            }}
                        >
                            <DebugDropdown
                                id="debug-menu"
                                label={`Debug ${debug ? "On" : "Off"}`}
                                Icon={BugReportIcon}
                            >
                                {(closeMenu) =>
                                    [false, true].map((enabled) => (
                                        <MenuItem
                                            key={String(enabled)}
                                            selected={debug === enabled}
                                            onClick={() => {
                                                setDebug(enabled);
                                                closeMenu();
                                            }}
                                        >
                                            {enabled ? "On" : "Off"}
                                        </MenuItem>
                                    ))
                                }
                            </DebugDropdown>
                        </Box>

                        <ArticlesButton
                            size="sm"
                            onClick={() => {
                                console.log("Ball Positions:", ballPositions);
                            }}
                            sx={{
                                width: "50%",
                            }}
                        >
                            <RestartAltIcon
                                fontSize="inherit"
                                sx={{
                                    mr: 0.5,
                                }}
                            />
                            Log Balls
                        </ArticlesButton>
                    </Box>

                    <Box>
                        <ArticlesButton
                            size="sm"
                            onClick={() => {
                                setBallPositionsUpdated([
                                    {
                                        ball: 1,
                                        position: [
                                            -8.247533640255673,
                                            1.249927615551298,
                                            -23.47405745980015,
                                        ],
                                    },
                                    {
                                        ball: 2,
                                        position: [
                                            -15.452261018758763,
                                            1.249927615551298,
                                            -10.905968345373855,
                                        ],
                                    },
                                    {
                                        ball: 3,
                                        position: [
                                            -5.023284032582997,
                                            1.249927615551298,
                                            -27.240293678273577,
                                        ],
                                    },
                                    {
                                        ball: 4,
                                        position: [
                                            -15.047775089667894,
                                            1.249927615551298,
                                            -24.988772356025503,
                                        ],
                                    },
                                    {
                                        ball: 5,
                                        position: [
                                            7.172554509721704,
                                            1.249927615551298,
                                            -36.930368951579794,
                                        ],
                                    },
                                    {
                                        ball: 6,
                                        position: [
                                            -2.637840178526253,
                                            1.249927615551298,
                                            -39.25150371230237,
                                        ],
                                    },
                                    {
                                        ball: 7,
                                        position: [
                                            8.000845729860547,
                                            1.249927615551298,
                                            -27.43953743600558,
                                        ],
                                    },
                                    {
                                        ball: 8,
                                        position: [
                                            2.0942256802964323,
                                            1.249927615551298,
                                            -24.707135693317415,
                                        ],
                                    },
                                    {
                                        ball: 9,
                                        position: [
                                            18.208209054461225,
                                            1.249927615551298,
                                            -14.26495565137875,
                                        ],
                                    },
                                    {
                                        ball: 10,
                                        position: [
                                            3.113617960652882,
                                            1.249927615551298,
                                            -31.278087801697602,
                                        ],
                                    },
                                    {
                                        ball: 11,
                                        position: [
                                            12.641818571488063,
                                            1.249927615551298,
                                            -25.802180798722873,
                                        ],
                                    },
                                    {
                                        ball: 12,
                                        position: [
                                            -7.898695648627498,
                                            1.249927615551298,
                                            -38.960753353375125,
                                        ],
                                    },
                                    {
                                        ball: 13,
                                        position: [
                                            2.1882009336459034,
                                            1.249927615551298,
                                            -38.36133603719746,
                                        ],
                                    },
                                    {
                                        ball: 14,
                                        position: [
                                            -9.783205496927106,
                                            1.249927615551298,
                                            -27.18107636958629,
                                        ],
                                    },
                                    {
                                        ball: 15,
                                        position: [
                                            0.10354160397452415,
                                            1.249927615551298,
                                            -29.265224367762528,
                                        ],
                                    },
                                ]);
                            }}
                            active={showBallPositions ? true : false}
                            sx={{
                                width: "100%",
                                mt: 2,
                            }}
                        >
                            Fake Positions
                        </ArticlesButton>
                    </Box>

                    <Box>
                        <ArticlesButton
                            size="sm"
                            onClick={() =>
                                showBallPositions
                                    ? setShowBallPositions(false)
                                    : setShowBallPositions(true)
                            }
                            active={showBallPositions ? true : false}
                            sx={{
                                width: "100%",
                                mt: 2,
                            }}
                        >
                            <BugReportIcon
                                fontSize="inherit"
                                sx={{
                                    mr: 0.5,
                                }}
                            />
                            {showBallPositions ? "Ball Debug" : "Ball Debug"}
                        </ArticlesButton>
                    </Box>

                    {showBallPositions && (
                        <Box
                            sx={{
                                fontSize: "0.875rem",
                                border: 1,
                                borderColor: "divider",
                                p: 1,
                                height: "200px",
                                overflowY: "auto",
                            }}
                        >
                            {ballPositions.map((pos, index) => (
                                <Box key={index}>
                                    Ball {pos.ball}:{" "}
                                    {JSON.stringify(pos.position)}
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
