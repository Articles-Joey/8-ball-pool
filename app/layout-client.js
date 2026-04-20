"use client"
import { useStore } from '@/hooks/useStore';
import { DarkModeHandler } from '@articles-media/articles-dev-box';
import GlobalBody from '@articles-media/articles-dev-box/GlobalBody';

export default function LayoutClient({ children }) {

    return (
        <>
            <GlobalBody />
            <DarkModeHandler
                useStore={useStore}
            />
        </>
    );
}
