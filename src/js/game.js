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

    const join = (ind, name, external_id) => {
        console.log("Before choosePlaceFunc");
        players[ind] = {"name": name, "external_id": external_id};
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

    const onDraw = (p, q) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onDraw(p, q);
    };

    const onStart = (p) => {
        players = p;
        settings.seed = makeCommonSeed(players);
        unoGame = unoGameFunc(window, document, settings, players, handlers);
        const grid = document.getElementsByClassName("places")[0];
        grid.classList.remove("connected", "loading", "flying-cards");
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

    const onShuffle = (deck) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        console.log("onShuffle");
        return unoGame.onShuffle(deck);
    };

    const onDiscard = (card) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onDiscard(card);
    };

    const onChangeCurrent = (currentData) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onChangeCurrent(currentData);
    };

    const onClearHand = (card) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onClearHand(card);
    };

    const onNewRound = (data) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onNewRound(data);
    };

    const onGameOver = (data) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onGameOver(data);
    };

    const onPass = (data) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onPass(data);
    };

    const actionKeys = () => Object.keys(handlers);

    // TODO remove this
    const getHandlers = () => handlers;

    return {
        on,
        onChange,
        join,
        onConnect,
        swap,
        onStart,
        afterAllJoined,
        onShuffle,
        onDraw,
        onDiscard,
        onNewRound,
        onChangeCurrent,
        onClearHand,
        onGameOver,
        disconnect,
        onPass,
        actionKeys,
        getHandlers
    };
}
