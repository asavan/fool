"use strict";

function init(game) {
    return {
        'move': async (n) => {
          console.log("try to move " + JSON.stringify(n));
          return game.onChange(n);
        },
        'dealer': async (n) => {
          console.log("try to set dealer " + JSON.stringify(n));
          return game.setDealer(n);
        },
        'username': false,
        'start': async (p) => {
                  console.log(p);
                  return game.onStart(p);
        },
        'shuffle': async (p) => {
              console.log(p);
              return game.onShuffle(p);
        },

        'draw': async ({playerIndex, card}) => {
              console.log({playerIndex, card});
              return game.onDraw(playerIndex, card);
        },
        'changeCurrent': async (cur) => {
              console.log("Change current", cur);
              return game.onChangeCurrent(cur);
        },
        'clearPlayer': async (cur) => {
              console.log("clearPlayer", cur);
              return game.onClearHand(cur);
        },
        'discard': async (p) => {
              console.log("Discard", p);
              return game.onDiscard(p);
        }
    }
}

export default init;
