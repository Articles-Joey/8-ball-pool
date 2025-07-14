import { Suspense } from "react"
import GamePage from "./play"
// import metadataAppend from "util/metadataAppend"

export const metadata = {
    title: `8 Ball Pool`,
}

export default function Page() {
    return (
        <Suspense><GamePage /></Suspense>
    )
}