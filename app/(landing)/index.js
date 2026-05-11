"use client"
import {
    useEffect,
    useContext,
    useState,
    useRef
} from 'react';

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

import { useStore } from '@/hooks/useStore';

import ArticlesButton from '@/components/UI/Button';
import IsDev from '@/components/UI/IsDev';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useRouter } from 'next/navigation';

import NicknameInput from '@articles-media/articles-dev-box/NicknameInput';
import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';
const Ad = dynamic(() =>
    import('@articles-media/articles-dev-box/Ad'),
    { ssr: false }
);
const ReturnToLauncherButton = dynamic(() =>
    import('@articles-media/articles-dev-box/ReturnToLauncherButton'),
    { ssr: false }
);
const SessionButton = dynamic(() =>
    import('@articles-media/articles-dev-box/SessionButton'),
    { ssr: false }
);
import { useUserDetails, useUserToken } from '@articles-media/articles-dev-box';

const game_key = '8-ball-pool'
const game_name = '8 Ball Pool'

export default function LandingPage() {

    // const {
    //     data: userToken,
    //     error: userTokenError,
    //     isLoading: userTokenLoading,
    //     mutate: userTokenMutate
    // } = useUserToken();

    // const {
    //     data: userDetails,
    //     error: userDetailsError,
    //     isLoading: userDetailsLoading,
    //     mutate: userDetailsMutate
    // } = useUserDetails({
    //     token: userToken
    // });

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken(
        "3015"
    );

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate
    } = useUserDetails({
        token: userToken
    });

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const router = useRouter();

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const darkMode = useStore(state => state.darkMode)

    const nickname = useStore(state => state.nickname)
    const setNickname = useStore(state => state.setNickname)
    const randomNickname = useStore(state => state.randomNickname)

    const [prepareMultiplayer, setPrepareMultiplayer] = useState(false)

    const _hasHydrated = useStore(state => state._hasHydrated)
    const toggleDarkMode = useStore(state => state.toggleDarkMode);

    const setShowInfoModal = useStore(state => state.setShowInfoModal);
    const setShowSettingsModal = useStore(state => state.setShowSettingsModal);
    const setShowCreditsModal = useStore(state => state.setShowCreditsModal);

    const lobbyDetails = useStore(state => state.lobbyDetails);
    const setLobbyDetails = useStore(state => state.setLobbyDetails);

    useEffect(() => {

        socket.on('game:8-ball-pool-landing-details', function (msg) {
            console.log('game:8-ball-pool-landing-details', msg)

            if (JSON.stringify(msg) !== JSON.stringify(lobbyDetails)) {
                setLobbyDetails(msg)
            }
        });

        return () => {
            socket.off('game:8-ball-pool-landing-details');
        };

    }, [])

    useEffect(() => {

        if (socket.connected) {
            socket.emit('join-room', 'game:8-ball-pool-landing');
        }

        return function cleanup() {
            socket.emit('leave-room', 'game:8-ball-pool-landing')
        };

    }, [socket.connected]);

    function attemptConnection() {

        // First try and establish connection via peerjs before redirecting page

        const params = new URLSearchParams();
        params.set("game_id", prepareMultiplayer.room_code);
        router.push(`/play?${params.toString()}`);

    }

    return (

        <div className="landing-page">

            <div className='background-wrap'>
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN}games/8 Ball Pool/8-ball-pool-lobby-background.jpg`}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center', filter: 'blur(10px)' }}
                />
            </div>

            <div className="container d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center">

                <div
                    style={{ "width": "20rem" }}
                >

                    <div
                        className="card card-articles card-sm mb-2"
                    >

                        <div style={{ position: 'relative', height: '200px' }}>
                            <Image
                                src={"/img/logo.webp"}
                                alt=""
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>

                        <div className='card-header d-flex align-items-center'>

                            <NicknameInput
                                useStore={useStore}
                            />

                        </div>

                        <div className="card-body">

                            {prepareMultiplayer == false &&
                                <>
                                    <Link
                                        href={{
                                            pathname: `/play`,
                                            // query: {
                                            //     server: id
                                            // }
                                        }}
                                    >
                                        <ArticlesButton className="w-100 mb-3">
                                            <i className="fad fa-user me-2"></i>
                                            Play Single Player
                                        </ArticlesButton>
                                    </Link>


                                    <ArticlesButton
                                        className="w-100 mb-1"
                                        onClick={() => {
                                            setPrepareMultiplayer({})
                                        }}
                                    >
                                        <i className="fas fa-users me-2"></i>
                                        Play Multiplayer
                                    </ArticlesButton>
                                </>
                            }

                            {prepareMultiplayer !== false &&
                                <>

                                    {/* <div className='mt-1 mb-3' style={{ fontSize: '0.8rem' }}>
                                        Generate room code
                                    </div>
    
                                    <input
                                        autoComplete='off'
                                        // id={item_key}
                                        type="text"
                                        className='text-center w-100'
                                        // autoFocus={autoFocus && true}
                                        // onBlur={onBlur}
                                        // placeholder={placeholder}
                                        value={nickname}
                                        // onKeyDown={onKeyDown}
                                        onChange={(e) => {
                                            setNickname(e.target.value)
                                        }}
                                    />
    
                                    <div className='mt-1 mb-3' style={{ fontSize: '0.8rem' }}>
                                        Generate room code
                                    </div> */}

                                    {prepareMultiplayer.room_code == undefined &&
                                        <div className='w-100 mb-0'>
                                            <ArticlesButton
                                                className="w-50"
                                                onClick={() => {
                                                    const params = new URLSearchParams();
                                                    params.set("game_id", "loading");
                                                    router.push(`/play?${params.toString()}`);
                                                }}
                                            >
                                                Start a Game
                                            </ArticlesButton>

                                            <ArticlesButton
                                                className="w-50"
                                                onClick={() => {
                                                    setPrepareMultiplayer({
                                                        room_code: ''
                                                    })
                                                }}
                                            >
                                                Join a Game
                                            </ArticlesButton>
                                        </div>
                                    }

                                    {prepareMultiplayer.room_code !== undefined &&
                                        <div>

                                            <div className="alert alert-danger py-1 mb-2">
                                                Invalid room code
                                            </div>

                                            <input
                                                value={prepareMultiplayer.room_code}
                                                className='w-100'
                                                placeholder='Room code'
                                                onChange={(e) => {
                                                    setPrepareMultiplayer({
                                                        ...prepareMultiplayer,
                                                        room_code: e.target.value
                                                    })
                                                }}
                                            >
                                            </input>

                                        </div>

                                    }

                                    <div className="d-flex justify-content-center align-items-center w-100 mt-3">

                                        <ArticlesButton
                                            className=""
                                            variant='link'
                                            onClick={() => {
                                                prepareMultiplayer.room_code !== undefined ?
                                                    setPrepareMultiplayer({})
                                                    :
                                                    setPrepareMultiplayer(false)
                                            }}
                                        >
                                            <i className="fad fa-arrow-left me-2"></i>
                                            Back
                                        </ArticlesButton>

                                        <span className="mx-2">|</span>

                                        <ArticlesButton
                                            className=""
                                            variant='link'
                                            disabled={
                                                prepareMultiplayer.room_code?.length < 4
                                                ||
                                                !prepareMultiplayer.room_code
                                            }
                                            onClick={() => {
                                                attemptConnection()
                                            }}
                                        >
                                            Enter
                                            <i className="fad fa-arrow-right ms-2"></i>
                                        </ArticlesButton>

                                    </div>
                                </>
                            }

                            <div className="fw-bold mb-1 small text-center d-none">
                                {lobbyDetails.players.length || 0} player{lobbyDetails.players.length > 1 && 's'} in the lobby.
                            </div>

                            {/* <div className='small fw-bold'>Public Servers</div> */}

                            <div className="servers d-none">

                                {[1, 2, 3, 4].map(id => {

                                    let lobbyLookup = lobbyDetails?.fourFrogsGlobalState?.games?.find(lobby =>
                                        parseInt(lobby.server_id) == id
                                    )

                                    return (
                                        <div key={id} className="server">

                                            <div className='d-flex justify-content-between align-items-center w-100 mb-2'>
                                                <div className="mb-0" style={{ fontSize: '0.9rem' }}><b>Server {id}</b></div>
                                                <div className='mb-0'>{lobbyLookup?.players?.length || 0}/2</div>
                                            </div>

                                            <div className='d-flex justify-content-start w-100 mb-1'>
                                                {[1, 2].map(player_count => {

                                                    let playerLookup = false

                                                    if (lobbyLookup?.players?.length >= player_count) playerLookup = true

                                                    return (
                                                        <div key={player_count} className="icon" style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            ...(playerLookup ? {
                                                                backgroundColor: 'black',
                                                            } : {
                                                                backgroundColor: 'gray',
                                                            }),
                                                            border: '1px solid black'
                                                        }}>

                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <Link
                                                className={``}
                                                href={{
                                                    pathname: `/play`,
                                                    query: {
                                                        server: id
                                                    }
                                                }}
                                            >
                                                <ArticlesButton
                                                    className="px-5"
                                                    small
                                                >
                                                    Join
                                                </ArticlesButton>
                                            </Link>

                                        </div>
                                    )
                                })}

                            </div>

                            {/* <div className='small fw-bold  mt-3 mb-1'>Or</div> */}

                            {/* <div className='d-flex'>
    
                                <ArticlesButton
                                    className={`w-50`}
                                    onClick={() => {
                                        // TODO
                                        alert("Coming Soon!")
                                    }}
                                >
                                    <i className="fad fa-robot"></i>
                                    Practice
                                </ArticlesButton>
    
                                <ArticlesButton
                                    className={`w-50`}
                                    onClick={() => {
                                        setShowPrivateGameModal(prev => !prev)
                                    }}
                                >
                                    <i className="fad fa-lock"></i>
                                    Private Game
                                </ArticlesButton>
    
                            </div> */}

                            <IsDev className={'mt-3'}>
                                <div>
                                    <ArticlesButton
                                        className="w-50"
                                        variant='warning'
                                        onClick={() => {
                                            socket.emit('game:four-frogs:reset', '');
                                        }}
                                    >
                                        Reset Server
                                    </ArticlesButton>
                                </div>
                            </IsDev>

                        </div>

                        <div className="card-footer d-flex flex-wrap justify-content-center">

                            <GameMenuPrimaryButtonGroup
                                useStore={useStore}
                                type="Landing"
                            />

                        </div>

                    </div>

                    <SessionButton
                        port={process.env.NEXT_PUBLIC_GAME_PORT}
                        friendsButton={true}
                    />

                    <ReturnToLauncherButton />

                </div>

                {/* <GameScoreboard
                    game={process.env.NEXT_PUBLIC_GAME_NAME}
                    style="Default"
                    darkMode={darkMode ? true : false}
                    prepend={
                        <>
                            <div
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <RotatingMascot />
                            </div>
                        </>
                    }
                /> */}

                <Ad
                    style="Default"
                    section={"Games"}
                    section_id={process.env.NEXT_PUBLIC_GAME_NAME}
                    darkMode={darkMode ? true : false}
                    user_ad_token={userToken}
                    userDetails={userDetails}
                    userDetailsLoading={userDetailsLoading}
                />

            </div>
        </div>
    );
}