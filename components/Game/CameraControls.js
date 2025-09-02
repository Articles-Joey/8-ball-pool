import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from "@react-three/fiber"

import { OrbitControls, } from "@react-three/drei";
import { useEightBallStore } from '@/hooks/useEightBallStore';

const CameraControls = (props) => {

    // const { onCameraChange, cameraUpdate, setCameraUpdate } = props;
    const resetCameraRequest = useEightBallStore(state => state.resetCameraRequest);
    const setResetCameraRequest = useEightBallStore(state => state.setResetCameraRequest);

    const {
        camera,
        gl: { domElement },
    } = useThree();

    const controls = useRef();

    useFrame(() => {
        // controls.current.update()
        // console.log(camera)
        // onCameraChange(camera)
    });

    useEffect(() => {
        console.log("New resetCameraRequest", resetCameraRequest)
        if (camera.position) {
            camera.position.set(
                -60, 80, 0
            );
            camera.rotation.set(-Math.PI / 4, -Math.PI / 2, 0);
            if (controls.current) {
                controls.current.target.set(0, 0, 0);
                controls.current.update();
            }
            // You might also want to update other camera properties like rotation, etc.
        }
        setResetCameraRequest(false)
    }, [resetCameraRequest])

    return (
        <OrbitControls
            ref={controls}
            args={[camera, domElement]}
            target={[0, 0, 0]}
        />
    );

};

export default CameraControls