"use strict";

import test from "node:test";
import assert from "node:assert/strict";

import {prng_alea} from "esm-seedrandom";

import coreUnoFunc from "../../src/js/uno.js";
import settings from "../../src/js/settings.js";

test("positive scenario simple", async () => {
    const myrng = prng_alea("a");
    const engine = coreUnoFunc(settings, myrng);
    const players = ["server", "player1"];
    for (const p of players) {
        engine.addPlayer(p);
    }
    await engine.chooseDealer();
    assert.strictEqual(engine.getCurrentPlayer(), 1, "Wrong current player after choose");
    await engine.deal();
    assert.strictEqual(engine.getCurrentPlayer(), 0, "Wrong current player after deal");
    assert.ok(true, "Ended well");
});

test("client test", async () => {
    const myrng = prng_alea("a");
    const engine = coreUnoFunc(settings, myrng);
    const players = ["server", "player1"];
    for (const p of players) {
        engine.addPlayer(p);
    }
    await engine.chooseDealer();
    assert.strictEqual(engine.getCurrentPlayer(), 1, "Wrong current player after choose");
    await engine.deal();
    assert.strictEqual(engine.getCurrentPlayer(), 0, "Wrong current player after deal");
    assert.ok(true, "Ended well");
});


test("empty deck", async () => {
    const myrng = prng_alea("a");
    const engine = coreUnoFunc(settings, myrng);
    const players = ["server", "player1"];
    for (const p of players) {
        engine.addPlayer(p);
    }
    const deck = [1];
    engine.setDeck(deck);
    engine.setCurrent(0, 0, 1);
    let res = await engine.onDraw(0, 1);
    assert.ok(res, "First card dealed");

    engine.setCurrent(1, 0, 1);
    res = await engine.onDraw(1, 0);
    assert.ok(!res, "No such card");
    res = await engine.onDrawPlayer(1);
    console.log(res);
    assert.ok(!res, "No such card 2");
});

test("deck reshuffle", async () => {
    const myrng = prng_alea("a");
    const engine = coreUnoFunc(settings, myrng);
    const players = ["server", "player1"];
    for (const p of players) {
        engine.addPlayer(p);
    }
    const player0 = 0;
    const player1 = 1;
    const deck = [0, 1, 2, 3, 4];
    await engine.setDeck(deck);
    await engine.setCurrent(player1, player1, 1);
    await engine.dealN(1);
    let res = await engine.onDraw(player0, 1);
    assert.ok(res, "1 card dealed");
    res = await engine.moveToDiscard(player0, 1);
    assert.ok(res, "Move 1 card");
    assert.strictEqual(engine.getCurrentPlayer(), player1, "player changed after move");
    res = await engine.onDraw(player1, 0);
    assert.ok(res, "0 card dealed");
    res = await engine.moveToDiscard(player1, 0);
    assert.ok(res, "Move 0 card");

    res = await engine.onDraw(player0, 2);
    assert.ok(res, "Card 2 in deck again");
});

test("take 4", {only: true}, async () => {
    const myrng = prng_alea("a");
    const engine = coreUnoFunc(settings, myrng);
    const players = ["server", "player1"];
    for (const p of players) {
        engine.addPlayer(p);
    }
    const player0 = 0;
    const player1 = 1;
    const deck = [0, 1, 2, 13, 9, 97, 10];
    await engine.setDeck(deck);
    await engine.setCurrent(player0, player0, 1);
    await engine.dealN(2);
    assert.strictEqual(engine.getCurrentPlayer(), player1, "player changed after deal");
    let res = await engine.moveToDiscard(player1, 9);
    assert.ok(res, "Move 1 card");
    assert.strictEqual(engine.getCurrentPlayer(), player0, "player changed after move");
    res = await engine.moveToDiscard(player0, 97);
    assert.ok(res, "Move 14 card");
    assert.strictEqual(engine.getCurrentPlayer(), player0, "player not changed after take4");
    assert.strictEqual(engine.deckSize(), 0, "deck is empty after take4");
});


test("reverse", {only: true}, async () => {
    const myrng = prng_alea("a");
    const engine = coreUnoFunc(settings, myrng);
    const players = ["server", "player1", "player2"];
    for (const p of players) {
        engine.addPlayer(p);
    }
    const player0 = 0;
    const player1 = 1;
    const deck = [0, 1, 2, 13, 12, 11];
    await engine.setDeck(deck);
    await engine.setCurrent(player0, player0, 1);
    await engine.dealN(1);
    assert.strictEqual(engine.getCurrentPlayer(), player1, "player changed after deal");
    assert.strictEqual(engine.getDirection(), 1, "direction left");
    const res = await engine.moveToDiscard(player1, 11);
    assert.ok(res, "Move 11 card");
    assert.strictEqual(engine.getCurrentPlayer(), player0, "player changed after move");
    assert.strictEqual(engine.getDirection(), -1, "direction rignt");
});
