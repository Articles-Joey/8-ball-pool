import { Suspense } from "react";
import { Text } from "@react-three/drei";
import { useStore } from "@/hooks/useStore";
import { makeRack } from "@/util/poolGame";
import { PoolBall } from "./PoolPhysics";

const colors = [
    "white",
    "#edc72e",
    "#2349b5",
    "#c32c28",
    "#683aa0",
    "#e77723",
    "#267449",
    "#7c2536",
    "#171717",
];

export function BallAppearance({ ball }) {
    const darkMode = useStore((s) => s.darkMode);
    const color = colors[ball > 8 ? ball - 8 : ball];
    return (
        <group>
            <mesh
                castShadow
                receiveShadow
            >
                <sphereGeometry args={[1, 32, 24]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.2}
                    emissive="white"
                    emissiveIntensity={0.02}
                />
            </mesh>
            {ball > 8 &&
                [0, Math.PI].map((rotation) => (
                    <mesh
                        key={rotation}
                        rotation={[rotation, 0, 0]}
                    >
                        <sphereGeometry
                            args={[
                                1.005,
                                32,
                                16,
                                0,
                                Math.PI * 2,
                                0,
                                Math.PI * 0.3,
                            ]}
                        />
                        <meshStandardMaterial
                            color="#f6f3e8"
                            roughness={0.2}
                        />
                    </mesh>
                ))}
            {ball > 0 &&
                [-1, 1].map((side) => (
                    <group
                        key={side}
                        position={[0, 0, side * 1.007]}
                        rotation={[0, side < 0 ? Math.PI : 0, 0]}
                    >
                        <mesh>
                            <circleGeometry args={[0.34, 32]} />
                            <meshStandardMaterial
                                color={darkMode === false ? "#fff" : "#000"}
                                roughness={0.2}
                            />
                        </mesh>
                        <Suspense fallback={null}>
                            <Text
                                font="/font/stencilla.ttf"
                                position={[0, 0, 0.008]}
                                fontSize={0.34}
                                color={darkMode === false ? "#000" : "#fff"}
                                anchorX="center"
                                anchorY="middle"
                            >
                                {ball}
                            </Text>
                        </Suspense>
                    </group>
                ))}
            {darkMode && (
                <pointLight
                    intensity={ball === 0 ? 50 : 20}
                    distance={8}
                    color={color}
                />
            )}
        </group>
    );
}

export default function Balls({ preview = false }) {
    return makeRack()
        .filter((cfg) => cfg.ball !== 0)
        .map((cfg) =>
            preview ? (
                <group
                    key={cfg.ball}
                    position={cfg.position}
                >
                    <BallAppearance ball={cfg.ball} />
                </group>
            ) : (
                <PoolBall
                    key={cfg.ball}
                    ball={cfg.ball}
                >
                    <BallAppearance ball={cfg.ball} />
                </PoolBall>
            ),
        );
}
