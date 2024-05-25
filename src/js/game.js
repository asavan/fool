"use strict"; // jshint ;_;
import enterName from "./names.js";
import choosePlaceFunc from "./places.js";
import unoGameFunc from "./uno-game.js";

function stub(message) {
    console.trace("Stub " + message);
}

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

    const handlers = {
        "move": stub,
        "username": stub,
        "draw": stub1,
        "pass": stub1,
        "changeCurrent": stub,
        "discard": stub1,
        "shuffle": stub1,
        "clearPlayer": stub,
        "roundover": stub,
        "gameover": stub,
        "start": stub1,
        "swap": stub1,
        "onSeatsFinished": stub1
    };

    let unoGame = null;
    let players = [];

    function onChange(data) {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onMove(data);
    }

    function on(name, f) {
        handlers[name] = f;
    }

    const join = (name, external_id) => {
        console.log("Before choosePlaceFunc");

        const found = players.findIndex(player => player.external_id === external_id);

        if (found === -1) {
            players.push({"name": name, "external_id": external_id});
        } else {
            players[found].name = name;
        }

        choosePlaceFunc(window, document, settings, handlers, players);
        return true;
    };

    const disconnect = (external_id) => {
        console.log("disconnect", external_id);
        if (unoGame != null) {
            return false;
        }
        const old_size = players.length;
        players = players.filter(p => p.external_id != external_id);
        const new_size = players.length;
        console.log("disconnect", players);
        choosePlaceFunc(window, document, settings, handlers, players);
        return old_size > new_size;
    };

    const onStart = (p) => {
        players = p;
        settings.seed = makeCommonSeed(players);
        unoGame = unoGameFunc(window, document, settings, players, handlers);
        const grid = document.getElementsByClassName("places")[0];
        grid.classList.remove("connected", "loading", "flying-cards");
        return unoGame;
    };

    const onConnect = () => {
        console.log("onConnect", handlers);
        enterName(window, document, settings, handlers);
    };

    const swap = (id1, id2) => {
        const temp = players[id1];
        players[id1] = players[id2];
        players[id2] = temp;
        choosePlaceFunc(window, document, settings, handlers, players);
    };

    const afterAllJoined = async () => {
        if (!settings.seed) {
            console.log("settings", settings);
            settings.seed = makeCommonSeed(players);
        } else {
            console.log("settings already set", settings.seed);
        }
        unoGame = unoGameFunc(window, document, settings, players, handlers);
        console.log("Game init");
        await unoGame.start();
    };

    const actionKeys = () => Object.keys(handlers);

    // TODO remove this
    const getHandlers = () => handlers;

    const getEngine = () => {
        if (!unoGame) {
            console.error("No game");
            return;
        }
        return unoGame.getEngine();
    };

    return {
        on,
        onChange,
        join,
        onConnect,
        swap,
        onStart,
        afterAllJoined,
        disconnect,
        actionKeys,
        getEngine,
        getHandlers
    };
}
