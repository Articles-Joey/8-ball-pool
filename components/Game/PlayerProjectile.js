import { useEffect, useMemo, useRef, useState } from "react";
import { useSphere } from "@react-three/cannon";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { degToRad } from "three/src/math/MathUtils";
import { MathUtils } from "three";
import { useFrame } from "@react-three/fiber";
import { Image } from "@react-three/drei";
import { useStore } from "@/hooks/useStore";
import { useSearchParams } from "next/navigation";

export default function PlayerProjectile() {

    let searchParams = useSearchParams()
    let searchParamsObject = Object.fromEntries(searchParams.entries());
    let { game_id } = searchParamsObject;

    const peerId = useEightBallStore(state => state.peerId);
    const currentTurn = useEightBallStore(state => state.currentTurn);

    const showAimingTools = useMemo(() => {

        if (!game_id) {
            return true;
        } else {
            return peerId === currentTurn;
        }

    }, [game_id, peerId, currentTurn])

    const toolsRef = useRef()

    const [isStopped, setIsStopped] = useState(false);
    const [cueAnim, setCueAnim] = useState(false);

    const [ref, api] = useSphere(() => ({
        // Mass on balls
        // mass: 4,
        mass: 10,
        material: { friction: 20.8, restitution: 1.1 },
        linearDamping: 0.2, // Adds a slight resistance to rolling
        angularDamping: 0.2, // Adds a slight resistance to spinning
        // type: 'Dynamic',
        args: [1],
        position: [0, 5, 25],
        onCollide: (e) => {
            if (e?.body?.userData?.isTableBottom) {
                console.log("Ball hit table bottom")
                resetBall()
            }
        }
    }))

    function resetBall() {
        api.position.set(0, 5, 25)
        api.velocity.set(0, 0, 0)
        api.angularVelocity.set(0, 0, 0)
    }

    const cueRotation = useEightBallStore(state => state.cueRotation);
    const cuePower = useEightBallStore(state => state.cuePower);
    const nudge = useEightBallStore(state => state.nudge);
    const setNudge = useEightBallStore(state => state.setNudge);

    const darkMode = useStore(state => state.darkMode);

    // useEffect(() => {
    //     resetBall();
    //     api.wakeUp();
    // }, []);

    // const nudgeBall = () => {
    //     // Apply impulse or force to the ball
    //     api.applyImpulse([0, 0, -500], [0, 0, 0]); // Pushes the ball along the x-axis
    // };

    useEffect(() => {
        if (nudge) {
            setCueAnim(true);
            cueAnimStart.current = performance.now();
            nudgeBall();
            setNudge(false);
        }
    }, [nudge]);

    const nudgeBall = () => {
        // Convert hitRotation to radians
        const radians = MathUtils.degToRad(cueRotation);

        // Calculate impulse direction based on rotation
        const impulseX = Math.sin(radians) * cuePower * 4; // Z-axis points forward in Three.js, so sin affects X
        const impulseZ = Math.cos(radians) * cuePower * 4; // Cos affects Z

        // Apply impulse to the ball in the calculated direction
        api.applyImpulse([impulseX, 0, impulseZ], [0, 0, 0]); // Apply impulse at the center of the object
    };

    const cueStickRef = useRef();
    const cueAnimStart = useRef(null);

    useFrame(() => {
        if (cueAnim && cueStickRef.current) {
            const now = performance.now();
            const elapsed = now - cueAnimStart.current;
            // Animate for 200ms total
            if (elapsed < 200) {
                // Animate stick: move back for first 100ms, forward for next 100ms
                let z = 12;
                if (elapsed < 100) {
                    z = 12 - (elapsed / 100) * 4; // move back up to 4 units
                } else {
                    z = 8 + ((elapsed - 100) / 100) * 4; // move forward
                }
                cueStickRef.current.position.z = z;
            } else {
                cueStickRef.current.position.z = 12;
                setCueAnim(false);
            }
        }
    });

    useEffect(() => {

        // Get the current position of the sphere from the physics API
        const unsubscribe = api.position.subscribe((position) => {

            if (position[1] < -10) {

                resetBall()

            }

            if (toolsRef.current) {
                toolsRef.current.position.set(...position);
            }

        });

        return unsubscribe;

    }, [api.position]);

    useEffect(() => {
        const unsubscribe = api?.velocity.subscribe((position) => {

            // console.log(position)
            setIsStopped(
                (position[0] < 0.1 && position[0] > -0.1)
                &&
                (position[1] < 0.1 && position[1] > -0.1)
                &&
                (position[2] < 0.1 && position[2] > -0.1)
            )
            // toolsRef?.current?.velocity?.set(...position);

            // const [vx, vy, vz] = position;
            // const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
            // if (speed < 0.5 && speed > 0.1) { // threshold for sleep

            //     api.sleep();

            // }
        });
        return unsubscribe;
    }, [api.velocity]);

    return (
        <group>

            {/* Ball */}
            <mesh ref={ref} castShadow>
                <sphereGeometry args={[1, 10, 10]} />
                <meshStandardMaterial
                    color={"white"}
                    emissive={"white"} // glow color
                    emissiveIntensity={1} // adjust for subtle glow
                />
                {/* <pointLight
                    position={[0, 0, 0]}
                    intensity={10}
                    distance={10}
                    color="white"
                    castShadow
                /> */}
            </mesh>

            {/* Aiming tools */}
            {(showAimingTools || true) && <group ref={toolsRef} rotation={[0, degToRad(cueRotation), 0]}>

                {darkMode &&
                    <pointLight
                        position={[0, 0, 0]}
                        intensity={100}
                        distance={200}
                        color="white"
                        castShadow
                    />
                }

                {/* isStopped - cueAnim */}
                {isStopped && (

                    <>

                        {/* Direction Arrow */}
                        <mesh castShadow position={[0, 0, 2 + (cuePower / 4)]} rotation={[-Math.PI / 2, 0, 0]}>
                            <cylinderGeometry
                                args={[0.5, 0.5, (cuePower / 2)]}
                            />
                            <meshStandardMaterial
                                color="red"
                                transparent={true}
                                opacity={0.5}
                            />

                            <mesh
                                castShadow
                                position={[0, -(cuePower / 4), 0]}
                                rotation={[0, 0, 0]}
                            >
                                <cylinderGeometry
                                    args={[3, 0, 5]}
                                />
                                <meshStandardMaterial
                                    color="red"
                                    transparent={true}
                                    opacity={0.5}
                                />
                            </mesh>

                        </mesh>

                        <group>

                            <Image
                                url="/img/arrow.png"
                                position={[-3, 0, 0]}
                                scale={[3, 3, 3]}
                                rotation={[degToRad(-90), degToRad(0), degToRad(-50)]}
                                transparent={true}
                            />

                            <Image
                                url="/img/arrow.png"
                                position={[3, 0, 0]}
                                scale={[3, 3, 3]}
                                rotation={[degToRad(-90), degToRad(0), degToRad(90 + 50)]}
                                transparent={true}
                            />

                        </group>

                        {/* Cue Stick */}
                        <group rotation={[0, degToRad(180), 0]}>
                            <mesh ref={cueStickRef} castShadow position={[0, 0, 12]} rotation={[-Math.PI / 2, 0, 0]}>
                                <cylinderGeometry
                                    args={[0.25, 0.25, 20]}
                                />
                                <meshStandardMaterial color="saddlebrown" />
                            </mesh>
                        </group>

                    </>
                )}

            </group>}

        </group>
    )

}