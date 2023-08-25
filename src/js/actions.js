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
        'username': false
    }
}

export default init;
