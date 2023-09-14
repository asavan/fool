"use strict";

export default function test(window, document, settings, gameFunction) {
    return new Promise((resolve) => {
        settings.cardsDeal = 1;
        settings.seed = "c";
        settings.maxScore = 3;
        settings.clickAll = true;
        const game = gameFunction(window, document, settings);

        game.on("move", (move) => console.log(move));
        game.on("draw", () => {});
        game.on("shuffle", () => {});
        game.on("discard", () => {});
        game.on("changeCurrent", () => {});
        game.on("clearPlayer", () => {});
        game.join(0, "server", "server");
        for (let i = 1; i < 4; ++i) {
            const name = "client" + i;
            game.join(i, name, name);
        }
        game.afterAllJoined();

        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
        });

        resolve(game);
    });
}
