"use client"
import { useEightBallStore } from "@/hooks/useEightBallStore";
import { useEffect } from "react";

export default function DarkModeHandler({ children }) {

    const darkMode = useEightBallStore(state => state.darkMode);

    useEffect(() => {

        if (darkMode == null) {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            useEightBallStore.getState().setDarkMode(prefersDark ? true : false);
        }

        if (darkMode) {
            document.body.setAttribute("data-bs-theme", 'dark');
        } else {
            document.body.setAttribute("data-bs-theme", 'light');
        }

    }, [darkMode]);

    return (
        <>
        </>
    );
}
