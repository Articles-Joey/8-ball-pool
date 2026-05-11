import Link from "next/link";

// import ROUTES from '@/components/constants/routes';
// import { useGameStore } from "../hooks/useGameStore";
import ArticlesButton from "@/components/UI/Button";

// import ControllerPreview from "../../ControllerPreview";

// import { useSocketStore } from "@/hooks/useSocketStore";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useHotkeys } from "react-hotkeys-hook";
import { Suspense, useEffect, useRef, useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";


import { useSearchParams } from "next/navigation";
import { useStore } from "@/hooks/useStore";

export default function DebugPanel(props) {

    let searchParams = useSearchParams()
    let searchParamsObject = Object.fromEntries(searchParams.entries());

    const reloadScene = useStore(state => state.reloadScene);

    const cueRotation = useEightBallStore(state => state.cueRotation);
    const setCueRotation = useEightBallStore(state => state.setCueRotation);
    const cuePower = useEightBallStore(state => state.cuePower);
    const setCuePower = useEightBallStore(state => state.setCuePower);
    const debug = useEightBallStore(state => state.debug);
    const setDebug = useEightBallStore(state => state.setDebug);
    const ballPositions = useEightBallStore(state => state.ballPositions)

    const setBallPositionsUpdated = useEightBallStore(state => state.setBallPositionsUpdated);
    const setResetCameraRequest = useEightBallStore(state => state.setResetCameraRequest);

    const [showBallPositions, setShowBallPositions] = useState(false);

    return (
        <div
            className="card card-articles card-sm"
        >
            <div className="card-body">

                <div className="small text-muted">Debug Controls</div>

                <div className="small border p-2">
                    <div>Rotation Angle: {cueRotation}</div>
                    <div>Power: {cuePower}/100</div>
                    {/* <div>Ball Positions: {JSON.stringify(ballPositions)}</div> */}
                </div>

                <div className='d-flex flex-column'>

                    <div>
                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={reloadScene}
                        >
                            <i className="fad fa-redo"></i>
                            Reload Game
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => setResetCameraRequest(true)}
                        >
                            <i className="fad fa-redo"></i>
                            Reset Camera
                        </ArticlesButton>
                    </div>

                    <div className='d-flex'>
                        <div className='w-50'>
                            <DropdownButton
                                variant="articles w-100"
                                size='sm'
                                id="dropdown-basic-button"
                                className="dropdown-articles"
                                title={
                                    <span>
                                        <i className="fad fa-bug"></i>
                                        <span>Debug </span>
                                        <span>{debug ? 'On' : 'Off'}</span>
                                    </span>
                                }
                            >

                                <div style={{ maxHeight: '600px', overflowY: 'auto', width: '200px' }}>

                                    {[
                                        false,
                                        true
                                    ]
                                        .map(location =>
                                            <Dropdown.Item
                                                key={location}
                                                onClick={() => {
                                                    setDebug(location)
                                                }}
                                                className="d-flex justify-content-between"
                                            >
                                                {location ? 'True' : 'False'}
                                            </Dropdown.Item>
                                        )}

                                </div>

                            </DropdownButton>
                        </div>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => {
                                console.log("Ball Positions:", ballPositions);
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            Log Balls
                        </ArticlesButton>
                    </div>

                    <div>
                        <ArticlesButton
                            size="sm"
                            className="w-100 mt-3"
                            onClick={() => {
                                setBallPositionsUpdated(
                                    [
                                        // {
                                        //     "ball": 1,
                                        //     "position": [
                                        //         0,
                                        //         10,
                                        //         -20
                                        //     ]
                                        // },
                                        {
                                            "ball": 1,
                                            "position": [
                                                -8.247533640255673,
                                                1.249927615551298,
                                                -23.47405745980015
                                            ]
                                        },
                                        {
                                            "ball": 2,
                                            "position": [
                                                -15.452261018758763,
                                                1.249927615551298,
                                                -10.905968345373855
                                            ]
                                        },
                                        {
                                            "ball": 3,
                                            "position": [
                                                -5.023284032582997,
                                                1.249927615551298,
                                                -27.240293678273577
                                            ]
                                        },
                                        {
                                            "ball": 4,
                                            "position": [
                                                -15.047775089667894,
                                                1.249927615551298,
                                                -24.988772356025503
                                            ]
                                        },
                                        {
                                            "ball": 5,
                                            "position": [
                                                7.172554509721704,
                                                1.249927615551298,
                                                -36.930368951579794
                                            ]
                                        },
                                        {
                                            "ball": 6,
                                            "position": [
                                                -2.637840178526253,
                                                1.249927615551298,
                                                -39.25150371230237
                                            ]
                                        },
                                        {
                                            "ball": 7,
                                            "position": [
                                                8.000845729860547,
                                                1.249927615551298,
                                                -27.43953743600558
                                            ]
                                        },
                                        {
                                            "ball": 8,
                                            "position": [
                                                2.0942256802964323,
                                                1.249927615551298,
                                                -24.707135693317415
                                            ]
                                        },
                                        {
                                            "ball": 9,
                                            "position": [
                                                18.208209054461225,
                                                1.249927615551298,
                                                -14.26495565137875
                                            ]
                                        },
                                        {
                                            "ball": 10,
                                            "position": [
                                                3.113617960652882,
                                                1.249927615551298,
                                                -31.278087801697602
                                            ]
                                        },
                                        {
                                            "ball": 11,
                                            "position": [
                                                12.641818571488063,
                                                1.249927615551298,
                                                -25.802180798722873
                                            ]
                                        },
                                        {
                                            "ball": 12,
                                            "position": [
                                                -7.898695648627498,
                                                1.249927615551298,
                                                -38.960753353375125
                                            ]
                                        },
                                        {
                                            "ball": 13,
                                            "position": [
                                                2.1882009336459034,
                                                1.249927615551298,
                                                -38.36133603719746
                                            ]
                                        },
                                        {
                                            "ball": 14,
                                            "position": [
                                                -9.783205496927106,
                                                1.249927615551298,
                                                -27.18107636958629
                                            ]
                                        },
                                        {
                                            "ball": 15,
                                            "position": [
                                                0.10354160397452415,
                                                1.249927615551298,
                                                -29.265224367762528
                                            ]
                                        }
                                    ]
                                )
                            }}
                            active={showBallPositions ? true : false}
                        >
                            Fake Positions
                        </ArticlesButton>
                    </div>

                    <div>
                        <ArticlesButton
                            size="sm"
                            className="w-100 mt-3"
                            onClick={() => showBallPositions ? setShowBallPositions(false) : setShowBallPositions(true)}
                            active={showBallPositions ? true : false}
                        >
                            <i className="fad fa-bug"></i>
                            {showBallPositions ? "Ball Debug" : "Ball Debug"}
                        </ArticlesButton>
                    </div>

                    {showBallPositions && (
                        <div
                            className='small border p-2'
                            style={{
                                height: '200px',
                                overflowY: 'auto'
                            }}
                        >
                            {ballPositions.map((pos, index) => (
                                <div key={index}>
                                    Ball {pos.ball}: {JSON.stringify(pos.position)}
                                </div>
                            ))}
                        </div>
                    )}

                </div>

            </div>
        </div>
    )
}