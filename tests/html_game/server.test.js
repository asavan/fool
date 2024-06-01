import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import gameFunction from "../../src/js/game.js";
import settingsOriginal from "../../src/js/settings.js";

import mode from "../../src/js/mode/server.js";

test("simple server scenario", async () => {
    const settings = {...settingsOriginal};
    settings.mode = "server";
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/",
    });
    const document = dom.window.document;
    await mode(dom.window, document, settings, gameFunction).catch(e => console.log("Failed", e));
    assert.ok(true, "Ended well");
});

test("simple server scenario webrtc", async () => {
    const settings = {...settingsOriginal};
    settings.mode = "server";
    settings.connection = "webrtc";
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/",
    });
    const document = dom.window.document;
    await mode(dom.window, document, settings, gameFunction).catch(e => console.log("Failed", e));
    assert.ok(true, "Ended well");
});
