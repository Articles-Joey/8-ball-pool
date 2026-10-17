import { memo, Suspense, useEffect, useState } from "react";

import { Canvas } from "@react-three/fiber";
import { Sky, Stats } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";

import { Physics } from "@react-three/rapier";

import { ModelJToastieCouch } from "@/components/Game/Couch";

import { ModelKennyNLFurnitureTableGlass } from "@/components/Game/tableGlass";

import { Model as WomenPunkModel } from "@/components/Game/PunkMan";
import { Model as MenPunkModel } from "@/components/Game/PunkWoman";
import { Model as PunkManSleep } from "@/components/Game/PunkManSleep";

import Tree from "@/components/Game/Tree";
import ChristmasGifts from "@/components/Game/ChristmasGifts";
import { Star } from "@/components/Game/Star";
// import { ModelJToastieCampfire } from "@/components/Games/Campfire";
import { ModelGoogleCampFire } from "@/components/Game/Camp Fire";
import { ModelDoorway } from "@/components/Game/doorway";
import { ModelGoogleBookshelf } from "@/components/Game/Bookshelf";
import { ChairModel } from "@/components/Game/Chair";
import { ModelGoogleShoes1 } from "@/components/Game/Shoes1";
import { useEightBallStore } from "@/hooks/useEightBallStore";
// import { degToRad } from "three/src/math/MathUtils";
// import { useHotkeys } from "react-hotkeys-hook";
// import { MathUtils } from "three";
import PlayerProjectile from "./PlayerProjectile";
import KeyboardControls from "./KeyboardControls";
import Dartboard from "@/components/Game/Dartboard";
import { Table, TableBottom, TableLegs } from "@/components/Game/Table";
import Balls from "@/components/Game/Balls";
import WoodFloor from "@/components/Game/WoodFloor";
import FlickerFireLight from "@/components/Game/FlickerFireLight";
// import { degToRad } from "three/src/math/MathUtils";
import CameraControls from "@/components/Game/CameraControls";
import RoomWalls from "@/components/Game/RoomWalls";
import { degToRad } from "three/src/math/MathUtils";
import { useStore } from "@/hooks/useStore";
import HallwayWalls from "./HallwayWalls";
import RoomLighting from "./RoomLighting";
import SnowSlope from "./SnowSlope";
import {
    CueBallPlacement,
    PoolPhysicsController,
    PoolPhysicsProvider,
} from "./PoolPhysics";

