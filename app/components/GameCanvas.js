import { createContext, createRef, forwardRef, memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls, Cylinder, QuadraticBezierLine, Text, Image } from "@react-three/drei";

// import { useCannonStore } from "@/components/Games/Cannon/hooks/useCannonStore";
import { Debug, Physics, useBox, useSphere } from "@react-three/cannon";



import { ModelJToastieCouch } from "@/components/Game/Couch";

import { ModelKennyNLFurnitureTableGlass } from "@/components/Game/tableGlass";

import { Model as WomenPunkModel } from "@/components/Game/PunkMan";
import { Model as MenPunkModel } from "@/components/Game/PunkWoman";
import { Model as PunkManSleep } from "@/components/Game/PunkManSleep";

import Tree from "@/components/Game/Tree";
import { ModelKennyNLFurnitureCardboardBoxOpen } from "@/components/Game/cardboardBoxOpen";
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
import Dartboard from "@/components/Game/Dartboard";
import { Table, TableBottom, TableLegs } from "@/components/Game/Table";
import Balls from "@/components/Game/Balls";
import WoodFloor from "@/components/Game/WoodFloor";
import FlickerFireLight from "@/components/Game/FlickerFireLight";
// import { degToRad } from "three/src/math/MathUtils";
import CameraControls from "@/components/Game/CameraControls";
import RoomWalls from "@/components/Game/RoomWalls";
import { degToRad } from "three/src/math/MathUtils";

function GameCanvas(props) {

    const theme = useEightBallStore(state => state.theme);

    // const GPUTier = useDetectGPU()

    const [[a, b, c, d, e]] = useState(() => [...Array(5)].map(createRef))

    const {
        debug,
    } = useEightBallStore(state => ({
        debug: state.debug,
    }));

    let gameContent = (
        <>

            <PlayerProjectile />

            <Balls />

            <OuterWalls />

            <InnerWalls />

            {/* <Holes /> */}

            <Table />
            <TableBottom />

        </>
    )

    let physicsContent
    if (debug) {
        physicsContent = (
            <Debug>
                {gameContent}
            </Debug>
        )
    } else {
        physicsContent = (
            gameContent
        )
    }

    return (
        <Canvas camera={{ position: [-10, 40, 40], fov: 50 }}>

            <CameraControls />

            {/* <OrbitControls
            // autoRotate={gameState?.status == 'In Lobby'}
            /> */}

            <Sky
                // distance={450000}
                sunPosition={[0, -10, 0]}
            // inclination={0}
            // azimuth={0.25}
            // {...props} 
            />

            <ambientLight intensity={theme === 'Light' ? 5 : 1} />
            <spotLight intensity={theme === 'Light' ? 30000 : 1} position={[-50, 100, 50]} angle={5} penumbra={1} />

            {theme === 'Dark' &&
                <group position={[145, -10, 145]}>
                    {/* <spotLight
                        intensity={30000}
                        // position={[-50, 100, 50]}
                        angle={1}
                        penumbra={1}
                        color={'red'}
                    /> */}
                    <FlickerFireLight />
                </group>
            }

            {/* <pointLight position={[-10, -10, -10]} /> */}

            <WoodFloor
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -30, 0]}
                args={[300, 300]}
            />

            <RoomWalls />

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

            <ModelDoorway
                position={[-146, -30, 100]}
                scale={70}
                rotation={[0, -Math.PI / -2, 0]}
            />

            {theme === 'Dark' &&
                <rectAreaLight
                    width={50}
                    height={50}
                    color={"limegreen"}
                    intensity={11}
                    distance={100}
                    position={[-150, 0, 20]}
                    rotation={[0, degToRad(-90), 0]}
                />
            }

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

            {/* Window */}
            <group>
                <Image
                    url={`${process.env.NEXT_PUBLIC_CDN}games/8 Ball Pool/Ski Slope.jpg`}
                    scale={100}
                    rotation={[0, Math.PI / -2, 0]}
                    position={[149, 30, -10]}
                    alt="Ski Slope"
                />
                <mesh castShadow position={[149, 30, -60]}>
                    <boxGeometry args={[5, 100, 5]} />
                    <meshStandardMaterial
                        color={"black"}
                    />
                </mesh>
                <mesh castShadow position={[149, 30, 40]}>
                    <boxGeometry args={[5, 100, 5]} />
                    <meshStandardMaterial
                        color={"black"}
                    />
                </mesh>

                {/* Horizontal Bars */}
                <mesh castShadow position={[149, -20, -10]}>
                    <boxGeometry args={[5, 5, 100]} />
                    <meshStandardMaterial
                        color={"black"}
                    />
                </mesh>
                <mesh castShadow position={[149, 30, -10]}>
                    <boxGeometry args={[5, 5, 100]} />
                    <meshStandardMaterial
                        color={"black"}
                    />
                </mesh>
                <mesh castShadow position={[149, 80, -10]}>
                    <boxGeometry args={[5, 5, 100]} />
                    <meshStandardMaterial
                        color={"black"}
                    />
                </mesh>
            </group>

            {/* Tree */}
            <group position={[-120, -30, -120]}>
                <Tree
                    scale={4}
                />
                <Star
                    position={[1, 97, -4]}
                    rotation={[0, 0, 0]}
                    scale={10}
                />
                <ModelKennyNLFurnitureCardboardBoxOpen
                    scale={40}
                    position={[10, 0, 0]}
                />
                <ModelKennyNLFurnitureCardboardBoxOpen
                    scale={40}
                    position={[0, 0, 20]}
                />
                <ModelKennyNLFurnitureCardboardBoxOpen
                    scale={40}
                    position={[20, 0, 20]}
                />
            </group>

            {/* Campfire */}
            <group position={[135, -30, 135]}>

                <ModelGoogleCampFire
                    scale={0.3}
                    position={[0, 3, 0]}
                />

                {/* Base */}
                <mesh castShadow position={[0, 1, 0]}>
                    <boxGeometry args={[50, 5, 50]} />
                    <meshStandardMaterial color={"#222222"} />
                </mesh>

                {/* Top */}
                <mesh castShadow position={[0, 40, 0]}>
                    <boxGeometry args={[50, 5, 50]} />
                    <meshStandardMaterial color={"#222222"} />
                </mesh>

                {/* Walls */}
                <mesh castShadow position={[20, 20, -20]}>
                    <boxGeometry args={[50, 40, 5]} />
                    <meshStandardMaterial
                        color={"#222222"}
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>
                <mesh castShadow position={[-20, 20, 20]}>
                    <boxGeometry args={[5, 40, 50]} />
                    <meshStandardMaterial
                        color={"#222222"}
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>

                {/* Chimney */}
                <mesh castShadow position={[0, 110, 0]}>
                    <boxGeometry args={[10, 140, 10]} />
                    <meshStandardMaterial color={"#222222"} />
                </mesh>

            </group>

            <Dartboard />

            <Physics>

                {physicsContent}

            </Physics>

        </Canvas>
    )
}

