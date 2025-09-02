import { useEffect, useRef, useState } from "react";

import Peer from 'peerjs'

import ArticlesButton from "@/components/UI/Button";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useSearchParams } from "next/navigation";

export default function PeerLogic() {

    let searchParams = useSearchParams()
    let searchParamsObject = Object.fromEntries(searchParams.entries());

    const [connected, setConnected] = useState(false)

    const [peerId, setPeerId] = useState("")
    const [connectionPeerId, setConnectionPeerId] = useState("")

    const connectionRef = useRef(null);
    const peerRef = useRef(null); // Use a ref to store the peer instance

    const ballPositions = useEightBallStore(state => state.ballPositions);
    const setBallPositions = useEightBallStore(state => state.setBallPositions);

    const resetPeer = useEightBallStore(state => state.resetPeer);
    const setResetPeer = useEightBallStore(state => state.setResetPeer);

    // const ballPositionsUpdated = useEightBallStore(state => state.ballPositionsUpdated);
    const setBallPositionsUpdated = useEightBallStore(state => state.setBallPositionsUpdated);

    const isHost = useEightBallStore(state => state.isHost);
    const setIsHost = useEightBallStore(state => state.setIsHost);

    const cuePower = useEightBallStore(state => state.cuePower);
    // const setCuePower = useEightBallStore(state => state.setCuePower);
    const cueRotation = useEightBallStore(state => state.cueRotation);
    // const setCueRotation = useEightBallStore(state => state.setCueRotation);

    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([]);

    // Old
    // const [peerToConnect, setPeerToConnect] = useState('')

    useEffect(() => {

        if (!peerRef.current) {

            console.log("Setting up Peer")

            const newPeer = new Peer(null, { debug: 2 });
            peerRef.current = newPeer;

            newPeer.on('open', (id) => {

                setPeerId(id);
                console.log(`My peer ID is: ${id}`);

                const url = new URL(window.location.href);
                url.searchParams.set('game_id', id);
                window.history.replaceState({}, '', url);
            });

            newPeer.on('connection', function (conn) {
                console.log("A connection was made?")

                conn.on('data', (data) => {

                    console.log('Received data:', data); // Handle incoming data

                    // setBallPositions(prev => {
                    //     const updatedPositions = [...prev];
                    //     updatedPositions[data.ball] = data.position;
                    //     return updatedPositions;
                    // });

                    if (data.type == "Message") {
                        setMessages(prev => [
                            ...prev,
                            {
                                ...data
                            }
                        ])
                    }

                    if (data.type == "Ball Positions") {
                        console.log("Set Ball Positions", data.ballPositions)
                        setBallPositions(data.ballPositions);
                        setBallPositionsUpdated(data.ballPositions);
                    }

                    if (data.type == "Call") {
                        setMessages(prev => [
                            ...prev,
                            {
                                ...data
                            }
                        ])
                    }

                    if (data.type == "Connection") {
                        setConnected(true)
                        console.log("Someone initiated a connection with us!")
                        // Passed direct now
                        // setConnectionPeerId(data.peerId)
                        connectToPeer(data.peerId)
                    }

                });
            });

            newPeer.on('call', call => {
                console.log("Call incoming")
                call.answer(); // Auto-answer with no media (you can prompt user)
                call.on('stream', stream => {
                    // videoRefPeer(stream);
                    if (videoRefPeer.current) {
                        videoRefPeer.current.srcObject = stream;
                    }
                });
            });

            newPeer.on('disconnected', (data) => {
                console.log('Disconnected data:', data); // Handle incoming data
            });

            peerRef.current = newPeer;
        }

        return () => {
            if (peerRef.current) {
                peerRef.current.disconnect();
                peerRef.current.destroy();
                peerRef.current = null;
            }
        };

    }, []);

    useEffect(() => {

        console.log("My peerId changed", peerId)

    }, [peerId]);

    useEffect(() => {

        if (searchParamsObject.game_id == peerId) {

            console.log("PeerId is equal to the game_id so I must be the host")
            setIsHost(true)

        }

    }, [peerId, searchParams]);

    function connectToPeer(id) {

        if (!peerRef.current) {
            console.error('Peer not initialized yet!');
            return;
        }

        console.log(`Attempting peer connection to ${id}`);
        const connection = peerRef.current.connect(id);

        connection.on('open', () => {
            console.log(`Connection to ${id} established.`);
            // setConn(connection); // Save the connection after it's open
            connectionRef.current = connection;
            connectionRef.current.send({
                type: "Connection",
                date: new Date,
                peerId
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

        connection.on('close', () => {
            console.log(`Peer ${id} disconnected from you.`);
            setConnected(false);
        });
    }

    function sendMessage() {
        console.log("Test")

        // let data = {
        //     type: "Message",
        //     date: new Date(),
        //     peerId,
        //     message: ballPositions
        // }

        let data = {
            type: "Ball Positions",
            date: new Date(),
            peerId,
            ballPositions: ballPositions,
            cuePower,
            cueRotation
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

    useEffect(() => {
        let fastIntervalId;
        let slowIntervalId;

        console.log("Test", isHost)

        // Fast interval: 30 times per second
        if (isHost) {
            fastIntervalId = setInterval(() => {

                let ballPositions = useEightBallStore.getState().ballPositions;
                let cuePower = useEightBallStore.getState().cuePower;
                let cueRotation = useEightBallStore.getState().cueRotation;

                if (connectionRef.current) {
                    let data = {
                        type: "Ball Positions",
                        date: new Date(),
                        peerId,
                        ballPositions: ballPositions,
                        cuePower,
                        cueRotation
                    };
                    connectionRef.current.send({ ...data });
                }
            }, 1000 / 5); // 5 times per second

            // Slow interval: once per second
            slowIntervalId = setInterval(() => {
                console.log("Sending Ball Positions (logged every second)...");
            }, 1000);
        }

        return () => {
            if (fastIntervalId) clearInterval(fastIntervalId);
            if (slowIntervalId) clearInterval(slowIntervalId);
        };

    }, [isHost, peerId]);

    return (
        <div
            className="card card-articles card-sm"
        >
            <div className="card-body">

                <div className="small text-muted">Session Controls</div>

                <div className='d-flex flex-column'>

                    <div
                        style={{
                            fontSize: '0.7rem!important',
                        }}
                        onClick={() => {
                            console.log("peerId", peerId)
                            console.log("peer", peerRef.current)
                            console.log("connectionRef.current", connectionRef.current)
                        }}
                    >
                        {peerId ? peerId : "None"}
                    </div>

                    <input
                        autoComplete='off'
                        // id={item_key}
                        type="text"
                        className='text-center w-100'
                        // autoFocus={autoFocus && true}
                        // onBlur={onBlur}
                        // placeholder={placeholder}
                        value={connectionPeerId}
                        style={{
                            fontSize: '0.7rem!important'
                        }}
                        // onKeyDown={onKeyDown}
                        onChange={(e) => {
                            setConnectionPeerId(e.target.value)
                        }}
                    />

                    <div>

                        {!connected ?
                            <ArticlesButton
                                size="sm"
                                className="w-100"
                                active={false}
                                onClick={() => {
                                    // console.log('Connecting to host...');
                                    // const conn = newPeer.connect('host-peer-id'); // Replace with the host's peer ID
                                    // conn.on('open', () => {
                                    //     console.log('Connected to host');
                                    //     conn.on('data', (data) => {
                                    //         setBallsPositions(data);
                                    //     });
                                    // });

                                    connectToPeer(connectionPeerId)
                                }}
                            >
                                <i className="fad fa-redo"></i>
                                Connect
                            </ArticlesButton>
                            :
                            <ArticlesButton
                                size="sm"
                                className="w-100"
                                active={false}
                                onClick={() => {
                                    console.log("Disconnecting peer")
                                    // setTouchControlsEnabled(true)
                                    // peerRef.current.disconnect();
                                    peerRef.current.disconnect();
                                    peerRef.current.destroy();
                                    peerRef.current = null;
                                    setConnected(false)
                                    // setConnectionPeerId("")
                                    setPeerId(false)
                                    setResetPeer(true)
                                }}
                            >
                                <i className="fad fa-redo"></i>
                                Disconnect
                            </ArticlesButton>
                        }

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            active={false}
                            onClick={() => {
                                sendMessage()
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            Test Message
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            active={false}
                            onClick={() => {
                                setIsHost(!isHost)
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            Host: {isHost ? 'True' : 'False'}
                        </ArticlesButton>

                    </div>

                </div>

            </div>
        </div>
    )
}
