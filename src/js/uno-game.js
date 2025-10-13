import loggerFunc from "./views/logger.js";
import {assert} from "./utils/assert.js";
import {delay} from "./utils/timer.js";

import coreUnoFunc from "./uno/engine.js";
import colorChooser from "./views/choose_color.js";
import onGameEnd from "./views/end_game.js";
import layout from "./views/layout.js";
import setupBots from "./bot/setup_bot.js";

import {prng_alea} from "esm-seedrandom";

export default function unoGame({window, document, settings}, {playersExternal, myId, queue}, engineRaw, handlers) {

    const logger = loggerFunc(7, null, settings);
    const traceLogger = loggerFunc(1, null, settings);
    const debugLogger = loggerFunc(4, null, settings);
    const loggerLayout = loggerFunc(2, null, settings);
    const loggerBot = loggerFunc(3, null, settings);

    layout.setLogger(loggerLayout);
    const myrng = prng_alea(settings.seed);
    const gameState = {
        inColorChoose: false,
        inExternalMove: false
    };
    const myIndex = playersExternal.findIndex(p => p.externalId === myId);
    assert(myIndex >= 0, "Not my game");
    const engine = coreUnoFunc({settings, rngFunc: myrng, applyEffects: settings.applyEffects, delay},
        {logger, traceLogger, debugLogger},
        engineRaw);

    function report(callbackName, data) {
        if (data && data.playerIndex !== undefined) {
            const playerExt = playersExternal[data.playerIndex];
            Object.assign(data, {externalId: playerExt.externalId, myIndex});
        }
        return handlers[callbackName](data);
    }

    function drawScreen(marker) {
        return layout.drawPlayers({document, engine, myIndex, settings, playersExternal}, marker);
    }

    function onDrawTiming(playerIndex, showAllCards) {
        if (showAllCards) {
            return settings.drawShow;
        } else if (playerIndex === myIndex) {
            return settings.drawMy;
        } else {
            return settings.drawClosed;
        }
    }

    engine.on("draw", ({playerIndex, card}) => {
        const drawAnim = layout.drawPlayersDeal(window,
            {document, engine, myIndex, settings, playersExternal},
            "draw", card, playerIndex
        );
        const pause = delay(onDrawTiming(playerIndex, engine.showAllCards()));
        const network = handlers["draw"]({playerIndex, card});
        const promises = [pause, network, drawAnim];
        return Promise.all(promises);
    });

    engine.on("drawExternal", ({playerIndex, card}) => {
        const drawAnim = layout.drawPlayersDeal(window,
            {document, engine, myIndex, settings, playersExternal},
            "drawExternal", card, playerIndex
        );
        const promises = [delay(onDrawTiming(playerIndex, engine.showAllCards())), drawAnim];
        if (settings.mode === "server") {
            promises.push(report("draw", {playerIndex, card}));
        }
        return Promise.all(promises);
    });

    engine.on("changeCurrent", (data) => {
        const draw = layout.drawCurrent(document, engine, myIndex, settings);
        const promises = [draw];
        if (settings.mode !== "net") {
            promises.push(report("changeCurrent", data));
        }
        return Promise.all(promises);
    });

    engine.on("changeCurrentExternal", () => {
        const draw = layout.drawCurrent(document, engine, myIndex, settings);
        const promises = [draw];
        return Promise.all(promises);
    });

    engine.on("pass", (data) => {
        if (data.playerIndex !== myIndex) {
            logger.error("Bad pass");
        }
        return report("pass", data);
    });

    engine.on("move", (data) => {
        debugLogger.log("move", data);
        const draw = layout.drawPlayersMove(window,
            {document, engine, myIndex, settings, playersExternal},
            "drawMove",
            data.card,
            data.playerIndex
        );
        const pause = delay(settings.movePause);
        const promises = [draw, pause, report("move", data)];
        return Promise.all(promises);
    });

    engine.on("discard", async (p) => {
        const draw = layout.drawDiscard({document, engine, myIndex, settings});
        await Promise.all([draw, report("discard", p)]);
    });

    engine.on("discardExternal", (p) => {
        assert(p === engine.getCardOnBoard());
        return layout.drawDiscard({document, engine, myIndex, settings});
    });

    engine.on("shuffle", async (deck) => {
        debugLogger.log("new deck", deck.length, ...deck);
        const draw = layout.drawShuffle({document, settings, engine, myIndex,
            logger: loggerLayout, length: deck.length});
        const promises = [draw, report("shuffle", deck)];
        await Promise.all(promises);
    });

    engine.on("shuffleFake", (deck) => {
        logger.log("new deck fake", deck.length, deck);
        return layout.drawShuffle({document, settings, engine, myIndex,
            logger: loggerLayout, length: deck.length});
    });


    engine.on("gameover", async (data) => {
        onGameOver(data);
        if (settings.mode === "net") {
            return;
        }
        await handlers["gameover"](data);
    });

    engine.on("clearPlayer", async (playerIndex) => {
        const promises = [handlers["clearPlayer"](playerIndex)];
        // drawScreen("clearPlayer");
        promises.push(layout.cleanHand({
            playerIndex,
            myIndex,
            document,
            settings,
            engine,
            animTime: settings.drawMy,
            logger: loggerLayout}));
        await Promise.all(promises);
    });

    engine.on("clearPlayerExternal", () => drawScreen("clearPlayerExternal"));

    colorChooser(window, document, engine, gameState);

    const newRound = async () => {
        await delay(settings.betweenRounds);
        await engine.nextDealer();
        await delay(settings.beforeDeal);
        await engine.deal();
    };

    engine.on("roundover", async (data) => {
        drawScreen("roundover");
        if (settings.mode === "net") {
            return;
        }
        await handlers["roundover"](data);
        // no await
        newRound();
    });

    async function start() {
        drawScreen("start");
        if (settings.chooseDealer) {
            await delay(settings.beforeChooseDealer);
            await engine.chooseDealer();
        }
        await delay(settings.betweenRounds);
        await engine.deal();
    }

    function onGameOver(data) {
        drawScreen("onGameOver");
        const name = playersExternal[data.playerIndex].name;
        const firstLine = name + " wins";
        const secondLine = "with score " + data.score;
        logger.log(firstLine, secondLine);
        onGameEnd(document, firstLine, secondLine);
        return true;
    }

    // TODO may be delete this
    const getEngine = () => engine;

    setupBots({players: playersExternal, engine, queue, logger: loggerBot, settings, rngEngine: myrng});

    handlers["engineCreated"](engine);
    drawScreen("firstDraw");
    traceLogger.log("engineCreated");
    delay(100).then(() => {
        const grid = document.querySelector(".places");
        if (grid) {
            grid.classList.remove("connected", "loading", "flying-cards");
        }
    });

    return {
        start,
        getEngine
    };
}
