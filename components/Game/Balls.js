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

function getBallDetails(ball) {

    let defaultEmissiveValue = 10;

    const ballProperties = [
        {
            ball: 1,
            name: "yellow",
            emissiveLightIntensity: 20,
            emissiveLightColor: "yellow"
        },
        {
            ball: 2,
            name: "blue",
            emissiveLightIntensity: 500,
            emissiveLightColor: "blue"
        },
        {
            ball: 3,
            name: "red",
            emissiveLightIntensity: 200,
            emissiveLightColor: "red"
        },
        {
            ball: 4,
            name: "purple",
            emissiveLightIntensity: 1000,
            emissiveLightColor: "purple"
        },
        {
            ball: 5,
            name: "orange",
            emissiveLightIntensity: defaultEmissiveValue,
            emissiveLightColor: "orange"
        },
        {
            ball: 6,
            name: "green",
            emissiveLightIntensity: 30,
            emissiveLightColor: "#32CD32"
        },
        {
            ball: 7,
            name: "maroon",
            emissiveLightIntensity: 500,
            emissiveLightColor: "maroon"
        },
        {
            ball: 8,
            name: "black",
            emissiveLightIntensity: 100,
            emissiveLightColor: "#333333"
        },
        {
            ball: 9,
            name: "yellow",
            emissiveLightIntensity: defaultEmissiveValue,
            emissiveLightColor: "yellow"
        },
        {
            ball: 10,
            name: "blue",
            emissiveLightIntensity: 500,
            emissiveLightColor: "blue"
        },
        {
            ball: 11,
            name: "red",
            emissiveLightIntensity: 200,
            emissiveLightColor: "red"
        },
        {
            ball: 12,
            name: "purple",
            emissiveLightIntensity: 1000,
            emissiveLightColor: "purple"
        },
        {
            ball: 13,
            name: "orange",
            emissiveLightIntensity: defaultEmissiveValue,
            emissiveLightColor: "orange"
        },
        {
            ball: 14,
            name: "green",
            emissiveLightIntensity: 30,
            emissiveLightColor: "#32CD32"
        },
        {
            ball: 15,
            name: "maroon",
            emissiveLightIntensity: 500,
            emissiveLightColor: "maroon"
        }
    ];

    const ballObj = ballProperties.find(b => b.ball === ball);
    return ballObj || { name: "white", emissiveLightIntensity: defaultEmissiveValue, emissiveLightColor: "white" };

    return colors[ball] || "white"; // Default to white if the ball number is invalid
}

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
                    angularVelocity={cfg.angularVelocity}
                    rotation={cfg.rotation}
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
    angularVelocity,
    rotation,
    ball,
    // setBallPositions 
}) {

    const theme = useEightBallStore(state => state.theme);
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
    const rot = useRef(new THREE.Vector3(0, 0, 0));
    const vel = useRef(new THREE.Vector3(0, 0, 0));
    const angVel = useRef(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
        const unsubPos = api.position.subscribe((v) => {
            pos.current = new THREE.Vector3(v[0], v[1], v[2]);

            if (v?.[1] < -10) {
                api.sleep();
            }

        });
        const unsubRot = api.rotation.subscribe((v) => {
            // console.log("velocity.current", velocity.current)
            rot.current = new THREE.Vector3(v?.[0], v?.[1], v?.[2]);
        });
        const unsubVel = api.velocity.subscribe((v) => {
            // console.log("velocity.current", velocity.current)
            vel.current = new THREE.Vector3(v?.[0], v?.[1], v?.[2]);
        });
        const unsubAngVel = api.angularVelocity.subscribe((v) => {
            // console.log("velocity.current", velocity.current)
            angVel.current = new THREE.Vector3(v?.[0], v?.[1], v?.[2]);
        });
        return () => {
            unsubPos();
            unsubVel();
            // unsubAngVel();
            // unsubRot();
        };
    }, [api.position, api.velocity, api.rotation, api.angularVelocity]);

    // Update ball position and velocity in store as it moves
    useFrame(() => {
        setBallPosition(ball, pos.current, vel.current, rot.current, angVel.current);
    });

    const color = getBallColor(ball);
    // const emissiveLightColor = getBallDetails(ball);

    useEffect(() => {
        // console.log("Passed velocity", velocity)
        if (!velocity) return
        api.velocity.set(velocity?.[0], velocity?.[1], velocity?.[2]);
        api.rotation.set(rotation?.[0], rotation?.[1], rotation?.[2]);
        api.angularVelocity.set(angularVelocity?.[0], angularVelocity?.[1], angularVelocity?.[2]);
    }, []);

    if (!isVisible) return null;

    return (
        <group>
            <mesh castShadow ref={ref}>
                <sphereGeometry args={[1, 10, 10]} />

                {/* <meshStandardMaterial color={color} /> */}
                <meshStandardMaterial
                    color={color}
                    emissive={"white"} // glow color
                    emissiveIntensity={0.02} // adjust for subtle glow
                />

                {theme == "Dark" && (
                    <pointLight
                        position={[0, 0, 0]}
                        intensity={getBallDetails(ball).emissiveLightIntensity}
                        distance={10}
                        color={getBallDetails(ball).emissiveLightColor}
                        castShadow
                    />
                )}

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
