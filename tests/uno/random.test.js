"use strict";

import test from "node:test";
import assert from "node:assert/strict";

import {prng_alea} from "esm-seedrandom";

import rngFunc from "../../src/js/utils/random.js";


test("make id different", () => {
    const first = rngFunc.makeId(6, Math.random);
    assert.strictEqual(first.length, 6);

    const second = rngFunc.makeId(6, Math.random);
    assert.strictEqual(second.length, 6);

    assert.notEqual(first, second, "Random broken");
});

test("make id same", () => {
    const myrng1 = prng_alea("a");
    const first = rngFunc.makeId(6, myrng1);
    assert.strictEqual(first.length, 6);

    const myrng2 = prng_alea("a");
    const second = rngFunc.makeId(6, myrng2);
    assert.strictEqual(second.length, 6);

    assert.strictEqual(first, second, "Random broken");
});
