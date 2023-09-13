import test from 'node:test'
import assert from 'node:assert/strict'

import core from "../../src/js/uno/basic.js"

test('hello', () => {
  const message = 'Hello'
  assert.equal(message, 'Hello', 'checking the greeting')
});

test('has card', () => {
  const pile = [0, 1, 110]; // red red blue
  assert.ok(core.pileHasColor(pile, 'red'), 'No color');
  assert.notEqual(core.pileHasColor(pile, 'green'), true, 'Has green but should not');
});
