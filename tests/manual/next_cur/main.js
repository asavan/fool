import layout from "../../../src/js/views/layout.js";
import settingsOriginal from "../../../src/js/settings.js";
import core from "../../../src/js/uno/basic.js";

function fakeEngine(extSize) {
    let currentPlayer = 0;
    let direction = 1;
    let dealer = 0;
    let currentColor = core.cardColor(106);
    function calcNextFromCurrent(cur, size, direction) {
        return core.nextPlayer(0, size, direction, cur);
    }
    function getDirection() {
        return direction;
    }
    function skip() {
        // TODO should we notify others
        currentPlayer = calcNextFromCurrent(currentPlayer, size(), direction);
    }
    function getDealer() {
        return dealer;
    }

    function getCurrentColor() {
        return currentColor;
    }

    function getCurrentPlayer() {
        return currentPlayer;
    }

    function reverse() {
        direction *= -1;
    }

    function size() {
        return extSize;
    }
    return {
        skip,
        size,
        getDirection,
        getCurrentPlayer,
        getCurrentColor,
        getDealer
    }
}


const fieldElem = document.querySelector(".container");
const engine = fakeEngine(4);
const myIndex = 0;
const settings = {...settingsOriginal};
let canClick = true;
fieldElem.addEventListener("click", async (event) => {
    if (!canClick) {
        return;
    }
    canClick = false;
    engine.skip();
    await layout.drawCurrent(document, engine, myIndex, settings);
    canClick = true;
});
