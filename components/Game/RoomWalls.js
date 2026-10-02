import { useMemo } from "react";
import { useTexture } from "@react-three/drei";

import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils";

export default function HallwayWalls() {
    return (
        <group position={[0, 0, 0]}>
            <StoneBrickWall
                // rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, -150]}
                args={[300, 150]}
            />

            <StoneBrickWall
                rotation={[0, 0, 0]}
                invertFace={true}
                position={[0, 0, 150]}
                args={[300, 150]}
            />

            <StoneBrickWall
                rotation={[0, -Math.PI / 2, 0]}
                position={[150, 0, 0]}
                args={[300, 150]}
            />

            <StoneBrickWall
                rotation={[0, -Math.PI / -2, 0]}
                position={[-150, 0, 0]}
                args={[300, 150]}
            />
        </group>
    );
}

function StoneBrickWall(props) {
    const base_link = `textures/StoneBricks/`;

    const textures = useTexture({
        map: `${base_link}COL_1K.jpg`,
        // displacementMap: `${base_link}StoneBricksSplitface001_DISP_1K.jpg`,
        normalMap: `${base_link}NRM_1K.jpg`,
        // roughnessMap: `${base_link}StoneBricksSplitface001_BUMP_1K.jpg`,
        // aoMap: `${base_link}StoneBricksSplitface001_AO_1K.jpg`,
    });

    const texture = useMemo(() => {
        const cloned = { ...textures };
        if (cloned.map) cloned.map = cloned.map.clone();
        if (cloned.normalMap) cloned.normalMap = cloned.normalMap.clone();
        return cloned;
    }, [textures]);

    Object.values(texture).forEach((t) => {
        if (t instanceof THREE.Texture) {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(5, 3.5);
        }
    });

    // If invertFace is true, flip the plane by rotating 180 degrees around Y
    const planeRotation = props.invertFace ? [0, Math.PI, 0] : [0, 0, 0];

    return (
        <group {...props}>
            <mesh
                receiveShadow
                rotation={planeRotation}
            >
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>

            <mesh
                position={[0, -55, props.invertFace ? -0.5 : 0.5]}
                rotation={planeRotation}
            >
                <planeGeometry args={[props.args[0], 20]} />
                <meshStandardMaterial color={"saddlebrown"} />
            </mesh>

            <mesh
                position={[0, 67.5, props.invertFace ? -0.5 : 0.5]}
                rotation={planeRotation}
            >
                <planeGeometry args={[props.args[0], 5]} />
                <meshStandardMaterial color={"saddlebrown"} />
            </mesh>

            <mesh position={[0, -70, 0]}>
                <boxGeometry args={[props.args[0], 10]} />
                <meshStandardMaterial color={"black"} />
            </mesh>

            <mesh
                position={[0, 72.5, 0]}
                rotation={[0, degToRad(0), 0]}
            >
                <boxGeometry args={[props.args[0], 5]} />
                <meshStandardMaterial color={"black"} />
            </mesh>
        </group>
    );
}
