import { useEffect, useRef } from "react";
import Peer from 'peerjs';
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useSearchParams } from "next/navigation";

export function usePeer() {
    const searchParams = useSearchParams();
    const searchParamsObject = Object.fromEntries(searchParams.entries());

    const idPrefix = "articles-media-8-ball-pool-";

    const {
        peerId, setPeerId,
        connected, setConnected,
        connectionPeerId, setConnectionPeerId,
        players, setPlayers,
        lastLaunch, setLastLaunch,
        isHost, setIsHost,
        setCurrentTurn,
        setBallPositions,
        setBallPositionsUpdated,
        setCuePower,
        setCueRotation,
        setNudge,
        setResetPeer,
        peerRef,
        connectionRef,
        nudge,
        cuePower,
        cueRotation,
        currentTurn,
    } = useEightBallStore();

    const manuallyDisconnectedRef = useRef(false);

    useEffect(() => {
        if (!peerRef.current) {
            console.log("Setting up Peer from hook");

            const initPeer = (id) => {
                const newPeer = new Peer(id, { debug: 2 });
                peerRef.current = newPeer;

                newPeer.on('open', (id) => {
                    setPeerId(id);
                    console.log(`My peer ID is: ${id}`);
                    setPlayers([...new Set([...players, id])]);

                    if (searchParamsObject.game_id === "loading" || searchParamsObject.game_id === id.replace(idPrefix, '')) {
                        const url = new URL(window.location.href);
                        url.searchParams.set('game_id', id.replace(idPrefix, ''));
                        window.history.replaceState({}, '', url);
                        if (searchParamsObject.game_id !== "loading") {
                            setIsHost(true);
                        }
                    }
                });

                newPeer.on('connection', function (conn) {
                    console.log("A connection was made?");
                    setConnected(true);
                    setPlayers([...new Set([...useEightBallStore.getState().players, conn.peer])]);

                    setTimeout(() => {
                        conn.send({
                            type: "Turn Change",
                            turn: useEightBallStore.getState().currentTurn
                        });
                        conn.send({
                            type: "Ball Sync",
                            ballPositions: useEightBallStore.getState().ballPositions
                        });
                    }, 500);

                    conn.on('data', (data) => {
                        console.log('Received data:', data);
                        if (data.type === "Ball Positions" || data.type === "Ball Sync") {
                            setBallPositions(data.ballPositions);
                            setBallPositionsUpdated(data.ballPositions);
                        }
                        if (data.type === "Adjustment Event") {
                            const currentTurnState = useEightBallStore.getState().currentTurn;
                            if (currentTurnState === conn.peer) {
                                setCuePower(data.cuePower);
                                setCueRotation(data.cueRotation);

                                // Host broadcasts to all other clients
                                if (peerRef.current && peerRef.current.connections) {
                                    Object.keys(peerRef.current.connections).forEach(pid => {
                                        if (pid !== conn.peer) {
                                            peerRef.current.connections[pid].forEach(c => {
                                                if (c.open) c.send(data);
                                            });
                                        }
                                    });
                                }
                            }
                        }
                        if (data.type === "Launch Event") {
                            const currentTurnState = useEightBallStore.getState().currentTurn;
                            if (currentTurnState && currentTurnState !== conn.peer) {
                                console.log("Ignoring Launch Event - not this player's turn");
                            } else {
                                setCuePower(data.cuePower);
                                setCueRotation(data.cueRotation);
                                setNudge(true);
                                setLastLaunch({ cuePower: data.cuePower, cueRotation: data.cueRotation, time: new Date().toLocaleTimeString() });
                                if (peerRef.current && peerRef.current.connections) {
                                    Object.keys(peerRef.current.connections).forEach(pid => {
                                        if (pid !== conn.peer) {
                                            peerRef.current.connections[pid].forEach(c => {
                                                c.send({ type: "Launch Event", cuePower: data.cuePower, cueRotation: data.cueRotation });
                                            });
                                        }
                                    });
                                }
                            }
                        }
                        if (data.type === "Connection") {
                            connectToPeer(data.peerId);
                        }
                        if (data.type === "Kick") {
                            disconnectPeer();
                        }
                        if (data.type === "Turn Change") {
                            setCurrentTurn(data.turn);
                        }
                    });

                    conn.on('close', () => {
                        const newPlayers = useEightBallStore.getState().players.filter(p => p !== conn.peer);
                        setPlayers(newPlayers);
                        if (newPlayers.length === 0) setConnected(false);
                    });
                });

                newPeer.on('error', (err) => {
                    console.error('Peer error:', err);
                    if (err.type === 'unavailable-id' && searchParamsObject.game_id && searchParamsObject.game_id !== "loading") {
                        newPeer.destroy();
                        const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
                        initPeer(`${idPrefix}${randomFourDigit}`);
                    }
                });
            };

            let desiredId;
            if (searchParamsObject.game_id && searchParamsObject.game_id !== "loading") {
                desiredId = `${idPrefix}${searchParamsObject.game_id}`;
            } else {
                const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
                desiredId = `${idPrefix}${randomFourDigit}`;
            }
            initPeer(desiredId);
        }

        return () => {
            // We might not want to destroy here if the hook is used in multiple places,
            // but the user only uses it in LeftPanel which stays mounted.
        };
    }, []);

    useEffect(() => {
        if (manuallyDisconnectedRef.current) return;
        if (searchParamsObject.game_id === "loading") {
            setIsHost(true);
        } else if (peerId && !connected && !isHost && searchParamsObject.game_id) {
            connectToPeer(`${idPrefix}${searchParamsObject.game_id}`);
        }
    }, [peerId, connected, isHost, searchParamsObject.game_id]);

    function connectToPeer(id) {
        if (!peerRef.current) return;
        const connection = peerRef.current.connect(id);
        connection.on('open', () => {
            connectionRef.current = connection;
            connectionRef.current.send({ type: "Connection", date: new Date(), peerId });
            setConnected(true);
            setPlayers([...new Set([...useEightBallStore.getState().players, id])]);
            connectionRef.current.on('data', (data) => {
                if (data.type === "Kick") disconnectPeer();
                if (data.type === "Turn Change") setCurrentTurn(data.turn);
                if (data.type === "Adjustment Event") {
                    setCuePower(data.cuePower);
                    setCueRotation(data.cueRotation);
                }
                if (data.type === "Ball Sync") {
                    setBallPositions(data.ballPositions);
                    setBallPositionsUpdated(data.ballPositions);
                }
                if (data.type === "Launch Event") {
                    setCuePower(data.cuePower);
                    setCueRotation(data.cueRotation);
                    setNudge(true);
                    setLastLaunch({ cuePower: data.cuePower, cueRotation: data.cueRotation, time: new Date().toLocaleTimeString() });
                }
            });
        });
        connection.on('close', () => {
            const newPlayers = useEightBallStore.getState().players.filter(p => p !== id);
            setPlayers(newPlayers);
            if (newPlayers.length === 0) setConnected(false);
        });
    }

    function disconnectPeer() {
        manuallyDisconnectedRef.current = true;
        if (peerRef.current) {
            peerRef.current.disconnect();
            peerRef.current.destroy();
            peerRef.current = null;
        }
        setConnected(false);
        setPeerId("");
        setResetPeer(true);
        setPlayers([]);
    }

    function kickUser(id) {
        if (!isHost || !peerRef.current) return;
        if (peerRef.current.connections[id]) {
            peerRef.current.connections[id].forEach(conn => {
                conn.send({ type: "Kick" });
                setTimeout(() => conn.close(), 100);
            });
        }
        setPlayers(players.filter(p => p !== id));
    }

    function changeTurn(id) {
        if (!isHost) return;
        setCurrentTurn(id);
        const ballPositions = useEightBallStore.getState().ballPositions;
        if (peerRef.current && peerRef.current.connections) {
            Object.keys(peerRef.current.connections).forEach(pid => {
                peerRef.current.connections[pid].forEach(conn => {
                    conn.send({ type: "Turn Change", turn: id });
                    conn.send({ type: "Ball Sync", ballPositions });
                });
            });
        }
    }

    function sendMessage() {
        if (connectionRef.current) {
            connectionRef.current.send({
                type: "Ball Positions",
                date: new Date(),
                peerId,
                ballPositions: useEightBallStore.getState().ballPositions,
                cuePower,
                cueRotation
            });
        }
    }

    // Broadcast launch event when nudge fires
    const prevNudgeRef = useRef(false);
    useEffect(() => {
        if (nudge && !prevNudgeRef.current) {
            const currentTurnState = useEightBallStore.getState().currentTurn;
            if (!currentTurnState || currentTurnState === peerId) {
                const launchCuePower = useEightBallStore.getState().cuePower;
                const launchCueRotation = useEightBallStore.getState().cueRotation;
                setLastLaunch({ cuePower: launchCuePower, cueRotation: launchCueRotation, time: new Date().toLocaleTimeString() });
                
                // Broadcast
                if (peerRef.current && peerRef.current.connections) {
                    Object.keys(peerRef.current.connections).forEach(pid => {
                        peerRef.current.connections[pid].forEach(conn => {
                            if (conn.open) conn.send({ type: "Launch Event", cuePower: launchCuePower, cueRotation: launchCueRotation });
                        });
                    });
                }
                if (connectionRef.current && connectionRef.current.open) {
                    connectionRef.current.send({ type: "Launch Event", cuePower: launchCuePower, cueRotation: launchCueRotation });
                }
            }
        }
        prevNudgeRef.current = nudge;
    }, [nudge]);

    // Broadcast adjustment events (Rotation/Power)
    useEffect(() => {
        const currentTurnState = useEightBallStore.getState().currentTurn;

        // Only broadcast if it's my turn
        if (currentTurnState === peerId) {
            const data = {
                type: "Adjustment Event",
                cuePower,
                cueRotation
            };

            // If I am host, broadcast to everyone
            if (isHost && peerRef.current && peerRef.current.connections) {
                Object.keys(peerRef.current.connections).forEach(pid => {
                    peerRef.current.connections[pid].forEach(conn => {
                        if (conn.open) conn.send(data);
                    });
                });
            }
            // If I am client, send to host
            else if (connectionRef.current && connectionRef.current.open) {
                connectionRef.current.send(data);
            }
        }
    }, [cuePower, cueRotation, peerId, isHost]);

    return {
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
        idPrefix
    };
}
