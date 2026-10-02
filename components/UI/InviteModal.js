"use client";

import { Suspense } from "react";
import InvitePlayersModal from "@articles-media/articles-dev-box/InviteModal";
import { useSocketStore } from "@/hooks/useSocketStore";

export default function InviteModal(props) {
    return (
        <Suspense>
            <InvitePlayersModal
                {...props}
                useSocketStore={useSocketStore}
            />
        </Suspense>
    );
}
