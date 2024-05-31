import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import clicker from "../helper/clicker.js";

import gameFunction from "../../src/js/game.js";
import settingsOriginal from "../../src/js/settings.js";
import {delay, promiseState} from "../../src/js/helper.js";

test("click color scenario", async () => {
    const dom = await JSDOM.fromFile("src/index.html");
    const document = dom.window.document;
    const settings = {...settingsOriginal};
    const myId = "client1";
    settings.externalId = "client1";
    settings.cardsDeal = 1;
    settings.seed = "h";
    settings.maxScore = 3;
    settings.mode = "hotseat";
    settings.clickAll = true;
    const game = gameFunction({window: dom.window, document, settings, myId});

    game.on("move", (move) => console.log(move));
    game.on("shuffle", () => {});
    game.on("discard", () => {});
    game.on("changeCurrent", () => {});
    game.on("clearPlayer", () => {});
    game.join("server", "server");
    for (let i = 1; i < 4; ++i) {
        const name = "client" + i;
        game.join(name, name);
    }
    const gameFinish = new Promise((resolve) => {
        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
            console.log("FINISHED");
            resolve();
        });
    });
    gameFinish.catch(error => {
        console.error(error);
        assert.fail("fail on game over");
    });

    await game.afterAllJoined();
    clicker.clickBySelector(dom, ".current-player > ul > li > div");
    await delay(500);
    // cancel choice
    clicker.clickBySelector(dom, "li.cancel-color");
    await delay(500);
    const gameNotFinishedYet = await promiseState(gameFinish);
    assert.equal(gameNotFinishedYet.status, "pending");
    // click chooser again
    clicker.clickBySelector(dom, ".current-player > ul > li > div");
    await delay(500);
    clicker.clickBySelector(dom, "li.red");
    await gameFinish;
    assert.ok(true, "Ended well");
});
