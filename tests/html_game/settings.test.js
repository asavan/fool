import test from "node:test";
import assert from "node:assert/strict";

import settingsOriginal from "../../src/js/settings.js";
import {parseSettings, adjustMode} from "../../src/js/utils/parse-settings.js";



test("parse settings", () => {
    const search = "?mode=server";
    const settings = {...settingsOriginal};
    const changed = parseSettings(search, settings);
    assert.deepStrictEqual(changed, ["mode"]);
});

test("ajust settings", () => {
    const search = "?mode=server";
    const settings = {...settingsOriginal};
    const changed = parseSettings(search, settings);
    assert.ok(changed.includes("mode"));
    adjustMode(changed, settings, "https:");
    assert.equal(settings.mode, "server");
    assert.equal(settings.botCount, 0);
});

test("ajust settings2", () => {
    const search = "";
    const settings = {...settingsOriginal};
    const changed = parseSettings(search, settings);
    assert.equal(changed.length, 0);
    adjustMode(changed, settings, "https:");
    assert.equal(settings.mode, "ai");
    assert.equal(settings.botCount, 2);
});

test("ajust settings has bot", () => {
    const search = "?mode=server&botCount=3";
    const settings = {...settingsOriginal};
    const changed = parseSettings(search, settings);
    assert.ok(changed.includes("mode"));
    adjustMode(changed, settings, "https:");
    assert.equal(settings.mode, "server");
    assert.equal(settings.botCount, 3);
});
