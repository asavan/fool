"use strict";

function init(game) {
    return {
        'move': async (n) => {
          console.log("try to move " + JSON.stringify(n));
          return game.onChange(n);
        }
    }
}

export default init;
