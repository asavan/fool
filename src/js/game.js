import enterName from "./names.js";
import choosePlaceFunc from "./places.js";
import unoGameFunc from "./uno-game.js";
import {loggerFunc} from "./helper.js";
import bestCardBot from "./bot/best_card.bot.js";


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

function setupBots(players, engine, queue, settings) {
    if (queue === undefined) {
        return;
    }
    
    const simpleBotIndexes = [];
    let index = 0;
    for (const player of players) {
        if (player.is_bot) {
            simpleBotIndexes.push(index);
        }
        ++index;
    }
    if (simpleBotIndexes.length === 0) {
        return;
    }
    const loggerBot = loggerFunc(8, null, settings);
    engine.on("changeCurrent", (currentChangeData) => {
        bestCardBot(engine, queue, loggerBot, simpleBotIndexes, currentChangeData);
    });
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
    let botCount = 0;
    let queue;

    const setQueue = (q) => {queue = q;};

    function on(name, f) {
        handlers[name] = f;
    }

    function addBot() {
        logger.log("addBot");
        ++botCount;
        const name = "bot " + botCount;
        return join(name, name, true);
    }

    const renderChoosePlace = () => choosePlaceFunc(document, afterAllJoined, swap, addBot, players);

    function join(name, external_id, isBot) {

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
        setupBots(players, unoGame.getEngine(), queue, settings);
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
        setQueue,
        onConnect,
        onStart,
        createUnoGame,
        afterAllJoined,
        disconnect,
        actionKeys,
        addBot,
        getEngine
    };
}
