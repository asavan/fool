import connectionFunc from "../connection/client.js";
import actionsFuncUno from "../actions_uno_client.js";
import actionsToSend from "../actions_uno_server.js";
import rngFunc from "../utils/random.js";
import {loggerFunc} from "../helper.js";
import enterName from "../names.js";
import PromiseQueue from "../utils/async-queue.js";


function getMyId(window, settings, rngEngine) {
    const data = window.sessionStorage.getItem(settings.idNameInStorage);
    if (data) {
        return data;
    }
    const newId = rngFunc.makeId(settings.idNameLen, rngEngine);
    window.sessionStorage.setItem(settings.idNameInStorage, newId);
}

function onConnectionAnimation(document, connection) {
    connection.on("socket_open", () => {
        const grid = document.querySelector(".places");
        grid.classList.add("loading");
        connection.on("socket_close", () => {
            grid.classList.remove("loading");
            grid.classList.add("flying-cards");
        });
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

export default function netMode(window, document, settings, gameFunction) {
    return new Promise((resolve, reject) => {
        enterName(window, document, settings);
        const myId = getMyId(window, settings, Math.random);
        const logger = loggerFunc(2, null, settings);
        const connection = connectionFunc(myId, logger);
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
        onConnectionAnimation(document, connection);
        connection.on("open", (con) => {
            const queue = PromiseQueue(console);
            settings["externalId"] = myId;
            settings.applyEffects = false;
            const game = gameFunction({window, document, settings});
            setupGameToNetwork(game, con, logger, myId);
            const actions = {"start": (data) => {
                const unoGame = game.onStart(data);
                const loggerActions = loggerFunc(6, null, settings);
                const engine = unoGame.getEngine();
                const unoActions = actionsFuncUno(engine, loggerActions);
                connection.registerHandler(unoActions, queue);
                return unoGame;
            }};
            connection.registerHandler(actions, queue);
            game.onConnect();
            resolve(game);
        });

        connection.connect(socketUrl).catch(e => {
            logger.error(e);
            reject(e);
        });
    });
}
