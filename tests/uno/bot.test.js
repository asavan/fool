import test from "node:test";
import assert from "node:assert/strict";

import core from "../../src/js/uno/basic.js";
import emptyEngine from "../../src/js/uno/default-engine.js";
import coreUnoFunc from "../../src/js/uno/engine.js";
import settings from "../../src/js/settings.js";
import rngFunc from "../../src/js/utils/random.js";


import simpleBot from "../../src/js/bot/simple.bot.js";

test("bad bot deal", async () => {
    const count = 6;
    const engineRaw = emptyEngine(settings, count);
    const engine = coreUnoFunc({settings, rngFunc: Math.random, applyEffects: true},
        {logger: console, traceLogger: console, debugLogger: console}, engineRaw);
    const deck = [
        108, 59, 31, 29, 48, 35, 6, 99, 5, 86, 95, 81, 94, 54, 110, 41, 42, 43, 50,
        76, 13, 75, 49, 32, 14, 9, 69, 2, 100, 19, 71, 3, 106, 97, 20, 55, 64, 39,
        51, 109, 53, 102, 23, 107, 38, 82, 33, 34, 105, 36, 80, 22, 16, 12, 25, 87,
        77, 57, 78, 28, 45, 37, 96, 108, 21, 88, 90, 60, 1, 17, 93, 89, 65, 11, 91,
        27, 30, 46, 101, 68, 85, 15, 40, 47, 73, 67, 92, 7, 111, 18, 10, 44, 83, 0,
        104, 63, 58, 26, 52, 79, 72, 103, 61, 66, 74, 4, 24, 8, 62
    ];
    engine.setDeck(deck);
    const currentObj = {currentPlayer: 2, dealer: 2, direction: 1, gameState : core.GameStage.DEALING };
    await engine.setCurrentObj(currentObj);
    await engine.dealN(7);
    await engine.onMove(engine.getCurrentPlayer(), 62, "red");
    await engine.onMove(engine.getCurrentPlayer(), 8, "red");
    await engine.onMove(engine.getCurrentPlayer(), 111, "green");
    const me = engine.getPlayerByIndex(0);
    assert.deepStrictEqual(me.pile(), [4, 79, 0, 7, 15, 27, 17, 88, 21, 108, 96]);
    const brokenBot = engine.getPlayerByIndex(1);
    const pile = [74, 52, 83, 92, 85, 91, 1];
    assert.deepStrictEqual(brokenBot.pile(), pile);
});

test("bad not draw4", () => {
    const pile = [74, 52, 83, 92, 85, 91, 1];
    const bestCard = simpleBot.findBestGoodCard(pile, 111, "green");
    assert.equal(bestCard, 92);
});

test("best color on black card", () => {
    const pile = [74, 83, 92, 85, 91, 1];
    const randEl = (arr) => rngFunc.randomEl(arr, Math.random);
    const bestColor = simpleBot.bestColor(pile, 83, randEl);
    assert.equal(bestColor, "green", pile.map(core.cardToString));
});

test("best color on normal", () => {
    const pile = [74, 52, 83, 92, 85, 91, 1];
    const randEl = (arr) => rngFunc.randomEl(arr, Math.random);
    const bestCard = simpleBot.bestColor(pile, 1, randEl);
    assert.equal(bestCard, "red", pile.map(core.cardToString));
});


test("bot mostWeightedColor", () => {
    const card = 28;
    const pile = [card];
    const bestColor = simpleBot.mostWeightedColor(pile);
    assert.equal(core.cardColor(card), "green");
    assert.equal(bestColor, "green", pile.map(core.cardToString));
});

test("bot black and green", () => {
    const card = 28;
    const blackCard = 83;
    assert.equal(core.cardColor(blackCard), core.BLACK_COLOR);
    const pile = [card, blackCard];
    const randEl = (arr) => rngFunc.randomEl(arr, Math.random);
    const bestColor = simpleBot.bestColor(pile, blackCard, randEl);
    assert.equal(core.cardColor(card), "green");
    assert.equal(bestColor, "green", pile.map(core.cardToString));
});
