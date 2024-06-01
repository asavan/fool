import {delay, loggerFunc, assert} from "./helper.js";
import coreUnoFunc from "./uno/engine.js";
import colorChooser from "./views/choose_color.js";
import layout from "./views/layout.js";
import setupBots from "./bot/setup_bot.js";

import {prng_alea} from "esm-seedrandom";

export default function unoGame({window, document, settings}, {playersExternal, myId, queue}, engineRaw, handlers) {

    const logger = loggerFunc(7, null, settings);
    const loggerLayout = loggerFunc(2, null, settings);
    const loggerBot = loggerFunc(6, null, settings);

    layout.setLogger(loggerLayout);
    const myrng = prng_alea(settings.seed);
    const gameState = {
        inColorChoose: false,
        inExternalMove: false
    };
    const myIndex = playersExternal.findIndex(p => p.external_id === myId);
    assert(myIndex >= 0, "Not my game");
    const engine = coreUnoFunc(settings, myrng, logger, engineRaw);

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

    function onDrawTiming(playerIndex, showAllCards) {
        if (showAllCards) {
            return 200;
        } else if (playerIndex === myIndex) {
            return 120;
        } else {
            return 50;
        }
    }

    engine.on("draw", ({playerIndex, card}) => {
        layout.drawPlayersDeal(window, {document, engine, myIndex, settings, playersExternal}, "draw", card, playerIndex);
        const pause = delay(onDrawTiming(playerIndex, engine.showAllCards()));
        const network = handlers["draw"]({playerIndex, card});
        const promises = [pause, network];
        return Promise.allSettled(promises);
    });

    engine.on("drawExternal", ({playerIndex, card}) => {
        layout.drawPlayersDeal(window, {document, engine, myIndex, settings, playersExternal}, "drawExternal", card, playerIndex);
        const promises = [delay(onDrawTiming(playerIndex, engine.showAllCards()))];
        if (settings.mode === "server") {
            promises.push(report("draw", {playerIndex, card}));
        }
        return Promise.all(promises);
    });

    engine.on("changeCurrent", (data) => {
        layout.drawCurrent(document, engine, myIndex, settings);
        const pause = delay(50);
        const promises = [pause];
        if (settings.mode !== "net") {
            promises.push(report("changeCurrent", data));
        }
        return Promise.allSettled(promises);
    });

    engine.on("changeCurrentExternal", () => {
        layout.drawCurrent(document, engine, myIndex, settings);
        const pause = delay(50);
        const promises = [pause];
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
        const promises = [pause, report("move", data)];
        return Promise.allSettled(promises);
    });

    engine.on("discard", async (p) => {
        const draw = layout.drawDiscard(document, engine, myIndex, settings);
        await Promise.allSettled([draw, handlers["discard"](p)]);
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

    engine.on("shuffleFake", async (deck) => {
        // TODO play shuffle animation
        drawScreen("shuffleFake");
        logger.log("new deck", deck.length, ...deck);
        await delay(300);        
    });

    function onGameEnd(message1, message2) {
        const overlay = document.querySelector(".overlay");
        const close = document.querySelector(".close");
        const btnInstall = document.querySelector(".install");

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
        drawScreen("roundover");
        if (settings.mode === "net") {
            return;
        }
        await handlers["roundover"](data);
        await delay(1000);
        await engine.nextDealer();
        await engine.deal();
    });

    async function start() {
        await delay(100);
        await engine.chooseDealer();
        await delay(700);
        await engine.deal();
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

    // TODO may be delete this
    const getEngine = () => engine;

    setupBots(playersExternal, engine, queue, loggerBot);

    handlers["engineCreated"](engine);
    drawScreen("firstDraw");

    return {
        start,
        getEngine
    };
}
