import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function FlickerFireLight() {
    const lightRef = useRef();
    const [intensity, setIntensity] = useState(50000);
    const minIntensity = 20000;
    const maxIntensity = 50000;
    const speed = 0.01; // Flicker speed

    useFrame(() => {
        // Flicker using sine wave + random noise
        const time = performance.now() * 0.002 * speed;
        const flicker = Math.sin(time) * 0.5 + 0.5; // 0 to 1
        const random = Math.random() * 0.2 + 0.9; // Slight randomness
        const newIntensity = minIntensity + (maxIntensity - minIntensity) * flicker * random;
        setIntensity(newIntensity);
        if (lightRef.current) {
            lightRef.current.intensity = newIntensity;
        }
    });

    return (
        <group>
            <spotLight
                ref={lightRef}
                intensity={intensity}
                angle={1}
                penumbra={1}
                color={'red'}
            />

            <spotLight
                // ref={lightRef}
                intensity={5000}
                angle={2}
                penumbra={1}
                color={'orange'}
            />
        </group>
    );
}