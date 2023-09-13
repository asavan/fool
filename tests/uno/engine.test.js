import test from "node:test";
import assert from "node:assert/strict";

import coreUnoFunc from "../../src/js/uno.js";
import settings from "../../src/js/settings.js";
import {prng_alea} from "esm-seedrandom";

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

