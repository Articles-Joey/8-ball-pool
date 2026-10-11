import { memo } from "react";
import { Base, Geometry, Intersection, Subtraction } from "@react-three/csg";
import {
    CuboidCollider,
    CylinderCollider,
    RigidBody,
} from "@react-three/rapier";
import { DoubleSide, Shape } from "three";
import { POCKETS } from "@/util/poolGame";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import FeltMaterial from "./FeltMaterial";

const pockets = POCKETS;
const POCKET_RIM_COLOR = "#292b2e";
const POCKET_RIM_WIDTH = 0.3;
const GREEN_RAIL_WIDTH = 56;
const GREEN_RAIL_LENGTH = 106;
const WOOD_RAIL_WIDTH = 60;
const WOOD_RAIL_LENGTH = 110;
const FELT_THICKNESS = 0.5;
const FELT_TOP_Y = FELT_THICKNESS / 2;

// Cut straight cushion faces toward each pocket instead of leaving round bites.
const POCKET_JAWS = pockets.map(({ position: [x, , z], radius }) => {
    const corner = z !== 0;
    const front = -7;
    const back = 1.2;
    const halfWidth = (depth) =>
        corner ? radius * 1.1 : radius + 0.35 - depth * 0.75;
    const shape = new Shape();
    shape.moveTo(-halfWidth(front), front);
    shape.lineTo(halfWidth(front), front);
    shape.lineTo(halfWidth(back), back);
    shape.lineTo(-halfWidth(back), back);
    shape.closePath();
    return { x, z, rotation: Math.atan2(Math.sign(x), Math.sign(z)), shape };
});

