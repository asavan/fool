"use strict";

import {removeElem, loggerFunc} from "../helper.js";
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

        const logger = loggerFunc(2, document.querySelector(settings.loggerAnchor), settings);        
        const connection = connectionFunc(logger);
        const socketUrl = connection.getWebSocketUrl(settings, window.location);
        if (!socketUrl) {
            logger.error("Can't determine ws address", socketUrl);
            reject(socketUrl);
            return;
        }
        connection.on("error", (e) => {
            logger.error(e);
            reject(e);
        });
        connection.on("socket_open", () => {
            const code = makeQr(window, document, settings);
            connection.on("socket_close", () => {
                removeElem(code);
            });
        });

        // const queue = Queue();
        const queue = PromiseQueue(logger);
        const game = gameFunction(window, document, settings);
        game.setQueue(queue);
        const actions = actionsFunc(game, clients, logger);
        connection.registerHandler(actions, queue);
        for (const handlerName of game.actionKeys()) {
            game.on(handlerName, (n) => {
                let ignore;
                if (n && n.externalId) {
                    console.log("Ignore", n.externalId);
                    ignore = [n.externalId];
                }
                return connection.sendRawAll(handlerName, n, ignore);
            });
        }

        game.on("username", actions["username"]);

        game.on("start", ({players, engine, seed}) => {
            connection.closeSocket();
            const loggerActions = loggerFunc(7, null, settings);   
            const unoActions = actionsFuncUno(engine, loggerActions);
            connection.registerHandler(unoActions, queue);
            return connection.sendRawAll("start", {players, seed});
        });

        connection.on("disconnect", (id) => {
            const is_disconnected = game.disconnect(id);
            if (is_disconnected) {
                --index;
                delete clients[id];
            }
            logger.log({id, index}, "disconnect");
        });

        connection.on("open", (id) => {
            ++index;
            clients[id] = {"index": index};
        });

        game.onConnect();        
        connection.connect(socketUrl);
        resolve(game);
    });
}