export default memo(GameCanvas)

function Holes() {

    return (
        <group>

            {/* Top */}
            <Hole
                position={[25, -0.79, -50]}
                args={[2, 2, 2.1]}
            />
            <Hole
                position={[-25, -0.79, -50]}
                args={[2, 2, 2.1]}
            />

            {/* Middle */}
            <Hole
                position={[25, -0.79, 0]}
                args={[2, 2, 2.1]}
            />
            <Hole
                position={[-25, -0.79, 0]}
                args={[2, 2, 2.1]}
            />

            {/* Bottom */}
            <Hole
                position={[25, -0.79, 50]}
                args={[2, 2, 2.1]}
            />
            <Hole
                position={[-25, -0.79, 50]}
                args={[2, 2, 2.1]}
            />

        </group>
    )

}

function Hole({ position, args }) {

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: position,
    }))

    return (
        <mesh ref={ref} castShadow>
            <cylinderGeometry args={args} />
            {/* <BeachBall /> */}
            <meshStandardMaterial color="black" />
        </mesh>
    )

}

function OuterWalls() {

    const lengthOffsetX = 29

    return (
        <group>

            {/* Length Walls */}
            <Wall
                position={[lengthOffsetX, 1, 0]}
                args={[2, 2, 106]}
            />
            <Wall
                position={[-lengthOffsetX, 1, 0]}
                args={[2, 2, 106]}
            />

            {/* Width Walls */}
            <Wall
                position={[0, 1, 54]}
                args={[60, 2, 2]}
            />
            <Wall
                position={[0, 1, -54]}
                args={[60, 2, 2]}
            />

        </group>
    )

}

function InnerWalls() {

    const wallWidth = 3
    const lengthOffsetX = 26.5

    return (
        <group>

            {/* North Length Walls */}
            <Wall
                position={[lengthOffsetX, 1, -25]}
                args={[wallWidth, 2, 46]}
                inner
            />
            <Wall
                position={[-lengthOffsetX, 1, -25]}
                args={[wallWidth, 2, 46]}
                inner
            />

            {/* South Length Walls */}
            <Wall
                position={[lengthOffsetX, 1, 25]}
                args={[wallWidth, 2, 46]}
                inner
            />
            <Wall
                position={[-lengthOffsetX, 1, 25]}
                args={[wallWidth, 2, 46]}
                inner
            />

            {/* Width Walls */}
            <Wall
                position={[0, 1, 51.5]}
                args={[46, 2, wallWidth]}
                inner
            />
            <Wall
                position={[0, 1, -51.5]}
                args={[46, 2, wallWidth]}
                inner
            />

        </group>
    )

}

function Wall({ position, args, inner }) {

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: position,
        material: { friction: 1, restitution: 1 },
    }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            {/* <BeachBall /> */}
            {/* <meshStandardMaterial color={inner ? "#054600" : "chocolate"} /> */}
            <meshStandardMaterial
                color={inner ? "#054600" : "chocolate"}
                emissive={"#054600"} // glow color
                emissiveIntensity={0.90} // adjust for subtle glow
            />
            {/* <rectAreaLight
                width={30}
                height={30}
                color={"limegreen"}
                intensity={0.3}
                distance={100}
                position={[0, 2, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            /> */}
        </mesh>
    )

}