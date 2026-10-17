import { useMemo } from "react";
import { useTexture } from "@react-three/drei";

import * as THREE from "three";
import { StoneBrickWall } from "./RoomWalls";

export default function HallwayWalls() {
    return (
        <group position={[-200, 0, 0]}>
            {/* The room supplies the full shared wall; this matching wall has no door. */}
            <StoneBrickWall
                rotation={[0, Math.PI / 2, 0]}
                position={[-52, 20, 0]}
                width={600}
            />

            <WoodFloor
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -30, 0]}
                args={[100, 600]}
            />
        </group>
    );
}

function WoodFloor(props) {
    const base_link = `${process.env.NEXT_PUBLIC_CDN}games/US Tycoon/Textures/WoodFloor041_1K-JPG/`;

    const textures = useTexture({
        map: `${base_link}WoodFloor041_1K-JPG_Color.jpg`,
        // displacementMap: `${base_link}GroundSand005_DISP_1K.jpg`,
        // normalMap: `${base_link}GroundSand005_NRM_1K.jpg`,
        // roughnessMap: `${base_link}GroundSand005_BUMP_1K.jpg`,
        // aoMap: `${base_link}GroundSand005_AO_1K.jpg`,
    });

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
            <mesh receiveShadow>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    );
}
