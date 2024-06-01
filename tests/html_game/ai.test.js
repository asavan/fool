import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import gameFunction from "../../src/js/game.js";
import settings from "../../src/js/settings.js";
import mode from "../../src/js/mode/ai.js";

import { delay } from "../../src/js/utils/timer.js";

function defaultAiSettings(settings) {
    const localSettings = {...settings};
    localSettings.cardsDeal = 1;
    localSettings.seed = "v";
    localSettings.mode = "ai";
    localSettings.maxScore = 3;
    return localSettings;
}

async function aiTest(settings, fisrtName) {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/",
    });
    const document = dom.window.document;
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
    assert.equal(firstPlayerName.textContent, fisrtName);
    await gameFinish;
    await delay(70);
    const elem = document.querySelector(".overlay.show");
    assert.ok(elem, "No win window");
    const winMessage1 = elem.querySelector("h2").textContent;
    assert.equal(winMessage1, "bot 2 wins");

    const winMessage2 = elem.querySelector(".content").textContent;
    assert.equal(winMessage2, "with score 127");
    assert.ok(true, "Ended well");
}


test("ai scenario", async () => {
    const localSettings = defaultAiSettings(settings);
    await aiTest(localSettings, "bot 1");
});


test("ai clickAll", async () => {
    const localSettings = defaultAiSettings(settings);
    localSettings.clickAll = true;
    await aiTest(localSettings, "Player");
});
