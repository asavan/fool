"use strict";

function init(game, clients) {
    return {
        'move': async (data) => {
          console.log("try to move " + JSON.stringify(data));
          return game.onChange(data);
        },
        'username': async (n, id) => {
          console.log("User joined", n, id);
          const client = clients[id];
          client.username = n;
          return game.join(client.index, n, id);
        },
        'start': false,
        'shuffle': false,
        'draw': async ({playerIndex, card}) => {
              console.log({playerIndex, card});
              return game.onDraw(playerIndex, card);
        },
//        'draw': false,
        'discard': false,
//        'changeCurrent': false,
        'changeCurrent': async (currentData) => {
                      console.log("Change current");
                      return game.onChangeCurrent(currentData);
                },
        'clearPlayer': false
    }
}

export default init;
