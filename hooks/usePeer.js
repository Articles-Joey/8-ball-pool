import { useEffect } from "react";
import Peer from "peerjs";
import { useSearchParams } from "next/navigation";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useStore } from "@/hooks/useStore";
import {
    makeSnapshot,
    normalizeRoomCode,
    PEER_PREFIX,
    POOL_PROTOCOL,
    validSnapshot,
} from "@/util/poolGame";

// Mounted once by GamePage, independently of whether the sidebar is visible.
export function usePeer() {
    const gameId = useSearchParams().get("game_id");

    useEffect(() => {
        const store = useEightBallStore;
        const multiplayer = Boolean(gameId);
        store.getState().startSession(multiplayer ? "multiplayer" : "local");
        if (!multiplayer) return;

        const hosting = gameId === "loading";
        const roomCode = normalizeRoomCode(gameId);
        let peer;
        let connection;
        let disposed = false;
        let sequence = 0;
        let receivedSequence = -1;
        let commandNumber = 0;
        let pendingAim = null;
        let retries = 0;
        let timeout;
        let pendingTimeout;
        let lastSnapshotState;
        let unsubscribe = () => {};
        const localName = String(
            useStore.getState().nickname || "Player",
        ).slice(0, 32);
        const nameOf = (conn) =>
            String(conn.metadata?.name || "Guest").slice(0, 32);
        const packet = (type, fields = {}) => ({
            protocol: POOL_PROTOCOL,
            type,
            ...fields,
        });
        const setError = (message) =>
            store.setState({
                networkError: message,
                networkBusy: false,
            });
        const send = (conn, data) => {
            if (!conn?.open || disposed) return false;
            try {
                conn.send(data);
                return true;
            } catch {
                setError(
                    "Connection lost. Return to the lobby to start another game.",
                );
                return false;
            }
        };
        const sendSnapshot = (conn = connection, extra = {}) => {
            if (!hosting || !conn?.open) return;
            lastSnapshotState = store.getState();
            send(
                conn,
                packet("state", {
                    sequence: ++sequence,
                    snapshot: makeSnapshot(lastSnapshotState),
                    ...extra,
                }),
            );
        };
        const disconnect = (message = "You left the room.") => {
            clearTimeout(timeout);
            clearTimeout(pendingTimeout);
            const state = store.getState();
            if (connection?.open) send(connection, packet("leave"));
            state.playerDisconnected(state.peerId);
            connection?.close();
            connection = null;
            store.setState({
                connectionRef: { current: null },
                networkError: message,
                sendPeerCommand: null,
                networkBusy: false,
            });
        };

        const attachConnection = (conn, outgoing = false) => {
            let accepted = false;
            let lastCommand = 0;
            conn.on("open", () => {
                if (disposed) {
                    conn.close();
                    return;
                }
                clearTimeout(timeout);
                if (hosting) {
                    if (
                        conn.metadata?.protocol !== POOL_PROTOCOL ||
                        connection?.open ||
                        !store.getState().seatGuest(conn.peer, nameOf(conn))
                    ) {
                        send(
                            conn,
                            packet("reject", {
                                message:
                                    "This room already has two players or uses a different game version.",
                            }),
                        );
                        // Allow the reliable rejection packet to leave before closing.
                        setTimeout(() => conn.close(), 200);
                        return;
                    }
                } else if (
                    !outgoing ||
                    conn.peer !== `${PEER_PREFIX}${roomCode}`
                ) {
                    conn.close();
                    return;
                }
                accepted = true;
                connection = conn;
                receivedSequence = -1;
                store.setState({
                    connected: true,
                    peerStatus: "connected",
                    networkError: "",
                    connectionRef: { current: conn },
                });
                if (hosting) sendSnapshot(conn);
            });
            conn.on("data", (data) => {
                if (disposed || !data || data.protocol !== POOL_PROTOCOL)
                    return;
                if (!hosting && data.type === "reject" && outgoing) {
                    clearTimeout(timeout);
                    setError(
                        String(
                            data.message || "The host rejected the connection.",
                        ),
                    );
                    store.setState({ connected: false, peerStatus: "error" });
                    accepted = false;
                    connection = null;
                    return;
                }
                if (!accepted || conn !== connection) return;
                if (data.type === "leave") {
                    store.getState().playerDisconnected(conn.peer);
                    conn.close();
                    return;
                }
                if (hosting) {
                    // Guests never supply turns, physics snapshots, scores, or winners.
                    if (
                        data.type !== "command" ||
                        !Number.isInteger(data.id) ||
                        data.id <= lastCommand
                    )
                        return;
                    lastCommand = data.id;
                    const state = store.getState();
                    const valid =
                        data.matchId === state.matchId &&
                        data.shotNumber === state.shotNumber;
                    const acceptedCommand =
                        valid &&
                        state.applyGameCommand(data.command, conn.peer);
                    sendSnapshot(conn, {
                        acknowledgement: data.id,
                        error: acceptedCommand
                            ? ""
                            : "That action is no longer available. The table has been refreshed.",
                    });
                } else if (
                    data.type === "state" &&
                    Number.isInteger(data.sequence) &&
                    data.sequence > receivedSequence &&
                    validSnapshot(data.snapshot)
                ) {
                    receivedSequence = data.sequence;
                    clearTimeout(pendingTimeout);
                    if (
                        data.snapshot.phase !== "aiming" ||
                        data.snapshot.currentTurn !== store.getState().peerId ||
                        (Number.isInteger(data.acknowledgement) &&
                            data.acknowledgement >= pendingAim?.id)
                    )
                        pendingAim = null;
                    const snapshot = pendingAim
                        ? { ...data.snapshot, ...pendingAim.values }
                        : data.snapshot;
                    store.getState().applyPeerSnapshot(snapshot);
                    if (data.error) setError(String(data.error));
                    else if (Number.isInteger(data.acknowledgement))
                        store.setState({ networkError: "" });
                }
            });
            const closed = () => {
                if (disposed || !accepted || conn !== connection) return;
                clearTimeout(pendingTimeout);
                store.getState().playerDisconnected(conn.peer);
                store.setState({
                    connectionRef: { current: null },
                    networkBusy: false,
                    networkError:
                        "The other player disconnected. This rack has ended.",
                });
                connection = null;
            };
            conn.on("close", closed);
            conn.on("error", (error) => {
                if (accepted) closed();
                else {
                    clearTimeout(timeout);
                    setError(error.message || "Unable to join this room.");
                    store.setState({ peerStatus: "error", connected: false });
                }
            });
        };

        const connect = () => {
            if (disposed || hosting || !peer?.open || connection?.open) return;
            if (!/^[a-z0-9-]{4,64}$/.test(roomCode)) {
                setError("Enter a valid room code.");
                store.setState({ peerStatus: "error" });
                return;
            }
            connection?.close();
            store.setState({ peerStatus: "connecting", networkError: "" });
            const conn = peer.connect(`${PEER_PREFIX}${roomCode}`, {
                reliable: true,
                serialization: "json",
                metadata: { protocol: POOL_PROTOCOL, name: localName },
            });
            attachConnection(conn, true);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (!disposed && !store.getState().connected) {
                    conn.close();
                    setError(
                        "The room could not be reached. Check the code and try again.",
                    );
                    store.setState({ peerStatus: "error" });
                }
            }, 15000);
        };

        const createPeer = () => {
            const suffix = crypto
                .randomUUID()
                .replaceAll("-", "")
                .slice(0, hosting ? 8 : 16);
            peer = new Peer(`${PEER_PREFIX}${suffix}`);
            const thisPeer = peer;
            store.setState({ peerRef: { current: peer } });
            peer.on("open", (id) => {
                if (disposed || peer !== thisPeer) return;
                store.setState({
                    peerId: id,
                    roomCode: hosting ? normalizeRoomCode(id) : roomCode,
                });
                if (hosting)
                    store
                        .getState()
                        .seatHost(id, localName, normalizeRoomCode(id));
                else connect();
            });
            peer.on("connection", (conn) => {
                if (hosting && !disposed) attachConnection(conn);
                else conn.close();
            });
            peer.on("error", (error) => {
                if (disposed || peer !== thisPeer) return;
                if (error.type === "unavailable-id" && retries++ < 3) {
                    thisPeer.destroy();
                    createPeer();
                    return;
                }
                clearTimeout(timeout);
                setError(
                    error.type === "peer-unavailable"
                        ? "Room not found. Check the room code or ask the host for a new invite."
                        : error.message || "Unable to connect to multiplayer.",
                );
                if (!connection?.open)
                    store.setState({ peerStatus: "error", connected: false });
            });
            peer.on("disconnected", () => {
                if (!disposed && !thisPeer.destroyed) thisPeer.reconnect();
            });
        };

        store.setState({
            retryPeerConnection: () => {
                if (peer?.destroyed || !peer?.open) {
                    peer?.destroy();
                    createPeer();
                } else connect();
            },
            leavePeerSession: disconnect,
            sendPeerCommand: (command) => {
                const state = store.getState();
                if (!connection?.open || state.networkBusy) return false;
                const waitsForReply = [
                    "shoot",
                    "confirm-placement",
                    "break-choice",
                    "rematch",
                ].includes(command.type);
                if (waitsForReply) {
                    store.setState({ networkBusy: true, networkError: "" });
                    clearTimeout(pendingTimeout);
                    pendingTimeout = setTimeout(() => {
                        if (!disposed)
                            setError(
                                "The host has not responded. Wait for the table to refresh before trying again.",
                            );
                    }, 5000);
                }
                const id = ++commandNumber;
                const sent = send(
                    connection,
                    packet("command", {
                        id,
                        matchId: state.matchId,
                        shotNumber: state.shotNumber,
                        command,
                    }),
                );
                if (sent && command.type === "aim") {
                    const values = { ...(pendingAim?.values || {}) };
                    if (Number.isFinite(command.power))
                        values.cuePower = Math.max(
                            0,
                            Math.min(100, command.power),
                        );
                    if (Number.isFinite(command.rotation))
                        values.cueRotation =
                            ((command.rotation % 360) + 360) % 360;
                    pendingAim = { id, values };
                    store.setState(values);
                }
                if (!sent) store.setState({ networkBusy: false });
                return sent;
            },
        });
        if (hosting) {
            unsubscribe = store.subscribe((state, previous) => {
                if (
                    state.phase !== previous.phase ||
                    state.winner !== previous.winner ||
                    state.matchId !== previous.matchId ||
                    state.rematchRequests !== previous.rematchRequests
                )
                    sendSnapshot();
            });
        }
        // One authoritative stream includes cue ball, transforms, side assignments and turn state.
        const interval = setInterval(() => {
            if (hosting && store.getState() !== lastSnapshotState)
                sendSnapshot();
        }, 80);
        createPeer();

        return () => {
            disposed = true;
            clearInterval(interval);
            clearTimeout(timeout);
            clearTimeout(pendingTimeout);
            unsubscribe();
            connection?.close();
            peer?.destroy();
            store.setState({
                connected: false,
                sendPeerCommand: null,
                networkBusy: false,
                retryPeerConnection: null,
                leavePeerSession: null,
                peerRef: { current: null },
                connectionRef: { current: null },
            });
        };
    }, [gameId]);
}
