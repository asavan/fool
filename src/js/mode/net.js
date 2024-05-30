import connectionFunc from "../connection/client.js";
import actionsFuncUno from "../actions_uno_client.js";
import rngFunc from "../utils/random.js";
import {loggerFunc} from "../helper.js";
import enterName from "../names.js";
import PromiseQueue from "../utils/async-queue.js";


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

function setupGameToNetwork(game, connection, logger, myId) {
    const OTHER_SIDE_ID = "server";
    for (const handlerName of game.actionKeys()) {
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
        const myId = makeid(6);
        const logger = loggerFunc(2, null, settings);
        const connection = connectionFunc(settings, window.location, myId, logger);
        connection.on("error", (e) => {
            logger.error(e);
            reject(e);
        });
        onConnectionAnimation(document, connection);
        connection.on("open", () => {
            const queue = PromiseQueue(console);
            settings["externalId"] = myId;
            settings.applyEffects = false;
            const game = gameFunction({window, document, settings});
            setupGameToNetwork(game, connection, logger, myId);
            const actions = {"start": async (data) => {
                const unoGame = await game.onStart(data);
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

        connection.connect().catch(e => {
            logger.error(e);
            reject(e);
        });
    });
}
