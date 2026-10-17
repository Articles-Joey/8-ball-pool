import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { WINDOW_CENTERS } from "./RoomWalls";

RectAreaLightUniformsLib.init();

export default function RoomLighting({ darkMode }) {
    return (
        <group>
            <ambientLight intensity={darkMode ? 0.18 : 0.35} />
            <hemisphereLight
                args={["#d9eaff", "#66513b", darkMode ? 0.35 : 0.85]}
            />
            <directionalLight
                position={[400, 300, -200]}
                color={darkMode ? "#b4cfff" : "#fff3da"}
                intensity={darkMode ? 0.5 : 2.4}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-360}
                shadow-camera-right={360}
                shadow-camera-top={360}
                shadow-camera-bottom={-360}
                shadow-camera-near={1}
                shadow-camera-far={1100}
                shadow-bias={-0.0001}
                shadow-normalBias={0.15}
            />
            {WINDOW_CENTERS.map((z) => (
                <rectAreaLight
                    key={z}
                    position={[147, 26, z]}
                    rotation={[0, Math.PI / 2, 0]}
                    width={72}
                    height={46}
                    color="#d6e9ff"
                    intensity={darkMode ? 0.45 : 2}
                />
            ))}

            {/* This inset faces down with the ceiling so it also disappears from above. */}
            <mesh
                position={[0, 69.7, 0]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[27, 70]} />
                <meshStandardMaterial
                    color="#fff1cf"
                    emissive="#ffe0a2"
                    emissiveIntensity={2}
                    toneMapped={false}
                />
            </mesh>
            <spotLight
                position={[0, 68, 0]}
                color="#ffe9c4"
                intensity={darkMode ? 30000 : 36000}
                angle={0.9}
                penumbra={0.65}
                distance={220}
                decay={2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={1}
                shadow-camera-far={180}
                shadow-bias={-0.00005}
                shadow-normalBias={0.04}
            />
            <pointLight
                position={[-85, 32, -80]}
                color="#ffdbad"
                intensity={darkMode ? 1700 : 2500}
                distance={240}
                decay={2}
            />
            <pointLight
                position={[75, 30, 90]}
                color="#ffdbad"
                intensity={darkMode ? 1300 : 2100}
                distance={220}
                decay={2}
            />
        </group>
    );
}
