import test from "node:test";
import {JSDOM} from "jsdom";

import clicker from "../helper/clicker.js";

import gameFunction from "../../src/js/game.js";
import settingsOriginal from "../../src/js/settings.js";
import {delay} from "../../src/js/utils/timer.js";

test("server mode no network", async () => {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/",
    });
    const document = dom.window.document;
    const settings = {...settingsOriginal};
    const myId = "server";
    settings.mode = "server";
    const game = gameFunction({window: dom.window, document, settings, myId});

    game.join("player name", myId);
    for (let i = 1; i < 4; ++i) {
        const name = "client" + i;
        game.join(name, name);
    }
    await game.afterAllJoined();
    await delay(700);
    clicker.clickBySelector(dom, ".center-pile .sprite-back");
    await delay(500);
});

test("client mode no network", async () => {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/",
    });
    const document = dom.window.document;
    const settings = {...settingsOriginal};
    const myId = "client1";
    settings.mode = "net";
    const game = gameFunction({window: dom.window, document, settings, myId});

    game.join("player name", myId);
    for (let i = 1; i < 4; ++i) {
        const name = "client" + i;
        game.join(name, name);
    }
    await game.afterAllJoined();
    await delay(700);
    clicker.clickBySelector(dom, ".center-pile .sprite-back");
    await delay(500);
});
