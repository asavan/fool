"use strict";

function init(game, clients) {
    return {
        "username": (n, id) => {
            console.log("User joined", n, id);
            const client = clients[id];
            client.username = n;
            return game.join(client.index, n, id);
        }
    };
}

export default init;
