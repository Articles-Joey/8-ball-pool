import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function FlickerFireLight() {
    const lightRef = useRef();
    useFrame(({ clock }) => {
        if (lightRef.current) {
            const time = clock.elapsedTime;
            lightRef.current.intensity =
                6000 + Math.sin(time * 7) * 650 + Math.sin(time * 13.3) * 350;
        }
    });

    return (
        <pointLight
            ref={lightRef}
            intensity={6000}
            distance={180}
            decay={2}
            color="#ff9a45"
        />
    );
}
