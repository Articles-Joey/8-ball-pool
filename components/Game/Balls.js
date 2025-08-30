import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

import * as THREE from 'three'

function getBallColor(ball) {

    const colors = {
        1: "yellow",
        2: "blue",
        3: "red",
        4: "purple",
        5: "orange",
        6: "green",
        7: "maroon",
        8: "black",
        9: "yellow", // Stripe starts here, logic for stripes can be added
        10: "blue",
        11: "red",
        12: "purple",
        13: "orange",
        14: "green",
        15: "maroon",
    };

    return colors[ball] || "white"; // Default to white if the ball number is invalid
}

// Ball initial positions and numbers
const ballConfigs = [
    { position: [0, 10, -20], ball: 1 },
    { position: [1.15, 10, -21.75], ball: 9 },
    { position: [-1.15, 10, -21.75], ball: 2 },
    { position: [2.25, 10, -23.5], ball: 10 },
    { position: [0, 10, -23.5], ball: 8 },
    { position: [-2.25, 10, -23.5], ball: 3 },
    { position: [3.15, 10, -25.35], ball: 11 },
    { position: [1.15, 10, -25.35], ball: 7 },
    { position: [-1.15, 10, -25.35], ball: 14 },
    { position: [-3.15, 10, -25.35], ball: 4 },
    { position: [4.5, 10, -27.25], ball: 5 },
    { position: [2.25, 10, -27.25], ball: 13 },
    { position: [0, 10, -27.25], ball: 15 },
    { position: [-2.25, 10, -27.25], ball: 6 },
    { position: [-4.5, 10, -27.25], ball: 12 },
];

let ballsState = ballConfigs.map(cfg => ({
    ball: cfg.ball,
    position: cfg.position
}))

export default function Balls() {

    const ballsRef = useRef([]);

    const [finalBallPositions, setFinalBallPositions] = useState([]);

    const ballPositionsUpdated = useEightBallStore(state => state.ballPositionsUpdated);
    const setBallPositionsUpdated = useEightBallStore(state => state.setBallPositionsUpdated);

    const spacing = 1.15;

    // Store ball positions in a global store
    const ballPositions = useEightBallStore(state => state.ballPositions);
    const setBallPositions = useEightBallStore(state => state.setBallPositions);

    const isHost = useEightBallStore(state => state.isHost);

    // This effect runs once to initialize positions in the store
    useEffect(() => {

        let ballsState = ballConfigs.map(cfg => ({
            ball: cfg.ball,
            position: cfg.position
        }))

        console.log("Setting up balls", ballsState)

        ballsRef.current = ballsState

        setBallPositions(ballsState)


    }, [setBallPositions]);

    // useEffect(() => {
    //     console.log("ballPositions", ballPositions)
    // }, [ballPositions]);

    useEffect(() => {
        if (ballPositionsUpdated && ballsRef?.current) {
            console.log("Ball positions updated detected, overriding state", ballPositionsUpdated);
            ballsRef.current = ballPositionsUpdated;
            setBallPositionsUpdated(false);
            // ballConfigs = ballPositions
        }
    }, [ballPositionsUpdated, ballsRef]);

    return (
        <group>
            {!ballPositionsUpdated && ballsRef?.current?.map(cfg => (
                <Ball
                    key={cfg.ball}
                    position={cfg.position}
                    velocity={cfg.velocity}
                    ball={cfg.ball}
                // setBallPositions={setBallPositions}
                />
            ))}
        </group>
    );
}

function Ball({
    position,
    velocity,
    ball,
    // setBallPositions 
}) {

    const ballPositions = useEightBallStore(state => state.ballPositions);
    const setBallPosition = useEightBallStore(state => state.setBallPosition);

    const [isVisible, setIsVisible] = useState(true); // Track visibility

    const [ref, api] = useSphere(() => ({
        mass: 4,
        args: [1, 1, 1],
        position: position,
        material: { friction: 20.8, restitution: 1.1 },
        linearDamping: 0.2, // Adds a slight resistance to rolling
        angularDamping: 0.2, // Adds a slight resistance to spinning
        onCollide: (e) => {
            if (e?.body?.userData?.isTableBottom) {
                api.mass.set(0);
                api.velocity.set(0, 0, 0);
                api.angularVelocity.set(0, 0, 0);
                api.position.set(0, -100, 0);
                setIsVisible(false);
            }
        }
    }));

    const pos = useRef(new THREE.Vector3(0, 0, 0));
    const vel = useRef(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
        const unsubPos = api.position.subscribe((v) => {
            pos.current = new THREE.Vector3(v[0], v[1], v[2]);
        });
        const unsubVel = api.velocity.subscribe((v) => {
            // console.log("velocity.current", velocity.current)
            vel.current = new THREE.Vector3(v[0], v[1], v[2]);
        });
        return () => {
            unsubPos();
            unsubVel();
        };
    }, [api.position, api.velocity]);

    // Update ball position and velocity in store as it moves
    useFrame(() => {
        setBallPosition(ball, pos.current, vel.current);
    });

    const color = getBallColor(ball);

    useEffect(() => {
        console.log("Passed velocity", velocity)
        if(!velocity) return
        api.velocity.set(velocity[0], velocity[1], velocity[2]);
    }, [])

    if (!isVisible) return null;

    return (
        <group>
            <mesh castShadow ref={ref}>
                <sphereGeometry args={[1, 10, 10]} />
                <meshStandardMaterial color={color} />
                {ball > 8 && <group>
                    <mesh
                        castShadow
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, 0, -0.2]}
                    >
                        <cylinderGeometry
                            args={[1.00, 1.00, 0.2]}
                        />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh
                        castShadow
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, 0, 0.2]}
                    >
                        <cylinderGeometry
                            args={[1.00, 1.00, 0.2]}
                        />
                        <meshStandardMaterial color="white" />
                    </mesh>
                </group>}
            </mesh>
        </group>
    );
}
