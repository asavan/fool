"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import gameFunction from "../../src/js/game.js";
import settings from "../../src/js/settings.js";

test("simple 4 player scenario", async () => {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/",
    });
    const document = dom.window.document;
    settings.externalId = "client1";
    settings.cardsDeal = 1;
    settings.seed = "h";
    settings.maxScore = 3;
    settings.clickAll = true;
    const game = gameFunction(dom.window, document, settings);

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
