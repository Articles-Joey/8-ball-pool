export const PEER_PREFIX = "articles-media-8-ball-pool-";
export const POOL_PROTOCOL = "8-ball-pool-v1";
// Recess the pocket centers into the rails beyond the 50 × 100 playing surface.
export const POCKETS = [
    { name: "Top left", position: [-26.1, 0, -51.1], radius: 2.7 },
    { name: "Top right", position: [26.1, 0, -51.1], radius: 2.7 },
    { name: "Middle left", position: [-26.6, 0, 0], radius: 2.3 },
    { name: "Middle right", position: [26.6, 0, 0], radius: 2.3 },
    { name: "Bottom left", position: [-26.1, 0, 51.1], radius: 2.7 },
    { name: "Bottom right", position: [26.1, 0, 51.1], radius: 2.7 },
];

export const ballGroup = (ball) =>
    ball >= 1 && ball <= 7
        ? "solids"
        : ball >= 9 && ball <= 15
          ? "stripes"
          : null;
export const isOut = (ball) => ball.pocketed || ball.position[1] < -10;
export const isAuthority = (state) => state.mode === "local" || state.isHost;
export const actorId = (state) =>
    state.mode === "local" ? state.currentTurn : state.peerId;
export const remainingBalls = (state, player = state.currentTurn) =>
    state.ballPositions.filter(
        (ball) =>
            ball.ball !== 0 &&
            !isOut(ball) &&
            ballGroup(ball.ball) === state.sides[player],
    );
export const isOnEight = (state, player = state.currentTurn) => {
    if (state.breakPending) return false;
    const side = state.sides[player];
    return side
        ? remainingBalls(state, player).length === 0
        : ["solids", "stripes"].some(
              (group) =>
                  !state.ballPositions.some(
                      (b) => !isOut(b) && ballGroup(b.ball) === group,
                  ),
          );
};
const hasRequiredCall = (state) =>
    !isOnEight(state) ||
    state.safety ||
    (state.calledBall === 8 &&
        Number.isInteger(state.calledPocket) &&
        state.calledPocket >= 0 &&
        state.calledPocket < POCKETS.length);
export const canControl = (state) =>
    state.physicsReady &&
    !state.networkBusy &&
    state.participants.length === 2 &&
    state.currentTurn === actorId(state) &&
    (state.mode === "local" || state.connected) &&
    ["aiming", "placing", "break-choice"].includes(state.phase);
export const canAim = (state) => canControl(state) && state.phase === "aiming";
export const canShoot = (state) =>
    canAim(state) && state.cuePower > 0 && hasRequiredCall(state);
export function normalizeRoomCode(value) {
    let code = String(value || "").trim();
    if (/^https?:\/\//i.test(code)) {
        try {
            code = new URL(code).searchParams.get("game_id") || "";
        } catch {
            return "";
        }
    }
    return code.toLowerCase().replace(PEER_PREFIX, "");
}

const stoppedBall = (ball, position) => ({
    ball,
    position,
    velocity: [0, 0, 0],
    rotation: [0, 0, 0],
    angularVelocity: [0, 0, 0],
    pocketed: false,
});

export function makeRack() {
    const order = [1, 9, 2, 10, 8, 3, 11, 7, 14, 4, 5, 13, 15, 6, 12];
    const rack = [stoppedBall(0, [0, 1.26, 25])];
    let index = 0;
    for (let row = 0; row < 5; row++) {
        for (let column = 0; column <= row; column++) {
            rack.push(
                stoppedBall(order[index++], [
                    (column - row / 2) * 2.02,
                    1.26,
                    -25 - row * Math.sqrt(3) * 1.01,
                ]),
            );
        }
    }
    return rack;
}

