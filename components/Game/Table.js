import { useBox } from "@react-three/cannon"

export function Table() {

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

export function TableBottom() {

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

export function TableLegs() {

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