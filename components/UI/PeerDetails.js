import React from "react";
import ArticlesButton from "@/components/UI/Button";
import { usePeer } from "@/hooks/usePeer";
import { useEightBallStore } from "@/hooks/useEightBallStore";

export default function PeerDetails() {
    const {
        peerId,
        connectionPeerId,
        setConnectionPeerId,
        connected,
        connectToPeer,
        disconnectPeer,
        isHost,
        setIsHost,
        players,
        currentTurn,
        changeTurn,
        kickUser,
        lastLaunch,
        sendMessage,
        idPrefix,
    } = usePeer();

    const { peerRef, connectionRef } = useEightBallStore();

    return (
        <div className="card card-articles card-sm">
            <div className="card-body">
                <div className="small text-muted">Session Controls</div>

                <div className='d-flex flex-column'>
                    <div
                        style={{
                            fontSize: '0.7rem!important',
                        }}
                        onClick={() => {
                            console.log("peerId", peerId);
                            console.log("peer", peerRef.current);
                            console.log("connectionRef.current", connectionRef.current);
                        }}
                    >
                        {peerId ? peerId : "None"}
                    </div>

                    <input
                        autoComplete='off'
                        type="text"
                        className='text-center w-100'
                        value={connectionPeerId}
                        style={{
                            fontSize: '0.7rem!important'
                        }}
                        onChange={(e) => {
                            setConnectionPeerId(e.target.value);
                        }}
                    />

                    <div>
                        {!connected ? (
                            <ArticlesButton
                                size="sm"
                                className="w-100"
                                active={false}
                                onClick={() => {
                                    connectToPeer(`${idPrefix}${connectionPeerId}`);
                                }}
                            >
                                <i className="fad fa-redo"></i>
                                Connect
                            </ArticlesButton>
                        ) : (
                            <ArticlesButton
                                size="sm"
                                className="w-100"
                                active={false}
                                onClick={disconnectPeer}
                            >
                                <i className="fad fa-redo"></i>
                                Disconnect
                            </ArticlesButton>
                        )}

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            active={false}
                            onClick={() => {
                                sendMessage();
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
                                setIsHost(!isHost);
                            }}
                        >
                            <i className="fad fa-redo"></i>
                            Host: {isHost ? 'True' : 'False'}
                        </ArticlesButton>

                        {/* Server-side state panel */}
                        <div className="mt-2 border-top pt-2">
                            <div className="small text-muted mb-1">Session State</div>
                            <div style={{ fontSize: '0.7rem' }}>
                                <div>Turn: <b>{currentTurn ? currentTurn.replace(idPrefix, '') : 'None'}</b>{currentTurn === peerId && ' (You)'}</div>
                                <div>Host: <b>{isHost ? 'Yes' : 'No'}</b></div>
                                {lastLaunch ? (
                                    <>
                                        <div>Last Power: <b>{lastLaunch.cuePower}</b></div>
                                        <div>Last Rotation: <b>{lastLaunch.cueRotation}°</b></div>
                                        <div>Last Shot: <b>{lastLaunch.time}</b></div>
                                    </>
                                ) : (
                                    <div className="text-muted">No shots yet</div>
                                )}
                            </div>
                        </div>

                        {/* Connections List */}
                        {players.length > 0 && (
                            <div className="mt-2 border-top pt-2">
                                <div className="small text-muted mb-1">Players ({players.length})</div>
                                {players.map((id) => (
                                    <div key={id} className="d-flex flex-column mb-2 p-1 rounded">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div
                                                className="text-truncate"
                                                style={{
                                                    fontSize: '0.7rem',
                                                    flex: 1,
                                                    fontWeight: currentTurn === id ? 'bold' : 'normal',
                                                    color: currentTurn === id ? '#007bff' : 'inherit'
                                                }}
                                                title={id}
                                            >
                                                <i className={`fad ${currentTurn === id ? 'fa-star' : 'fa-user-circle'} me-1`}></i>
                                                {id.replace(idPrefix, '')}
                                                {id === peerId && " (You)"}
                                            </div>
                                            <div className="d-flex">
                                                {isHost && (
                                                    <>
                                                        <ArticlesButton
                                                            size="sm"
                                                            variant={currentTurn === id ? "primary" : "outline-primary"}
                                                            className="ms-1 py-0 px-2"
                                                            style={{ height: '1.2rem', lineHeight: '1rem', fontSize: '0.6rem' }}
                                                            onClick={() => changeTurn(id)}
                                                        >
                                                            Turn
                                                        </ArticlesButton>
                                                        <ArticlesButton
                                                            size="sm"
                                                            variant="danger"
                                                            className="ms-1 py-0 px-2"
                                                            style={{ height: '1.2rem', lineHeight: '1rem', fontSize: '0.6rem' }}
                                                            onClick={() => kickUser(id)}
                                                        >
                                                            Kick
                                                        </ArticlesButton>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Host themself mentioned or turn handled */}
                                <div className="mt-1 small">
                                    Current Turn: <b className="text-primary">{currentTurn ? currentTurn.replace(idPrefix, '') : "None"}</b> {currentTurn === peerId && "(You)"}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
