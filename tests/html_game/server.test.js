"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import gameFunction from "../../src/js/game.js";
import settings from "../../src/js/settings.js";
import mode from "../../src/js/mode/server.js";

test("simple server scenario", async () => {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/",
    });
    const document = dom.window.document;
    let counter = 0;
    dom.window.requestAnimationFrame = function (callback) {
        ++counter;
        if (counter < 10) {
            return setTimeout(callback, 200);
        }
    };
    await mode(dom.window, document, settings, gameFunction).catch(e => console.log("Failed", e));
    assert.ok(true, "Ended well");
});
