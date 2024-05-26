"use strict";

function init(game, clients, logger) {
    return {
        "username": (n, id) => {
            logger.log("User joined", n, id);
            const client = clients[id];
            client.username = n;
            return game.join(n, id);
        }
    };
}

export default init;
