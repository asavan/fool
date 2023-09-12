import test from 'node:test'
import assert from 'node:assert/strict'

import core from "../../src/js/uno/basic.js"

test('hello', () => {
  const message = 'Hello'
  assert.equal(message, 'Hello', 'checking the greeting')
});

test('has card', () => {
  const pile = [0, 1, 110];
  const found = core.pileHasColor(pile, 'red');
  assert.ok(found, 'No color');
  assert.ok(!core.pileHasColor(pile, 'green'), 'Has green but should not');
});

