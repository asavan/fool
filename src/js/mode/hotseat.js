"use strict";

import rngFunc from "../utils/random.js";

export default function hotseat(window, document, settings, gameFunction) {
    return new Promise((resolve) => {
        settings.externalId = "client1";
        if (settings.seed === "") {
            settings.seed = rngFunc.makeId(6, Math.random);
        }
        settings.clickAll = true;
        const game = gameFunction(window, document, settings);

        game.on("move", (move) => console.log(move));
        game.on("draw", () => {});
        game.on("shuffle", () => {});
        game.on("discard", () => {});
        game.on("changeCurrent", () => {});
        game.on("clearPlayer", () => {});
        game.join("server", "server");
        for (let i = 1; i < 4; ++i) {
            const name = "client" + i;
            game.join(name, name);
        }
        game.afterAllJoined();

        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
        });

        resolve(game);
    });
}
