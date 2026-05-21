import { useEightBallStore } from "@/hooks/useEightBallStore";
import { Suspense, useEffect } from "react";

import PeerDetails from "@/components/UI/PeerDetails";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/hooks/useStore";
import DebugPanel from "@/components/UI/DebugPanel";

import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';

export default function LeftPanelContent(props) {

    let searchParams = useSearchParams()
    let searchParamsObject = Object.fromEntries(searchParams.entries());

    const debug = useStore(state => state.debug);

    const resetPeer = useEightBallStore(state => state.resetPeer);
    const setResetPeer = useEightBallStore(state => state.setResetPeer);

    useEffect(() => {
        setResetPeer(false);
    }, [resetPeer]);

    return (
        <div>

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
                            useRouter={useRouter}
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
                        <PeerDetails />
                    }
                </Suspense>
            }

            {/* Debug Controls */}
            {debug &&
                <DebugPanel />
            }

        </div>
    )

}