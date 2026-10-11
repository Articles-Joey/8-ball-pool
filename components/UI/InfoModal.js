import Box from "@mui/material/Box";
import ArticlesModal from "./ArticlesModal";
import gameTextSx from "./gameTextSx";

export default function GameInfoModal({ show, setShow }) {
    return (
        <ArticlesModal
            show={show}
            setShow={setShow}
            title="Game Info"
            sx={gameTextSx}
            contentSx={{ p: 2 }}
        >
            <Box sx={{ fontWeight: "bold", mb: 1 }}>8 Ball Pool</Box>
            <Box sx={{ mb: 1 }}>
                Local Play has two players taking turns on the same device.
                Multiplayer uses a room code or invite link for a second player.
            </Box>
            <Box sx={{ mb: 1 }}>
                Place the cue ball behind the head string to break. Pocket a
                ball or send at least four object balls to rails for a legal
                break. The table stays open after the break.
            </Box>
            <Box sx={{ mb: 1 }}>
                Regular shots do not need a ball or pocket call. After the
                break, the first legally pocketed solid or stripe assigns sides
                (solids 1–7, stripes 9–15). Pocketing one of your own balls
                legally keeps your turn; a miss or safety passes it. If you
                pocket both groups on an open table, the first ball pocketed
                determines your side.
            </Box>
            <Box sx={{ mb: 1 }}>
                A scratch, hitting the wrong ball first, missing every object
                ball, driving a ball off the table, or failing to reach a rail
                or pocket after contact is a foul. The opponent gets ball in
                hand. Break fouls restrict placement to behind the head string.
            </Box>
            <Box sx={{ mb: 1 }}>
                Only the 8 ball needs a pocket call. Clear your side, choose the
                8-ball pocket, then shoot. A legal 8-ball pocket wins. Pocketing
                it early, in an uncalled pocket, with a foul, or driving it off
                the table loses. An 8 ball made on the break is spotted, with an
                option to re-rack.
            </Box>
            <Box sx={{ mb: 1 }}>
                Click or tap the felt to place a cue ball in hand, then confirm.
                Aim with A/D or Left/Right, adjust power with W/S or Up/Down,
                and shoot with Space/Enter. Hold Z for five times slower aiming
                and power adjustments. Shift also slows aiming. Touch buttons
                provide the same controls.
            </Box>
            <Box>
                Multiplayer rematches require both players to agree. Leaving an
                active room forfeits the rack.
            </Box>
        </ArticlesModal>
    );
}
