import Box from "@mui/material/Box";
import ArticlesModal from "./ArticlesModal";

export default function GameInfoModal({ show, setShow }) {
    return (
        <ArticlesModal
            show={show}
            setShow={setShow}
            title="Game Info"
            contentSx={{ p: 2 }}
        >
            <Box sx={{ fontWeight: "bold", mb: 1 }}>8 Ball Pool</Box>
            <Box>...</Box>
        </ArticlesModal>
    );
}
