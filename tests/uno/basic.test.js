"use strict";

import test from "node:test";
import assert from "node:assert/strict";

import core from "../../src/js/uno/basic.js";

test("hello", () => {
    const message = "Hello";
    assert.equal(message, "Hello", "checking the greeting");
});

test("has card", () => {
    const pile = [0, 1, 110]; // red red blue
    assert.ok(core.pileHasColor(pile, "red"), "No color");
    assert.notEqual(core.pileHasColor(pile, "green"), true, "Has green but should not");
});

test("sort", () => {
    const pile = [13, 2, 0, 69, 57, 110]; // blue red red blue
    core.sortByTemplate(pile, "asc", core.GOOD_COLORS);
    assert.deepStrictEqual(pile, [0, 57, 2, 110, 13, 69], "Sorted asc");

    core.sortByTemplate(pile, "desc", [...core.GOOD_COLORS, "black"]);
    assert.deepStrictEqual(pile, [2, 57, 0, 110, 69, 13], "Sorted desc");
});
