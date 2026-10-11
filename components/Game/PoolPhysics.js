import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useFrame } from "@react-three/fiber";
import {
    BallCollider,
    RigidBody,
    useAfterPhysicsStep,
    useBeforePhysicsStep,
    useRapier,
} from "@react-three/rapier";
import { Euler, Quaternion } from "three";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import {
    canControl,
    isAuthority,
    isOut,
    makeRack,
    POCKETS,
} from "@/util/poolGame";

// Adjust this value to tune the impulse delivered at 100% shot power.
// Previously 192; 249.6 increases full-power shots by 30%.
const MAX_SHOT_IMPULSE = 300;

const BodiesContext = createContext(null);
const vector = ([x, y, z]) => ({ x, y, z });

function applyFrame(entry, frame, interpolate = false) {
    if (!entry || !frame) return;
    const { body, visual } = entry;
    const out = isOut(frame);
    body.setEnabled(!out);
    body.setTranslation(vector(frame.position), true);
    const quaternion = new Quaternion().setFromEuler(
        new Euler(...frame.rotation),
    );
    body.setRotation(quaternion, true);
    body.setLinvel(vector(frame.velocity), true);
    body.setAngvel(vector(frame.angularVelocity), true);
    if (visual) {
        visual.visible = !out;
        // A guest's paused physics world must still display received transforms immediately.
        if (!interpolate || out) {
            visual.parent.position.set(...frame.position);
            visual.parent.quaternion.copy(quaternion);
        }
    }
}

export function PoolPhysicsProvider({ children }) {
    const [bodies] = useState(() => new Map());
    return (
        <BodiesContext.Provider value={bodies}>
            {children}
        </BodiesContext.Provider>
    );
}

export function PoolBall({ ball, children }) {
    const bodies = useContext(BodiesContext);
    const visual = useRef(null);
    const bodyRef = useRef(null);
    const [initial] = useState(
        () =>
            useEightBallStore
                .getState()
                .ballPositions.find((b) => b.ball === ball) ||
            makeRack().find((b) => b.ball === ball),
    );
    const register = useCallback(
        (body) => {
            bodyRef.current = body;
            if (body) bodies.set(ball, { body, visual: visual.current });
            else bodies.delete(ball);
        },
        [ball, bodies],
    );
    useEffect(() => {
        const entry = bodies.get(ball);
        if (entry) {
            entry.visual = visual.current;
            applyFrame(
                entry,
                useEightBallStore
                    .getState()
                    .ballPositions.find((b) => b.ball === ball) || initial,
            );
        }
    }, [ball, bodies, initial]);

    const removeBall = (pocket, offTable) => {
        if (!useEightBallStore.getState().recordPocket(ball, pocket, offTable))
            return;
        bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, false);
        bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, false);
        bodyRef.current.setEnabled(false);
        visual.current.visible = false;
    };

    return (
        <RigidBody
            ref={register}
            position={initial.position}
            colliders={false}
            userData={{ ball }}
            linearDamping={0.35}
            angularDamping={0.35}
            ccd
            onCollisionEnter={({ other }) => {
                useEightBallStore.getState().recordContact(ball, {
                    ...other.rigidBodyObject?.userData,
                    behindHead: (other.rigidBody?.translation().z || 0) >= 25,
                });
            }}
            onIntersectionEnter={({ other }) => {
                const data = other.rigidBodyObject?.userData;
                if (data?.isPocket) removeBall(data.pocket, false);
                else if (data?.isTableBottom) removeBall(null, true);
            }}
        >
            <BallCollider
                args={[1]}
                mass={4}
                friction={0.2}
                restitution={0.92}
            />
            <group ref={visual}>{children}</group>
        </RigidBody>
    );
}

