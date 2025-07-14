import { createContext, createRef, forwardRef, memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Canvas } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls, Cylinder, QuadraticBezierLine, Text, Image } from "@react-three/drei";

// import { useCannonStore } from "@/components/Games/Cannon/hooks/useCannonStore";
import { Debug, Physics, useBox, useSphere } from "@react-three/cannon";

import * as THREE from 'three'

import { ModelJToastieCouch } from "@/components/Game/Couch";

import { ModelKennyNLFurnitureTableGlass } from "@/components/Game/tableGlass";

import { Model as WomenPunkModel } from "@/components/Game/PunkMan";
import { Model as MenPunkModel } from "@/components/Game/PunkWoman";
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

function GameCanvas(props) {

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

            <OrbitControls
            // autoRotate={gameState?.status == 'In Lobby'}
            />

            <Sky
                // distance={450000}
                sunPosition={[0, -10, 0]}
            // inclination={0}
            // azimuth={0.25}
            // {...props} 
            />

            <ambientLight intensity={5} />
            <spotLight intensity={30000} position={[-50, 100, 50]} angle={5} penumbra={1} />

            {/* <pointLight position={[-10, -10, -10]} /> */}

            <WoodFloor
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -30, 0]}
                args={[300, 300]}
            />

            <StoneBrickWall
                // rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, -150]}
                args={[300, 300]}
            />

            <StoneBrickWall
                rotation={[-Math.PI / 1, 0, 0]}
                position={[0, 0, 150]}
                args={[300, 300]}
            />

            <StoneBrickWall
                rotation={[0, -Math.PI / 2, 0]}
                position={[150, 0, 0]}
                args={[300, 300]}
            />

            <StoneBrickWall
                rotation={[0, -Math.PI / -2, 0]}
                position={[-150, 0, 0]}
                args={[300, 300]}
            />

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

            <ModelDoorway
                position={[-146, -30, 100]}
                scale={70}
                rotation={[0, -Math.PI / -2, 0]}
            />

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

function WoodFloor(props) {

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

function StoneBrickWall(props) {

    const base_link = `${process.env.NEXT_PUBLIC_CDN}games/US Tycoon/Textures/StoneBricksSplitface001/`

    const texture = useTexture({
        map: `${base_link}StoneBricksSplitface001_COL_1K.jpg`,
        // displacementMap: `${base_link}StoneBricksSplitface001_DISP_1K.jpg`,
        normalMap: `${base_link}StoneBricksSplitface001_NRM_1K.jpg`,
        // roughnessMap: `${base_link}StoneBricksSplitface001_BUMP_1K.jpg`,
        // aoMap: `${base_link}StoneBricksSplitface001_AO_1K.jpg`,
    })

    texture.map.repeat.set(7, 7);
    texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;

    return (
        <group {...props}>
            <mesh receiveShadow>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    )

};

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
    }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            {/* <BeachBall /> */}
            <meshStandardMaterial color={inner ? "#054600" : "chocolate"} />
        </mesh>
    )

}

function Table() {

    const args = [50, 0.5, 100]

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: [0, 0, 0],
    }))

    return (
        <mesh ref={ref} castShadow>

            <boxGeometry
                args={args}
            />
            <meshStandardMaterial color="#0a6c03" />

        </mesh>
    )

}

function TableBottom() {

    const args = [60, 0.5, 110]

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: [0, -0.5, 0],
        userData: {
            isTableBottom: true
        }
    }))

    return (
        <mesh ref={ref} castShadow>

            <boxGeometry
                args={args}
            />
            <meshStandardMaterial color="#000" />

        </mesh>
    )

}

function TableLegs() {

    return (
        <group position={[0, -15, 0]}>
            <mesh castShadow>
                <boxGeometry args={[20, 30, 20]} />
                {/* <BeachBall /> */}
                <meshStandardMaterial color="saddlebrown" />
            </mesh>
            <mesh castShadow position={[0, -15, 0]}>
                <boxGeometry args={[40, 10, 40]} />
                {/* <BeachBall /> */}
                <meshStandardMaterial color="saddlebrown" />
            </mesh>
        </group>
    )

}

