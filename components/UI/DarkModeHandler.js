"use client";

import SharedDarkModeHandler from "@articles-media/articles-dev-box/DarkModeHandler";
import { useStore } from "@/hooks/useStore";

export default function DarkModeHandler() {
    return <SharedDarkModeHandler useStore={useStore} />;
}