export function PoolPhysicsController() {
    const bodies = useContext(BodiesContext);
    const { rigidBodyStates } = useRapier();
    const quiet = useRef({ key: "", time: 0, elapsed: 0 });
    const quaternion = useRef(new Quaternion());
    const euler = useRef(new Euler());

    useEffect(
        () =>
            useEightBallStore.subscribe((state, previous) => {
                if (
                    state.ballPositionsUpdated &&
                    state.ballPositionsUpdated !== previous.ballPositionsUpdated
                ) {
                    const interpolate =
                        !isAuthority(state) &&
                        state.phase === "shooting" &&
                        state.matchId === previous.matchId;
                    for (const frame of state.ballPositionsUpdated)
                        applyFrame(bodies.get(frame.ball), frame, interpolate);
                }
            }),
        [bodies],
    );

    useBeforePhysicsStep(() => {
        const state = useEightBallStore.getState();
        if (
            !isAuthority(state) ||
            state.phase !== "shooting" ||
            !state.shot ||
            state.shot.applied
        )
            return;
        const cue = bodies.get(0)?.body;
        if (!cue || bodies.size !== 16) return;
        const radians = (state.shot.rotation * Math.PI) / 180;
        // Preserve the existing power curve, normalized to the adjustable maximum.
        const boost = 1 + 0.2 * Math.max(0, (state.shot.power - 50) / 50);
        const impulse =
            MAX_SHOT_IMPULSE * (state.shot.power / 100) * (boost / 1.2);
        cue.applyImpulse(
            {
                x: Math.sin(radians) * impulse,
                y: 0,
                z: Math.cos(radians) * impulse,
            },
            true,
        );
        useEightBallStore.setState({
            shot: { ...state.shot, applied: true },
            nudge: false,
        });
    });

    useAfterPhysicsStep((world) => {
        const state = useEightBallStore.getState();
        if (
            !isAuthority(state) ||
            state.phase !== "shooting" ||
            !state.shot?.applied
        )
            return;
        const cue = bodies.get(0)?.body;
        if (
            cue?.isEnabled() &&
            cue.translation().z < 25 &&
            !state.shot.crossedHeadString
        ) {
            useEightBallStore.setState({
                shot: { ...state.shot, crossedHeadString: true },
            });
        }
        // Sample contacts every substep so quick impacts cannot disappear between rendered frames.
        const contacts = (number) => {
            const body = bodies.get(number)?.body;
            if (!body?.isEnabled() || body.numColliders() === 0) return;
            const collider = body.collider(0);
            world.contactPairsWith(collider, (other) => {
                const parent = other.parent();
                const data =
                    parent &&
                    rigidBodyStates.get(parent.handle)?.object.userData;
                if (
                    !data ||
                    (!data.isRail &&
                        !(number === 0 && Number.isInteger(data.ball)))
                )
                    return;
                world.contactPair(collider, other, (manifold) => {
                    if (manifold.numSolverContacts() > 0) {
                        useEightBallStore.getState().recordContact(number, {
                            ...data,
                            behindHead: parent.translation().z >= 25,
                        });
                    }
                });
            });
        };
        contacts(0);
        for (const number of bodies.keys()) if (number !== 0) contacts(number);
    });

    // Rapier runs at priority -50, including collision events; resolve after those events.
    useFrame((_, delta) => {
        const state = useEightBallStore.getState();
        if (!isAuthority(state)) {
            const alpha = 1 - Math.exp(-delta * 30);
            for (const { body, visual } of bodies.values()) {
                if (!visual?.visible) continue;
                const p = body.translation();
                visual.parent.position.lerp({ x: p.x, y: p.y, z: p.z }, alpha);
                visual.parent.quaternion.slerp(
                    quaternion.current.copy(body.rotation()),
                    alpha,
                );
            }
            return;
        }
        if (bodies.size !== 16 || state.phase === "finished") return;
        let moving = false;
        const frames = state.ballPositions.map((previous) => {
            const entry = bodies.get(previous.ball);
            if (!entry || isOut(previous)) return previous;
            const body = entry.body;
            const p = body.translation();
            const velocity = body.linvel();
            const angular = body.angvel();
            const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
            const spin = Math.hypot(angular.x, angular.y, angular.z);
            const belowCloth = p.y < 0.95 && speed < 0.12 && spin < 0.3;
            if (
                p.y < -8 ||
                Math.abs(p.x) > 32 ||
                Math.abs(p.z) > 57 ||
                belowCloth
            ) {
                // A ball resting below the cloth at a pocket lip has left the playing surface.
                const pocket = POCKETS.findIndex(
                    ({ position: [x, , z], radius }) =>
                        Math.hypot(p.x - x, p.z - z) < radius,
                );
                if (
                    state.recordPocket(
                        previous.ball,
                        pocket < 0 ? null : pocket,
                        pocket < 0,
                    )
                ) {
                    body.setEnabled(false);
                    entry.visual.visible = false;
                    return useEightBallStore
                        .getState()
                        .ballPositions.find((b) => b.ball === previous.ball);
                }
            }
            if (speed > 0.12 || spin > 0.3) moving = true;
            euler.current.setFromQuaternion(
                quaternion.current.copy(body.rotation()),
            );
            return {
                ball: previous.ball,
                position: [p.x, p.y, p.z],
                velocity: [velocity.x, velocity.y, velocity.z],
                angularVelocity: [angular.x, angular.y, angular.z],
                rotation: [euler.current.x, euler.current.y, euler.current.z],
                pocketed: false,
            };
        });
        useEightBallStore.setState({
            ballPositions: frames,
            physicsReady: true,
        });
        if (state.phase !== "shooting" || !state.shot?.applied) return;
        const key = `${state.matchId}:${state.shotNumber}`;
        if (quiet.current.key !== key)
            quiet.current = { key, time: 0, elapsed: 0 };
        quiet.current.elapsed += Math.min(delta, 0.1);
        quiet.current.time = moving
            ? 0
            : quiet.current.time + Math.min(delta, 0.1);
        if (quiet.current.elapsed < 0.7 || quiet.current.time < 0.5) return;
        for (const { body } of bodies.values()) {
            body.setLinvel({ x: 0, y: 0, z: 0 }, false);
            body.setAngvel({ x: 0, y: 0, z: 0 }, false);
            body.sleep();
        }
        useEightBallStore.setState({
            ballPositions: frames.map((b) => ({
                ...b,
                velocity: [0, 0, 0],
                angularVelocity: [0, 0, 0],
            })),
        });
        useEightBallStore.getState().finishShot();
    });

    return null;
}

export function CueBallPlacement() {
    const placing = useEightBallStore(
        (s) => s.phase === "placing" && canControl(s),
    );
    const behindHead = useEightBallStore((s) => s.ballInHand === "head");
    if (!placing) return null;
    return (
        <group>
            {behindHead && (
                <mesh
                    position={[0, 0.27, 25]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <planeGeometry args={[48, 0.16]} />
                    <meshBasicMaterial
                        color="#e5d9ad"
                        transparent
                        opacity={0.6}
                        depthWrite={false}
                    />
                </mesh>
            )}
            <mesh
                position={[0, 1.3, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(event) => {
                    if (event.button !== 0 || event.delta > 5) return;
                    event.stopPropagation();
                    useEightBallStore
                        .getState()
                        .requestGameAction({
                            type: "place",
                            x: event.point.x,
                            z: event.point.z,
                        });
                }}
            >
                <planeGeometry args={[50, 100]} />
                <meshBasicMaterial
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}
