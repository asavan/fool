"use strict";

import {assert} from "../helper.js";

export default function ai(window, document, settings, gameFunction) {
    return new Promise((resolve, reject) => {
        settings.externalId = "client1";
        const game = gameFunction(window, document, settings);

        game.on("move", (move) => console.log(move));
        game.on("draw", (move) => {});
        game.on("shuffle", (deck) => {});
        game.on("discard", (card) => {});
        game.on("changeCurrent", (pl) => {});
        game.on("clearPlayer", (pl) => {});
        game.join(0, 'server', 'server');
        for (let i = 1; i < 4; ++i) {
            const name = 'client' + i;
            game.join(1, name, name);
        }
        game.afterAllJoined();

        game.on("gameover", (score) => {
            const btnAdd = document.querySelector('.butInstall');
            btnAdd.classList.remove("hidden2");
        });

        resolve(game);
    });
}
