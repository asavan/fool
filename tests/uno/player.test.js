import test from 'node:test'
import assert from 'node:assert/strict'

import newPlayer from "../../src/js/player.js";

test('player has card', () => {
  const pile = [0, 1, 110];
  const player = newPlayer("sasha", 3);

  for (const card of pile) {
    player.addCard(card);
  }


  assert.ok(player.hasColor('red'), 'No color');
  assert.ok(!player.hasColor('green'), 'WHY green color?');
  assert.ok(!player.hasCard(2), 'Wrong card');
  assert.ok(player.hasCard(0), 'Miss card 0');
  assert.ok(player.hasCard(110), 'Miss card 110');
  assert.equal(player.getIndex(), 3, 'Wrong index');
  assert.equal(player.getScore(), 0, 'Wrong score');
});

test('player score', () => {
  const player = newPlayer("sasha", 3);
  assert.equal(player.getScore(), 0, 'Wrong score');
  player.updateScore(20);
  assert.equal(player.getScore(), 20, 'Wrong score after update');
});

