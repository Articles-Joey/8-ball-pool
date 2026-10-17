import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { Base, Geometry, Subtraction } from "@react-three/csg";
import { RepeatWrapping } from "three";
import { CeilingMaterial, WoodMaterial } from "./RoomMaterials";
import { DoorCut } from "./doorway";

const FLOOR_Y = -30;
const CEILING_Y = 70;
const WALL_HEIGHT = CEILING_Y - FLOOR_Y;
const WALL_CENTER_Y = (FLOOR_Y + CEILING_Y) / 2;
const PANEL_HEIGHT = WALL_HEIGHT * 0.2;
const WINDOW_WIDTH = 76;
const WINDOW_HEIGHT = 50;
const WINDOW_Y = 26;
export const WINDOW_CENTERS = [-65, 65];

function WoodBox({ position, size, color = "#ffffff", doorway }) {
    return (
        <mesh
            position={position}
            castShadow
            receiveShadow
        >
            {doorway ? (
                <Geometry>
                    <Base>
                        <boxGeometry args={size} />
                    </Base>
                    <DoorCut
                        wallPosition={doorway.position}
                        wallRotation={doorway.rotation}
                        origin={position}
                    />
                </Geometry>
            ) : (
                <boxGeometry args={size} />
            )}
            <WoodMaterial
                width={size[0]}
                height={size[1]}
                color={color}
            />
        </mesh>
    );
}

function WindowFrame({ x }) {
    const localY = WINDOW_Y - WALL_CENTER_Y;
    return (
        <group position={[x, localY, 0]}>
            {[-1, 1].map((side) => (
                <group key={side}>
                    <WoodBox
                        position={[side * (WINDOW_WIDTH / 2 + 1.5), 0, 0.5]}
                        size={[3, WINDOW_HEIGHT + 6, 6]}
                        color="#bfad99"
                    />
                    <WoodBox
                        position={[0, side * (WINDOW_HEIGHT / 2 + 1.5), 0.5]}
                        size={[WINDOW_WIDTH, 3, 6]}
                        color="#bfad99"
                    />
                </group>
            ))}
            <WoodBox
                position={[0, -WINDOW_HEIGHT / 2 - 2, 3]}
                size={[WINDOW_WIDTH + 9, 2, 10]}
            />
            {/* Open panes keep the landscape and its lighting unobstructed. */}
            <mesh
                position={[0, 0, 0.5]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[1.25, WINDOW_HEIGHT, 2]} />
                <meshStandardMaterial
                    color="#302d29"
                    roughness={0.5}
                />
            </mesh>
            <mesh
                position={[0, 0, 0.5]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[WINDOW_WIDTH, 1.25, 2]} />
                <meshStandardMaterial
                    color="#302d29"
                    roughness={0.5}
                />
            </mesh>
        </group>
    );
}

export function StoneBrickWall({
    position,
    rotation,
    windows = false,
    doorway = false,
    width = 300,
    panelBothSides = false,
}) {
    const source = useTexture({
        map: "/textures/StoneBricks/COL_1K.jpg",
        normalMap: "/textures/StoneBricks/NRM_1K.jpg",
    });
    const textures = useMemo(() => {
        const copies = {};
        for (const [name, texture] of Object.entries(source)) {
            const copy = texture.clone();
            copy.wrapS = copy.wrapT = RepeatWrapping;
            copy.repeat.set(width / 50, 2);
            copy.needsUpdate = true;
            copies[name] = copy;
        }
        return copies;
    }, [source, width]);
    useEffect(
        () => () => {
            Object.values(textures).forEach((texture) => texture.dispose());
        },
        [textures],
    );
    const doorWall = doorway ? { position, rotation } : undefined;

    return (
        <group
            position={position}
            rotation={rotation}
        >
            <mesh
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    {...textures}
                    roughness={0.9}
                />
                <Geometry>
                    <Base>
                        <boxGeometry args={[width, WALL_HEIGHT, 4]} />
                    </Base>
                    {doorway && (
                        <DoorCut
                            wallPosition={position}
                            wallRotation={rotation}
                        />
                    )}
                    {windows &&
                        WINDOW_CENTERS.map((x) => (
                            <Subtraction
                                key={x}
                                position={[x, WINDOW_Y - WALL_CENTER_Y, 0]}
                            >
                                <boxGeometry
                                    args={[WINDOW_WIDTH, WINDOW_HEIGHT, 10]}
                                />
                            </Subtraction>
                        ))}
                </Geometry>
            </mesh>

            {(panelBothSides ? [-1, 1] : [1]).map((side) => (
                <group key={side}>
                    <WoodBox
                        position={[
                            0,
                            FLOOR_Y + PANEL_HEIGHT / 2 - WALL_CENTER_Y,
                            side * 2.75,
                        ]}
                        size={[width, PANEL_HEIGHT, 1.5]}
                        doorway={doorWall}
                    />
                    <WoodBox
                        position={[
                            0,
                            FLOOR_Y + PANEL_HEIGHT - WALL_CENTER_Y,
                            side * 3.25,
                        ]}
                        size={[width, 1.5, 2.5]}
                        color="#d9c4a8"
                        doorway={doorWall}
                    />
                    <WoodBox
                        position={[0, FLOOR_Y + 2 - WALL_CENTER_Y, side * 3.25]}
                        size={[width, 4, 2.5]}
                        color="#b8a18b"
                        doorway={doorWall}
                    />
                    <WoodBox
                        position={[
                            0,
                            CEILING_Y - 2.5 - WALL_CENTER_Y,
                            side * 3,
                        ]}
                        size={[width, 5, 2]}
                    />
                </group>
            ))}

            {windows &&
                WINDOW_CENTERS.map((x) => (
                    <WindowFrame
                        key={x}
                        x={x}
                    />
                ))}
        </group>
    );
}

export default function RoomWalls() {
    return (
        <group>
            <StoneBrickWall position={[0, WALL_CENTER_Y, -152]} />
            <StoneBrickWall
                position={[0, WALL_CENTER_Y, 152]}
                rotation={[0, Math.PI, 0]}
            />
            <StoneBrickWall
                position={[152, WALL_CENTER_Y, 0]}
                rotation={[0, -Math.PI / 2, 0]}
                windows
            />
            <StoneBrickWall
                position={[-152, WALL_CENTER_Y, 0]}
                rotation={[0, Math.PI / 2, 0]}
                width={600}
                panelBothSides
                doorway
            />

            {/* The front face points down: orbiting above the room hides the ceiling. */}
            <mesh
                position={[0, CEILING_Y, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                castShadow
                receiveShadow
            >
                <planeGeometry args={[300, 300]} />
                <CeilingMaterial />
            </mesh>
        </group>
    );
}
