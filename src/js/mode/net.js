"use strict";

import connectionFunc from "../connection/client.js";
import actionsFunc from "../actions.js";
import rngFunc from "../utils/random.js";
import {log} from "../helper.js";
import enterName from "../names.js";
import PromiseQueue from "../utils/async-queue.js";

const OTHER_SIDE_ID = "server";


function makeid(length) {
    return rngFunc.makeId(length, Math.random);
}

function onConnectionAnimation(document, connection) {
    connection.on("socket_open", () => {
        const grid = document.getElementsByClassName("places")[0];
        grid.classList.add("loading");
        connection.on("socket_close", () => {
            grid.classList.remove("loading");
            grid.classList.add("flying-cards");
        });
    });
}

function setupActions(game, connection) {
    for (const handlerName of game.actionKeys()) {
        game.on(handlerName, (n) => connection.sendRawTo(handlerName, n, OTHER_SIDE_ID));
    }
}

export default function netMode(window, document, settings, gameFunction) {
    return new Promise((resolve, reject) => {
        enterName(window, document, settings);
        const myId = makeid(6);
        const connection = connectionFunc(settings, window.location, myId);
        const logger = document.getElementsByClassName("log")[0];
        connection.on("error", (e) => {
            log(settings, e, logger);
        });
        onConnectionAnimation(document, connection);
        connection.on("open", () => {
            const queue = PromiseQueue(console);
            settings["externalId"] = myId;
            settings.applyEffects = false;
            const game = gameFunction(window, document, settings);
            setupActions(game, connection);
            const actions = actionsFunc(game);
            connection.registerHandler(queue, actions);
            game.onConnect();
            resolve(game);
        });

        connection.connect().catch(e => {
            log(settings, e, logger);
            reject(e);
        });

    });
}
