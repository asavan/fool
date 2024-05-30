import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import gameFunction from "../../src/js/game.js";
import settingsOriginal from "../../src/js/settings.js";

test("simple 4 player scenario", async () => {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/",
    });
    const settings = {...settingsOriginal};
    const document = dom.window.document;
    const window = dom.window;
    settings.externalId = "client1";
    settings.cardsDeal = 1;
    settings.seed = "h";
    settings.maxScore = 3;
    settings.clickAll = true;
    const game = gameFunction({window, document, settings});

    game.join("server", "server");
    for (let i = 1; i < 4; ++i) {
        const name = "client" + i;
        game.join(name, name);
    }
    game.afterAllJoined();
    const gameFinish = new Promise((resolve) => {
        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
            resolve();
        });
    });
    gameFinish.catch(error => {
        console.error(error);
        assert.fail("fail on game over");
    });
    assert.ok(true, "Ended well");
});
