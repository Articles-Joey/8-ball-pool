import { useEffect, useRef } from "react";

import ArticlesButton from "@/components/UI/Button";
import { useEightBallStore } from "@/hooks/useEightBallStore";

export default function MenuBarControls() {

    const cueRotation = useEightBallStore(state => state.cueRotation);
    const setCueRotation = useEightBallStore(state => state.setCueRotation);
    const cuePower = useEightBallStore(state => state.cuePower);
    const setCuePower = useEightBallStore(state => state.setCuePower);
    const setNudge = useEightBallStore(state => state.setNudge);
    const touchControls = useEightBallStore(state => state.touchControls);
    // const touchControlsEnabled = useEightBallStore(state => state.touchControlsEnabled);

    const cuePowerRef = useRef(cuePower);
    const cueRotationRef = useRef(cueRotation);

    // Sync refs with the latest state
    useEffect(() => {
        cuePowerRef.current = cuePower;
    }, [cuePower]);

    useEffect(() => {
        cueRotationRef.current = cueRotation;
    }, [cueRotation]);

    const useHandleCueRotationChange = (direction) => {
        const intervalRef = useRef(null);

        const startRotation = () => {
            intervalRef.current = setInterval(() => {
                if (direction === "increase") {
                    if (cueRotationRef.current >= 360) {
                        setCueRotation(0);
                    } else {
                        setCueRotation(cueRotationRef.current + 1);
                    }
                } else {
                    if (cueRotationRef.current <= 0) {
                        setCueRotation(360);
                    } else {
                        setCueRotation(cueRotationRef.current - 1);
                    }
                }
            }, 100); // Adjust interval as needed
        };

        const stopRotation = () => {
            clearInterval(intervalRef.current);
        };

        return { startRotation, stopRotation };
    };

    const increaseRotationHandlers = useHandleCueRotationChange("increase");
    const decreaseRotationHandlers = useHandleCueRotationChange("decrease");

    const useHandleCuePowerChange = (direction) => {
        const intervalRef = useRef(null);

        const startPowerChange = () => {
            intervalRef.current = setInterval(() => {
                if (direction === "increase") {
                    if (cuePowerRef.current < 100) {
                        setCuePower(cuePowerRef.current + 1);
                    }
                } else {
                    if (cuePowerRef.current > 0) {
                        setCuePower(cuePowerRef.current - 1);
                    }
                }
            }, 100); // Adjust interval as needed
        };

        const stopPowerChange = () => {
            clearInterval(intervalRef.current);
        };

        return { startPowerChange, stopPowerChange };
    };

    const increasePowerHandlers = useHandleCuePowerChange("increase");
    const decreasePowerHandlers = useHandleCuePowerChange("decrease");

    useEffect(() => {
        // define a custom handler function
        // for the contextmenu event
        const handleContextMenu = (e) => {
            // prevent the right-click menu from appearing
            e.preventDefault()
        }

        // attach the event listener to 
        // the document object
        document.addEventListener("contextmenu", handleContextMenu)

        // clean up the event listener when 
        // the component unmounts
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu)
        }
    }, [])

    return (
        <div>

            {touchControls &&
                <div className="floating-controls">

                    <div className="rotation">
                        <div
                            className="floating-button rotation-left"
                            onMouseDown={increaseRotationHandlers.startRotation}
                            onMouseUp={increaseRotationHandlers.stopRotation}
                            onTouchStart={increaseRotationHandlers.startRotation}
                            onTouchEnd={increaseRotationHandlers.stopRotation}
                        >
                            <i className="fad fa-undo me-0"></i>
                        </div>

                        <div
                            className="floating-button rotation-right"
                            onMouseDown={decreaseRotationHandlers.startRotation}
                            onMouseUp={decreaseRotationHandlers.stopRotation}
                            onTouchStart={decreaseRotationHandlers.startRotation}
                            onTouchEnd={decreaseRotationHandlers.stopRotation}
                        >
                            <i className="fad fa-redo me-0"></i>
                        </div>
                    </div>

                    <div
                        className="floating-button launch"
                        onClick={() => {
                            setNudge(true)
                        }}
                    >
                        <i className="fas text-danger fa-fire fa-2x me-0"></i>
                    </div>

                    <div
                        className="floating-button increase-power"
                        onMouseDown={increasePowerHandlers.startPowerChange}
                        onMouseUp={increasePowerHandlers.stopPowerChange}
                        onTouchStart={increasePowerHandlers.startPowerChange}
                        onTouchEnd={increasePowerHandlers.stopPowerChange}
                    >
                        <i className="fad fa-chevron-double-up me-0"></i>
                    </div>

                    <div
                        className="floating-button decrease-power"
                        onMouseDown={decreasePowerHandlers.startPowerChange}
                        onMouseUp={decreasePowerHandlers.stopPowerChange}
                        onTouchStart={decreasePowerHandlers.startPowerChange}
                        onTouchEnd={decreasePowerHandlers.stopPowerChange}
                    >
                        <i className="fad fa-chevron-double-down me-0"></i>
                    </div>

                </div>
            }

            <div>
                <ArticlesButton
                    small
                    onMouseDown={increaseRotationHandlers.startRotation}
                    onMouseUp={increaseRotationHandlers.stopRotation}
                    onTouchStart={increaseRotationHandlers.startRotation}
                    onTouchEnd={increaseRotationHandlers.stopRotation}
                    style={{
                        contextMenuOnRightClick: "none",
                        userSelect: "none",
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <i className="fad fa-undo me-0"></i>
                </ArticlesButton>
                <span className="badge bg-black">{cueRotation}</span>
                <ArticlesButton
                    small
                    onMouseDown={decreaseRotationHandlers.startRotation}
                    onMouseUp={decreaseRotationHandlers.stopRotation}
                    onTouchStart={decreaseRotationHandlers.startRotation}
                    onTouchEnd={decreaseRotationHandlers.stopRotation}
                    style={{
                        contextMenuOnRightClick: "none",
                        userSelect: "none",
                    }}
                    onContextMenu={(e) => e.preventDefault()}
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
                    onMouseDown={increasePowerHandlers.startPowerChange}
                    onMouseUp={increasePowerHandlers.stopPowerChange}
                    onTouchStart={increasePowerHandlers.startPowerChange}
                    onTouchEnd={increasePowerHandlers.stopPowerChange}
                >
                    <i className="fad fa-chevron-double-up me-0"></i>
                </ArticlesButton>
                <span className="badge bg-black">{cuePower}</span>
                <ArticlesButton
                    small
                    // active={}
                    onMouseDown={decreasePowerHandlers.startPowerChange}
                    onMouseUp={decreasePowerHandlers.stopPowerChange}
                    onTouchStart={decreasePowerHandlers.startPowerChange}
                    onTouchEnd={decreasePowerHandlers.stopPowerChange}
                >
                    <i className="fad fa-chevron-double-down me-0"></i>
                </ArticlesButton>
            </div>

        </div>
    )
}