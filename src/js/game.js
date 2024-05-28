import enterName from "./names.js";
import choosePlaceFunc from "./places.js";
import unoGameFunc from "./uno-game.js";
import {loggerFunc} from "./helper.js";


function stub1() {
    // console.trace(message);
}

function makeCommonSeed(players) {
    let seed = "";
    for (const pl of players) {
        seed += pl.external_id;
    }
    return seed;
}

export default function game(window, document, settings) {

    const logger = loggerFunc(8, null, settings);

    const commands = [
        "move",
        "username",
        "draw",
        "pass",
        "changeCurrent",
        "discard",
        "shuffle",
        "clearPlayer",
        "roundover",
        "gameover",
        "start"
    ];

    const handlers = Object.fromEntries(commands.map((key) => [key, stub1]));

    let unoGame = null;
    let players = [];

    function on(name, f) {
        handlers[name] = f;
    }

    const renderChoosePlace = () => choosePlaceFunc(document, afterAllJoined, swap, players);

    const join = (name, external_id) => {

        const found = players.findIndex(player => player.external_id === external_id);

        if (found === -1) {
            players.push({"name": name, "external_id": external_id});
        } else {
            players[found].name = name;
        }
        renderChoosePlace();        
        return true;
    };

    const disconnect = (external_id) => {
        logger.log("disconnect", external_id);
        if (unoGame != null) {
            return false;
        }
        const old_size = players.length;
        players = players.filter(p => p.external_id != external_id);
        const new_size = players.length;
        renderChoosePlace();
        return old_size > new_size;
    };

    const onStart = (data) => {
        players = data.players;
        settings.seed = data.seed;
        unoGame = createUnoGame();
        const grid = document.getElementsByClassName("places")[0];
        grid.classList.remove("connected", "loading", "flying-cards");
        return unoGame;
    };

    const onNameChange = (name) => {
        // handlers["username"](data, "server");
        // TODO remove server
        return handlers["username"](name, "server");
    };

    const onConnect = () => {
        return enterName(window, document, settings, onNameChange);
    };

    function swap(id1, id2) {
        const temp = players[id1];
        players[id1] = players[id2];
        players[id2] = temp;
        return renderChoosePlace();
    }

    function createUnoGame() {
        return unoGameFunc(window, document, settings, players, handlers);
    }

    function afterAllJoined() {
        if (!settings.seed) {
            logger.log("settings", settings);
            settings.seed = makeCommonSeed(players);
        } else {
            logger.log("settings already set", settings);
        }
        unoGame = createUnoGame();
        logger.log("Game init");
        return unoGame.start();
    }

    const actionKeys = () => [...commands];

    const getEngine = () => {
        if (!unoGame) {
            logger.error("No game");
            return;
        }
        return unoGame.getEngine();
    };

    return {
        on,
        join,
        onConnect,
        onStart,
        createUnoGame,
        afterAllJoined,
        disconnect,
        actionKeys,
        getEngine
    };
}
