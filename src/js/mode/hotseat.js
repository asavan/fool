"use strict";

import rngFunc from "../utils/random.js";

export default function hotseat(window, document, settings, gameFunction) {
    return new Promise((resolve) => {
        const myId = "client1";
        settings.externalId = myId;
        if (settings.seed === "") {
            settings.seed = rngFunc.makeId(6, Math.random);
        }
        settings.clickAll = true;
        const game = gameFunction({window, document, settings, myId});
        game.join("server", "server");
        for (let i = 1; i < 4; ++i) {
            const name = "client" + i;
            game.join(name, name);
        }
        
        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
        });
        
        game.afterAllJoined().then(() => resolve(game));
    });
}
