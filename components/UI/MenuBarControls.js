import { useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import classNames from "classnames";

import ArticlesButton from "@/components/UI/Button";
import { useEightBallStore } from "@/hooks/useEightBallStore";

export default function MenuBarControls() {

    let searchParams = useSearchParams()
    let searchParamsObject = Object.fromEntries(searchParams.entries());
    let { game_id } = searchParamsObject;

    const peerId = useEightBallStore(state => state.peerId);
    const currentTurn = useEightBallStore(state => state.currentTurn);

    const disableAimingTools = useMemo(() => {

        if (!game_id) {
            return false;
        } else {
            return peerId !== currentTurn;
        }

    }, [game_id, peerId, currentTurn])

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

            if (disableAimingTools) return;

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

            if (disableAimingTools) return;

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
            // Block context menu when the event target is inside .floating-controls
            const target = e.target;
            if (target && typeof target.closest === 'function') {
                if (target.closest('.floating-controls')) {
                    // prevent the right-click menu from appearing inside floating controls
                    e.preventDefault();
                    return;
                }
                // optional: explicitly block elements with a specific attribute too
                if (target.closest('[data-block-context]')) {
                    e.preventDefault();
                    return;
                }
            }
            // allow default context menu elsewhere
        }

        // attach the event listener to the document object
        document.addEventListener("contextmenu", handleContextMenu)

        // clean up the event listener when the component unmounts
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
                            className={classNames("floating-button rotation-left", { "disabled": disableAimingTools })}
                            onMouseDown={increaseRotationHandlers.startRotation}
                            onMouseUp={increaseRotationHandlers.stopRotation}
                            onTouchStart={increaseRotationHandlers.startRotation}
                            onTouchEnd={increaseRotationHandlers.stopRotation}
                        >
                            <i className="fad fa-undo me-0"></i>
                        </div>

                        <div
                            className={classNames("floating-button rotation-right", { "disabled": disableAimingTools })}
                            onMouseDown={decreaseRotationHandlers.startRotation}
                            onMouseUp={decreaseRotationHandlers.stopRotation}
                            onTouchStart={decreaseRotationHandlers.startRotation}
                            onTouchEnd={decreaseRotationHandlers.stopRotation}
                        >
                            <i className="fad fa-redo me-0"></i>
                        </div>
                    </div>

                    <div
                        className={classNames("floating-button launch", { "disabled": disableAimingTools })}
                        onClick={() => {
                            if (disableAimingTools) return;
                            console.log("Launch")
                            setNudge(true)
                        }}
                    >
                        <i className="fas text-danger fa-fire fa-2x me-0"></i>
                    </div>

                    <div
                        className={classNames("floating-button increase-power", { "disabled": disableAimingTools })}
                        onMouseDown={increasePowerHandlers.startPowerChange}
                        onMouseUp={increasePowerHandlers.stopPowerChange}
                        onTouchStart={increasePowerHandlers.startPowerChange}
                        onTouchEnd={increasePowerHandlers.stopPowerChange}
                    >
                        <i className="fad fa-chevron-double-up me-0"></i>
                    </div>

                    <div
                        className={classNames("floating-button decrease-power", { "disabled": disableAimingTools })}
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
                    disabled={disableAimingTools}
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
                    disabled={disableAimingTools}
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
                    disabled={disableAimingTools}
                    // active={}
                    onClick={() => {
                        setNudge(true)
                    }}
                >
                    <i className="fas text-danger fa-fire me-0"></i>
                </ArticlesButton>
                <ArticlesButton
                    small
                    disabled={disableAimingTools}
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
                    disabled={disableAimingTools}
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