function Dartboard() {
    return (
        <group position={[-80, 20, 150]}>

            <Image
                url={`${process.env.NEXT_PUBLIC_CDN}games/8 Ball Pool/Dartboard Graphic.svg`}
                scale={25}
                rotation={[0, Math.PI / 1, 0]}
                position={[0, 0, -0.1]}
                transparent={true}
            />

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

function Balls() {

    const spacing = 1.15

    return (
        <group>

            {/* Row 1 */}
            <Ball
                position={[0, 10, -20]}
                ball={1}
            />

            {/* Row 2 */}
            <Ball
                position={[1.15, 10, -21.75]}
                ball={9}
            />
            <Ball
                position={[-1.15, 10, -21.75]}
                ball={2}
            />

            {/* Row 3 */}
            <Ball
                position={[2.25, 10, -23.5]}
                ball={10}
            />
            <Ball
                position={[0, 10, -23.5]}
                ball={8}
            />
            <Ball
                position={[-2.25, 10, -23.5]}
                ball={3}
            />

            {/* Row 4 */}
            <Ball
                position={[3.15, 10, -25.35]}
                ball={11}
            />
            <Ball
                position={[1.15, 10, -25.35]}
                ball={7}
            />
            <Ball
                position={[-1.15, 10, -25.35]}
                ball={14}
            />
            <Ball
                position={[-3.15, 10, -25.35]}
                ball={4}
            />

            {/* Row 5 */}
            <Ball
                position={[4.5, 10, -27.25]}
                ball={5}
            />
            <Ball
                position={[2.25, 10, -27.25]}
                ball={13}
            />
            <Ball
                position={[0, 10, -27.25]}
                ball={15}
            />
            <Ball
                position={[-2.25, 10, -27.25]}
                ball={6}
            />
            <Ball
                position={[-4.5, 10, -27.25]}
                ball={12}
            />

        </group>
    )

}

function getBallColor(ball) {
    const colors = {
        1: "yellow",
        2: "blue",
        3: "red",
        4: "purple",
        5: "orange",
        6: "green",
        7: "maroon",
        8: "black",
        9: "yellow", // Stripe starts here, logic for stripes can be added
        10: "blue",
        11: "red",
        12: "purple",
        13: "orange",
        14: "green",
        15: "maroon",
    };

    return colors[ball] || "white"; // Default to white if the ball number is invalid
}

function Ball({ position, ball }) {

    const [isVisible, setIsVisible] = useState(true); // Track visibility

    const [ref, api] = useSphere(() => ({
        mass: 1,
        // type: 'Dynamic',
        args: [1, 1, 1],
        position: position,
        onCollide: (e) => {
            if (e?.body?.userData?.isTableBottom) {
                console.log("Ball hit table bottom")

                // Disable physics
                // Out of sight, out of mind! lol - not sure if this is best way but any computer or phone can handle this so why not!
                api.mass.set(0);
                api.velocity.set(0, 0, 0);
                api.angularVelocity.set(0, 0, 0);
                api.position.set(0, -100, 0);

                // Hide the ball
                setIsVisible(false);
            }
        }
    }))

    const color = getBallColor(ball);

    if (!isVisible) return null;

    return (
        <group>

            <mesh castShadow ref={ref}>

                <sphereGeometry args={[1, 10, 10]} />
                <meshStandardMaterial color={color} />

                {ball > 8 && <group>
                    <mesh
                        castShadow
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, 0, -0.2]}
                    >
                        <cylinderGeometry
                            args={[1.00, 1.00, 0.2]}
                        />
                        <meshStandardMaterial color="white" />
                    </mesh>

                    <mesh
                        castShadow
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, 0, 0.2]}
                    >
                        <cylinderGeometry
                            args={[1.00, 1.00, 0.2]}
                        />
                        <meshStandardMaterial color="white" />
                    </mesh>
                </group>}

            </mesh>

        </group>
    )

}