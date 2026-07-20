export const sounds = {
    click: new Audio("./sounds/click.mp3"),
    flip: new Audio("./sounds/card_flip.mp3"),
    match: new Audio("./sounds/matched_cards.mp3"),
    wrongMatch: new Audio("./sounds/not_matched.mp3"),

    buy: new Audio("./sounds/buy_items.mp3"),

    win: new Audio("./sounds/win.mp3"),
    lose: new Audio("./sounds/lose.mp3"),

    shield: new Audio("./sounds/Shield.mp3"),
    freeze: new Audio("./sounds/freeze.mp3"),
    falconEye: new Audio("./sounds/falcon_eye.mp3"),
    compass: new Audio("./sounds/compass.mp3"),
    lightning: new Audio("./sounds/Lightning.mp3"),
    focus: new Audio("./sounds/foucs.mp3"),
    magic: new Audio("./sounds/Digital_Delete.mp3"),
};

export function playSound (sound) {
    sound.currentTime = 0;
    sound.play();
}
