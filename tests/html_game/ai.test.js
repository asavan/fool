"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import gameFunction from "../../src/js/game.js";
import settings from "../../src/js/settings.js";
import mode from "../../src/js/mode/ai.js";

test("ai scenario", async () => {
    const dom = await JSDOM.fromFile("src/index.html");
    const document = dom.window.document;
    await mode(dom.window, document, settings, gameFunction);
    assert.ok(true, "Ended well");
});
