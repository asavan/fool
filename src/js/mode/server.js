import {removeElem, loggerFunc} from "../helper.js";
import actionsFuncUno from "../actions_uno_server.js";
import actionsToSend from "../actions_uno_client.js";
import qrRender from "../lib/qrcode.js";
import {getWebSocketUrl} from "../connection/common.js";
import connectionFunc from "../connection/server.js";
import PromiseQueue from "../utils/async-queue.js";

function makeQr(window, document, settings) {
    const staticHost = settings.sh || window.location.href;
    const url = new URL(staticHost);
    console.log("enemy url", url.toString());
    return qrRender(url.toString(), document.querySelector(".qrcode"));
}

function setupGameToNetwork(game, connection, logger) {
    const keys = Object.keys(actionsToSend({}, null));
    keys.push("start");
    for (const handlerName of keys) {
        logger.log("setup handler " + handlerName);
        game.on(handlerName, (n) => {
            let ignore;
            if (n && n.externalId) {
                console.log("Ignore", n.externalId);
                ignore = [n.externalId];
            }
            return connection.sendRawAll(handlerName, n, ignore);
        });
    }
}

export default function server(window, document, settings, gameFunction) {
    const clients = {};
    let index = 0;
    const myId = "server";
    clients[myId] = {index};

    return new Promise((resolve, reject) => {

        const logger = loggerFunc(2, document.querySelector(settings.loggerAnchor), settings);        
        const connection = connectionFunc(myId, logger, true);
        const socketUrl = getWebSocketUrl(settings, window.location);
        if (!socketUrl) {
            logger.error("Can't determine ws address", socketUrl);
            reject(socketUrl);
            return;
        }
        let qrCodeEl;
        connection.on("error", (e) => {
            logger.error(e);
            reject(e);
        });
        connection.on("socket_open", () => {
            qrCodeEl = makeQr(window, document, settings);
            connection.on("socket_close", () => {
                removeElem(qrCodeEl);
                qrCodeEl = undefined;
            });
        });

        const queue = PromiseQueue(logger);
        const game = gameFunction({window, document, settings, myId});
        game.setQueue(queue);
        const actions = {
            "username": (n, id) => {
                logger.log("User joined", n, id);
                const client = clients[id];
                client.username = n;
                return game.join(n, id, settings.playerIsBot);
            }
        };

        connection.registerHandler(actions, queue);
        setupGameToNetwork(game, connection, logger);

        game.on("username", actions["username"]);

        game.on("engineCreated", (engine) => {
            // connection.closeSocket();
            removeElem(qrCodeEl);
            qrCodeEl = undefined;

            const loggerActions = loggerFunc(7, null, settings);   
            const unoActions = actionsFuncUno(engine, loggerActions);
            connection.registerHandler(unoActions, queue);
        });

        connection.on("disconnect", (id) => {
            const is_disconnected = game.disconnect(id);
            if (is_disconnected) {
                --index;
                delete clients[id];
            }
            logger.log({id, index}, "disconnect");
        });

        connection.on("open", (con) => {
            ++index;
            clients[con.id] = {"index": index};
            logger.log("connected", con.id, con);
            if (game.isInPlay()) {
                // TODO find in players
                return connection.sendRawTo("start", game.toJson(), con.id);
            }
        });

        game.onConnect();
        connection.connect(socketUrl);
        resolve(game);
    });
}
