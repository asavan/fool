import deckFunc from "./deck.js";
import newPlayer from "./player.js";
import core from "./uno/basic.js";

import handlersFunc from "./utils/handlers.js";

function assertHelper(logger) {
    return (b, message) => {
        if (b) return;
        logger.error(message);
        throw message;
    };
}

export default function initCore(settings, rngFunc, logger, {
    playersRaw,
    dealer,
    direction,
    deckRaw,
    discardPile,
    currentPlayer,
    roundover,
    cardTaken,
    cardDiscarded,
    maxScore,
    gameState,
    cardOnBoard,
    currentColor
}) {

    const MAX_SCORE = maxScore;

    // TODO remove this
    const applyEffects = settings.applyEffects;
    
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

    
    function nextPlayer(diff, size, direction, cur) {
        localAssert(size > 0, "Bad usage");
        localAssert(direction === 1 || direction === -1, "Bad usage direction");
        return (cur + (diff + 1) * direction + size) % size;
    }
    
    function calcNextFromCurrent(cur, size, direction) {
        return nextPlayer(0, size, direction, cur);
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
        if (playerIndex !== currentPlayer && !core.isDrawCard(cardOnBoard) && !roundover) {
            logger.error("draw not for current player", playerIndex, currentPlayer, roundover);
        // return;
        }
        const cardFromDeck = await dealToPlayer(deck, playerIndex, true);
        if (cardFromDeck === undefined) {
            logger.error("onDraw bad");
            return false;
        }
        logger.log("onDraw", cardFromDeck, core.cardToString(cardFromDeck));
        cardTaken++;
        return true;
    }

    async function onDrawPlayer(playerIndex) {
        if (playerIndex !== currentPlayer) {
            logger.log("draw not for current player", playerIndex, currentPlayer);
            return false;
        }

        if (roundover) {
            logger.log("onDrawPlayer start new round");
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
        logger.log("onDrawPlayer", cardFromDeck);
        return cardFromDeck != null;
    }

    async function pass(playerIndex) {
        if (playerIndex !== currentPlayer) {
            logger.log("pass not for current player", playerIndex, currentPlayer);
            return false;
        }

        if (roundover) {
            logger.log("pass start new round");
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
            localAssert(roundover, "Black on discard in live round");
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
        logger.log("dealToDiscardEnd", core.cardToString(card), card);
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

    async function chooseDealerInner(rngFunc) {
        // TODO update clients
        gameState = core.GameStage.DEALING;
        deck = await deckFunc.newShuffledDeck(onShuffle, rngFunc);
        let candidates = [...players];

        while (candidates.length > 1) {
            const n = candidates.length;
            const scores = new Array(n);
            let max = 0;
            for (let i = 0; i < n; i++) {
                const dealIndex = nextPlayer(i, n, direction, dealer);
                const currentPlayer = candidates[dealIndex].getIndex();
                const card = await dealToPlayer(deck, currentPlayer);
                localAssert(card !== undefined);
                const score = core.cardScore(card);
                logger.log(">> Player " + i + " draws "
                                + core.cardToString(card) + " and gets " + score + " points");
                scores[dealIndex] = score;
                max = Math.max(max, score);
            }
            const newCand = [];
            for (let i = 0; i < n; i++) {
                if (scores[i] === max) {
                    newCand.push(candidates[i]);
                }
            }
            candidates = newCand;
        }
        if (candidates.length >= 1) {
            dealer = candidates[0].getIndex();
        } else {
            logger.error("No cand", candidates);
        }
        currentPlayer = dealer;
        gameState = core.GameStage.DEALING;
        await report("changeCurrent", {currentPlayer, dealer, direction, roundover});
        logger.log("dealer was chosen", currentPlayer, dealer);
    }

    async function cleanAllHands(rngFunc) {
        cardOnBoard = undefined;
        discardPile = [];
        const promises = [];
        for (const pl of players) {
            pl.cleanHand();
            promises.push(report("clearPlayer", pl.getIndex()));
        }
        await Promise.allSettled(promises);
        deck = await deckFunc.newShuffledDeck(onShuffle, rngFunc);
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
        logger.log("calcCardEffect", {playerIndex, card}, core.cardToString(card));

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
                const dealIndex = nextPlayer(i, n, direction, dealer);
                const currentPlayer = players[dealIndex].getIndex();
                await dealToPlayer(deck, currentPlayer);
            }
        }
        if (currentPlayer !== dealer) {
            logger.error("dealN", {currentPlayer, dealer, direction, roundover});
            currentPlayer = dealer;
            await report("changeCurrent", {currentPlayer, dealer, direction, roundover});
        }
        const card = await dealToDiscard(deck);
        await calcCardEffect(card, currentPlayer);        
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
            logger.log("player not has card");
            return false;
        }

        if (roundover) {
            logger.log("start new round");
            return false;
        }

        if (cardDiscarded > 0) {
            logger.log("already moved");
            return false;
        }

        if (core.cardType(card) === "Wild") {
            const newColor = await chooseColor(playerInd);
            if (!core.GOOD_COLORS.includes(newColor)) {
                logger.error("Wrong color", newColor);
                return false;
            }
            return newColor;
        }

        if (core.cardType(card) === "Draw4") {
            if (getCurrentPlayerObj().hasColor(currentColor)) {
                return false;
            }

            const newColor = await chooseColor(playerInd);

            if (!core.GOOD_COLORS.includes(newColor)) {
                logger.error("Wrong color", newColor);
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

        logger.error("Bad card", core.cardType(card), core.cardType(cardOnBoard), currentColor);
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

        if (roundover) {
            logger.log("start new round");
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
        localAssert(!roundover, "Move on round end");
        const pl = players[playerIndex];
        pl.removeCard(card);
        cardOnBoard = card;
        discardPile.push(card);
        currentColor = nextColor;
        ++cardDiscarded;
        if (pl.hasEmptyHand()) {
            roundover = true;
            gameState = core.GameStage.ROUND_OVER;
        }
        await report("move", {playerIndex, card, currentColor});
        if (applyEffects) {
            await calcCardEffect(card, currentPlayer);
            if (roundover) {
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
        localAssert(player.hasEmptyHand());
        localAssert(roundover);
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
        roundover = true;
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
        logger.log("Current change", {currentPlayer, dealer, direction, roundover});
        await report("changeCurrent", {currentPlayer, dealer, direction, roundover});
        return true;
    }

    function nextDealer() {
        direction = 1;
        dealer = calcNextFromCurrent(dealer, players.length, direction);
        currentPlayer = dealer;
        logger.log("nextDealer", {currentPlayer, dealer, direction, roundover});
        return report("changeCurrent", {currentPlayer, dealer, direction, roundover});
    }

    // TODO make private
    function setCurrent(c, d, dir, rover) {
        cardTaken = 0;
        cardDiscarded = 0;
        if (rover !== undefined) {
            roundover = rover;
        }
        if (d != null) {
            dealer = d;
            // roundover = false;
        }
        if (dir != null) {
            direction = dir;
        }
        currentPlayer = c;
        return report("changeCurrentExternal", {currentPlayer, dealer, direction, roundover});
    }

    function setCurrentObj(data) {
        return setCurrent(data.currentPlayer, data.dealer, data.direction, data.roundover);
    }

    function state() {
        return {
            currentPlayer,
            dealer,
            currentColor,
            cardOnBoard,
            roundover,
            color: core.cardColor(cardOnBoard),
            type: core.cardType(cardOnBoard)
        };
    }

    function deckSize() {
        if (deck == null) {
            return 0;
        }
        return deck.size();
    }

    function chooseDealer() {
        return chooseDealerInner(rngFunc);
    }
    async function deal() {
        // TODO update clients
        gameState = core.GameStage.DEALING;

        await cleanAllHands(rngFunc);
        await dealN(settings.cardsDeal);
        roundover = false;
        gameState = core.GameStage.ROUND;
        await report("changeCurrent", {currentPlayer, dealer, direction, roundover});
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

    const toJson = () => {
        return {
            playersRaw: players.map(p => p.toJson()),
            deckRaw: deck.toJson(),
            dealer,
            direction,
            discardPile,
            currentPlayer,
            roundover,
            gameState,
            cardTaken,
            cardDiscarded,
            maxScore,
            cardOnBoard,
            currentColor
        };
    };

    return {
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
        // TODO deprecated
        setCurrent,
        setCurrentObj,
        cleanHandExternal,
        nextDealer,
        onDrawPlayer,
        pass,
        getCurrentColor,
        getDirection,
        state,
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
