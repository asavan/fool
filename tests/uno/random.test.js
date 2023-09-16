"use strict";

import test from "node:test";
import assert from "node:assert/strict";

import {prng_alea} from "esm-seedrandom";

import rngFunc from "../../src/js/utils/random.js";


test("length match", () => {
    const first = rngFunc.makeId(6, Math.random);
    assert.strictEqual(first.length, 6);

    const second = rngFunc.makeId(2, Math.random);
    assert.strictEqual(second.length, 2);

    const myrng = prng_alea("a");
    const third = rngFunc.makeId(3, myrng);
    assert.strictEqual(third.length, 3);
});

test("make id different", () => {
    const first = rngFunc.makeId(6, Math.random);
    const second = rngFunc.makeId(6, Math.random);

    assert.notEqual(first, second, "Random broken");
});

test("make id same", () => {
    const myrng1 = prng_alea("a");
    const first = rngFunc.makeId(6, myrng1);

    const myrng2 = prng_alea("a");
    const second = rngFunc.makeId(6, myrng2);

    assert.strictEqual(first, second, "Random broken");
});

test("make id different 2", () => {
    const myrng1 = prng_alea("a");
    const first = rngFunc.makeId(6, myrng1);

    const myrng2 = prng_alea("b");
    const second = rngFunc.makeId(6, myrng2);

    assert.notEqual(first, second, "Random broken");

    const third = rngFunc.makeId(6, myrng1);
    assert.notEqual(first, third, "Random broken");
});
