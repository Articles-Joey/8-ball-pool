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
import { useStore } from "@/hooks/useStore";
import DebugPanel from "./UI/DebugPanel";

import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';

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

    const darkMode = useStore(state => state.darkMode);
    const setDarkMode = useStore(state => state.setDarkMode);
    // const theme = useEightBallStore(state => state.theme);
    // const setTheme = useEightBallStore(state => state.setTheme);

    const setBallPositionsUpdated = useEightBallStore(state => state.setBallPositionsUpdated);
    const setResetCameraRequest = useEightBallStore(state => state.setResetCameraRequest);

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

    const showSidebar = useEightBallStore(state => state.showSidebar);
    const setShowSidebar = useEightBallStore(state => state.setShowSidebar);

    return (
        <div
        // className=''
        >

            <div
                className="card card-articles card-sm"
                onClick={(e) => {

                }}
            >

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

                    <div className="d-flex flex-wrap">

                        <GameMenuPrimaryButtonGroup 
                        useStore={useStore}
                        type="GameMenu"
                    />

                    </div>

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

            {/* Debug Controls */}
            {debug &&
                <DebugPanel />
            }

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