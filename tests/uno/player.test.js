import test from "node:test";
import assert from "node:assert/strict";

import newPlayer from "../../src/js/player.js";

test("player has card", () => {
    const pile = [0, 1];
    const player = newPlayer(pile, 3, 0);

    player.addCard(110);

    assert.ok(player.hasColor("red"), "No color");
    assert.ok(!player.hasColor("green"), "WHY green color?");
    assert.ok(!player.hasCard(2), "Wrong card");
    assert.ok(player.hasCard(0), "Miss card 0");
    assert.ok(player.hasCard(110), "Miss card 110");
    assert.equal(player.getIndex(), 3, "Wrong index");
    assert.equal(player.getScore(), 0, "Wrong score");
});

test("player score", () => {
    const player = newPlayer([], 3, 0);
    assert.equal(player.getScore(), 0, "Wrong score");
    player.updateScore(20);
    assert.equal(player.getScore(), 20, "Wrong score after update");
});

test("player remove card", () => {
    const pile = [0, 1, 110];
    const player = newPlayer(pile, 3, 0);

    let index = player.removeCard(2);
    assert.equal(index, -1, "Not delete non existing card");
    assert.equal(player.pile().length, 3, "Not delete non existing card");

    index = player.removeCard(1);
    assert.equal(index, 1, "Delete existing card");
    assert.equal(player.pile().length, 2, "Delete existing card");

    index = player.removeCard(0);
    assert.equal(index, 0, "Delete existing card");
    assert.equal(player.pile().length, 1, "Delete existing card");

    index = player.removeCard(110);
    assert.equal(index, 0, "Delete existing card");
    assert.equal(player.pile().length, 0, "Delete existing card");

    index = player.removeCard(110);
    assert.equal(index, -1, "Not delete non existing card");
    assert.equal(player.pile().length, 0, "Not delete non existing card");



});