function freshRack(participants, breaker, scores = {}) {
    const balls = makeRack();
    return {
        matchId: crypto.randomUUID(),
        participants,
        scores,
        sides: {},
        ballPositions: balls,
        ballPositionsUpdated: balls,
        currentTurn: breaker,
        phase: participants.length === 2 ? "placing" : "waiting",
        breakPending: true,
        ballInHand: "head",
        placementValid: true,
        headRestricted: false,
        calledBall: null,
        calledPocket: null,
        safety: false,
        shotNumber: 0,
        shot: null,
        winner: null,
        winReason: "",
        lastFoul: "",
        showWinner: false,
        message:
            participants.length === 2
                ? "Place the cue ball behind the head string, then confirm to break."
                : "Waiting for a second player.",
        breakDecision: null,
        rematchRequests: [],
        nudge: false,
        lastBreaker: breaker,
        cuePower: 80,
        cueRotation: 180,
        lastLaunch: null,
        networkBusy: false,
        physicsReady: false,
    };
}

export function validPlacement(state, x, z) {
    if (
        !Number.isFinite(x) ||
        !Number.isFinite(z) ||
        Math.abs(x) > 23.9 ||
        Math.abs(z) > 48.9 ||
        (state.ballInHand === "head" && z < 25)
    )
        return false;
    if (
        POCKETS.some(
            ({ position: [px, , pz], radius }) =>
                Math.hypot(x - px, z - pz) < radius + 1.05,
        )
    )
        return false;
    return !state.ballPositions.some(
        (b) =>
            b.ball !== 0 &&
            !isOut(b) &&
            Math.hypot(x - b.position[0], z - b.position[2]) < 2.05,
    );
}

function findSpot(state, ball, headOnly = false) {
    const occupied = state.ballPositions.filter(
        (b) => b.ball !== ball && !isOut(b),
    );
    const free = (x, z) =>
        !occupied.some(
            (b) => Math.hypot(x - b.position[0], z - b.position[2]) < 2.05,
        );
    const preferredZ = ball === 8 ? -25 : 25;
    if (free(0, preferredZ)) return [0, 1.26, preferredZ];
    if (ball === 8) {
        for (let z = -25.2; z >= -48; z -= 0.2)
            if (free(0, z)) return [0, 1.26, z];
        for (let z = -24.8; z <= 48; z += 0.2)
            if (free(0, z)) return [0, 1.26, z];
    }
    for (let z = headOnly ? 25 : -45; z <= 45; z += 2.2) {
        for (let x = -20; x <= 20; x += 2.2) {
            if (free(x, z)) return [x, 1.26, z];
        }
    }
    return [0, 1.26, 25];
}

export const SNAPSHOT_KEYS = [
    "matchId",
    "participants",
    "scores",
    "sides",
    "ballPositions",
    "currentTurn",
    "phase",
    "breakPending",
    "ballInHand",
    "placementValid",
    "calledBall",
    "calledPocket",
    "safety",
    "shotNumber",
    "winner",
    "winReason",
    "lastFoul",
    "message",
    "breakDecision",
    "rematchRequests",
    "cuePower",
    "cueRotation",
    "physicsReady",
    "lastLaunch",
    "lastBreaker",
];
export const makeSnapshot = (state) =>
    Object.fromEntries(SNAPSHOT_KEYS.map((key) => [key, state[key]]));

export function validSnapshot(snapshot) {
    return (
        snapshot &&
        typeof snapshot.matchId === "string" &&
        [
            "waiting",
            "placing",
            "aiming",
            "shooting",
            "break-choice",
            "finished",
        ].includes(snapshot.phase) &&
        Array.isArray(snapshot.participants) &&
        snapshot.participants.length <= 2 &&
        snapshot.participants.every(
            (p) => typeof p.id === "string" && typeof p.name === "string",
        ) &&
        Number.isInteger(snapshot.shotNumber) &&
        snapshot.sides &&
        snapshot.scores &&
        Array.isArray(snapshot.rematchRequests) &&
        snapshot.rematchRequests.every((id) => typeof id === "string") &&
        (snapshot.currentTurn === null ||
            snapshot.participants.some((p) => p.id === snapshot.currentTurn)) &&
        (snapshot.winner === null ||
            snapshot.participants.some((p) => p.id === snapshot.winner)) &&
        Array.isArray(snapshot.ballPositions) &&
        snapshot.ballPositions.length === 16 &&
        new Set(snapshot.ballPositions.map((b) => b.ball)).size === 16 &&
        snapshot.ballPositions.every(
            (b) =>
                Number.isInteger(b.ball) &&
                b.ball >= 0 &&
                b.ball <= 15 &&
                [b.position, b.velocity, b.rotation, b.angularVelocity].every(
                    (v) =>
                        Array.isArray(v) &&
                        v.length === 3 &&
                        v.every(Number.isFinite),
                ),
        ) &&
        Number.isFinite(snapshot.cuePower) &&
        Number.isFinite(snapshot.cueRotation)
    );
}

