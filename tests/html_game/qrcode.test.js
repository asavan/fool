import test from "node:test";
import assert from "node:assert/strict";

import {JSDOM} from "jsdom";

import settingsOriginal from "../../src/js/settings.js";
import {makeQr, makeQrString} from "../../src/js/views/qr_helper.js";
import setupSettings from "../../src/js/utils/setup-settings.js";

test("qrcode", async () => {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost:8080/?mode=server&playerIsBot=false",
    });
    const document = dom.window.document;
    const settings = {...settingsOriginal};
    makeQr(dom.window, document, settings);
});

test("qrcode_local", async () => {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost:8080/?mode=server&playerIsBot=false&seed=xyz",
    });
    const settings = setupSettings(dom.window);
    assert.equal(settings.seed, "xyz");
    const shareUrl = makeQrString(dom.window, settings);
    assert.equal(shareUrl, "http://localhost:8080/?seed=xyz");
});

test("qrcode_github", async () => {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "https://asavan.github.io/fool/?mode=server&channelType=supabase&seed=xyz",
    });
    const settings = setupSettings(dom.window);
    const shareUrl = makeQrString(dom.window, settings);
    assert.equal(shareUrl, "https://asavan.github.io/fool/?seed=xyz");
});
