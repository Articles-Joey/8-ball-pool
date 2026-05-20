import { useMemo } from "react";
import { useTexture } from "@react-three/drei";

import * as THREE from 'three'
import { degToRad } from "three/src/math/MathUtils";
// import WoodFloor from "./WoodFloor";
// import { useTexture } from "@react-three/drei";
// import * as THREE from 'three'

export default function RoomWalls() {

    return (
        <group position={[-200, 0, 0]}>

            <StoneBrickWall
                rotation={[0, -Math.PI / 2, 0]}
                position={[50, 0, 0]}
                args={[600, 150]}
            />

            <StoneBrickWall
                rotation={[0, -Math.PI / -2, 0]}
                position={[-50, 0, 0]}
                args={[600, 150]}
            />

            <WoodFloor
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -30, 0]}
                args={[100, 600]}
            />

        </group>
    )
}

function StoneBrickWall(props) {

    const base_link = `textures/StoneBricks/`

    const textures = useTexture({
        map: `${base_link}COL_1K.jpg`,
        // displacementMap: `${base_link}StoneBricksSplitface001_DISP_1K.jpg`,
        normalMap: `${base_link}NRM_1K.jpg`,
        // roughnessMap: `${base_link}StoneBricksSplitface001_BUMP_1K.jpg`,
        // aoMap: `${base_link}StoneBricksSplitface001_AO_1K.jpg`,
    })

    const texture = useMemo(() => {
        const cloned = { ...textures };
        if (cloned.map) cloned.map = cloned.map.clone();
        if (cloned.normalMap) cloned.normalMap = cloned.normalMap.clone();
        return cloned;
    }, [textures]);

    // Auto-set repeat and wrapping based on wall size
    const width = props.args?.[0] || 1;
    const height = props.args?.[1] || 1;

    Object.values(texture).forEach((t) => {
        if (t instanceof THREE.Texture) {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(width / 100, height / 50);
        }
    });

    // If invertFace is true, flip the plane by rotating 180 degrees around Y
    const planeRotation = props.invertFace ? [0, Math.PI, 0] : [0, 0, 0];

    return (
        <group {...props}>
            <mesh receiveShadow rotation={planeRotation}>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>

            <mesh position={[0, -55, props.invertFace ? -0.5 : 0.5]} rotation={planeRotation}>
                <planeGeometry args={[props.args[0], 20]} />
                <meshStandardMaterial
                    color={"saddlebrown"}
                />
            </mesh>

            <mesh position={[0, 67.5, props.invertFace ? -0.5 : 0.5]} rotation={planeRotation}>
                <planeGeometry args={[props.args[0], 5]} />
                <meshStandardMaterial
                    color={"saddlebrown"}
                />
            </mesh>

            <mesh position={[0, -70, 0]}>
                <boxGeometry args={[props.args[0], 10]} />
                <meshStandardMaterial
                    color={"black"}
                />
            </mesh>

            <mesh position={[0, 72.5, 0]} rotation={[0, degToRad(0), 0]}>
                <boxGeometry args={[props.args[0], 5]} />
                <meshStandardMaterial
                    color={"black"}
                />
            </mesh>
        </group>
    )

};

function WoodFloor(props) {

    const base_link = `${process.env.NEXT_PUBLIC_CDN}games/US Tycoon/Textures/WoodFloor041_1K-JPG/`

    const textures = useTexture({
        map: `${base_link}WoodFloor041_1K-JPG_Color.jpg`,
        // displacementMap: `${base_link}GroundSand005_DISP_1K.jpg`,
        // normalMap: `${base_link}GroundSand005_NRM_1K.jpg`,
        // roughnessMap: `${base_link}GroundSand005_BUMP_1K.jpg`,
        // aoMap: `${base_link}GroundSand005_AO_1K.jpg`,
    })

    const texture = useMemo(() => {
        const cloned = { ...textures };
        if (cloned.map) cloned.map = cloned.map.clone();
        return cloned;
    }, [textures]);

    // Auto-set repeat and wrapping based on floor size
    const width = props.args?.[0] || 1;
    const height = props.args?.[1] || 1;

    Object.values(texture).forEach((t) => {
        if (t instanceof THREE.Texture) {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(width / 50, height / 100);
        }
    });

    return (
        <group {...props}>
            <mesh>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    )

};