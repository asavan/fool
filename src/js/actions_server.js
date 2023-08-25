"use strict";

function init(game, clients) {
    return {
        'move': async (n, id) => {
          console.log("try to move " + JSON.stringify(n));
          return game.onChange(n);
        },
        'username': async (n, id) => {
          console.log("User joined", n, id);
          const client = clients[id];
          client.username = n;
          return game.join(client.index, n, id);
        },
        'start': async (p) => {
          console.log(p);
          return game.onStart(p);
        }
    }
}

export default init;
