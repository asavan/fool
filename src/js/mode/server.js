"use strict";

import {removeElem, logHtml} from "../helper.js";
import actionsFunc from "../actions_server.js";
import actionsFuncUno from "../actions_uno_server.js";
import qrRender from "../lib/qrcode.js";
import connectionFunc from "../connection/server.js";
import PromiseQueue from "../utils/async-queue.js";

function makeQr(window, document, settings) {
    const staticHost = settings.sh || window.location.href;
    const url = new URL(staticHost);
    console.log("enemy url", url.toString());
    return qrRender(url.toString(), document.querySelector(".qrcode"));
}

export default function server(window, document, settings, gameFunction) {
    const clients = {};
    let index = 0;
    clients["server"] = {"index": index};

    return new Promise((resolve, reject) => {

        const connection = connectionFunc(settings, window.location);
        const logger = document.querySelector(settings.loggerInMode);
        connection.on("error", (e) => {
            logHtml(e, logger);
            reject(e);
        });
        connection.on("socket_open", () => {
            const code = makeQr(window, document, settings);
            connection.on("socket_close", () => {
                removeElem(code);
            });
        });

        // const queue = Queue();
        const queue = PromiseQueue(console);
        const game = gameFunction(window, document, settings);
        const actions = actionsFunc(game, clients);
        connection.registerHandler(actions, queue);
        for (const handlerName of game.actionKeys()) {
            game.on(handlerName, (n) => {
                let ignore;
                if (n && n.externalId) {
                    ignore = [n.externalId];
                }
                return connection.sendRawAll(handlerName, n, ignore);
            });
        }

        game.on("username", actions["username"]);

        game.on("start", ({players, engine}) => {
            connection.closeSocket();
            const unoActions = actionsFuncUno(engine);
            connection.registerHandler(unoActions, queue);
            console.log(players);
            return connection.sendRawAll("start", players);
        });

        connection.on("disconnect", (id) => {
            const is_disconnected = game.disconnect(id);
            if (is_disconnected) {
                --index;
                delete clients[id];
            }
            logHtml({id, index}, logger);
        });

        connection.on("open", (id) => {
            ++index;
            clients[id] = {"index": index};
        });

        game.onConnect();
        
        try {
            connection.connect();
        } catch(e) {
            logHtml(e, logger);
            reject(e);
        }
        resolve(game);
    });
}
