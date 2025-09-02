"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// import Link from 'next/link';
import dynamic from 'next/dynamic'
// import Script from 'next/script'

// import { useSelector, useDispatch } from 'react-redux'

// import ROUTES from '@/components/constants/routes';

import ArticlesButton from '@/components/UI/Button';

import useFullscreen from '@/hooks/useFullScreen';
// import { useControllerStore } from 'app/(site)/community/games/glass-ceiling/components/hooks/useControllerStore';
// import ControllerPreview from '@/components/Games/ControllerPreview';
// import { useGameStore } from '@/components/Games/Ocean Rings/hooks/useGameStore';
// import { Dropdown, DropdownButton } from 'react-bootstrap';
// import TouchControls from 'app/(site)/community/games/glass-ceiling/components/UI/TouchControls';
// import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
import LeftPanelContent from '../components/LeftPanel';
import { useSocketStore } from '@/hooks/useSocketStore';
import MenuBarControls from '../components/MenuBarControls';
import { useEightBallStore } from '@/hooks/useEightBallStore';
import TouchControls from '../components/TouchControls';
import classNames from 'classnames';

const GameCanvas = dynamic(() => import('../components/GameCanvas'), {
    ssr: false,
});

export default function GamePage() {

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    // const { controllerState, setControllerState } = useControllerStore()
    const [showControllerState, setShowControllerState] = useState(false)

    // const [ cameraMode, setCameraMode ] = useState('Player')

    const [players, setPlayers] = useState([])

    useEffect(() => {

        // if (server && socket.connected) {
        //     socket.emit('join-room', `game:cannon-room-${server}`, {
        //         game_id: server,
        //         nickname: JSON.parse(localStorage.getItem('game:nickname')),
        //         client_version: '1',

        //     });
        // }

        // return function cleanup() {
        //     socket.emit('leave-room', 'game:glass-ceiling-landing')
        // };

    }, [server, socket]);

    const [showMenu, setShowMenu] = useState(false)

    // const [touchControlsEnabled, setTouchControlsEnabled] = useLocalStorageNew("game:touchControlsEnabled", false)

    // const touchControls = useEightBallStore(state => state.touchControls);
    // const setTouchControls = useEightBallStore(state => state.setTouchControls);

    const [sceneKey, setSceneKey] = useState(0);

    const [gameState, setGameState] = useState(false)

    // Function to handle scene reload
    const reloadScene = () => {
        setSceneKey((prevKey) => prevKey + 1);
    };

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    let panelProps = {
        server,
        players,
        // touchControlsEnabled,
        // setTouchControlsEnabled,
        reloadScene,
        // controllerState,
        isFullscreen,
        requestFullscreen,
        exitFullscreen,
        setShowMenu
    }

    const showSidebar = useEightBallStore(state => state.showSidebar);
    const setShowSidebar = useEightBallStore(state => state.setShowSidebar);

    // const game_name = '8 Ball Pool'
    // const game_key = '8-ball-pool'

    return (

        <div
            className={
                classNames(
                    `amcot-pool-game-page`,
                    {
                        'fullscreen': isFullscreen,
                        'sidebar': showSidebar
                    }
                )
            }
            id="amcot-pool-game-page"
        >

            <div className="menu-bar card card-articles p-1 justify-content-center">

                <div className='flex-header align-items-center'>

                    <div className='d-flex'>
                        <ArticlesButton
                            small
                            active={showMenu}
                            onClick={() => {
                                setShowMenu(prev => !prev)
                            }}
                        >
                            <i className="fad fa-bars"></i>
                            <span>Menu</span>
                        </ArticlesButton>
    
                        <div className='d-none d-lg-block'>
                            <ArticlesButton
                                small
                                active={showSidebar}
                                onClick={() => {
                                    setShowSidebar(!showSidebar)
                                }}
                            >
                                <i className="fas fa-bars" style={{transform: 'rotate(90deg)'}}></i>
                                <span>Sidebar</span>
                            </ArticlesButton>
                        </div>
                    </div>

                    <MenuBarControls />

                </div>

            </div>

            <div 
                className={`mobile-menu ${showMenu && 'show'}`}
                onClick={e => {
                    // Only close if clicking the background, not a child card
                    // Only close if clicking the background, not a card or its child
                    let el = e.target;
                    let isCard = false;
                    while (el && el !== e.currentTarget) {
                        if (el.classList && el.classList.contains('card')) {
                            isCard = true;
                            break;
                        }
                        el = el.parentElement;
                    }
                    if (!isCard && e.target === e.currentTarget) setShowMenu(false);
                }}
            >

                <LeftPanelContent
                    {...panelProps}
                />
                
            </div>

            <div className='panel-left card rounded-0'>

                <LeftPanelContent
                    {...panelProps}
                />

            </div>

            {/* <div className='game-info'>
                <div className="card card-articles card-sm">
                    <div className="card-body">
                        <pre> 
                            {JSON.stringify(playerData, undefined, 2)}
                        </pre>
                    </div>
                </div>
            </div> */}

            <div className='canvas-wrap'>

                <TouchControls

                />

                <GameCanvas
                    key={sceneKey}
                    gameState={gameState}
                    // playerData={playerData}
                    // setPlayerData={setPlayerData}
                    players={players}
                />

            </div>

        </div>
    );
}