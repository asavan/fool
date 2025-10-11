import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import starterFunc from "../../src/js/starter.js";
import settingsOriginal from "../../src/js/settings.js";


async function testMode(mode) {
    const baseUrl = "http://localhost/?botCount=2&channelType=fake";
    const urlToTest = baseUrl + "&mode=" + mode;
    const dom = await JSDOM.fromFile("src/index.html", {
        url: urlToTest,
    });
    const document = dom.window.document;
    assert.doesNotReject(starterFunc(dom.window, document));
}

test("test modes", async () => {    
    for (const mode of settingsOriginal.modes) {
        await testMode(mode);
    }
    assert.ok(true, "Ended well");
});
