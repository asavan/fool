import {getMyId} from "../connection/common.js";
import connectionChooser from "../connection/connection_chooser.js";
import actionsFuncUno from "../actions/actions_uno_client.js";
import actionsToSend from "../actions/actions_uno_server.js";
import loggerFunc from "../views/logger.js";
import PromiseQueue from "../utils/async-queue.js";
import { assert } from "../utils/assert.js";
import {safe_query} from "../views/safe_query.js";
import channelChooser from "../connection/channel_chooser.js";

function onConnectionAnimation(document, connection, logger) {
    connection.on("socket_open", () => {
        const grid = document.querySelector(".places");
        grid.classList.add("loading");
        logger.log("socket_open");
        const onClose = () => {
            logger.log("onConnectionAnimation");
            grid.classList.remove("loading");
            grid.classList.add("flying-cards");
        };
        connection.on("socket_close", onClose);
        connection.on("open", onClose);
    });
}

function setupGameToNetwork(game, connection, logger, myId) {
    const OTHER_SIDE_ID = "server";
    const keys = Object.keys(actionsToSend({}, null));
    keys.push("username");

    for (const handlerName of keys) {
        logger.log("setup handler", handlerName);
        game.on(handlerName, (n) => {
            if (n && n.externalId && myId !== n.externalId) {
                logger.log("Ignore", n.externalId);
                return;
            }
            return connection.sendRawTo(handlerName, n, OTHER_SIDE_ID);
        });
    }
}

function startGame(window, document, settings, gameFunction, myId, connection) {
    const loggerActions = loggerFunc(2, null, settings);
    const queue = PromiseQueue(console);
    settings.applyEffects = false;
    const game = gameFunction({window, document, settings, myId});
    setupGameToNetwork(game, connection, loggerActions, myId);
    const actions = {
        "start": (data) => {
            const unoGame = game.onStart(data);
            const engine = unoGame.getEngine();
            const unoActions = actionsFuncUno(engine, loggerActions);
            connection.registerHandler(unoActions, queue);
            return unoGame;
        }
    };
    connection.registerHandler(actions, queue);
    game.onConnect();
    return game;
}

export default async function netMode(window, document, settings, gameFunction) {
    const connectionFunc = await connectionChooser(settings);
    const cch = await channelChooser(settings);
    const myId = getMyId(window, settings, Math.random);
    assert(myId, "No net id");
    const el = safe_query(document, settings.clNAnchor);
    const logger = loggerFunc(2, el, settings);
    const connectionLogger = loggerFunc(1, el, settings);
    const connection = connectionFunc(myId, connectionLogger, false, settings);
    const socketUrl = cch.getConnectionUrl(settings, window.location);
    onConnectionAnimation(document, connection, logger);
    const gameInitPromise = Promise.withResolvers();
    connection.on("open", (id) => {
        logger.log("Server id ", id, myId);
        gameInitPromise.resolve(id);
    });

    await connection.connect(socketUrl, cch);
    connection.sendRawAll("join", {});
    await gameInitPromise.promise;
    const game = startGame(window, document, settings, gameFunction, myId, connection);
    return game;
}