export function createPoolGameSlice(set, get) {
    const ownCommand = (command) => {
        const state = get();
        if (state.mode === "multiplayer" && !state.isHost) {
            if (!state.connected || !state.sendPeerCommand) return false;
            return state.sendPeerCommand(command);
        }
        return get().applyGameCommand(command, actorId(state));
    };
    const finish = (winner, reason) => {
        const state = get();
        if (state.winner) return;
        set({
            winner,
            winReason: reason,
            phase: "finished",
            shot: null,
            showWinner: true,
            ballInHand: null,
            nudge: false,
            message: reason,
            scores: {
                ...state.scores,
                [winner]: (state.scores[winner] || 0) + 1,
            },
        });
    };

    return {
        mode: "local",
        participants: [],
        sides: {},
        scores: {},
        matchId: "",
        phase: "waiting",
        currentTurn: null,
        breakPending: true,
        ballInHand: null,
        placementValid: false,
        headRestricted: false,
        calledBall: null,
        calledPocket: null,
        safety: false,
        shotNumber: 0,
        shot: null,
        winner: null,
        winReason: "",
        lastFoul: "",
        message: "Preparing the table…",
        breakDecision: null,
        showWinner: false,
        rematchRequests: [],
        physicsReady: false,
        networkBusy: false,
        networkError: "",
        peerStatus: "idle",
        roomCode: "",
        sendPeerCommand: null,
        retryPeerConnection: null,
        leavePeerSession: null,

        startSession: (mode) => {
            const participants =
                mode === "local"
                    ? [
                          { id: "local-1", name: "Player 1" },
                          { id: "local-2", name: "Player 2" },
                      ]
                    : [];
            set({
                ...freshRack(participants, participants[0]?.id || null),
                mode,
                isHost: false,
                connected: false,
                peerId: "",
                players: [],
                networkError: "",
                peerStatus: mode === "local" ? "idle" : "connecting",
                roomCode: "",
                sendPeerCommand: null,
            });
        },
        seatHost: (id, name, roomCode) =>
            set({
                peerId: id,
                isHost: true,
                roomCode,
                peerStatus: "waiting",
                participants: [{ id, name }],
                players: [id],
                currentTurn: id,
            }),
        seatGuest: (id, name) => {
            const state = get();
            if (!state.isHost || state.participants.length !== 1) return false;
            const participants = [...state.participants, { id, name }];
            set({
                ...freshRack(participants, participants[0].id, state.scores),
                participants,
                players: participants.map((p) => p.id),
                connected: true,
                peerStatus: "connected",
            });
            return true;
        },
        applyPeerSnapshot: (snapshot) => {
            if (get().isHost || !validSnapshot(snapshot)) return false;
            const resultChanged =
                snapshot.winner !== get().winner ||
                snapshot.matchId !== get().matchId;
            set({
                ...Object.fromEntries(
                    SNAPSHOT_KEYS.map((key) => [key, snapshot[key]]),
                ),
                ...(resultChanged
                    ? { showWinner: Boolean(snapshot.winner) }
                    : {}),
                ballPositionsUpdated: snapshot.ballPositions,
                players: snapshot.participants.map((p) => p.id),
                networkBusy: false,
                connected: true,
                peerStatus: "connected",
            });
            return true;
        },
        requestGameAction: ownCommand,
        setBallPositionsUpdated: (updates) => {
            const state = get();
            // Keep the existing local debug positioning control out of online racks.
            if (
                state.mode !== "local" ||
                state.phase === "shooting" ||
                !Array.isArray(updates)
            )
                return;
            const balls = state.ballPositions.map((previous) => {
                const update = updates.find((b) => b.ball === previous.ball);
                return update
                    ? {
                          ...previous,
                          ...stoppedBall(previous.ball, update.position),
                          pocketed: update.position[1] < -10,
                      }
                    : previous;
            });
            set({ ballPositions: balls, ballPositionsUpdated: balls });
        },
        setNudge: (value) =>
            value ? ownCommand({ type: "shoot" }) : set({ nudge: false }),
        setCueRotation: (value) => ownCommand({ type: "aim", rotation: value }),
        setCuePower: (value) => ownCommand({ type: "aim", power: value }),

        applyGameCommand: (command, actor) => {
            const state = get();
            if (
                !isAuthority(state) ||
                !command ||
                typeof command.type !== "string" ||
                !state.participants.some((p) => p.id === actor)
            )
                return false;
            if (command.type === "rematch") {
                if (
                    state.phase !== "finished" ||
                    (state.mode === "multiplayer" && !state.connected)
                )
                    return false;
                const requests = [
                    ...new Set([...state.rematchRequests, actor]),
                ];
                if (state.mode === "local" || requests.length === 2) {
                    const breaker =
                        state.participants.find(
                            (p) => p.id !== state.lastBreaker,
                        )?.id || state.participants[0].id;
                    set({
                        ...freshRack(state.participants, breaker, state.scores),
                        lastBreaker: breaker,
                    });
                } else
                    set({
                        rematchRequests: requests,
                        message:
                            "Waiting for the other player to accept a rematch.",
                    });
                return true;
            }
            if (
                state.currentTurn !== actor ||
                !state.physicsReady ||
                (state.mode === "multiplayer" && !state.connected)
            )
                return false;
            if (command.type === "aim" && state.phase === "aiming") {
                const update = {};
                if (Number.isFinite(command.power))
                    update.cuePower = Math.max(0, Math.min(100, command.power));
                if (Number.isFinite(command.rotation))
                    update.cueRotation = ((command.rotation % 360) + 360) % 360;
                set(update);
                return true;
            }
            if (
                command.type === "call" &&
                state.phase === "aiming" &&
                isOnEight(state, actor)
            ) {
                if (
                    command.ball !== 8 ||
                    !state.ballPositions.some(
                        (b) => b.ball === 8 && !isOut(b),
                    ) ||
                    !(
                        command.pocket === null ||
                        (Number.isInteger(command.pocket) &&
                            command.pocket >= 0 &&
                            command.pocket < POCKETS.length)
                    )
                )
                    return false;
                set({
                    calledBall: 8,
                    calledPocket: command.pocket,
                    safety: false,
                });
                return true;
            }
            if (
                command.type === "safety" &&
                state.phase === "aiming" &&
                !state.breakPending
            ) {
                set({
                    safety: Boolean(command.value),
                    calledBall: null,
                    calledPocket: null,
                });
                return true;
            }
            if (command.type === "place" && state.phase === "placing") {
                if (!validPlacement(state, command.x, command.z)) return false;
                const balls = state.ballPositions.map((b) =>
                    b.ball === 0
                        ? stoppedBall(0, [command.x, 1.26, command.z])
                        : b,
                );
                set({
                    ballPositions: balls,
                    ballPositionsUpdated: balls,
                    placementValid: true,
                });
                return true;
            }
            if (
                command.type === "confirm-placement" &&
                state.phase === "placing"
            ) {
                const cue = state.ballPositions.find((b) => b.ball === 0);
                if (
                    !cue ||
                    !validPlacement(state, cue.position[0], cue.position[2])
                )
                    return false;
                set({
                    phase: "aiming",
                    ballInHand: null,
                    headRestricted:
                        state.ballInHand === "head" && !state.breakPending,
                    message: state.breakPending
                        ? "Break the rack."
                        : isOnEight(state)
                          ? "Choose a pocket for the 8 ball, then shoot."
                          : "Aim and shoot.",
                });
                return true;
            }
            if (
                command.type === "break-choice" &&
                state.phase === "break-choice"
            ) {
                const decision = state.breakDecision;
                if (
                    !["accept", "hand", "rerack", "opponent-rerack"].includes(
                        command.choice,
                    ) ||
                    (decision.kind === "foul" && command.choice === "rerack") ||
                    (command.choice === "hand" && !decision.canTakeHand) ||
                    (command.choice === "opponent-rerack" &&
                        decision.kind !== "illegal")
                )
                    return false;
                if (["rerack", "opponent-rerack"].includes(command.choice)) {
                    const breaker =
                        command.choice === "opponent-rerack"
                            ? decision.shooter
                            : actor;
                    set({
                        ...freshRack(state.participants, breaker, state.scores),
                        lastBreaker: breaker,
                    });
                } else {
                    const hand =
                        command.choice === "hand" || decision.needsHand;
                    const balls = state.ballPositions.map((b) =>
                        b.ball === 0 && hand
                            ? stoppedBall(0, findSpot(state, 0, true))
                            : b,
                    );
                    set({
                        phase: hand ? "placing" : "aiming",
                        breakPending: false,
                        ballInHand: hand ? "head" : null,
                        breakDecision: null,
                        ballPositions: balls,
                        ballPositionsUpdated: balls,
                        message: hand
                            ? "Ball in hand behind the head string."
                            : "The table is open. Pocket a ball to claim solids or stripes.",
                    });
                }
                return true;
            }
            if (
                command.type !== "shoot" ||
                state.phase !== "aiming" ||
                state.cuePower <= 0 ||
                !hasRequiredCall(state)
            )
                return false;
            const side = state.sides[actor];
            const calledBall =
                isOnEight(state, actor) && !state.safety ? 8 : null;
            const calledPocket = calledBall === 8 ? state.calledPocket : null;
            const groups = side
                ? state.sides
                : calledBall === 8
                  ? (() => {
                        const empty = ["solids", "stripes"].find(
                            (group) =>
                                !state.ballPositions.some(
                                    (b) =>
                                        !isOut(b) &&
                                        ballGroup(b.ball) === group,
                                ),
                        );
                        const opponent = state.participants.find(
                            (p) => p.id !== actor,
                        ).id;
                        return {
                            [actor]: empty,
                            [opponent]:
                                empty === "solids" ? "stripes" : "solids",
                        };
                    })()
                  : state.sides;
            set({
                phase: "shooting",
                nudge: true,
                calledBall,
                calledPocket,
                shotNumber: state.shotNumber + 1,
                sides: groups,
                lastFoul: "",
                shot: {
                    shooter: actor,
                    isBreak: state.breakPending,
                    calledBall,
                    calledPocket,
                    safety: state.safety,
                    headRestricted: state.headRestricted,
                    crossedHeadString: false,
                    headViolation: false,
                    side: groups[actor],
                    remaining: remainingBalls(
                        { ...state, sides: groups },
                        actor,
                    ).length,
                    firstContact: null,
                    rails: [],
                    pocketed: [],
                    offTable: [],
                    applied: false,
                    power: state.cuePower,
                    rotation: state.cueRotation,
                },
                lastLaunch: {
                    cuePower: state.cuePower,
                    cueRotation: state.cueRotation,
                    time: new Date().toLocaleTimeString(),
                },
                message: "Shot in progress…",
            });
            return true;
        },

        recordContact: (ball, other) => {
            const { shot, phase } = get();
            if (!isAuthority(get()) || phase !== "shooting" || !shot) return;
            if (
                ball === 0 &&
                Number.isInteger(other.ball) &&
                other.ball > 0 &&
                shot.firstContact === null
            ) {
                set({
                    shot: {
                        ...shot,
                        firstContact: other.ball,
                        headViolation:
                            shot.headRestricted &&
                            !shot.crossedHeadString &&
                            other.behindHead,
                    },
                });
            }
            const latest = get().shot;
            if (
                other.isRail &&
                latest.firstContact !== null &&
                !latest.rails.includes(ball)
            ) {
                set({ shot: { ...latest, rails: [...latest.rails, ball] } });
            }
        },
        recordPocket: (ball, pocket = null, offTable = false) => {
            const state = get();
            if (
                !isAuthority(state) ||
                state.phase !== "shooting" ||
                !state.shot ||
                state.shot.pocketed.some((b) => b.ball === ball) ||
                state.shot.offTable.includes(ball)
            )
                return false;
            const balls = state.ballPositions.map((b) =>
                b.ball === ball
                    ? { ...stoppedBall(ball, [0, -100, 0]), pocketed: true }
                    : b,
            );
            set({
                ballPositions: balls,
                shot: {
                    ...state.shot,
                    pocketed: offTable
                        ? state.shot.pocketed
                        : [...state.shot.pocketed, { ball, pocket }],
                    offTable: offTable
                        ? [...state.shot.offTable, ball]
                        : state.shot.offTable,
                },
            });
            return true;
        },
        finishShot: () => {
            const state = get();
            const shot = state.shot;
            if (
                !isAuthority(state) ||
                state.phase !== "shooting" ||
                !shot?.applied
            )
                return;
            const opponent = state.participants.find(
                (p) => p.id !== shot.shooter,
            )?.id;
            const shooterName =
                state.participants.find((p) => p.id === shot.shooter)?.name ||
                "The shooter";
            if (!opponent) return;
            const scratch =
                shot.pocketed.some((b) => b.ball === 0) ||
                shot.offTable.includes(0);
            const objectPockets = shot.pocketed.filter((b) => b.ball !== 0);
            let foul = scratch
                ? "Scratch: cue ball pocketed or driven off the table."
                : "";
            if (!foul && shot.offTable.length)
                foul = "An object ball left the table.";
            if (!foul && shot.firstContact === null)
                foul = "The cue ball did not hit an object ball.";
            if (!foul && shot.headViolation)
                foul =
                    "The cue ball hit a ball behind the head string before crossing it.";
            if (!foul && !shot.isBreak) {
                const legalFirst = shot.side
                    ? shot.remaining === 0
                        ? shot.firstContact === 8
                        : ballGroup(shot.firstContact) === shot.side
                    : shot.firstContact !== 8;
                if (!legalFirst)
                    foul = "The cue ball hit the wrong ball first.";
                else if (!objectPockets.length && !shot.rails.length)
                    foul = "No ball reached a rail after contact.";
            }
            const illegalBreak =
                shot.isBreak &&
                !objectPockets.length &&
                shot.rails.filter((n) => n !== 0).length < 4;
            if (!foul && illegalBreak)
                foul =
                    "Illegal break: pocket a ball or drive four object balls to rails.";
            const eight = shot.pocketed.find((b) => b.ball === 8);
            if (!shot.isBreak && (eight || shot.offTable.includes(8))) {
                if (shot.offTable.includes(8))
                    finish(
                        opponent,
                        `${shooterName} drove the 8 ball off the table.`,
                    );
                else if (foul)
                    finish(
                        opponent,
                        `${shooterName} pocketed the 8 ball with a foul. ${foul}`,
                    );
                else if (!shot.side || shot.remaining > 0)
                    finish(
                        opponent,
                        `${shooterName} pocketed the 8 ball before clearing their side.`,
                    );
                else if (
                    shot.calledBall !== 8 ||
                    eight.pocket !== shot.calledPocket
                )
                    finish(
                        opponent,
                        `${shooterName} pocketed the 8 ball in an uncalled pocket.`,
                    );
                else
                    finish(
                        shot.shooter,
                        `${shooterName} cleared their side and pocketed the 8 ball legally.`,
                    );
                set({
                    ballPositionsUpdated: get().ballPositions,
                    lastFoul: foul,
                });
                return;
            }
            let balls = state.ballPositions;
            if (shot.isBreak && (eight || shot.offTable.includes(8))) {
                balls = balls.map((b) =>
                    b.ball === 8 ? stoppedBall(8, findSpot(state, 8)) : b,
                );
            }
            if (
                shot.isBreak &&
                (illegalBreak || eight || shot.offTable.includes(8) || foul)
            ) {
                const chooser = foul ? opponent : shot.shooter;
                set({
                    ballPositions: balls,
                    ballPositionsUpdated: balls,
                    currentTurn: chooser,
                    phase: "break-choice",
                    shot: null,
                    nudge: false,
                    lastFoul: foul,
                    breakDecision: {
                        kind: illegalBreak
                            ? "illegal"
                            : eight || shot.offTable.includes(8)
                              ? "eight"
                              : "foul",
                        shooter: shot.shooter,
                        foul,
                        needsHand: scratch,
                        canTakeHand: Boolean(
                            foul &&
                            (!illegalBreak ||
                                scratch ||
                                shot.offTable.length > 0),
                        ),
                    },
                    message: illegalBreak
                        ? "Illegal break. Accept the table or choose who breaks a new rack."
                        : eight || shot.offTable.includes(8)
                          ? "8 ball on the break: it has been spotted. Accept the table or break a new rack."
                          : "Foul on the break. Accept the table or take ball in hand behind the head string.",
                });
                return;
            }
            const firstMade = objectPockets.find((b) => ballGroup(b.ball));
            let sides = state.sides;
            if (
                !foul &&
                !shot.isBreak &&
                !shot.safety &&
                !shot.side &&
                firstMade
            ) {
                const group = ballGroup(firstMade.ball);
                sides = {
                    [shot.shooter]: group,
                    [opponent]: group === "solids" ? "stripes" : "solids",
                };
            }
            const keepTurn =
                !foul &&
                !shot.safety &&
                (shot.isBreak
                    ? objectPockets.length > 0
                    : objectPockets.some(
                          (b) => ballGroup(b.ball) === sides[shot.shooter],
                      ));
            if (foul)
                balls = balls.map((b) =>
                    b.ball === 0
                        ? stoppedBall(0, findSpot(state, 0, shot.isBreak))
                        : b,
                );
            set({
                ballPositions: balls,
                ballPositionsUpdated: balls,
                sides,
                currentTurn: keepTurn ? shot.shooter : opponent,
                breakPending: false,
                phase: foul ? "placing" : "aiming",
                ballInHand: foul ? (shot.isBreak ? "head" : "anywhere") : null,
                placementValid: true,
                shot: null,
                nudge: false,
                calledBall: null,
                calledPocket: null,
                safety: false,
                headRestricted: false,
                lastFoul: foul,
                message: foul
                    ? `${foul} Ball in hand${shot.isBreak ? " behind the head string" : ""}.`
                    : keepTurn
                      ? "Legal pocket. Shoot again."
                      : shot.safety
                        ? "Safety played. Turn passes."
                        : "Turn passes to the other player.",
            });
        },
        playerDisconnected: (id) => {
            const state = get();
            if (state.participants.length === 2 && !state.winner) {
                const winner = state.participants.find((p) => p.id !== id)?.id;
                const departed =
                    state.participants.find((p) => p.id === id)?.name ||
                    "A player";
                if (winner)
                    finish(
                        winner,
                        `${departed} disconnected and forfeited the rack.`,
                    );
            }
            set({
                connected: false,
                networkBusy: false,
                peerStatus: "disconnected",
            });
        },
        lastBreaker: "local-1",
    };
}
