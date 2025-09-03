import { useEightBallStore } from "@/hooks/useEightBallStore";
import { Image } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils";

export default function Dartboard() {

    const theme = useEightBallStore(state => state.theme);

    return (
        <group position={[-80, 20, 150]}>

            <Image
                url={`${process.env.NEXT_PUBLIC_CDN}games/8 Ball Pool/Dartboard Graphic.svg`}
                scale={25}
                rotation={[0, Math.PI / 1, 0]}
                position={[0, 0, -0.1]}
                transparent={true}
                alt="Dartboard"
            />

            {theme === 'Dark' &&
                <rectAreaLight
                    width={20}
                    height={20}
                    color={"red"}
                    intensity={25}
                    distance={100}
                    position={[0, 0, -20]}
                    rotation={[0, degToRad(-180), 0]}
                />
            }

            <mesh
                castShadow
                rotation={[Math.PI / 2, 0, 0]}
                position={[0, 0, -0.5]}
            >
                <cylinderGeometry
                    args={[0.25, 0.25, 4]}
                />
                <meshStandardMaterial color="black" />
            </mesh>

            {/* Darts Holder */}
            <mesh
                castShadow
                rotation={[0, 0, 0]}
                position={[20, 0, 0]}
            >
                <boxGeometry
                    args={[10.00, 10.00, 1]}
                />
                <meshStandardMaterial color="saddlebrown" />
            </mesh>

            {[...Array(9)].map((item, i) => {
                return (
                    <mesh
                        key={i}
                        castShadow
                        rotation={[0, 0, 0]}
                        position={[24 - (i * 1.), 0, -0.5]}
                    >
                        <cylinderGeometry
                            args={[0.25, 0.25, 4]}
                        />
                        <meshStandardMaterial color="black" />
                    </mesh>
                )
            })}

        </group>
    )
}