function GameCanvas({ landingAnimationMode = false }) {
    const guest = useEightBallStore(
        (s) => s.mode === "multiplayer" && !s.isHost,
    );
    const finished = useEightBallStore((s) => s.phase === "finished");
    // const theme = useEightBallStore(state => state.theme);
    const darkMode = useStore((state) => state.darkMode);
    const showStats = useStore((state) => state?.debugConfig?.showStats);

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // const GPUTier = useDetectGPU()

    const { debug } = useEightBallStore((state) => ({
        debug: state.debug,
    }));

    return (
        <Canvas
            camera={{ position: [-10, 40, 40], fov: 50, far: 2400 }}
            shadows="soft"
            dpr={[1, 1.75]}
            gl={{
                toneMapping: ACESFilmicToneMapping,
                toneMappingExposure: 1.05,
            }}
        >
            {showStats && (
                <>
                    <Stats className="stats-overlay" />
                </>
            )}

            <CameraControls />

            {/* <OrbitControls
            // autoRotate={gameState?.status == 'In Lobby'}
            /> */}

            <Sky
                sunPosition={darkMode ? [400, -30, -200] : [400, 300, -200]}
                turbidity={6}
                rayleigh={0.6}
            />

            <RoomLighting darkMode={darkMode} />

            <group position={[130, -16, 130]}>
                <FlickerFireLight />
            </group>

            <WoodFloor
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -30, 0]}
                args={[300, 300]}
            />

            <RoomWalls />
            <SnowSlope />

            <HallwayWalls />

            <TableLegs />

            <ModelJToastieCouch
                position={[0, -30, -130]}
                scale={38}
                rotation={[0, -Math.PI / -2, 0]}
            />

            <ModelKennyNLFurnitureTableGlass
                position={[80, -30, -110]}
                scale={60}
                rotation={[0, 0, 0]}
            />

            <WomenPunkModel
                position={[20, -30, -80]}
                scale={30}
            />

            <MenPunkModel
                position={[0, -30, -80]}
                scale={30}
            />

            <PunkManSleep
                position={[16, -11, -125]}
                scale={30}
                rotation={[0, -Math.PI / 2, 0]}
            />

            <ModelDoorway />

            {darkMode && (
                <rectAreaLight
                    width={50}
                    height={50}
                    color={"limegreen"}
                    intensity={2}
                    distance={100}
                    position={[-150, 0, 20]}
                    rotation={[0, degToRad(-90), 0]}
                />
            )}

            <ModelGoogleBookshelf
                position={[-140, -30, 20]}
                scale={0.75}
                rotation={[0, 0, 0]}
            />
            <ModelGoogleShoes1
                position={[-140, 33.5, 20]}
                scale={5}
                rotation={[0, -Math.PI / -2, 0]}
            />
            <ModelGoogleShoes1
                position={[-140, 19.5, 20]}
                scale={5}
                rotation={[0, -Math.PI / -2, 0]}
            />

            <ChairModel
                position={[120, -30, 60]}
                scale={80}
                rotation={[0, 0, 0]}
            />
            <ChairModel
                position={[90, -30, 60]}
                scale={80}
                rotation={[0, 0, 0]}
            />

            <ChairModel
                position={[60, -30, 140]}
                scale={80}
                rotation={[0, -Math.PI / -2, 0]}
            />
            <ChairModel
                position={[60, -30, 110]}
                scale={80}
                rotation={[0, -Math.PI / -2, 0]}
            />

            {/* Tree */}
            <group position={[-120, -30, -120]}>
                <Tree
                    scale={4}
                    heightScale={0.85}
                />
                <Star
                    position={[1, 82.45, -4]}
                    rotation={[0, 0, 0]}
                    scale={10}
                />
                <ChristmasGifts />
            </group>

            {/* Campfire */}
            <group position={[130, -30, 130]}>
                <ModelGoogleCampFire
                    scale={0.3}
                    position={[0, 3, 0]}
                />

                {/* Base */}
                <mesh
                    castShadow
                    position={[0, 1, 0]}
                >
                    <boxGeometry args={[40, 5, 40]} />
                    <meshStandardMaterial color={"#222222"} />
                </mesh>

                {/* Top */}
                <mesh
                    castShadow
                    position={[0, 40, 0]}
                >
                    <boxGeometry args={[40, 5, 40]} />
                    <meshStandardMaterial color={"#222222"} />
                </mesh>

                {/* Solid back panels sit flush against the room's +X and +Z walls. */}
                <mesh
                    castShadow
                    receiveShadow
                    position={[0, 20, 17.5]}
                >
                    <boxGeometry args={[40, 40, 5]} />
                    <meshStandardMaterial
                        color={"#222222"}
                        roughness={0.8}
                    />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    position={[17.5, 20, -2.5]}
                >
                    <boxGeometry args={[5, 40, 35]} />
                    <meshStandardMaterial
                        color={"#222222"}
                        roughness={0.8}
                    />
                </mesh>

                {/* Chimney */}
                <mesh
                    castShadow
                    position={[0, 110, 0]}
                >
                    <boxGeometry args={[10, 140, 10]} />
                    <meshStandardMaterial color={"#222222"} />
                </mesh>
            </group>

            <Dartboard />

            <Suspense fallback={null}>
                <Physics
                    debug={debug}
                    gravity={[0, -9.81, 0]}
                    timeStep={1 / 120}
                    updatePriority={-50}
                    paused={guest || finished || landingAnimationMode}
                >
                    <PoolPhysicsProvider>
                        {isReady && (
                            <>
                                {!landingAnimationMode && <KeyboardControls />}
                                <PlayerProjectile
                                    preview={landingAnimationMode}
                                />
                                <Balls preview={landingAnimationMode} />
                                {!landingAnimationMode && (
                                    <PoolPhysicsController />
                                )}
                                {!landingAnimationMode && <CueBallPlacement />}
                            </>
                        )}
                        <Table />
                        <TableBottom />
                    </PoolPhysicsProvider>
                </Physics>
            </Suspense>
        </Canvas>
    );
}

export default memo(GameCanvas);
