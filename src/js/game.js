import enterName from "./views/names.js";
import choosePlaceFunc from "./views/places.js";
import unoGameFunc from "./uno-game.js";
import loggerFunc from "./views/logger.js";
import {assert} from "./utils/assert.js";
import emptyEngine from "./uno/default-engine.js";

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

export default function game({window, document, settings, myId}) {

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
        "engineCreated",
        "gameover",
        "start"
    ];

    const handlers = Object.fromEntries(commands.map((key) => [key, stub1]));

    let unoGame;
    let players = [];
    let botCount = 0;
    let queue;

    const isInPlay = () => unoGame != null;

    const setQueue = (q) => {queue = q;};

    function on(name, f) {
        handlers[name] = f;
    }

    function addBot() {
        logger.log("addBot");
        ++botCount;
        const name = "bot " + botCount;
        const externalId = "bot" + botCount;
        return join(name, externalId, true);
    }

    const renderChoosePlace = () => choosePlaceFunc(document, afterAllJoined, swap, addBot, players);

    function join(name, external_id, isBot) {
        assert(name, "No name");
        const found = players.findIndex(player => player.external_id === external_id);

        if (found === -1) {
            players.push({name, external_id, is_bot: !!isBot});
        } else {
            players[found].name = name;
        }
        renderChoosePlace();
        return true;
    }

    const disconnect = (external_id) => {
        if (unoGame != null) {
            return false;
        }
        logger.log("disconnect", external_id);
        const old_size = players.length;
        players = players.filter(p => p.external_id !== external_id);
        const new_size = players.length;
        renderChoosePlace();
        return old_size > new_size;
    };

    const onStart = (data) => {
        players = data.players;
        settings.seed = data.seed;
        unoGame = createUnoGame(data.engine);
        return unoGame;
    };

    const onNameChange = (name) => {
        return handlers["username"](name, myId);
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

    function createUnoGame(engineRaw) {
        return unoGameFunc({window, document, settings}, {playersExternal: players, myId, queue}, engineRaw, handlers);
    }

    const toJson = () => {
        return {players, seed: settings.seed, engine: unoGame.getEngine().toJson()};
    };

    async function afterAllJoined() {
        assert(players.length > 0, "No players");
        if (!settings.seed) {
            logger.log("settings", settings);
            settings.seed = makeCommonSeed(players);
        } else {
            logger.log("settings already set", settings);
        }
        unoGame = createUnoGame(emptyEngine(settings, players.length));
        logger.log("Game init");
        await handlers["start"](toJson());
        await unoGame.start();
    }

    return {
        on,
        join,
        isInPlay,
        toJson,
        setQueue,
        onConnect,
        onStart,
        afterAllJoined,
        disconnect,
        addBot
    };
}
