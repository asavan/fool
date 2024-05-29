import test from "node:test";
import assert from "node:assert/strict";

import {prng_alea} from "esm-seedrandom";

import coreUnoFunc from "../../src/js/uno.js";
import settings from "../../src/js/settings.js";

import simpleBot from "../../src/js/bot/simple.bot.js";

test("bad bot deal", async () => {
    const myrng = prng_alea("a");
    const engine = coreUnoFunc(settings, myrng, console);
    for (let i = 0; i < 6; ++i) {
        engine.addPlayer();
    }
    
    const deck = [108, 59, 31, 29, 48, 35, 6, 99, 5, 86, 95, 81, 94, 54, 110, 41, 42, 43, 50, 76, 13, 75, 49, 32, 14, 9, 69, 2, 100, 19, 71, 3, 106, 97, 20, 55, 64, 39, 51, 109, 53, 102, 23, 107, 38, 82, 33, 34, 105, 36, 80, 22, 16, 12, 25, 87, 77, 57, 78, 28, 45, 37, 96, 108, 21, 88, 90, 60, 1, 17, 93, 89, 65, 11, 91, 27, 30, 46, 101, 68, 85, 15, 40, 47, 73, 67, 92, 7, 111, 18, 10, 44, 83, 0, 104, 63, 58, 26, 52, 79, 72, 103, 61, 66, 74, 4, 24, 8, 62];
    engine.setDeck(deck);
    engine.setCurrent(2, 2, 1, true);
    await engine.dealN(7);
    engine.setCurrent(3, 2, 1, false);
    await engine.onMove(engine.getCurrentPlayer(), 62, "red");
    await engine.onMove(engine.getCurrentPlayer(), 8, "red");
    await engine.onMove(engine.getCurrentPlayer(), 111, "green");
    const me = engine.getPlayerByIndex(0);
    assert.deepStrictEqual(me.pile(), [
        4, 79, 0, 7, 15,
        27, 17, 88, 21, 108,
        96
    ]);
    const brokenBot = engine.getPlayerByIndex(1);
    const pile = [74, 52, 83, 92, 85, 91, 1];
    assert.deepStrictEqual(brokenBot.pile(), pile);
});

test("bad not draw4", () => {
    const pile = [74, 52, 83, 92, 85, 91, 1];
    const bestCard = simpleBot.findBestGoodCard(pile, 111, "green");
    assert.equal(bestCard, 92);
});
