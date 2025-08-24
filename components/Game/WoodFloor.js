import { useTexture } from "@react-three/drei";

import * as THREE from 'three'

export default function WoodFloor(props) {

    const base_link = `${process.env.NEXT_PUBLIC_CDN}games/US Tycoon/Textures/WoodFloor041_1K-JPG/`

    const texture = useTexture({
        map: `${base_link}WoodFloor041_1K-JPG_Color.jpg`,
        // displacementMap: `${base_link}GroundSand005_DISP_1K.jpg`,
        // normalMap: `${base_link}GroundSand005_NRM_1K.jpg`,
        // roughnessMap: `${base_link}GroundSand005_BUMP_1K.jpg`,
        // aoMap: `${base_link}GroundSand005_AO_1K.jpg`,
    })

    texture.map.repeat.set(6, 6);
    texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;

    return (
        <group {...props}>
            <mesh>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    )

};