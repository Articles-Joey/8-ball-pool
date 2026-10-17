import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
    BufferGeometry,
    CubicBezierCurve3,
    DoubleSide,
    Float32BufferAttribute,
    RepeatWrapping,
    Shape,
    SRGBColorSpace,
    Vector3,
} from "three";

const TEXTURE_ROOT = "/textures/GiftWrap/";
const GIFTS = [
    {
        position: [13, 0.08, 8],
        size: [13, 9, 11],
        angle: 0.18,
        paper: "red-holly.svg",
        ribbon: "#e8bd59",
    },
    {
        position: [-12, 0.08, 16],
        size: [10, 13, 9],
        angle: -0.23,
        paper: "green-tartan.svg",
        ribbon: "#be3545",
    },
    {
        position: [6, 0.08, 24],
        size: [16, 7, 12],
        angle: -0.15,
        paper: "cream-snowflakes.svg",
        ribbon: "#286044",
    },
    {
        position: [22, 0.08, 25],
        size: [8, 11, 9],
        angle: 0.18,
        paper: "red-holly.svg",
        ribbon: "#f3e0b3",
    },
    {
        position: [-9, 0.08, -10],
        size: [12, 6, 10],
        angle: 0.12,
        paper: "green-tartan.svg",
        ribbon: "#e8bd59",
    },
];

function useGiftTextures(paper, width, height, depth) {
    const [source, labelSource] = useTexture([
        `${TEXTURE_ROOT}${paper}`,
        `${TEXTURE_ROOT}gift-label.svg`,
    ]);
    const anisotropy = useThree(({ gl }) =>
        Math.min(8, gl.capabilities.getMaxAnisotropy()),
    );
    const textures = useMemo(() => {
        const maps = [
            [depth, height],
            [width, depth],
            [width, height],
        ].map(([w, h]) => {
            const map = source.clone();
            map.wrapS = map.wrapT = RepeatWrapping;
            map.repeat.set(w / 18, h / 18);
            map.colorSpace = SRGBColorSpace;
            map.anisotropy = anisotropy;
            map.needsUpdate = true;
            return map;
        });
        const label = labelSource.clone();
        label.colorSpace = SRGBColorSpace;
        label.anisotropy = anisotropy;
        label.needsUpdate = true;
        return { maps, label };
    }, [source, labelSource, width, height, depth, anisotropy]);
    useEffect(
        () => () => {
            [...textures.maps, textures.label].forEach((texture) =>
                texture.dispose(),
            );
        },
        [textures],
    );
    return textures;
}

function RibbonMaterial({ color }) {
    return (
        <meshPhysicalMaterial
            color={color}
            roughness={0.3}
            metalness={0.2}
            sheen={0.75}
            sheenColor={color}
            clearcoat={0.2}
            side={DoubleSide}
        />
    );
}

function BowLoop({ direction, length, width, color }) {
    const geometry = useMemo(() => {
        const curve = new CubicBezierCurve3(
            new Vector3(0, 0.15, 0),
            new Vector3(direction * length, length * 0.8, -0.2),
            new Vector3(direction * length, length * 0.08, 0.2),
            new Vector3(0, 0.3, 0.15),
        );
        const positions = [];
        const indices = [];
        const segments = 24;
        for (let i = 0; i <= segments; i++) {
            const point = curve.getPoint(i / segments);
            positions.push(
                point.x,
                point.y,
                point.z - width / 2,
                point.x,
                point.y,
                point.z + width / 2,
            );
            if (i < segments) {
                const a = i * 2;
                indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
            }
        }
        const mesh = new BufferGeometry();
        mesh.setAttribute("position", new Float32BufferAttribute(positions, 3));
        mesh.setIndex(indices);
        mesh.computeVertexNormals();
        mesh.computeBoundingSphere();
        return mesh;
    }, [direction, length, width]);
    useEffect(() => () => geometry.dispose(), [geometry]);
    return (
        <mesh
            geometry={geometry}
            castShadow
            receiveShadow
        >
            <RibbonMaterial color={color} />
        </mesh>
    );
}

