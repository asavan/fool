import {delay, loggerFunc, assert} from "./helper.js";
import coreUnoFunc from "./uno.js";
import colorChooser from "./choose_color.js";
import layout from "./layout.js";

import {prng_alea} from "esm-seedrandom";

export default function unoGame(window, document, settings, playersExternal, handlers) {

    const logger = loggerFunc(7, null, settings);
    const loggerLayout = loggerFunc(2, null, settings);
    layout.setLogger(loggerLayout);
    const myrng = prng_alea(settings.seed);
    const gameState = {
        inColorChoose: false,
        inExternalMove: false
    };
    const engine = coreUnoFunc(settings, myrng, logger);
    let index = 0;
    let myIndex = 0;

    function on(name, f) {
        handlers[name] = f;
    }

    function report(callbackName, data) {
        if (data && data.playerIndex !== undefined) {
            const playerExt = playersExternal[data.playerIndex];
            Object.assign(data, {externalId: playerExt.external_id, myIndex});
        }
        return handlers[callbackName](data);
    }

    function drawScreen(marker) {
        layout.drawPlayers({document, engine, myIndex, settings, playersExternal}, marker);
    }

    for (const p of playersExternal) {
        engine.addPlayer();
        if (p.external_id == settings.externalId) {
            myIndex = index;
        }
        ++index;
    }

    function onDrawTiming(playerIndex) {
        if (settings.show) {
            return 200;
        } else if (playerIndex === myIndex) {
            return 120;
        } else {
            return 50;
        }
    }

    engine.on("draw", ({playerIndex, card}) => {
        layout.drawPlayersDeal(window, {document, engine, myIndex, settings, playersExternal}, "draw", card, playerIndex);
        const promises = [delay(onDrawTiming(playerIndex))];
        if (settings.show) {
            promises.push(delay(200));
        } else if (playerIndex === myIndex) {
            promises.push(delay(120));
        } else {
            promises.push(delay(50));
        }
        if (playerIndex === myIndex || settings.mode === "server") {
            promises.push(handlers["draw"]({playerIndex, card}));
        }
        return Promise.allSettled(promises);
    });

    engine.on("drawExternal", ({playerIndex, card}) => {
        layout.drawPlayersDeal(window, {document, engine, myIndex, settings, playersExternal}, "drawExternal", card, playerIndex);
        const promises = [delay(onDrawTiming(playerIndex))];
        if (settings.mode === "server") {
            promises.push(report("draw", {playerIndex, card}));
        }
        return Promise.all(promises);
    });

    engine.on("changeCurrent", ({currentPlayer, dealer, direction, roundover}) => {
        layout.drawCurrent(document, engine, myIndex, settings);
        const pause = delay(50);
        const promises = [pause];
        if (settings.mode !== "net") {
            promises.push(handlers["changeCurrent"]({currentPlayer, dealer, myIndex, direction, roundover}));
        }
        return Promise.allSettled(promises);
    });

    engine.on("pass", (data) => {
        if (data.playerIndex !== myIndex) {
            logger.error("Bad pass");
        }
        return report("pass", data);
    });

    engine.on("move", (data) => {
        logger.log("move", data);
        layout.drawPlayersMove(window, {document, engine, myIndex, settings, playersExternal}, "drawMove", data.card, data.playerIndex);
        const pause = delay(150);
        const promises = [pause];
        if (data.playerIndex === myIndex || settings.mode === "server") {
            promises.push(report("move", data));
        }
        return Promise.all(promises);
    });

    engine.on("discard", async (p) => {
        const draw = layout.drawDiscard(document, engine, myIndex, settings);
        await Promise.all([draw, handlers["discard"](p)]);
    });

    engine.on("discardExternal", (p) => {
        assert(p === engine.getCardOnBoard());
        return layout.drawDiscard(document, engine, myIndex, settings);
    });

    engine.on("shuffle", async (deck) => {
        // TODO play shuffle animation
        drawScreen("shuffle");
        logger.log("new deck", deck.length, ...deck);
        await handlers["shuffle"](deck);
        await delay(300);
    });

    engine.on("deal", () => {
        logger.error("NEVER");
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
        onGameOver(data);
        await handlers["gameover"](data);
    });

    engine.on("clearPlayer", async (playerIndex) => {
        await handlers["clearPlayer"](playerIndex);
        drawScreen("clearPlayer");
    });

    engine.on("clearPlayerExternal", () => {
        return drawScreen("clearPlayerExternal");
    });

    colorChooser(window, document, engine, gameState);

    engine.on("roundover", async (data) => {
        if (settings.mode === "net") {
            drawScreen("roundover");
            return;
        }
        logger.log("roundover");
        await handlers["roundover"](data);
        await delay(1000);
        await engine.nextDealer();
        await engine.deal();
    });

    async function start() {
        await handlers["start"]({players: playersExternal, engine, seed: settings.seed});
        await engine.chooseDealer();
        await delay(700);
        if (settings.showAll || settings.clickAll) {
            settings.show = true;
        } else {
            settings.show = false;
        }
        await engine.deal();
    }

    function onShuffle(deck) {
        engine.setDeck(deck);
        drawScreen("onShuffle");
    }

    function onChangeCurrent(data) {
        if (engine.getCurrentPlayer() !== data.myIndex && settings.mode === "server") {
            logger.error("Wrong player", engine.getCurrentPlayer(), data.myIndex);
            return;
        }
        if (settings.showAll || settings.clickAll) {
            settings.show = true;
        } else {
            settings.show = false;
        }

        logger.log("Change current", data.currentPlayer, data.dealer);
        engine.setCurrent(data.currentPlayer, data.dealer, data.direction, data.roundover);
        return layout.drawCurrent(document, engine, myIndex, settings);
    }

    async function onNewRound(data) {
        const res = await engine.onNewRound(data);
        drawScreen("onNewRound");
        return res;
    }

    function onGameOver(data) {
        drawScreen("onGameOver");
        const name = playersExternal[data.playerIndex].name;
        const firstLine = name + " wins";
        const secondLine = "with score " + data.score;
        logger.log(firstLine, secondLine);
        onGameEnd(firstLine, secondLine);
        return true;
    }

    const getEngine = () => engine;

    return {
        on,
        start,
        onShuffle,
        onChangeCurrent,
        onNewRound,
        onGameOver,
        getEngine
    };
}
