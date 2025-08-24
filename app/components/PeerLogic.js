import { useEffect, useRef, useState } from "react";

import Peer from 'peerjs'

import ArticlesButton from "@/components/UI/Button";
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useSearchParams } from "next/navigation";

export default function PeerLogic() {

    let searchParams = useSearchParams()
    let searchParamsObject = Object.fromEntries(searchParams.entries());

    const [connected, setConnected] = useState(false)

    const [peer, setPeer] = useState(null)

    const [peerId, setPeerId] = useState("")
    const [connectionPeerId, setConnectionPeerId] = useState("")

    const connectionRef = useRef(null);

    const ballPositions = useEightBallStore(state => state.ballPositions);

    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([]);

    // Old
    // const [peerToConnect, setPeerToConnect] = useState('')

    useEffect(() => {

        if (!peer) {

            console.log("Setting peer")

            setPeer(
                new Peer(null, { debug: 2 })
            )

        }

    }, []);

    useEffect(() => {

        if (peer && searchParamsObject.game_id) {

            peer.on('open', (id) => {
                setPeerId(id);
                console.log(`My peer ID is: ${id}`);

                const url = new URL(window.location.href);
                url.searchParams.set('game_id', id);
                window.history.replaceState({}, '', url);
            });

            peer.on('connection', function (conn) {
                console.log("A connection was made?")

                conn.on('data', (data) => {

                    console.log('Received data:', data); // Handle incoming data

                    if (data.type == "Message") {
                        setMessages(prev => [
                            ...prev,
                            {
                                ...data
                            }
                        ])
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

            peer.on('call', call => {
                console.log("Call incoming")
                call.answer(); // Auto-answer with no media (you can prompt user)
                call.on('stream', stream => {
                    // videoRefPeer(stream);
                    if (videoRefPeer.current) {
                        videoRefPeer.current.srcObject = stream;
                    }
                });
            });

            peer.on('disconnected', (data) => {
                console.log('Disconnected data:', data); // Handle incoming data
            });

            // peer.on('data', (data) => {
            //     console.log('Received data:', data); // Handle incoming data
            // });
        }

        return () => {
            if (peer) {
                peer.disconnect();
                peer.destroy();
            }
        };

    }, [peer, searchParams])

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
    }

    function sendMessage() {
        console.log("Test")

        let data = {
            type: "Message",
            date: new Date(),
            peerId,
            message: ballPositions
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
                    >
                        {peerId || "None"}
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
                                    // setTouchControlsEnabled(true)
                                    peer.disconnect();
                                }}
                            >
                                <i className="fad fa-redo"></i>
                                Disconnect
                            </ArticlesButton>
                        }

                        <ArticlesButton
                            size="sm"
                            className="w-100"
                            active={false}
                            onClick={() => {
                                sendMessage()
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            Test Message
                        </ArticlesButton>

                    </div>

                </div>

            </div>
        </div>
    )
}