function GiftBow({ size, ribbonWidth, color }) {
    const length = size * 0.36;
    const tail = useMemo(() => {
        const shape = new Shape();
        shape.moveTo(-ribbonWidth / 2, 0);
        shape.lineTo(ribbonWidth / 2, 0);
        shape.lineTo(ribbonWidth / 2, -length);
        shape.lineTo(0, -length * 0.76);
        shape.lineTo(-ribbonWidth / 2, -length);
        shape.closePath();
        return shape;
    }, [ribbonWidth, length]);
    return (
        <group>
            {[-1, 1].map((direction) => (
                <group key={direction}>
                    <BowLoop
                        direction={direction}
                        length={length}
                        width={ribbonWidth}
                        color={color}
                    />
                    <mesh
                        position={[direction * 0.18, 0.04, 0.2]}
                        rotation={[-Math.PI / 2, 0, direction * 0.45]}
                        castShadow
                        receiveShadow
                    >
                        <shapeGeometry args={[tail]} />
                        <RibbonMaterial color={color} />
                    </mesh>
                </group>
            ))}
            <mesh
                position={[0, 0.42, 0.05]}
                scale={[ribbonWidth * 0.7, 0.5, ribbonWidth * 0.6]}
                castShadow
                receiveShadow
            >
                <sphereGeometry args={[1, 14, 10]} />
                <RibbonMaterial color={color} />
            </mesh>
        </group>
    );
}

function WrappedGift({ position, size, angle, paper, ribbon }) {
    const [width, height, depth] = size;
    const { maps, label } = useGiftTextures(paper, width, height, depth);
    const ribbonWidth = Math.max(1, Math.min(width, depth) * 0.12);
    const labelWidth = Math.min(5.5, width * 0.38);
    const labelHeight = labelWidth * (180 / 320);
    return (
        <group
            position={position}
            rotation={[0, angle, 0]}
        >
            <mesh
                position={[0, height / 2, 0]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={size} />
                {[maps[0], maps[0], maps[1], maps[1], maps[2], maps[2]].map(
                    (map, i) => (
                        <meshStandardMaterial
                            key={i}
                            attach={`material-${i}`}
                            map={map}
                            roughness={0.63}
                        />
                    ),
                )}
            </mesh>
            <mesh
                position={[0, height / 2, 0]}
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[ribbonWidth, height + 0.12, depth + 0.12]}
                />
                <RibbonMaterial color={ribbon} />
            </mesh>
            <mesh
                position={[0, height / 2, 0]}
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[width + 0.12, height + 0.18, ribbonWidth]}
                />
                <RibbonMaterial color={ribbon} />
            </mesh>
            <group position={[0, height + 0.1, 0]}>
                <GiftBow
                    size={Math.min(width, depth)}
                    ribbonWidth={ribbonWidth}
                    color={ribbon}
                />
            </group>
            <group
                position={[width * 0.28, height + 0.15, -depth * 0.28]}
                rotation={[0, -0.12, 0]}
            >
                <mesh receiveShadow>
                    <boxGeometry args={[labelWidth, 0.04, labelHeight]} />
                    <meshStandardMaterial
                        color="#fff3d7"
                        roughness={0.9}
                    />
                </mesh>
                <mesh
                    position={[0, 0.04, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    renderOrder={1}
                    receiveShadow
                >
                    <planeGeometry args={[labelWidth, labelHeight]} />
                    <meshStandardMaterial
                        map={label}
                        roughness={0.9}
                        polygonOffset
                        polygonOffsetFactor={-1}
                        polygonOffsetUnits={-1}
                    />
                </mesh>
            </group>
        </group>
    );
}

export default function ChristmasGifts() {
    return (
        <group>
            {GIFTS.map((gift, i) => (
                <WrappedGift
                    key={i}
                    {...gift}
                />
            ))}
        </group>
    );
}
