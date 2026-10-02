import Box from "@mui/material/Box";

export default function IsDev({ className, noOutline, children, inline, sx }) {
    // Developer content stays hidden until an authenticated role is available.
    const userReduxState = false;
    if (!children || !userReduxState?.roles?.isDev) return null;
    return (
        <Box
            className={className}
            sx={[
                {
                    display: inline ? "inline-block" : "block",
                    outline: noOutline ? "none" : "1px dashed",
                    outlineColor: "warning.main",
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            {children}
        </Box>
    );
}
