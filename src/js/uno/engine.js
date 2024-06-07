import deckFunc from "./deck.js";
import newPlayer from "./player.js";
import core from "./basic.js";

import handlersFunc from "../utils/handlers.js";

import chooseDealerInner2 from "./dealer.js";
import { delay } from "../utils/timer.js";

function assertHelper(logger) {
    /* #__PURE__ */
    return (b, message) => {
        if (b) return;
        logger.error(message);
        throw message;
    };
}

export default function initCore({settings, rngFunc, applyEffects},
    {logger, traceLogger, debugLogger},
    {
        playersRaw,
        dealer,
        direction,
        deckRaw,
        discardPile,
        currentPlayer,
        cardTaken,
        cardDiscarded,
        maxScore,
        gameState,
        cardOnBoard,
        currentColor
    }
) {

    const MAX_SCORE = maxScore;

    const localAssert = assertHelper(logger);

    const commands = [
        "shuffle",
        "shuffleFake",
        "draw",
        "discard",
        "discardExternal",
        "move",
        "clearPlayer",
        "clearPlayerExternal",
        "changeCurrent",
        "changeCurrentExternal",
        "changeDealer",
        "gameover",
        "roundover",
        "pass",
        "drawExternal",
        "moveExternal"
    ];

    const handlers = handlersFunc(commands);
    function on(name, f) {
        return handlers.on(name, f);
    }

    function report(callbackName, data) {
        if (callbackName === "changeCurrent" && !applyEffects) {
            logger.error("try to change current without effect");
        }
        return handlers.call(callbackName, data);
    }

    const onShuffle = (d) => report("shuffle", d);
    const players = playersRaw.map((p, ind) => newPlayer(p.pile, ind, p.score));
    let deck = deckFunc.newExternalDeck(deckRaw, onShuffle, rngFunc);

    let chooseColor = getCurrentColor;
    const setColorChooser = (f) => {chooseColor = f;};

    function getCurrentColor() {
        return currentColor;
    }

    function getDirection() {
        return direction;
    }

    function calcNextFromCurrent(cur, size, direction) {
        return core.nextPlayer(0, size, direction, cur);
    }

    function getCardOnBoard() {
        return cardOnBoard;
    }

    function addPlayer() {
        players.push(newPlayer(players.length));
        return true;
    }

    function reshuffleDiscard() {
        const onTop = discardPile.pop();
        deck.setDeck(discardPile);
        discardPile = [onTop];
        return deck.shuffle();
    }

    async function dealToPlayer(deck, playerIndex, external) {
        if (deck == null || deck.size() === 0) {
            logger.error("deck is empty");
            return;
        }
        const card = deck.deal();
        if (card == null) {
            logger.error("deck is empty, should never happen");
            return;
        }
        players[playerIndex].addCard(card);
        if (!external) {
            await report("draw", {playerIndex, card});
        } else {
            await report("drawExternal", {playerIndex, card});
        }
        if (deck.size() === 0 && applyEffects) {
            logger.log("reshuffle discard");
            await reshuffleDiscard();
        }
        return card;
    }

    function secretlySeeTopCard() {
        if (deck == null) {
            return;
        }
        return deck.topCard();
    }

    async function onDraw(playerIndex, card) {
        if (!deck.checkTop(card)) {
            logger.error("Different engines");
            return false;
        }
        if (!(playerIndex === currentPlayer
            || core.isDrawCard(cardOnBoard)
            || gameState === core.GameStage.CHOOSE_DEALER
            || gameState === core.GameStage.DEALING)
        ) {
            logger.error("draw not for current player", state());
            return false;
        }
        const cardFromDeck = await dealToPlayer(deck, playerIndex, true);
        if (cardFromDeck === undefined) {
            logger.error("onDraw bad");
            return false;
        }
        traceLogger.log("onDraw", cardFromDeck, core.cardToString(cardFromDeck));
        cardTaken++;
        return true;
    }

    async function onDrawPlayer(playerIndex) {
        if (playerIndex !== currentPlayer) {
            logger.log("draw not for current player", playerIndex, currentPlayer);
            return false;
        }

        if (gameState !== core.GameStage.ROUND) {
            logger.log("onDrawPlayer bad state", state());
            return false;
        }

        if (cardTaken > 0) {
            logger.log("alreadyDrawn");
            return false;
        }
        const cardFromDeck = await dealToPlayer(deck, currentPlayer);
        if (cardFromDeck === undefined) {
            logger.error("onDrawPlayer bad");
            return false;
        }
        cardTaken++;
        debugLogger.log("onDrawPlayer", cardFromDeck);
        return cardFromDeck != null;
    }

    async function pass(playerIndex) {
        if (playerIndex !== currentPlayer) {
            logger.log("pass not for current player", playerIndex, currentPlayer);
            return false;
        }

        if (gameState !== core.GameStage.ROUND) {
            logger.log("pass bad state", state());
            return false;
        }

        if (cardTaken == 0) {
            logger.error("cannot pass");
            return false;
        }
        if (applyEffects) {
            await next();
        } else {
            await report("pass", {playerIndex});
        }
        return true;
    }

    async function onMove(playerIndex, card, nextColor) {
        const res = await onMoveToDiscard(playerIndex, card, nextColor);
        if (!res) {
            logger.log("Different engines");
        }
        return res;
    }

    async function onDiscard(card) {
        if (deck == null || !deck.checkTop(card)) {
            logger.error("Different engines");
            return;
        }

        const cardFromDeck = deck.deal();
        localAssert(cardFromDeck === card, "Different cards");
        const newColor = core.cardColor(card);
        if (newColor !== core.BLACK_COLOR) {
            currentColor = newColor;
        } else {
            localAssert(gameState !== core.GameStage.ROUND, "Black on discard in live round");
        }
        cardOnBoard = card;
        discardPile.push(card);
        await report("discardExternal", card);
    }

    async function dealToDiscard(deck) {
        let card = deck.deal();
        cardOnBoard = card;
        while (core.cardColor(card) === core.BLACK_COLOR) {
            await report("discard", card);
            cardOnBoard = undefined;
            await deck.addCardAndShuffle(card);
            card = deck.deal();
            cardOnBoard = card;
        }
        discardPile.push(card);
        currentColor = core.cardColor(card);
        debugLogger.log("dealToDiscardEnd", state());
        await report("discard", card);
        return card;
    }

    function getPlayerIterator() {
        return {
            [Symbol.iterator]() {
                let i = 0;
                return {
                    next() {
                        if (i >= players.length){
                            return { done: true, value: i };
                        }
                        return { done: false, value: players[i++] };
                    },
                    return() {
                        logger.log("Closing");
                        return { done: true };
                    },
                };
            },
        };
    }

    function size() {
        return players.length;
    }

    function getDealer() {
        return dealer;
    }

    function getCurrentPlayer() {
        return currentPlayer;
    }

    function reverse() {
        direction *= -1;
    }

    async function cleanAllHands() {
        cardOnBoard = undefined;
        discardPile = [];
        const promises = [];
        for (const pl of players) {
            pl.cleanHand();
            promises.push(report("clearPlayer", pl.getIndex()));
        }
        await Promise.allSettled(promises);
    }

    function cleanHandExternal(playerIndex) {
        cardOnBoard = undefined;
        discardPile = [];
        players[playerIndex].cleanHand();
        return report("clearPlayerExternal", playerIndex);
    }

    function skip() {
        // TODO should we notify others
        currentPlayer = calcNextFromCurrent(currentPlayer, players.length, direction);
        cardTaken = 0;
        cardDiscarded = 0;
    }

    async function calcCardEffect(card, playerIndex) {
        localAssert(playerIndex === currentPlayer);
        const type = core.cardType(card);
        traceLogger.log("calcCardEffect", {playerIndex, card}, core.cardToString(card));

        if (type === "Reverse") {
            reverse();
            if (players.length === 2) {
                skip();
            }
        }

        if (type === "Skip") {
            skip();
        }

        if (type === "Draw2") {
            skip();
            for (let i = 0; i < 2; ++i) {
                await dealToPlayer(deck, currentPlayer);
            }
        }

        if (type === "Draw4") {
            skip();
            for (let i = 0; i < 4; ++i) {
                await dealToPlayer(deck, currentPlayer);
            }
        }
        await next();
    }

    async function dealN(initialDealt) {
        localAssert(initialDealt*players.length < deck.size(), "Not enought cards to play");
        for (let round = 0; round < initialDealt; ++round) {
            const n = players.length;
            for (let i = 0; i < n; i++) {
                const dealIndex = core.nextPlayer(i, n, direction, dealer);
                const currentPlayer = players[dealIndex].getIndex();
                await dealToPlayer(deck, currentPlayer);
            }
        }
        // TODO delete this
        if (currentPlayer !== dealer) {
            logger.error("dealN", state());
            currentPlayer = dealer;
            await report("changeCurrent", state());
        }
        const card = await dealToDiscard(deck);
        await calcCardEffect(card, currentPlayer);
        gameState = core.GameStage.ROUND;
    }

    function getCurrentPlayerObj() {
        return players[currentPlayer];
    }

    function getPlayerByIndex(ind) {
        return players[ind];
    }

    async function tryMove(playerInd, card) {
        if (playerInd !== currentPlayer) {
            logger.log("Wrong player", currentPlayer, playerInd);
            return false;
        }

        // player has card
        if (!getCurrentPlayerObj().hasCard(card)) {
            logger.error("player not has card");
            return false;
        }

        if (gameState !== core.GameStage.ROUND) {
            logger.log("start new round");
            return false;
        }

        if (cardDiscarded > 0) {
            logger.log("already moved");
            return false;
        }

        if (core.cardType(card) === "Wild") {
            if (settings.lastCardNoColor && getCurrentPlayerObj().isUno()) {
                return currentColor;
            }
            const newColor = await chooseColor(playerInd);
            if (!core.GOOD_COLORS.includes(newColor)) {
                logger.log("Wrong color", newColor);
                return false;
            }
            return newColor;
        }

        if (core.cardType(card) === "Draw4") {
            if (getCurrentPlayerObj().hasColor(currentColor)) {
                return false;
            }
            if (settings.lastCardNoColor && getCurrentPlayerObj().isUno()) {
                return currentColor;
            }
            const newColor = await chooseColor(playerInd);

            if (!core.GOOD_COLORS.includes(newColor)) {
                logger.log("Wrong color", newColor);
                return false;
            }
            return newColor;
        }

        if (core.cardColor(card) === currentColor) {
            return currentColor;
        }

        if (core.cardType(card) === core.cardType(cardOnBoard)) {
            return core.cardColor(card);
        }

        logger.log("Bad card", core.cardType(card), core.cardType(cardOnBoard), currentColor);
        return false;
    }

    function onTryMove(playerInd, card, nextColor) {
        if (playerInd !== currentPlayer) {
            logger.error("Wrong player", currentPlayer, playerInd);
            return false;
        }

        // player has card
        if (!getCurrentPlayerObj().hasCard(card)) {
            logger.error("player not has card");
            return false;
        }

        if (!core.matchColor(card, nextColor)) {
            logger.error("Wrong next color", nextColor, card, core.cardToString(card));
            localAssert(false, "Bad color");
            return false;
        }

        if (gameState !== core.GameStage.ROUND) {
            logger.log("start new round", state());
            return false;
        }

        if (cardDiscarded > 0) {
            logger.log("already moved");
            return false;
        }

        const res = core.suitable(card, cardOnBoard, currentColor, getCurrentPlayerObj().hasColor(currentColor));
        if (res) {
            return true;
        }
        logger.error("Bad card", core.cardType(card), core.cardType(cardOnBoard), currentColor);
        return false;
    }


    function calcScore() {
        let score = 0;
        const players = getPlayerIterator();
        for (const pl of players) {
            for (const card of pl.pile()) {
                score += core.cardScore(card);
            }
        }
        return score;
    }

    async function moveInner(playerIndex, card, nextColor) {
        localAssert(gameState === core.GameStage.ROUND, "Move on round end");
        const pl = players[playerIndex];
        pl.removeCard(card);
        cardOnBoard = card;
        discardPile.push(card);
        currentColor = nextColor;
        ++cardDiscarded;
        if (pl.hasEmptyHand()) {
            // TODO send to other clients mb
            gameState = core.GameStage.ROUND_OVER;
        }
        await report("move", {playerIndex, card, currentColor});
        if (applyEffects) {
            await calcCardEffect(card, currentPlayer);
            if (gameState === core.GameStage.ROUND_OVER || gameState === core.GameStage.GAME_OVER) {
                await onRoundEnd(playerIndex);
            }
        }
    }

    async function moveToDiscard(playerIndex, card) {
        const res = await tryMove(playerIndex, card);
        if (res === false) {
            return false;
        }
        const res2 = await onMoveToDiscard(playerIndex, card, res);
        localAssert(res2, "Bad move");
        return res2;
    }

    async function onRoundEnd(playerIndex) {
        const player = players[playerIndex];
        localAssert(player.hasEmptyHand(), "End on not empty hand");
        localAssert(gameState !== core.GameStage.ROUND, "Bad state onRoundEnd");
        const diff = calcScore();
        player.updateScore(diff);
        const score = player.getScore();
        if (score >= MAX_SCORE) {
            gameState = core.GameStage.GAME_OVER;
            await report("gameover", { playerIndex, score, diff });
        } else {
            gameState = core.GameStage.ROUND_OVER;
            await report("roundover", { playerIndex, score, diff });
        }
    }

    function onEndRound(data) {
        if (data.playerIndex !== currentPlayer) {
            logger.log("End not for current Player");
            // return false;
        }
        const player = players[data.playerIndex];
        if (!player.hasEmptyHand()) {
            logger.error("End when not empty");
            return false;
        }
        const oldScore = player.getScore();
        if (data.score !== (oldScore + data.diff)) {
            logger.error("Bad score");
            return false;
        }
        const diff = calcScore();
        if (diff !== data.diff) {
            logger.error("Bad diff");
            return false;
        }
        // Maybe not needed
        gameState = core.GameStage.ROUND_OVER;
        return onRoundEnd(data.playerIndex);
    }

    async function onMoveToDiscard(playerIndex, card, nextColor) {
        const res = onTryMove(playerIndex, card, nextColor);
        if (res) {
            await moveInner(playerIndex, card, nextColor);
        }
        return res;
    }

    async function next() {
        skip();
        await report("changeCurrent", state());
        return true;
    }

    function nextDealer() {
        direction = 1;
        dealer = calcNextFromCurrent(dealer, players.length, direction);
        currentPlayer = dealer;
        gameState = core.GameStage.DEALING;
        return report("changeCurrent", state());
    }

    function setCurrentObj(data) {
        cardTaken = 0;
        cardDiscarded = 0;
        localAssert(data.dealer !== undefined, "No dealer");
        localAssert(data.currentPlayer !== undefined, "No currentPlayer");
        localAssert(data.direction, "No direction");
        localAssert(data.gameState !== undefined, "No gameState");
        dealer = data.dealer;
        currentPlayer = data.currentPlayer;
        direction = data.direction;
        gameState = data.gameState;
        return report("changeCurrentExternal", {});
    }

    function state() {
        return {
            currentPlayer,
            dealer,
            direction,
            currentColor,
            cardOnBoard,
            gameState
        };
    }

    function deckSize() {
        if (deck == null) {
            return 0;
        }
        return deck.size();
    }

    async function chooseDealer() {
        // TODO update clients
        gameState = core.GameStage.CHOOSE_DEALER;
        deck = await deckFunc.newShuffledDeck(onShuffle, rngFunc);
        dealer = await chooseDealerInner2({players, logger: traceLogger, dealToPlayer, dealer, deck, direction});
        await delay(settings.betweenRounds);
        await cleanAllHands();

        currentPlayer = dealer;
        gameState = core.GameStage.DEALING;
        await report("changeCurrent", state());
        traceLogger.log("dealer was chosen", state());
    }
    async function deal() {
        // TODO update clients
        await cleanAllHands();
        traceLogger.log("hands clean");
        gameState = core.GameStage.DEALING;
        deck = await deckFunc.newShuffledDeck(onShuffle, rngFunc);
        traceLogger.log("after cleanAllHands");
        await dealN(settings.cardsDeal);
        traceLogger.log("after dealN");
        gameState = core.GameStage.ROUND;
        await report("changeCurrent", state());
    }

    function setDeck(d) {
        if (deck == null) {
            deck = deckFunc.newExternalDeck(d, onShuffle, rngFunc);
        } else {
            deck.setDeck(d);
        }
        return report("shuffleFake", d);
    }

    const showAllCards = () => {
        // maybe show cards on round end and on game end
        return gameState === core.GameStage.CHOOSE_DEALER;
    };

    const isMyMove = (playerIndex) => {
        return currentPlayer === playerIndex && gameState === core.GameStage.ROUND;
    };

    const getCurrentSuitable = () => {
        const pl = getCurrentPlayerObj();
        const hasColor = pl.hasColor(currentColor);
        return pl.pile().filter(c => core.suitable(c, cardOnBoard, currentColor, hasColor));
    };

    const canDraw = () => cardTaken > 0;

    const toJson = () => {
        return {
            playersRaw: players.map(p => p.toJson()),
            deckRaw: deck.toJson(),
            dealer,
            direction,
            discardPile,
            currentPlayer,
            gameState,
            cardTaken,
            cardDiscarded,
            maxScore,
            cardOnBoard,
            currentColor
        };
    };

    return {
        isMyMove,
        canDraw,
        getCurrentSuitable,
        chooseDealer,
        deal,
        getPlayerIterator,
        getPlayerByIndex,
        addPlayer,
        size,
        on,
        getDealer,
        getCurrentPlayer,
        getCardOnBoard,
        tryMove,
        moveToDiscard,
        setDeck,
        onDraw,
        onMove,
        onDiscard,
        setCurrentObj,
        cleanHandExternal,
        nextDealer,
        onDrawPlayer,
        pass,
        getCurrentColor,
        getDirection,
        onEndRound,
        deckSize,
        secretlySeeTopCard,
        setColorChooser,
        toJson,
        showAllCards,
        // for tests only
        dealN
    };
}
