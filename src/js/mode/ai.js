"use strict";

import {assert} from "../helper.js";

export default function ai(window, document, settings, gameFunction) {
    return new Promise((resolve, reject) => {
        settings.cardsDeal = 2;
        settings.maxScore = 100;
        settings.externalId = "client1";
        const game = gameFunction(window, document, settings);

        game.on("move", (move) => console.log(move));
        game.on("draw", (move) => {});
        game.on("shuffle", (deck) => {});
        game.on("discard", (card) => {});
        game.on("changeCurrent", (pl) => {});
        game.on("clearPlayer", (pl) => {});
        game.join(0, 'sasha', 'server');
        game.join(1, 'client1', 'client1');
        game.join(2, 'client2', 'client2');
        game.join(3, 'client3', 'client3');
        game.afterAllJoined();

        game.on("gameover", (score) => {
            const btnAdd = document.querySelector('.butInstall');
            btnAdd.classList.remove("hidden2");
        });

        resolve(game);
    });
}
