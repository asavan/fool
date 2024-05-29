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
    settings.seed = "v";
    settings.mode = "ai";
    settings.maxScore = 3;
    const game = await mode(dom.window, document, settings, gameFunction);
    const gameFinish = new Promise((resolve) => {
        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
            resolve();
        });
    });
    const firstPlayerName = document.querySelector(".player-name");
    assert.ok(firstPlayerName, "No players");
    assert.equal(firstPlayerName.textContent, "bot 1");
    await gameFinish;
    await delay(70);
    const elem = document.querySelector(".overlay.show");
    assert.ok(elem, "No win window");
    const winMessage1 = elem.querySelector("h2").textContent;
    assert.equal(winMessage1, "bot 2 wins");

    const winMessage2 = elem.querySelector(".content").textContent;
    assert.equal(winMessage2, "with score 127");
    assert.ok(true, "Ended well");
});