function PocketJawCuts({
    height = 20,
    centerY = 0,
    originX = 0,
    originZ = 0,
    index,
}) {
    const jaws = index === undefined ? POCKET_JAWS : [POCKET_JAWS[index]];
    return jaws.map(({ x, z, rotation, shape }) => (
        <group
            key={`${x}:${z}`}
            position={[x - originX, centerY, z - originZ]}
            rotation={[0, rotation, 0]}
        >
            <Subtraction
                position={[0, height / 2, 0]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <extrudeGeometry
                    args={[
                        shape,
                        { depth: height, steps: 1, bevelEnabled: false },
                    ]}
                />
            </Subtraction>
        </group>
    ));
}

function PocketRim({ x, z, radius }) {
    const top = FELT_TOP_Y;
    const bottom = -6;
    const height = top - bottom;
    const center = (top + bottom) / 2;

    return (
        <mesh
            position={[0, center, 0]}
            renderOrder={10}
            castShadow
            receiveShadow
        >
            <meshStandardMaterial
                color={POCKET_RIM_COLOR}
                roughness={0.85}
                side={DoubleSide}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
            />
            <Geometry>
                <Base>
                    <cylinderGeometry
                        args={[
                            radius + POCKET_RIM_WIDTH,
                            radius + POCKET_RIM_WIDTH,
                            height,
                            64,
                        ]}
                    />
                </Base>
                {/* Follow the pocket through the wood while staying inside the table's edge. */}
                <Intersection position={[-x, 0, -z]}>
                    <boxGeometry
                        args={[WOOD_RAIL_WIDTH, height + 1, WOOD_RAIL_LENGTH]}
                    />
                </Intersection>
                {/* The inner wall sits just inside the cut to cover every exposed layer. */}
                <Subtraction>
                    <cylinderGeometry
                        args={[radius - 0.03, radius - 0.03, height + 1, 64]}
                    />
                </Subtraction>
                {/* The entire pocket lip is flush with the felt, below the angled cushion faces. */}
            </Geometry>
        </mesh>
    );
}

function PocketTarget({ index, x, z, radius }) {
    const selected = useEightBallStore(
        (s) =>
            s.calledBall === 8 &&
            s.calledPocket === index &&
            ["aiming", "shooting"].includes(s.phase),
    );
    if (!selected) return null;
    return (
        <mesh position={[0, FELT_TOP_Y + 0.14, 0]}>
            <meshBasicMaterial color="#f6d65c" />
            <Geometry>
                <Base rotation={[-Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[radius + 0.2, 0.12, 8, 64]} />
                </Base>
                <Intersection position={[-x, 0, -z]}>
                    <boxGeometry
                        args={[WOOD_RAIL_WIDTH, 1, WOOD_RAIL_LENGTH]}
                    />
                </Intersection>
            </Geometry>
        </mesh>
    );
}

function PocketCuts() {
    return pockets.map(({ position, radius }, index) => (
        <Subtraction
            key={index}
            position={position}
        >
            <cylinderGeometry args={[radius, radius, 20, 64]} />
        </Subtraction>
    ));
}

function CutSurface({
    size,
    opening,
    position,
    color,
    roughness = 0.7,
    angledPockets = false,
    felt = false,
}) {
    return (
        <mesh
            position={position}
            castShadow
            receiveShadow
        >
            {felt ? (
                <FeltMaterial
                    width={size[0]}
                    length={size[2]}
                    color={color}
                />
            ) : (
                <meshStandardMaterial
                    color={color}
                    roughness={roughness}
                />
            )}
            <Geometry>
                <Base>
                    <boxGeometry args={size} />
                </Base>
                {opening && (
                    <Subtraction>
                        <boxGeometry args={[opening[0], 20, opening[1]]} />
                    </Subtraction>
                )}
                <PocketCuts />
                {angledPockets && <PocketJawCuts />}
            </Geometry>
        </mesh>
    );
}

export const Table = memo(function Table() {
    return (
        <group>
            {/* Colliders follow the cut geometry, leaving all six pockets open. */}
            <RigidBody
                type="fixed"
                colliders="trimesh"
                friction={0.25}
                restitution={0}
            >
                {/* Felt continues under both rails to support every angled pocket entrance. */}
                <CutSurface
                    size={[WOOD_RAIL_WIDTH, FELT_THICKNESS, WOOD_RAIL_LENGTH]}
                    position={[0, 0, 0]}
                    color="#176b55"
                    felt
                />
                <CutSurface
                    size={[WOOD_RAIL_WIDTH, 1.5, WOOD_RAIL_LENGTH]}
                    position={[0, -1, 0]}
                    color="#252322"
                />
            </RigidBody>
            <RigidBody
                type="fixed"
                colliders="trimesh"
                friction={0.15}
                restitution={0.85}
                userData={{ isRail: true }}
            >
                <CutSurface
                    size={[GREEN_RAIL_WIDTH, 1.8, GREEN_RAIL_LENGTH]}
                    opening={[50, 100]}
                    position={[0, 1.05, 0]}
                    color="#125440"
                    angledPockets
                    felt
                />
            </RigidBody>
            <RigidBody
                type="fixed"
                colliders="trimesh"
                friction={0.3}
                restitution={0.45}
                userData={{ isRail: true }}
            >
                <CutSurface
                    size={[WOOD_RAIL_WIDTH, 2.2, WOOD_RAIL_LENGTH]}
                    opening={[GREEN_RAIL_WIDTH, GREEN_RAIL_LENGTH]}
                    position={[0, 0.9, 0]}
                    color="#4b281b"
                    roughness={0.3}
                    angledPockets
                />
            </RigidBody>

            {/* An open apron leaves room for the pockets below the slate. */}
            <CutSurface
                size={[59, 6, 109]}
                opening={[49, 99]}
                position={[0, -4.75, 0]}
                color="#352018"
                roughness={0.4}
            />

            {pockets.map(({ position: [x, , z], radius }, index) => (
                <group
                    key={index}
                    position={[x, 0, z]}
                >
                    <PocketTarget
                        index={index}
                        x={x}
                        z={z}
                        radius={radius}
                    />
                    <PocketRim
                        x={x}
                        z={z}
                        radius={radius}
                    />
                    <mesh
                        position={[0, -6, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <circleGeometry args={[radius, 64]} />
                        <meshStandardMaterial
                            color={POCKET_RIM_COLOR}
                            roughness={0.85}
                        />
                    </mesh>
                    <RigidBody
                        type="fixed"
                        colliders={false}
                        userData={{ isPocket: true, pocket: index }}
                    >
                        <CylinderCollider
                            args={[0.5, radius * 0.8]}
                            position={[0, -4, 0]}
                            sensor
                        />
                    </RigidBody>
                </group>
            ))}

            {/* Ivory diamond sights along the polished rails. */}
            {[-1, 1].map((side) => (
                <group key={side}>
                    {[-37.5, -25, -12.5, 12.5, 25, 37.5].map((z) => (
                        <mesh
                            key={z}
                            position={[side * 29, 2.02, z]}
                            rotation={[0, Math.PI / 4, 0]}
                        >
                            <boxGeometry args={[0.45, 0.04, 0.45]} />
                            <meshStandardMaterial
                                color="#e7d7ad"
                                roughness={0.35}
                            />
                        </mesh>
                    ))}
                    {[-12.5, 0, 12.5].map((x) => (
                        <mesh
                            key={x}
                            position={[x, 2.02, side * 54]}
                            rotation={[0, Math.PI / 4, 0]}
                        >
                            <boxGeometry args={[0.45, 0.04, 0.45]} />
                            <meshStandardMaterial
                                color="#e7d7ad"
                                roughness={0.35}
                            />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
});

export function TableBottom() {
    return (
        <RigidBody
            type="fixed"
            colliders={false}
            position={[0, -9, 0]}
            userData={{ isTableBottom: true }}
        >
            <CuboidCollider
                args={[34, 0.5, 59]}
                sensor
            />
        </RigidBody>
    );
}

export function TableLegs() {
    return (
        <group>
            {[-20, 20].flatMap((x) =>
                [-42, 42].map((z) => (
                    <group
                        key={`${x}-${z}`}
                        position={[x, -18.5, z]}
                    >
                        <mesh
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry args={[3.2, 2.4, 23, 8]} />
                            <meshStandardMaterial
                                color="#352018"
                                roughness={0.4}
                            />
                        </mesh>
                        <mesh
                            position={[0, -10.7, 0]}
                            castShadow
                        >
                            <cylinderGeometry args={[2.6, 2.6, 1.4, 32]} />
                            <meshStandardMaterial
                                color="#8c7244"
                                metalness={0.65}
                                roughness={0.3}
                            />
                        </mesh>
                    </group>
                )),
            )}
        </group>
    );
}
