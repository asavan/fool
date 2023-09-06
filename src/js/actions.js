"use strict";

function init(game, myIndex) {
    return {
        'move': ({playerIndex, card}) => {
              console.log("try to move " + JSON.stringify({playerIndex, card}));
              return game.onChange(playerIndex, card);
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
        'changeCurrent': async (currentData) => {
              console.log("Change current");
              return game.onChangeCurrent(currentData);
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
