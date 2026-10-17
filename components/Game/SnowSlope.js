import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
    CubicBezierCurve3,
    CurvePath,
    Float32BufferAttribute,
    LineCurve3,
    PlaneGeometry,
    Vector3,
} from "three";

function snowHeight(x, z) {
    const hill = (cx, cz, width, depth, height) =>
        height * Math.exp(-(((x - cx) / width) ** 2 + ((z - cz) / depth) ** 2));
    return (
        -5 +
        x * 0.085 +
        hill(260, -260, 170, 190, 75) +
        hill(540, 210, 230, 210, 130) +
        hill(830, -190, 240, 240, 175) +
        hill(980, 460, 220, 210, 110) +
        Math.sin(x * 0.016) * Math.sin(z * 0.012) * 3
    );
}

function SnowTerrain() {
    const geometry = useMemo(() => {
        const mesh = new PlaneGeometry(1100, 1500, 72, 88);
        mesh.rotateX(-Math.PI / 2);
        const positions = mesh.attributes.position;
        const colors = [];
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i) + 550;
            const z = positions.getZ(i);
            positions.setXYZ(i, x, snowHeight(x, z), z);
            const shade = 0.94 + Math.sin(x * 0.025 + z * 0.013) * 0.025;
            colors.push(shade, shade * 0.99, 1);
        }
        mesh.setAttribute("color", new Float32BufferAttribute(colors, 3));
        mesh.computeVertexNormals();
        mesh.computeBoundingSphere();
        return mesh;
    }, []);
    useEffect(() => () => geometry.dispose(), [geometry]);
    return (
        <mesh
            geometry={geometry}
            castShadow
            receiveShadow
        >
            <meshStandardMaterial
                color="#f7f9ff"
                vertexColors
                roughness={1}
                flatShading
            />
        </mesh>
    );
}

function LiftChair({ curve, offset, color }) {
    const chair = useRef();
    useFrame(({ clock }) => {
        if (!chair.current) return;
        const progress = (clock.elapsedTime / 85 + offset) % 1;
        chair.current.position.copy(curve.getPointAt(progress));
        const tangent = curve.getTangentAt(progress);
        // Only turn around Y so seats stay upright on both sides of the loop.
        chair.current.rotation.y = Math.atan2(tangent.x, tangent.z);
    });
    return (
        <group ref={chair}>
            <mesh
                position={[0, -4, -1.1]}
                rotation={[0.268, 0, 0]}
                castShadow
            >
                <boxGeometry args={[0.55, 8.3, 0.55]} />
                <meshStandardMaterial
                    color="#343d46"
                    roughness={0.7}
                />
            </mesh>
            <mesh
                position={[0, -12, 0]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[8, 1.25, 5]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.8}
                />
            </mesh>
            <mesh
                position={[0, -9.5, -2.2]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[8, 4, 0.8]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.8}
                />
            </mesh>
            {[-3.5, 3.5].map((x) => (
                <mesh
                    key={x}
                    position={[x, -10, 0]}
                    castShadow
                >
                    <boxGeometry args={[0.4, 4, 5]} />
                    <meshStandardMaterial
                        color="#343d46"
                        roughness={0.7}
                    />
                </mesh>
            ))}
            <mesh
                position={[0, -8.5, 2.2]}
                castShadow
            >
                <boxGeometry args={[8, 0.45, 0.45]} />
                <meshStandardMaterial
                    color="#343d46"
                    roughness={0.7}
                />
            </mesh>
        </group>
    );
}

function LiftTower({ position, side }) {
    const ground = snowHeight(position.x, position.z);
    const top = position.y + 2;
    const height = top - ground;
    const rotation = Math.atan2(-side.z, side.x);
    return (
        <group position={[position.x, ground, position.z]}>
            <mesh
                position={[0, height / 2, 0]}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[0.95, 1.5, height, 8]} />
                <meshStandardMaterial
                    color="#697b87"
                    roughness={0.75}
                />
            </mesh>
            <mesh
                position={[0, height, 0]}
                rotation={[0, rotation, 0]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[26, 1.4, 2]} />
                <meshStandardMaterial
                    color="#414d58"
                    roughness={0.75}
                />
            </mesh>
            {[-1, 1].map((lane) => (
                <mesh
                    key={lane}
                    position={[side.x * lane, height - 0.7, side.z * lane]}
                    rotation={[0, rotation, Math.PI / 2]}
                    castShadow
                >
                    <cylinderGeometry args={[1.6, 1.6, 0.8, 12]} />
                    <meshStandardMaterial
                        color="#252e36"
                        roughness={0.85}
                    />
                </mesh>
            ))}
            <mesh
                position={[0, 0.5, 0]}
                receiveShadow
            >
                <boxGeometry args={[6, 2, 6]} />
                <meshStandardMaterial
                    color="#bfc8ce"
                    roughness={1}
                />
            </mesh>
        </group>
    );
}

function Chairlift() {
    const { curve, towers, side } = useMemo(() => {
        const towers = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => {
            const x = 65 + 605 * t;
            const z = -90 + 335 * t;
            return new Vector3(x, snowHeight(x, z) + 45, z);
        });
        const start = towers[0];
        const end = towers[towers.length - 1];
        const forward = end.clone().sub(start).normalize();
        const side = new Vector3(-forward.z, 0, forward.x)
            .normalize()
            .multiplyScalar(9);
        const a = start.clone().add(side);
        const b = end.clone().add(side);
        const c = end.clone().sub(side);
        const d = start.clone().sub(side);
        const endTurn = end
            .clone()
            .sub(towers[towers.length - 2])
            .normalize()
            .multiplyScalar(12);
        const startTurn = towers[1]
            .clone()
            .sub(start)
            .normalize()
            .multiplyScalar(12);
        const curve = new CurvePath();
        for (let i = 0; i < towers.length - 1; i++) {
            curve.add(
                new LineCurve3(
                    towers[i].clone().add(side),
                    towers[i + 1].clone().add(side),
                ),
            );
        }
        curve.add(
            new CubicBezierCurve3(
                b,
                b.clone().add(endTurn),
                c.clone().add(endTurn),
                c,
            ),
        );
        for (let i = towers.length - 1; i > 0; i--) {
            curve.add(
                new LineCurve3(
                    towers[i].clone().sub(side),
                    towers[i - 1].clone().sub(side),
                ),
            );
        }
        curve.add(
            new CubicBezierCurve3(
                d,
                d.clone().sub(startTurn),
                a.clone().sub(startTurn),
                a,
            ),
        );
        curve.updateArcLengths();
        return {
            curve,
            side,
            towers,
        };
    }, []);

    return (
        <group>
            <mesh castShadow>
                <tubeGeometry args={[curve, 160, 0.3, 5, true]} />
                <meshStandardMaterial
                    color="#303b45"
                    roughness={0.85}
                />
            </mesh>
            {towers.map((position, i) => (
                <LiftTower
                    key={i}
                    position={position}
                    side={side}
                />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
                <LiftChair
                    key={i}
                    curve={curve}
                    offset={i / 12}
                    color={i % 2 === 0 ? "#af3d34" : "#345969"}
                />
            ))}
        </group>
    );
}

export default function SnowSlope() {
    return (
        // Scenery is deliberately outside Physics; only the lift transforms animate.
        <group position={[154, -31, 0]}>
            <SnowTerrain />
            <Chairlift />
        </group>
    );
}
