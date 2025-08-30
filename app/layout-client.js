"use client"
import { useEffect } from "react";

import { useEightBallStore } from "@/hooks/useEightBallStore";

export default function LayoutClient({ children }) {

    const theme = useEightBallStore(state => state.theme);

    useEffect(() => {

        if (theme == "Dark") {
            document.body.setAttribute("data-bs-theme", 'dark');
        } else {
            document.body.setAttribute("data-bs-theme", 'light');
        }

    }, [theme]);

    return (
        <>
        </>
    );
}
