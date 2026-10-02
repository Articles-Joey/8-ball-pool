import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import AppThemeProvider from "@/components/AppThemeProvider";
import { Suspense } from "react";

import "@articles-media/articles-gamepad-helper/dist/articles-gamepad-helper.css";

import SocketLogicHandler from "@/components/Handlers/SocketLogicHandler";
import LayoutClient from "./layout-client";

export const metadata = {
    title: "8 Ball Pool",
    description:
        "Play 8 Ball Pool! Turn based single player and multiplayer game by Articles Media",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head></head>

            <body>
                <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                    <AppThemeProvider>
                        <Suspense>
                            <SocketLogicHandler />
                            <LayoutClient />
                        </Suspense>
                        {children}
                    </AppThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
