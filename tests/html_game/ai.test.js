import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import gameFunction from "../../src/js/game.js";
import settings from "../../src/js/settings.js";
import mode from "../../src/js/mode/ai.js";

import { delay } from "../../src/js/helper.js";


test("ai scenario", async () => {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/",
    });
    const document = dom.window.document;
    settings.cardsDeal = 1;
    settings.seed = "h";
    settings.maxScore = 3;
    const game = await mode(dom.window, document, settings, gameFunction);
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
    await gameFinish;
    await delay(700);
    assert.ok(true, "Ended well");
});
