// Use the theme controlled by darkMode, including for MUI portal content.
export default function gameTextSx(theme) {
    const color = theme.palette.mode === "dark" ? "#fff" : "#000";
    return {
        color,
        "& .MuiDialog-paper, & .MuiTypography-root, & .MuiDialogContent-root, & .MuiAlert-root, & .MuiFormLabel-root, & .MuiFormLabel-root.Mui-focused, & .MuiFormLabel-root.Mui-disabled, & .MuiInputBase-root, & .MuiSelect-select, & .MuiFormControlLabel-label, & .MuiFormControlLabel-label.Mui-disabled, & .MuiMenuItem-root, & .MuiChip-label":
            { color },
        "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: color },
    };
}
