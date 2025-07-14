import { useEffect, useRef } from "react";
import { useSphere } from "@react-three/cannon";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { degToRad } from "three/src/math/MathUtils";
import { useHotkeys } from "react-hotkeys-hook";
import { MathUtils } from "three";

export default function PlayerProjectile() {

    const toolsRef = useRef()

    const [ref, api] = useSphere(() => ({
        mass: 10,
        // type: 'Dynamic',
        args: [1, 1, 1],
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

    const {
        cueRotation,
        cuePower,
        nudge,
        setNudge
    } = useEightBallStore(state => ({
        cueRotation: state.cueRotation,
        cuePower: state.cuePower,
        nudge: state.nudge,
        setNudge: state.setNudge
    }));

    // const nudgeBall = () => {
    //     // Apply impulse or force to the ball
    //     api.applyImpulse([0, 0, -500], [0, 0, 0]); // Pushes the ball along the x-axis
    // };

    const nudgeBall = () => {
        // Convert hitRotation to radians
        const radians = MathUtils.degToRad(cueRotation);

        // Calculate impulse direction based on rotation
        const impulseX = Math.sin(radians) * cuePower * 4; // Z-axis points forward in Three.js, so sin affects X
        const impulseZ = Math.cos(radians) * cuePower * 4; // Cos affects Z

        // Apply impulse to the ball in the calculated direction
        api.applyImpulse([impulseX, 0, impulseZ], [0, 0, 0]); // Apply impulse at the center of the object
    };

    useHotkeys(['Enter'], () => {
        console.log("Launch?")
        nudgeBall()
    });

    useEffect(() => {

        if (nudge) {
            nudgeBall()
            setNudge(false)
        }

    }, [nudge]);

    useEffect(() => {

        if (toolsRef.current) {
            // Get the current position of the sphere from the physics API
            api.position.subscribe((position) => {

                if (position[1] < -10) {

                    resetBall()

                }

                toolsRef.current.position.set(...position);

            });
        }

    }, [api.position]);

    return (
        <group>

            {/* Ball */}
            <mesh ref={ref} castShadow>

                <sphereGeometry args={[1, 10, 10]} />
                <meshStandardMaterial color="white" />

            </mesh>

            {/* Aiming tools */}
            <group ref={toolsRef} rotation={[0, degToRad(cueRotation), 0]}>

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

                {/* Cue Stick */}
                <group rotation={[0, degToRad(180), 0]}>
                    <mesh castShadow position={[0, 0, 12]} rotation={[-Math.PI / 2, 0, 0]}>
                        <cylinderGeometry
                            args={[0.25, 0.25, 20]}
                        />
                        <meshStandardMaterial color="saddlebrown" />
                    </mesh>
                </group>

            </group>

        </group>
    )

}