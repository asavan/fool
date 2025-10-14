import loggerFunc from "../views/logger.js";
import actionsFuncUno from "../actions/actions_uno_server.js";
import actionsToSend from "../actions/actions_uno_client.js";
import connectionChooser from "../connection/connection_chooser.js";
import PromiseQueue from "../utils/async-queue.js";
import { makeQr, removeElem } from "../views/qr_helper.js";
import {assert} from "../utils/assert.js";
import {safe_query} from "../views/safe_query.js";
import channelChooser from "../connection/channel_chooser.js";

function setupGameToNetwork(game, connection, logger) {
    const keys = Object.keys(actionsToSend({}, null));
    keys.push("start");
    for (const handlerName of keys) {
        logger.log("setup handler " + handlerName);
        game.on(handlerName, (n) => {
            let ignore;
            if (n && n.externalId) {
                logger.log("Ignore", n.externalId);
                ignore = [n.externalId];
            }
            return connection.sendRawAll(handlerName, n, ignore);
        });
    }
}

export default async function server(window, document, settings, gameFunction) {
    const myId = "server";

    const connectionFunc = await connectionChooser(settings);
    const cch = await channelChooser(settings);
    return new Promise((resolve, reject) => {
        const el = safe_query(document, settings.sNAnchor);
        const logger = loggerFunc(2, el, settings);
        const connectionLogger = loggerFunc(1, el, settings);
        const connection = connectionFunc(myId, connectionLogger, true, settings);
        const socketUrl = cch.getConnectionUrl(settings, window.location);
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
            "username": (data) => {
                logger.log("User joined", data);
                const { name, externalId } = data;
                assert(name, "No name");
                assert(externalId, "No externalId");
                return game.join(name, externalId, settings.playerIsBot);
            }
        };

        connection.registerHandler(actions, queue);
        setupGameToNetwork(game, connection, logger);

        game.on("username", async (data) => {
            await actions["username"](data);
            for (let i = 0; i < settings.botCount; ++i) {
                game.addBot();
            }
        });

        game.on("engineCreated", (engine) => {
            logger.log("engineCreated");
            removeElem(qrCodeEl);
            qrCodeEl = undefined;

            const loggerActions = loggerFunc(5, null, settings);
            const unoActions = actionsFuncUno(engine, loggerActions);
            connection.registerHandler(unoActions, queue);
        });

        connection.on("disconnect", (id) => {
            const is_disconnected = game.disconnect(id);
            logger.log({id, is_disconnected}, "disconnect");
        });

        connection.on("join", (con) => {
            logger.log("connected", con);
            if (game.canSeeGame(con.id)) {
                return connection.sendRawTo("start", game.toJson(), con.id);
            } else {
                logger.log("Try see game", con.id);
            }
        });

        game.onConnect();
        connection.connect(socketUrl, cch).catch(e => reject(e));
        resolve(game);
    });
}
