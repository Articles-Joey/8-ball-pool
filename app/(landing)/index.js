"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NicknameInput from "@articles-media/articles-dev-box/NicknameInput";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import useUserDetails from "@articles-media/articles-dev-box/useUserDetails";
import useUserToken from "@articles-media/articles-dev-box/useUserToken";
import ArticlesButton from "@/components/UI/Button";
import IsDev from "@/components/UI/IsDev";
import { useStore } from "@/hooks/useStore";
import { useSocketStore } from "@/hooks/useSocketStore";

const Ad = dynamic(() => import("@articles-media/articles-dev-box/Ad"), {
    ssr: false,
});
const ReturnToLauncherButton = dynamic(
    () => import("@articles-media/articles-dev-box/ReturnToLauncherButton"),
    { ssr: false },
);
const SessionButton = dynamic(
    () => import("@articles-media/articles-dev-box/SessionButton"),
    { ssr: false },
);

export default function LandingPage() {
    const { data: userToken } = useUserToken(
        process.env.NEXT_PUBLIC_GAME_PORT || "3015",
    );
    const { data: userDetails, isLoading: userDetailsLoading } = useUserDetails(
        { token: userToken },
    );
    const socket = useSocketStore((state) => state.socket);
    const router = useRouter();
    const darkMode = useStore((state) => state.darkMode);
    const lobbyDetails = useStore((state) => state.lobbyDetails);
    const setLobbyDetails = useStore((state) => state.setLobbyDetails);
    const [prepareMultiplayer, setPrepareMultiplayer] = useState(false);

    useEffect(() => {
        const updateLobby = (details) => {
            if (
                JSON.stringify(details) !==
                JSON.stringify(useStore.getState().lobbyDetails)
            ) {
                setLobbyDetails(details);
            }
        };
        socket.on("game:8-ball-pool-landing-details", updateLobby);
        return () =>
            socket.off("game:8-ball-pool-landing-details", updateLobby);
    }, [socket, setLobbyDetails]);

    useEffect(() => {
        const joinLobby = () =>
            socket.emit("join-room", "game:8-ball-pool-landing");
        if (socket.connected) joinLobby();
        socket.on("connect", joinLobby);
        return () => {
            socket.off("connect", joinLobby);
            socket.emit("leave-room", "game:8-ball-pool-landing");
        };
    }, [socket]);

    function attemptConnection() {
        const params = new URLSearchParams({
            game_id: `articles-media-8-ball-pool-${prepareMultiplayer.room_code}`,
        });
        router.push(`/play?${params.toString()}`);
    }

    return (
        <Box
            sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
            }}
        >
            <Box sx={{ position: "fixed", inset: 0, zIndex: -1 }}>
                <Box
                    component={Image}
                    src={`${process.env.NEXT_PUBLIC_CDN}games/8 Ball Pool/8-ball-pool-lobby-background.jpg`}
                    alt=""
                    fill
                    sx={(theme) => ({
                        objectFit: "cover",
                        objectPosition: "center",
                        filter:
                            theme.palette.mode === "dark"
                                ? "blur(5px) brightness(0.5)"
                                : "blur(10px)",
                    })}
                />
            </Box>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 1320,
                    mx: "auto",
                    px: 1.5,
                    py: 2,
                    display: "flex",
                    flexDirection: "column-reverse",
                    justifyContent: "center",
                    alignItems: "center",
                    "@media (min-width: 992px)": { flexDirection: "row" },
                }}
            >
                <Box sx={{ width: "20rem", maxWidth: "100%" }}>
                    <Box sx={{ position: "relative", height: 200 }}>
                        <Box
                            component={Image}
                            src="/img/logo.webp"
                            alt="8 Ball Pool"
                            fill
                            sx={{ objectFit: "cover" }}
                        />
                    </Box>
                    <Paper
                        variant="outlined"
                        sx={{ mb: 2, borderRadius: 1, overflow: "hidden" }}
                    >
                        <Box
                            sx={{
                                p: 1,
                                borderBottom: 1,
                                borderColor: "divider",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <NicknameInput useStore={useStore} />
                        </Box>
                        <Box sx={{ p: 1 }}>
                            {prepareMultiplayer === false ? (
                                <>
                                    <ArticlesButton
                                        component={Link}
                                        href="/play"
                                        fullWidth
                                        sx={{ mb: 2 }}
                                        startIcon={<PersonIcon />}
                                    >
                                        Play Single Player
                                    </ArticlesButton>
                                    <ArticlesButton
                                        fullWidth
                                        sx={{ mb: 0.5 }}
                                        startIcon={<GroupsIcon />}
                                        onClick={() =>
                                            setPrepareMultiplayer({})
                                        }
                                    >
                                        Play Multiplayer
                                    </ArticlesButton>
                                </>
                            ) : (
                                <>
                                    {prepareMultiplayer.room_code ===
                                    undefined ? (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                width: "100%",
                                            }}
                                        >
                                            <ArticlesButton
                                                sx={{ width: "50%" }}
                                                onClick={() =>
                                                    router.push(
                                                        "/play?game_id=loading",
                                                    )
                                                }
                                            >
                                                Start a Game
                                            </ArticlesButton>
                                            <ArticlesButton
                                                sx={{ width: "50%" }}
                                                onClick={() =>
                                                    setPrepareMultiplayer({
                                                        room_code: "",
                                                    })
                                                }
                                            >
                                                Join a Game
                                            </ArticlesButton>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Alert
                                                severity="error"
                                                sx={{ py: 0.5, mb: 1 }}
                                            >
                                                Invalid room code
                                            </Alert>
                                            <TextField
                                                label="Room code"
                                                value={
                                                    prepareMultiplayer.room_code
                                                }
                                                fullWidth
                                                size="small"
                                                onChange={(event) =>
                                                    setPrepareMultiplayer({
                                                        ...prepareMultiplayer,
                                                        room_code:
                                                            event.target.value,
                                                    })
                                                }
                                            />
                                        </Box>
                                    )}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            width: "100%",
                                            mt: 2,
                                        }}
                                    >
                                        <ArticlesButton
                                            variant="link"
                                            startIcon={<ArrowBackIcon />}
                                            onClick={() =>
                                                setPrepareMultiplayer(
                                                    prepareMultiplayer.room_code !==
                                                        undefined
                                                        ? {}
                                                        : false,
                                                )
                                            }
                                        >
                                            Back
                                        </ArticlesButton>
                                        <Box
                                            component="span"
                                            sx={{ mx: 1 }}
                                        >
                                            |
                                        </Box>
                                        <ArticlesButton
                                            variant="link"
                                            endIcon={<ArrowForwardIcon />}
                                            disabled={
                                                !prepareMultiplayer.room_code ||
                                                prepareMultiplayer.room_code
                                                    .length < 4
                                            }
                                            onClick={attemptConnection}
                                        >
                                            Enter
                                        </ArticlesButton>
                                    </Box>
                                </>
                            )}
                            <Box
                                sx={{
                                    fontWeight: "bold",
                                    mb: 0.5,
                                    fontSize: "0.875rem",
                                    textAlign: "center",
                                    display: "none",
                                }}
                            >
                                {lobbyDetails.players.length || 0} player
                                {lobbyDetails.players.length > 1 && "s"} in the
                                lobby.
                            </Box>
                            <Box
                                sx={{
                                    display: "none",
                                    gap: "5px",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                }}
                            >
                                {[1, 2, 3, 4].map((id) => {
                                    const lobby =
                                        lobbyDetails?.fourFrogsGlobalState?.games?.find(
                                            (item) =>
                                                parseInt(item.server_id) === id,
                                        );
                                    return (
                                        <Box
                                            key={id}
                                            sx={{
                                                p: 1,
                                                border: 1,
                                                borderColor: "divider",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    width: "100%",
                                                    mb: 1,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        fontSize: "0.9rem",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    Server {id}
                                                </Box>
                                                <Box>
                                                    {lobby?.players?.length ||
                                                        0}
                                                    /2
                                                </Box>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    width: "100%",
                                                    mb: 0.5,
                                                }}
                                            >
                                                {[1, 2].map((player) => (
                                                    <Box
                                                        key={player}
                                                        sx={{
                                                            width: 20,
                                                            height: 20,
                                                            bgcolor:
                                                                lobby?.players
                                                                    ?.length >=
                                                                player
                                                                    ? "black"
                                                                    : "gray",
                                                            border: "1px solid black",
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                            <ArticlesButton
                                                component={Link}
                                                href={{
                                                    pathname: "/play",
                                                    query: { server: id },
                                                }}
                                                sx={{ px: 6 }}
                                                small
                                            >
                                                Join
                                            </ArticlesButton>
                                        </Box>
                                    );
                                })}
                            </Box>
                            <IsDev sx={{ mt: 2 }}>
                                <ArticlesButton
                                    sx={{ width: "50%" }}
                                    variant="warning"
                                    onClick={() =>
                                        socket.emit("game:four-frogs:reset", "")
                                    }
                                >
                                    Reset Server
                                </ArticlesButton>
                            </IsDev>
                        </Box>
                        <Box
                            sx={{
                                p: 1,
                                borderTop: 1,
                                borderColor: "divider",
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                            }}
                        >
                            <GameMenuPrimaryButtonGroup
                                useStore={useStore}
                                type="Landing"
                            />
                        </Box>
                    </Paper>
                    <SessionButton
                        port={process.env.NEXT_PUBLIC_GAME_PORT}
                        friendsButton
                    />
                    <ReturnToLauncherButton />
                </Box>
                <Box
                    sx={{
                        mt: 2,
                        "@media (min-width: 992px)": {
                            mt: 0,
                            position: "absolute",
                            right: "1rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                        },
                    }}
                >
                    <Ad
                        style="Default"
                        section="Games"
                        section_id={process.env.NEXT_PUBLIC_GAME_NAME}
                        darkMode={Boolean(darkMode)}
                        user_ad_token={userToken}
                        userDetails={userDetails}
                        userDetailsLoading={userDetailsLoading}
                    />
                </Box>
            </Box>
        </Box>
    );
}
