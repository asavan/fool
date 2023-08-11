"use strict";

import {assert} from "../helper.js";

export default function ai(window, document, settings, gameFunction) {
    return new Promise((resolve, reject) => {
        const game = gameFunction(window, document, settings);

        game.on("move", (move) => console.log(move));
        resolve(game);
    });
}
