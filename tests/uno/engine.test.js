import test from 'node:test'
import assert from 'node:assert/strict'

import coreUnoFunc from "../../src/js/uno.js"
import settings from "../../src/js/settings.js"
import {prng_alea} from 'esm-seedrandom';


test('positive scenario simple', async () => {
  let myrng = prng_alea('a');
  const engine = coreUnoFunc(settings, myrng);
  const players = ['server', 'player1'];
  for (const p of players) {
    engine.addPlayer(p);
  }
  await engine.chooseDealer();
  assert.equal(engine.getCurrentPlayer(), 1, 'Wrong current player after choose');
  if (settings.showAll) {
      settings.show = true;
  } else {
      settings.show = false;
  }
  await engine.deal();

  assert.equal(engine.getCurrentPlayer(), 0, 'Wrong current player after deal');

  assert.ok(true, 'Ended well');
});
