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

// import Peer from 'peerjs';
import PeerLogic from "./PeerLogic";
import { useSearchParams } from "next/navigation";

export default function LeftPanelContent(props) {

    let searchParams = useSearchParams()
    let searchParamsObject = Object.fromEntries(searchParams.entries());

    const {
        server,
        // players,
        // touchControlsEnabled,
        // setTouchControlsEnabled,
        reloadScene,
        controllerState,
        isFullscreen,
        requestFullscreen,
        exitFullscreen,
        setShowMenu
    } = props;

    // const {
    //     socket,
    // } = useSocketStore(state => ({
    //     socket: state.socket,
    // }));

    const cueRotation = useEightBallStore(state => state.cueRotation);
    const setCueRotation = useEightBallStore(state => state.setCueRotation);
    const cuePower = useEightBallStore(state => state.cuePower);
    const setCuePower = useEightBallStore(state => state.setCuePower);
    const debug = useEightBallStore(state => state.debug);
    const setDebug = useEightBallStore(state => state.setDebug);
    const ballPositions = useEightBallStore(state => state.ballPositions);

    const touchControls = useEightBallStore(state => state.touchControls);
    const setTouchControls = useEightBallStore(state => state.setTouchControls);

    const resetPeer = useEightBallStore(state => state.resetPeer);
    const setResetPeer = useEightBallStore(state => state.setResetPeer);

    const setBallPositionsUpdated = useEightBallStore(state => state.setBallPositionsUpdated);

    useEffect(() => {
        setResetPeer(false);
    }, [resetPeer]);

    const cueRotationRef = useRef(cueRotation);
    useEffect(() => {
        cueRotationRef.current = cueRotation;
    }, [cueRotation]);

    useHotkeys(['Left'], () => {
        console.log("test", cueRotationRef.current)
        if (cueRotationRef.current >= 360) {
            setCueRotation(0)
            return
        }
        setCueRotation(cueRotationRef.current + 1)
    });
    useHotkeys(['Right'], () => {
        console.log("test", cueRotationRef.current)
        if (cueRotationRef.current <= 0) {
            setCueRotation(360)
            return
        }
        setCueRotation(cueRotationRef.current - 1)
    });

    const cuePowerRef = useRef(cuePower);
    useEffect(() => {
        cuePowerRef.current = cuePower;
    }, [cuePower]);

    useHotkeys(['Up'], () => {
        // console.log("test", cuePowerRef.current)
        if (cuePowerRef.current >= 100) {
            return
        }
        setCuePower(cuePowerRef.current + 1)
    });
    useHotkeys(['Down'], () => {
        // console.log("test", cuePowerRef.current)
        if (cuePowerRef.current <= 0) {
            return
        }
        setCuePower(cuePowerRef.current - 1)
    });

    useHotkeys(['Enter'], () => {
        console.log("Launch?")
    });

    const [connected, setConnected] = useState(false)
    const connectionRef = useRef(null);
    const [peerToConnect, setPeerToConnect] = useState('')

    function connectToPeer(id) {

        if (!peer) {
            console.error('Peer not initialized yet!');
            return;
        }

        console.log(`Attempting peer connection to ${id}`);
        const connection = peer.connect(id);

        connection.on('open', () => {
            console.log(`Connection to ${id} established.`);
            // setConn(connection); // Save the connection after it's open
            connectionRef.current = connection;
            connectionRef.current.send({
                type: "Connection",
                date: new Date,
                peerId: peerRef?.current?._id
            });
            setConnected(true)

            connectionRef.current.on('data', function (data) {
                console.log('Received', data);
            });

        });

        connection.on('data', (data) => {
            console.log('Received data:', data); // Handle incoming data
        });

        connection.on('error', (err) => {
            console.error('Connection error:', err);
        });
    }

    function sendMessage() {
        console.log("Test")

        let data = {
            type: "Message",
            date: new Date(),
            peerId: peerRef?.current?._id,
            message: 'Test'
        }

        connectionRef.current.send({
            ...data
        });

        // setMessages([
        //     ...messages,
        //     {
        //         ...data
        //     }
        // ])

        // setMessage('')
    }

    // const [peer, setPeer] = useState(null);

    // const peerRef = useRef(null);

    // useEffect(() => {
    //     if (peerRef.current) return; // Prevent double initialization in StrictMode

    //     const newPeer = new Peer();
    //     setPeer(newPeer);
    //     peerRef.current = newPeer;

    //     newPeer.on('open', (id) => {
    //         console.log(`Peer ID: ${id}`);

    //         // if (isHost) {
    //         //     console.log('Hosting session...');
    //         // } else {
    //         //     console.log('Connecting to host...');
    //         //     const conn = newPeer.connect('host-peer-id'); // Replace with the host's peer ID
    //         //     conn.on('open', () => {
    //         //         console.log('Connected to host');
    //         //         conn.on('data', (data) => {
    //         //             setBallsPositions(data);
    //         //         });
    //         //     });
    //         // }

    //     });

    //     newPeer.on('connection', (conn) => {
    //         console.log('New connection:', conn.peer);
    //         // setConnections((prev) => [...prev, conn]);

    //         // conn.on('data', (data) => {
    //         //     console.log('Received data:', data);
    //         //     setBallsPositions(data);
    //         // });
    //     });

    //     return () => {
    //         newPeer.destroy();
    //     };
    // }, []);

    const [showBallPositions, setShowBallPositions] = useState(false);

    return (
        <div className='w-100'>

            <div className="card card-articles card-sm">

                <div className="card-body">

                    {/* <div className='flex-header'>
                        <div>Server: {server}</div>
                        <div>Players: {0}/4</div>
                    </div> */}

                    {/* {!socket?.connected &&
                        <div
                            className=""
                        >

                            <div className="">

                                <div className="h6 mb-1">Not connected</div>

                                <ArticlesButton
                                    onClick={() => {
                                        console.log("Reconnect")
                                        socket.connect()
                                    }}
                                >
                                    Reconnect!
                                </ArticlesButton>

                            </div>

                        </div>
                    } */}

                    <Link
                        href={'/'}
                        className=""
                    >
                        <ArticlesButton
                            className='w-50'
                            small
                        >
                            <i className="fad fa-arrow-alt-square-left"></i>
                            <span>Leave Game</span>
                        </ArticlesButton>
                    </Link>

                    <ArticlesButton
                        small
                        className="w-50"
                        active={isFullscreen}
                        onClick={() => {
                            if (isFullscreen) {
                                exitFullscreen()
                            } else {
                                requestFullscreen('amcot-pool-game-page')
                            }
                        }}
                    >
                        {isFullscreen && <span>Exit </span>}
                        {!isFullscreen && <span><i className='fad fa-expand'></i></span>}
                        <span>Fullscreen</span>
                    </ArticlesButton>

                </div>
            </div>

            {/* <div
                className="card card-articles card-sm"
            >
                <div className="card-body d-flex justify-content-between">

                    <div>
                        <div className="small text-muted">playerData</div>
                        <div className="small">
                            <div>X: {playerLocation?.x}</div>
                            <div>Y: {playerLocation?.y}</div>
                            <div>Z: {playerLocation?.z}</div>
                            <div>Shift: {shift ? 'True' : 'False'}</div>
                            <div>Score: 0</div>
                        </div>
                    </div>

                    <div>
                        <div className="small text-muted">maxHeight</div>
                        <div>Y: {maxHeight}</div>
                        <ArticlesButton
                            small
                            onClick={() => {
                                setMaxHeight(playerLocation?.y)
                            }}
                        >
                            Reset
                        </ArticlesButton>
                    </div>

                </div>
            </div> */}

            <div
                className="card card-articles card-sm"
            >
                <div className="card-body">

                    <div className="small text-muted">Break to determine side</div>
                    <div className="small text-muted">Stripes turn</div>
                    <div className="small text-muted">Solids turn</div>

                    <div className='d-flex flex-column'>

                    </div>

                </div>
            </div>

            {/* Peer Controls */}
            {searchParamsObject?.game_id &&
                <Suspense>
                    {!resetPeer &&
                        <PeerLogic />
                    }
                </Suspense>
            }

            {/* Touch Controls */}
            <div
                className="card card-articles card-sm"
            >
                <div className="card-body">

                    <div className="small text-muted">Touch Controls</div>

                    <div className='d-flex flex-column'>

                        <div>
                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                active={!touchControls}
                                onClick={() => {
                                    setTouchControls(false)
                                }}
                            >
                                <i className="fad fa-redo"></i>
                                Off
                            </ArticlesButton>

                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                active={touchControls}
                                onClick={() => {
                                    setTouchControls(true)
                                }}
                            >
                                <i className="fad fa-redo"></i>
                                On
                            </ArticlesButton>
                        </div>

                    </div>

                </div>
            </div>

            {/* Debug Controls */}
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
                                onClick={reloadScene}
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

            {controllerState?.connected &&
                <div className="panel-content-group p-0 text-dark">

                    <div className="p-1 border-bottom border-dark">
                        <div className="fw-bold" style={{ fontSize: '0.7rem' }}>
                            {controllerState?.id}
                        </div>
                    </div>

                    <div className='p-1'>
                        <ArticlesButton
                            small
                            className="w-100"
                            active={showControllerState}
                            onClick={() => {
                                setShowControllerState(prev => !prev)
                            }}
                        >
                            {showControllerState ? 'Hide' : 'Show'} Controller Preview
                        </ArticlesButton>
                    </div>

                    {/* {showControllerState && <div className='p-3'>

                        <ControllerPreview
                            controllerState={controllerState}
                            showJSON={true}
                            showVibrationControls={true}
                            maxHeight={300}
                            showPreview={true}
                        />
                    </div>} */}

                </div>
            }

        </div>
    )

}