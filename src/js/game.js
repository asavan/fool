"use strict"; // jshint ;_;
import {assert, delay} from "./helper.js";
import enterName from "./names.js";
import choosePlaceFunc from "./places.js";
import unoGameFunc from "./uno-game.js";

function stub(message) {
    console.log("Stub " + message);
}

function stub1(message) {
    console.log(message);
}

const handlers = {
    'move': stub,
    'moveExternal': stub,
    'drawExternal': stub,
    'gameover': stub,
    'username': stub,
    'start': stub1,
    'swap': stub1,
    'pass': stub1,
    'uno-start': stub1,
    'shuffle': stub1,
    'draw': stub1,
    'discard': stub1,
    'chooseColor': stub1,
    'clearPlayer': stub,
    'changeCurrent': stub,
    'roundover': stub
}


export default function game(window, document, settings) {

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
        players[ind] = {"name": name, "external_id": external_id};
        choosePlaceFunc(window, document, settings, handlers, players);
        return true;
    }

    const disconnect = (external_id) => {
        console.log(external_id);
        const old_size = players.length;
        players = players.filter(p => p.external_id != external_id);
        const new_size = players.length;
        console.log(players);
        choosePlaceFunc(window, document, settings, handlers, players);
        return old_size > new_size;
    }

    const start = () => {
        // TODO move to server
        const qr = document.querySelector(".qrcode");
        if (qr) {
            qr.innerHTML = '';
        }
        handlers['start'](players);
    }

    const onDraw = (p, q) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onDraw(p, q);
    }

    const onStart = (p) => {
        players = p;
        unoGame = unoGameFunc(window, document, settings, players, handlers);
        const grid = document.getElementsByClassName('places')[0];
        grid.removeAttribute("style");
    }

    const startButton = document.querySelector(".start");
    if (startButton) {
        startButton.addEventListener("click", start);
    }

    enterName(window, document, settings, handlers);

    const onConnect = () => {
        enterName(window, document, settings, handlers);
    }

    const swap = (id1, id2) => {
        const temp = players[id1];
        players[id1] = players[id2];
        players[id2] = temp;
        choosePlaceFunc(window, document, settings, handlers, players);
    }

    const afterAllJoined = async () => {
       start();
       unoGame = unoGameFunc(window, document, settings, players, handlers);
       console.log("Game init");
       await unoGame.start();
   }

    on('onSeatsFinished', afterAllJoined);

    const onShuffle = (deck) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        console.log("onShuffle");
        return unoGame.onShuffle(deck);
    }

    const onDiscard = (card) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onDiscard(card);
    }

    const onChangeCurrent = (currentData) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onChangeCurrent(currentData);
    }

    const cardToString = (currentData) => {
            if (unoGame == null) {
                console.error("No game");
                return;
            }
            return unoGame.cardToString(currentData);
        }

    const onClearHand = (card) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onClearHand(card);
    }

    const onNewRound = (data) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onNewRound(data);
    }

    const onGameOver = (data) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onGameOver(data);
    }

    const onPass = (data) => {
        if (unoGame == null) {
            console.error("No game");
            return;
        }
        return unoGame.onPass(data);
    }


    return {
       on,
       onChange,
       join,
       start,
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
       cardToString,
       onPass
    }
}
