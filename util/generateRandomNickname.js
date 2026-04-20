const nicknames = [
        "Cue Master",
        "Eight Ball Eddie",
        "Rack Attack",
        "Pocket Rocket",
        "Spin Doctor",
        "Bank Shot Bob",
        "Break Queen",
        "Chalk Zilla",
        "Scratch Cat",
        "Side Pocket Sam",
        "Magic Cue",
        "Green Felt Greg",
        "Corner King",
        "Pool Shark",
        "Lucky Break",
        "Fast Fingers",
        "The Hustler",
        "Snooker Snoop",
        "Ball Buster",
        "Table Titan"
    ]

/**
 * Generates a random fish-themed nickname.
 * @returns {string} A random nickname like "SaltyShark" or "NeonDolphin".
 */
export const generateRandomNickname = () => {
    return nicknames[Math.floor(Math.random() * nicknames.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
};
