"use strict";

function init(game, clients) {
    return {
        "move": (data) => {
            console.log("try to move " + JSON.stringify(data));
            return game.onChange(data);
        },
        "username": (n, id) => {
            console.log("User joined", n, id);
            const client = clients[id];
            client.username = n;
            return game.join(client.index, n, id);
        },
        "draw": ({playerIndex, card}) => {
            console.log({playerIndex, card});
            return game.onDraw(playerIndex, card);
        },
        "pass": (currentData) => {
            console.log("on pass");
            return game.onPass(currentData);
        },
        "changeCurrent": () => {
            console.error("Change current disabled");
            // return game.onChangeCurrent(currentData);
        },
        "discard": false,
        "shuffle": false,
        "clearPlayer": false,
        "roundover": false,
        "gameover": false
    };
}

export default init;
