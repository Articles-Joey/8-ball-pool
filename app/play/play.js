"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic'

import ArticlesButton from '@/components/UI/Button';

import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';
import GameMenu from '@articles-media/articles-dev-box/GameMenu';
import LeftPanelContent from '@/components/UI/LeftPanel';
import { useSocketStore } from '@/hooks/useSocketStore';
// import MenuBarControls from '../../components/UI/MenuBarControls';
// import { useEightBallStore } from '@/hooks/useEightBallStore';
import TouchControls from '@/components/UI/TouchControls';
import classNames from 'classnames';
import { useStore } from '@/hooks/useStore';
import useTouchControlsStore from '@/hooks/useTouchControlsStore';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function GamePage() {

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    // const router = useRouter()
    // const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    // const [players, setPlayers] = useState([])

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

    const showMenu = useStore(state => state.showMenu);
    const sceneKey = useStore(state => state.sceneKey);
    const sidebar = useStore(state => state.sidebar);

    const touchControlsEnabled = useTouchControlsStore(state => state.enabled);

    // const [gameState, setGameState] = useState(false)

    // const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    return (

        <div
            className={classNames(
                `game-page`,
                {
                    'menu-open': showMenu,
                    'fullscreen': useFullscreen().isFullscreen,
                    'show-sidebar': sidebar,
                }
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
        >

            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{
                    style: "Bar",
                    menuBarButtonPosition: "Left"
                }}
                sidebarConfig={{
                    style: "Static Panel",
                }}
            />

            <div className='canvas-wrap'>

                {touchControlsEnabled &&
                    <TouchControls />
                }

                <GameCanvas
                    key={sceneKey}
                />

            </div>

        </div>
    );
}