"use strict";

import {assert} from "../helper.js";

export default function ai(window, document, settings, gameFunction) {
    return new Promise((resolve, reject) => {
        const game = gameFunction(window, document, settings);

        game.on("move", (move) => console.log(move));
        game.join(0, 'sasha', 'server');
        game.join(1, 'client1', 'client1');
        game.join(2, 'client2', 'client2');
        game.join(3, 'client3', 'client3');
        game.afterAllJoined();
        resolve(game);
    });
}
