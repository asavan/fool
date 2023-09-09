"use strict"; // jshint ;_;
import {assert, delay} from "./helper.js";
import coreUnoFunc from "./uno.js";
import colorChooser from "./choose_color.js";
import layout from "./layout.js";

export default function unoGame(window, document, settings, playersExternal, handlers) {

    const engine = coreUnoFunc(settings);
    let index = 0;
    let myIndex = 0;

    function drawScreen() {
        layout.drawPlayers(window, document, engine, myIndex, settings);
    }

    console.log(playersExternal);
    for (const p of playersExternal) {
        engine.addPlayer(p.name);
        if (p.external_id == settings.externalId) {
            myIndex = index;
        }
        ++index;
    }

    const handCont = document.querySelector('.hand-cont');
    engine.on("draw", async ({playerIndex, card}) => {
        drawScreen();
        await delay(30);
        if (playerIndex === myIndex || settings.mode === 'server') {
            await handlers['draw']({playerIndex, card});
        }
    });

    engine.on("drawExternal", async ({playerIndex, card}) => {
        drawScreen();
        await delay(30);
        if (settings.mode === 'server') {
            await handlers['draw']({playerIndex, card});
        }
    });

    engine.on("changeCurrent", async ({currentPlayer, dealer, direction}) => {
        layout.drawPlayers(window, document, engine, myIndex, settings);
        await delay(30);
        if (settings.mode === 'server') {
            await handlers['changeCurrent']({currentPlayer, dealer, myIndex, direction});
        }
    });

    engine.on("pass", async ({playerIndex}) => {
        if (playerIndex != myIndex) {
            console.error("Bad pass");
        }
        await handlers['pass']({playerIndex, myIndex});
    });

    engine.on("move", async (data) => {
        layout.drawPlayers(window, document, engine, myIndex, settings);
        await delay(30);
        if (data.playerIndex === myIndex || settings.mode === 'server') {
            await handlers['move'](data);
        }
    });

    engine.on("moveExternal", async (data) => {
        layout.drawPlayers(window, document, engine, myIndex, settings);
        await delay(30);
        if (settings.mode === 'server') {
            await handlers['move'](data);
        }
    });

    engine.on("discard", async (p) => {
        drawScreen();
        await delay(30);
        await handlers['discard'](p);
    });

    engine.on("shuffle", async (deck) => {
        // TODO play shuffle animation
        drawScreen();
        await delay(300);
        await handlers['shuffle'](deck);
    });

    engine.on("deal", () => {
        console.log("deal");
    });

    engine.on("gameover", async (data) => {
        drawScreen();
        console.log("GAME OVER");
        await handlers['gameover'](data);
    });

    engine.on("clearPlayer", async (playerIndex) => {
        await handlers['clearPlayer'](playerIndex);
    });

    colorChooser(window, document, engine);

    engine.on("roundover", async (data) => {
        if (settings.mode === 'net') {
            drawScreen();
            return;
        }
        console.log("roundover");
        await handlers["roundover"](data);
        await delay(200);
        await engine.cleanAllHands();
        await delay(300);
        await engine.nextDealer();
        await engine.deal();
    });

    async function start() {
        await engine.chooseDealer();
        await delay(1000);
        if (settings.showAll) {
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

    async function onChangeCurrent(data) {
        if (engine.getCurrentPlayer() !== data.myIndex && settings.mode == 'server') {
            console.log("Wrong player", engine.getCurrentPlayer(), data.myIndex);
            return;
        }
        if (settings.showAll) {
            settings.show = true;
        } else {
            settings.show = false;
        }

        console.log("Change current", data.currentPlayer, data.dealer);
        engine.setCurrent(data.currentPlayer, data.dealer, data.direction);
        drawScreen();
    }

    async function onClearHand(playerIndex) {
        await engine.cleanHand(playerIndex);
        drawScreen();
    }

    async function onNewRound(data) {
        console.log("onNewRound", data);
        const res = await engine.onNewRound(data);
        drawScreen();
        return res;
    }

    async function onGameOver(data) {
        console.log("onGameOver", data);
        const res = await engine.onNewRound(data);
        drawScreen();
        return res;
    }

    function cardToString(card) {
        return engine.cardColor(card) + " " + engine.cardType(card);
    }

    function onPass(data) {
        return engine.onPass(data.playerIndex);
    }

    return {
       start,
       onShuffle,
       onDraw,
       onDiscard,
       onChangeCurrent,
       onClearHand,
       onMove,
       onNewRound,
       onGameOver,
       cardToString,
       onPass
    }
}
