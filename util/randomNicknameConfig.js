
import generateRandomNickname from '@articles-media/articles-dev-box/generateRandomNickname';

const randomNicknameConfig = {
  type: 'Basic',
  parts: [
    [
        "Cue",
        "Eight Ball",
        "Rack",
        "Pocket",
        "Spin",
        "Bank Shot",
        "Break",
        "Chalk",
        "Scratch",
        "Side Pocket",
        "Magic",
        "Green Felt",
        "Corner",
        "Pool",
        "Lucky",
        "Fast",
        "The",
        "Snooker",
        "Ball",
        "Table"
    ],
    [
        "Master",
        "Eddie",
        "Attack",
        "Rocket",
        "Doctor",
        "Bob",
        "Queen",
        "Zilla",
        "Cat",
        "Sam",
        "Cue",
        "Greg",
        "King",
        "Shark",
        "Break",
        "Fingers",
        "Hustler",
        "Snoop",
        "Buster",
        "Titan"
    ]
  ]
};

export default () => generateRandomNickname(randomNicknameConfig);