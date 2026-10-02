"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StarIcon from "@mui/icons-material/Star";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArticlesButton from "@/components/UI/Button";
import { usePeer } from "@/hooks/usePeer";
import { useEightBallStore } from "@/hooks/useEightBallStore";
export default function PeerDetails() {
    const {
        peerId,
        connectionPeerId,
        setConnectionPeerId,
        connected,
        connectToPeer,
        disconnectPeer,
        isHost,
        setIsHost,
        players,
        currentTurn,
        changeTurn,
        kickUser,
        lastLaunch,
        sendMessage,
        idPrefix,
    } = usePeer();
    const { peerRef, connectionRef } = useEightBallStore();
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
                    Session Controls
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box
                        onClick={() => {
                            console.log("peerId", peerId);
                            console.log("peer", peerRef.current);
                            console.log(
                                "connectionRef.current",
                                connectionRef.current,
                            );
                        }}
                        sx={{
                            fontSize: "0.7rem",
                        }}
                    >
                        {peerId ? peerId : "None"}
                    </Box>

                    <TextField
                        label="Room code"
                        size="small"
                        autoComplete="off"
                        type="text"
                        value={connectionPeerId}
                        onChange={(e) => {
                            setConnectionPeerId(e.target.value);
                        }}
                        sx={{
                            width: "100%",
                            "& input": {
                                textAlign: "center",
                                fontSize: "0.7rem",
                            },
                        }}
                    />

                    <Box>
                        {!connected ? (
                            <ArticlesButton
                                size="sm"
                                active={false}
                                onClick={() => {
                                    connectToPeer(
                                        `${idPrefix}${connectionPeerId}`,
                                    );
                                }}
                                sx={{
                                    width: "100%",
                                }}
                            >
                                <RestartAltIcon
                                    fontSize="inherit"
                                    sx={{
                                        mr: 0.5,
                                    }}
                                />
                                Connect
                            </ArticlesButton>
                        ) : (
                            <ArticlesButton
                                size="sm"
                                active={false}
                                onClick={disconnectPeer}
                                sx={{
                                    width: "100%",
                                }}
                            >
                                <RestartAltIcon
                                    fontSize="inherit"
                                    sx={{
                                        mr: 0.5,
                                    }}
                                />
                                Disconnect
                            </ArticlesButton>
                        )}

                        <ArticlesButton
                            size="sm"
                            active={false}
                            onClick={() => {
                                sendMessage();
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
                            Test Message
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            active={false}
                            onClick={() => {
                                setIsHost(!isHost);
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
                            Host: {isHost ? "True" : "False"}
                        </ArticlesButton>

                        <Box
                            sx={{
                                mt: 1,
                                borderTop: 1,
                                borderColor: "divider",
                                pt: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    fontSize: "0.875rem",
                                    color: "text.secondary",
                                    mb: 0.5,
                                }}
                            >
                                Session State
                            </Box>
                            <Box
                                sx={{
                                    fontSize: "0.7rem",
                                }}
                            >
                                <Box>
                                    Turn:{" "}
                                    <b>
                                        {currentTurn
                                            ? currentTurn.replace(idPrefix, "")
                                            : "None"}
                                    </b>
                                    {currentTurn === peerId && " (You)"}
                                </Box>
                                <Box>
                                    Host: <b>{isHost ? "Yes" : "No"}</b>
                                </Box>
                                {lastLaunch ? (
                                    <>
                                        <Box>
                                            Last Power:{" "}
                                            <b>{lastLaunch.cuePower}</b>
                                        </Box>
                                        <Box>
                                            Last Rotation:{" "}
                                            <b>{lastLaunch.cueRotation}°</b>
                                        </Box>
                                        <Box>
                                            Last Shot: <b>{lastLaunch.time}</b>
                                        </Box>
                                    </>
                                ) : (
                                    <Box
                                        sx={{
                                            color: "text.secondary",
                                        }}
                                    >
                                        No shots yet
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {players.length > 0 && (
                            <Box
                                sx={{
                                    mt: 1,
                                    borderTop: 1,
                                    borderColor: "divider",
                                    pt: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        fontSize: "0.875rem",
                                        color: "text.secondary",
                                        mb: 0.5,
                                    }}
                                >
                                    Players ({players.length})
                                </Box>
                                {players.map((id) => (
                                    <Box
                                        key={id}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            mb: 1,
                                            p: 0.5,
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Box
                                                title={id}
                                                sx={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    minWidth: 0,
                                                    fontSize: "0.7rem",
                                                    flex: 1,
                                                    fontWeight:
                                                        currentTurn === id
                                                            ? "bold"
                                                            : "normal",
                                                    color:
                                                        currentTurn === id
                                                            ? "#007bff"
                                                            : "inherit",
                                                }}
                                            >
                                                {currentTurn === id ? (
                                                    <StarIcon
                                                        fontSize="inherit"
                                                        sx={{
                                                            mr: 0.5,
                                                        }}
                                                    />
                                                ) : (
                                                    <AccountCircleIcon
                                                        fontSize="inherit"
                                                        sx={{
                                                            mr: 0.5,
                                                        }}
                                                    />
                                                )}
                                                {id.replace(idPrefix, "")}
                                                {id === peerId && " (You)"}
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                }}
                                            >
                                                {isHost && (
                                                    <>
                                                        <ArticlesButton
                                                            size="sm"
                                                            variant={
                                                                currentTurn ===
                                                                id
                                                                    ? "primary"
                                                                    : "outline-primary"
                                                            }
                                                            onClick={() =>
                                                                changeTurn(id)
                                                            }
                                                            sx={{
                                                                ml: 0.5,
                                                                py: 0,
                                                                px: 1,
                                                                height: "1.2rem",
                                                                lineHeight:
                                                                    "1rem",
                                                                fontSize:
                                                                    "0.6rem",
                                                            }}
                                                        >
                                                            Turn
                                                        </ArticlesButton>
                                                        <ArticlesButton
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() =>
                                                                kickUser(id)
                                                            }
                                                            sx={{
                                                                ml: 0.5,
                                                                py: 0,
                                                                px: 1,
                                                                height: "1.2rem",
                                                                lineHeight:
                                                                    "1rem",
                                                                fontSize:
                                                                    "0.6rem",
                                                            }}
                                                        >
                                                            Kick
                                                        </ArticlesButton>
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}

                                <Box
                                    sx={{
                                        mt: 0.5,
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    Current Turn:{" "}
                                    <Box
                                        component="b"
                                        sx={{
                                            color: "primary.main",
                                        }}
                                    >
                                        {currentTurn
                                            ? currentTurn.replace(idPrefix, "")
                                            : "None"}
                                    </Box>{" "}
                                    {currentTurn === peerId && "(You)"}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
