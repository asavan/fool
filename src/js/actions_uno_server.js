"use strict";

function shouldNotHappen() {
    console.error("Should Not Happen");
}

function init(engine) {
    return {
        "move": (data) => {
            console.log("onMove", data);
            return engine.onMove(data.playerIndex, data.card, data.currentColor);
        },
        "draw": (data) => {
            console.log("onDraw", data);
            return engine.onDraw(data.playerIndex, data.card);
        },
        "pass": (data) => {
            console.log("on pass", data);
            return engine.onPass(data.playerIndex);
        },
        "changeCurrent": shouldNotHappen,
        "shuffle": false,
        "discard": false,
        "clearPlayer": false,
        "roundover": false,
        "gameover": false
    };
}

export default init;
