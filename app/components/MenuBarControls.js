import { useEffect, useRef } from "react";

import ArticlesButton from "@/components/UI/Button";
import { useEightBallStore } from "@/hooks/useEightBallStore";

export default function MenuBarControls() {

    const {
        cueRotation,
        setCueRotation,
        cuePower,
        setCuePower,
        setNudge
    } = useEightBallStore(state => ({
        cueRotation: state.cueRotation,
        setCueRotation: state.setCueRotation,
        cuePower: state.cuePower,
        setCuePower: state.setCuePower,
        setNudge: state.setNudge,
    }));

    const cuePowerRef = useRef(cuePower);
    const cueRotationRef = useRef(cueRotation);

    // Sync refs with the latest state
    useEffect(() => {
        cuePowerRef.current = cuePower;
    }, [cuePower]);

    useEffect(() => {
        cueRotationRef.current = cueRotation;
    }, [cueRotation]);

    return (
        <div>
            <ArticlesButton
                small
                // active={}
                onClick={() => {

                    if (cueRotationRef.current >= 360) {
                        setCueRotation(0)
                        return
                    }
                    setCueRotation(cueRotationRef.current + 1)

                }}
            >
                <i className="fad fa-undo me-0"></i>
            </ArticlesButton>
            <span className="badge bg-black">{cueRotation}</span>
            <ArticlesButton
                small
                // active={}
                onClick={() => {

                    if (cueRotationRef.current <= 0) {
                        setCueRotation(360)
                        return
                    }
                    setCueRotation(cueRotationRef.current - 1)

                }}
            >
                <i className="fad fa-redo me-0"></i>
            </ArticlesButton>
            <ArticlesButton
                small
                // active={}
                onClick={() => {
                    setNudge(true)
                }}
            >
                <i className="fas text-danger fa-fire me-0"></i>
            </ArticlesButton>
            <ArticlesButton
                small
                // active={}
                onClick={() => {
                    if (cuePowerRef.current >= 100) {
                        return
                    }
                    setCuePower(cuePowerRef.current + 1)
                }}
            >
                <i className="fad fa-chevron-double-up me-0"></i>
            </ArticlesButton>
            <span className="badge bg-black">{cuePower}</span>
            <ArticlesButton
                small
                // active={}
                onClick={() => {
                    if (cuePowerRef.current <= 0) {
                        return
                    }
                    setCuePower(cuePowerRef.current - 1)
                }}
            >
                <i className="fad fa-chevron-double-down me-0"></i>
            </ArticlesButton>
        </div>
    )
}