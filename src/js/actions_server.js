"use strict";

function init(game, clients) {
    return {
        'move': (data) => {
          console.log("try to move " + JSON.stringify(data));
          return game.onChange(data);
        },
        'username': (n, id) => {
          console.log("User joined", n, id);
          const client = clients[id];
          client.username = n;
          return game.join(client.index, n, id);
        },
        'start': false,
        'shuffle': false,
        'draw': ({playerIndex, card}) => {
          console.log({playerIndex, card});
          return game.onDraw(playerIndex, card);
        },
        'discard': false,
        'changeCurrent': (currentData) => {
          console.log("Change current disabled");
          // return game.onChangeCurrent(currentData);
        },
        'pass': (currentData) => {
          console.log("on pass");
          return game.onPass(currentData);
        },
        'clearPlayer': false,
        'roundover': false,
        'gameover': false
    }
}

export default init;
