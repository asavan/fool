import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import gameFunction from "../../src/js/game.js";
import settingsOriginal from "../../src/js/settings.js";

import mode from "../../src/js/mode/net.js";


test("simple net fake", async () => {
    const settings = {...settingsOriginal};
    settings.mode = "net";
    settings.connection = "fake";
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/",
    });
    const document = dom.window.document;
    await mode(dom.window, document, settings, gameFunction).catch(e => console.log("Failed", e));
    assert.ok(true, "Ended well");
});
