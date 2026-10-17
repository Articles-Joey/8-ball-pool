import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { makeRack } from "@/util/poolGame";
import { BallAppearance } from "./Balls";
import { PoolBall } from "./PoolPhysics";

export default function PlayerProjectile({ preview = false }) {
    const tools = useRef(null);
    const cue = useRef(null);
    const visual = useRef({
        ready: false,
        matchId: null,
        player: null,
        power: 0,
    });
    // Both peers see the active cue; input permissions remain in the controls.
    const aiming = useEightBallStore(
        (s) =>
            s.phase === "aiming" &&
            s.physicsReady &&
            s.participants.length === 2 &&
            (s.mode === "local" || s.connected),
    );
    const power = useEightBallStore((s) => s.cuePower);
    useFrame((_, delta) => {
        if (preview || !tools.current) {
            visual.current.ready = false;
            return;
        }
        const state = useEightBallStore.getState();
        const ball = state.ballPositions.find((b) => b.ball === 0);
        if (ball) tools.current.position.set(...ball.position);
        const targetRotation = (state.cueRotation * Math.PI) / 180;
        const observing =
            state.mode === "multiplayer" && state.currentTurn !== state.peerId;
        if (
            !visual.current.ready ||
            visual.current.matchId !== state.matchId ||
            visual.current.player !== state.currentTurn
        ) {
            visual.current = {
                ready: true,
                matchId: state.matchId,
                player: state.currentTurn,
                power: state.cuePower,
            };
            tools.current.rotation.y = targetRotation;
        } else {
            const alpha = observing ? 1 - Math.exp(-delta * 20) : 1;
            // Take the shortest arc, including when the angle crosses 0/360 degrees.
            const difference = targetRotation - tools.current.rotation.y;
            tools.current.rotation.y +=
                Math.atan2(Math.sin(difference), Math.cos(difference)) * alpha;
            visual.current.power +=
                (state.cuePower - visual.current.power) * alpha;
        }
        if (cue.current) {
            cue.current.position.z = 14.5 + (visual.current.power / 100) * 4;
        }
    });
    if (preview)
        return (
            <group position={makeRack()[0].position}>
                <BallAppearance ball={0} />
            </group>
        );
    return (
        <group>
            <PoolBall ball={0}>
                <BallAppearance ball={0} />
            </PoolBall>
            {aiming && (
                <group ref={tools}>
                    <mesh
                        position={[0, 0, 2 + power / 4]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <cylinderGeometry
                            args={[0.18, 0.18, Math.max(0.01, power / 2), 16]}
                        />
                        <meshStandardMaterial
                            color="#dc4545"
                            transparent
                            opacity={0.55}
                        />
                        <mesh position={[0, -power / 4, 0]}>
                            <coneGeometry args={[1.2, 3, 24]} />
                            <meshStandardMaterial
                                color="#dc4545"
                                transparent
                                opacity={0.55}
                            />
                        </mesh>
                    </mesh>
                    {/* Raise the back of the cue so it clears the cushion and wood rail. */}
                    <group rotation={[Math.PI / 12, Math.PI, 0]}>
                        <mesh
                            ref={cue}
                            position={[0, 0, 14.5 + (power / 100) * 4]}
                            rotation={[-Math.PI / 2, 0, 0]}
                            castShadow
                        >
                            <cylinderGeometry args={[0.18, 0.3, 25, 24]} />
                            <meshStandardMaterial
                                color="#bc935f"
                                roughness={0.4}
                            />
                        </mesh>
                    </group>
                </group>
            )}
        </group>
    );
}
