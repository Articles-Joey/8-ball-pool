"use client";

import { forwardRef } from "react";
import SharedArticlesButton from "@articles-media/articles-dev-box/Button";

const ArticlesButton = forwardRef(function ArticlesButton(
    { sx, ...props },
    ref,
) {
    return (
        <SharedArticlesButton
            {...props}
            ref={ref}
            sx={[
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
                (theme) => {
                    const dark = theme.palette.mode === "dark";
                    const color = dark ? "#fff" : "#000";
                    return {
                        "--articles-button-default-background-color": dark
                            ? "#464646"
                            : "#fff",
                        "--articles-button-default-hover-background-color": dark
                            ? "#000"
                            : "#e2e6ea",
                        "&&, &&:hover, &&:hover:not(.active), &&.active, &&.Mui-disabled":
                            { color },
                        "&&.Mui-disabled": {
                            bgcolor: dark ? "#464646" : "#fff",
                        },
                    };
                },
            ]}
        />
    );
});

export default ArticlesButton;
