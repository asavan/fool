"use strict"; // jshint ;_;
import {delay} from "./helper.js";
import coreUnoFunc from "./uno.js";
import colorChooser from "./choose_color.js";
import layout from "./layout.js";

import {prng_alea} from "esm-seedrandom";

export default function unoGame(window, document, settings, playersExternal, handlers) {

    const myrng = prng_alea(settings.seed);
    const gameState = {
        inColorChoose: false,
        inExternalMove: false
    };
    const engine = coreUnoFunc(settings, myrng);
    let index = 0;
    let myIndex = 0;

    function on(name, f) {
        handlers[name] = f;
    }

    function drawScreen(marker) {
        layout.drawPlayers(window, document, engine, myIndex, settings, marker);
    }

    console.log(playersExternal);
    for (const p of playersExternal) {
        engine.addPlayer(p.name);
        if (p.external_id == settings.externalId) {
            myIndex = index;
        }
        ++index;
    }

    engine.on("draw", ({playerIndex, card}) => {
        layout.drawPlayersDeal(window, document, engine, myIndex, settings, "draw", card, playerIndex);
        const pause = delay(150);
        let external = Promise.resolve();
        if (playerIndex === myIndex || settings.mode === "server") {
            external = handlers["draw"]({playerIndex, card});
        }
        return Promise.all([pause, external]);
    });

    engine.on("drawExternal", ({playerIndex, card}) => {
        layout.drawPlayersDeal(window, document, engine, myIndex, settings, "drawExternal", card, playerIndex);
        const pause = delay(150);
        let external = Promise.resolve();
        if (settings.mode === "server") {
            external = handlers["draw"]({playerIndex, card});
        }
        return Promise.all([pause, external]);
    });

    engine.on("changeCurrent", async ({currentPlayer, dealer, direction}) => {
        // drawScreen("changeCurrent");
        layout.drawCurrent(window, document, engine, myIndex, settings);
        if (settings.mode === "server") {
            await handlers["changeCurrent"]({currentPlayer, dealer, myIndex, direction});
        }
        await delay(50);
    });

    engine.on("pass", async ({playerIndex}) => {
        if (playerIndex != myIndex) {
            console.error("Bad pass");
        }
        await handlers["pass"]({playerIndex, myIndex});
    });

    engine.on("move", (data) => {
        // drawScreen("move");
        console.log("move", data);
        layout.drawPlayersMove(window, document, engine, myIndex, settings, "drawExternal", data.card, data.playerIndex);
        // layout.drawPlayersMove(window, document, engine, myIndex, settings, data.card, data.playerIndex);
        const pause = delay(150);
        let external = Promise.resolve();
        if (data.playerIndex === myIndex || settings.mode === "server") {
            external = handlers["move"](data);
        }
        return Promise.all([pause, external]);
    });

    engine.on("moveExternal", (data) => {
        drawScreen("moveExternal");
        const pause = delay(150);
        let external = Promise.resolve();

        if (settings.mode === "server") {
            external = handlers["move"](data);
        }
        return Promise.all([pause, external]);
    });

    engine.on("discard", async (p) => {
        // drawScreen("discard");
        const draw = layout.drawDiscard(window, document, engine, myIndex, settings);
        await Promise.all([draw, handlers["discard"](p)]);
    });

    engine.on("shuffle", async (deck) => {
        // TODO play shuffle animation
        drawScreen("shuffle");
        await handlers["shuffle"](deck);
        await delay(300);
    });

    engine.on("deal", () => {
        console.log("NEVER");
    });

    function onGameEnd(message1, message2) {
        const overlay = document.getElementsByClassName("overlay")[0];
        const close = document.getElementsByClassName("close")[0];
        const btnInstall = document.getElementsByClassName("install")[0];

        close.addEventListener("click", function (e) {
            e.preventDefault();
            overlay.classList.remove("show");
        }, false);

        const h2 = overlay.querySelector("h2");
        h2.textContent = message1;
        const content = overlay.querySelector(".content");
        content.textContent = message2;
        overlay.classList.add("show");
        btnInstall.classList.remove("hidden2");
    }

    engine.on("gameover", async (data) => {
        drawScreen();
        console.log("GAME OVER", data);
        const name = playersExternal[data.playerIndex].name;
        console.log(name);
        onGameEnd(name + " wins", "with score " + data.score);
        await handlers["gameover"](data);
    });

    engine.on("clearPlayer", async (playerIndex) => {
        await handlers["clearPlayer"](playerIndex);
        drawScreen();
    });

    engine.on("clearPlayerExternal", () => {
        return drawScreen();
    });

    colorChooser(window, document, engine, gameState);

    engine.on("roundover", async (data) => {
        if (settings.mode === "net") {
            drawScreen();
            return;
        }
        console.log("roundover");
        await handlers["roundover"](data);
        await delay(1000);
        await engine.nextDealer();
        await engine.deal();
    });

    async function start() {
        await handlers["start"]({players: playersExternal, engine});
        await engine.chooseDealer();
        await delay(700);
        if (settings.showAll || settings.clickAll) {
            settings.show = true;
        } else {
            settings.show = false;
        }
        await engine.deal();
    }

    async function onShuffle(deck) {
        await engine.setDeck(deck);
        console.log("onShuffle");
        layout.drawPlayers(window, document, engine, myIndex, settings);
    }

    function onDraw(playerIndex, card) {
        console.log("onDraw", playerIndex, card);
        return engine.onDraw(playerIndex, card);
    }

    function onMove(data) {
        console.log("onMove", data);
        return engine.onMove(data.playerIndex, data.card, data.currentColor);
    }

    function onDiscard(card) {
        console.log("onDiscard");
        return engine.onDiscard(card);
    }

    function onChangeCurrent(data) {
        if (engine.getCurrentPlayer() !== data.myIndex && settings.mode == "server") {
            console.log("Wrong player", engine.getCurrentPlayer(), data.myIndex);
            return;
        }
        if (settings.showAll || settings.clickAll) {
            settings.show = true;
        } else {
            settings.show = false;
        }

        console.log("Change current", data.currentPlayer, data.dealer);
        engine.setCurrent(data.currentPlayer, data.dealer, data.direction);
        return layout.drawCurrent(window, document, engine, myIndex, settings);
        // drawScreen("onChangeCurrent");
    }

    function onClearHand(playerIndex) {
        return engine.cleanHand(playerIndex);
    }

    async function onNewRound(data) {
        console.log("onNewRound", data);
        const res = await engine.onNewRound(data);
        drawScreen();
        return res;
    }

    function onGameOver(data) {
        console.log("onGameOver", data);
        drawScreen();
        const name = playersExternal[data.playerIndex].name;
        console.log(name);
        onGameEnd(name + " wins", "with score " + data.score);
        return true;
    }

    function onPass(data) {
        return engine.onPass(data.playerIndex);
    }

    const getEngine = () => engine;

    return {
        on,
        start,
        onShuffle,
        onDraw,
        onDiscard,
        onChangeCurrent,
        onClearHand,
        onMove,
        onNewRound,
        onGameOver,
        onPass,
        getEngine
    };
}
