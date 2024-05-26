import deckFunc from "./deck.js";
import newPlayer from "./player.js";
import core from "./uno/basic.js";

import {assert} from "./helper.js";

import handlersFunc from "./utils/handlers.js";

function localAssert(condition, message) {
    assert(condition, message);
}

export default function initCore(settings, rngFunc) {

    let chooseColor = getCurrentColor;
    const setColorChooser = (f) => {chooseColor = f;};
    const commands = [
        "shuffle",
        "deal",
        "draw",
        "discard",
        "move",
        "clearPlayer",
        "clearPlayerExternal",
        "changeCurrent",
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
        return handlers.call(callbackName, data);
    }

    const onShuffle = (d) => handlers.call("shuffle", d);

    let MAX_SCORE = 500;
    let dealer = 0;
    let direction = 0;
    let players = [];
    let deck;
    let applyEffects = true;
    let cardOnBoard = null;
    let discardPile = [];
    let currentPlayer = null;
    let currentColor = null;
    let cardTaken = 0;
    let cardDiscarded = 0;
    let roundover = true;


    function getCurrentColor() {
        return currentColor;
    }

    function getDirection() {
        return direction;
    }

    function calcNextFromCurrent(ind, size) {
        localAssert(size > 0, "Bad usage");
        return (ind + direction + size) % size;
    }

    function nextPlayer(ind, size) {
        return (dealer + (ind + 1) * direction + size) % size;
    }

    function getCardOnBoard() {
        return cardOnBoard;
    }

    function addPlayer(name) {
        if (!name) {
            return false;
        }
        const n = players.length;
        players.push(newPlayer(name, n));
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
            console.warn("deck is empty");
            return null;
        }
        const card = deck.deal();
        if (card == null) {
            console.error("deck is empty, should never happen");
            return null;
        }
        players[playerIndex].addCard(card);
        if (!external) {
            await report("draw", {playerIndex, card});
        } else {
            await report("drawExternal", {playerIndex, card});
        }
        if (deck.size() === 0) {
            console.log("reshuffle discard");
            await reshuffleDiscard();
        }
        return card;
    }

    async function onDraw(playerIndex, card) {
        if (!deck.checkTop(card)) {
            console.error("Different engines");
            return false;
        }
        if (playerIndex !== currentPlayer && !core.isDrawCard(cardOnBoard) && !roundover) {
            console.error("draw not for current player", playerIndex, currentPlayer, roundover);
        // return;
        }
        const cardFromDeck = await dealToPlayer(deck, playerIndex, true);
        console.log("onDraw", cardFromDeck);
        cardTaken++;
        return true;
    }

    async function onDrawPlayer(playerIndex) {
        if (playerIndex !== currentPlayer) {
            console.log("draw not for current player", playerIndex, currentPlayer);
            return false;
        }

        if (roundover) {
            console.log("start new round");
            return false;
        }

        if (cardTaken > 0) {
            console.log("alreadyDrawn");
            return false;
        }
        cardTaken++;
        const cardFromDeck = await dealToPlayer(deck, currentPlayer);
        console.log("onDrawPlayer", cardFromDeck);
        return cardFromDeck != null;
    }

    async function pass(playerIndex) {
        if (playerIndex !== currentPlayer) {
            console.log("pass not for current player", playerIndex, currentPlayer);
            return;
        }

        if (roundover) {
            console.log("start new round");
            return false;
        }

        if (cardTaken == 0) {
            console.log("cannot pass");
            return;
        }
        await next();
        await report("pass", {playerIndex});
        return true;
    }

    async function onMove(playerIndex, card, nextColor) {
        const res = await onMoveToDiscard(playerIndex, card, nextColor);
        if (!res) {
            console.log("Different engines");
        }
        return res;
    }

    async function onDiscard(card) {
        if (deck == null || !deck.checkTop(card)) {
            console.error("Different engines");
            return;
        }

        const cardFromDeck = deck.deal();
        localAssert(cardFromDeck === card, "Different cards");
        cardOnBoard = card;
        const newColor = core.cardColor(card);
        if (newColor !== "black") {
            discardPile.push(card);
            currentColor = newColor;
        }
        // TODO smth wrong here
        await report("discard", card);

    // calcCardEffect(card, currentPlayer);
    }

    async function dealToDiscard(deck) {
        console.log("dealToDiscard");

        currentPlayer = dealer;
        await report("changeCurrent", {currentPlayer, dealer, direction, roundover});

        let card = deck.deal();
        cardOnBoard = card;
        while (core.cardColor(card) === "black") {
            await report("discard", card);
            cardOnBoard = null;
            await deck.addCardAndShuffle(card);
            card = deck.deal();
            cardOnBoard = card;
        }
        discardPile.push(card);
        currentColor = core.cardColor(card);
        await report("discard", card);
        console.log("dealToDiscardEnd");
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
                        console.log("Closing");
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
    // console.trace("chooseDealerInner");
        deck = await deckFunc.newShuffledDeck(onShuffle, rngFunc);
        let candidates = [...players];

        while (candidates.length > 1) {
            const n = candidates.length;
            const scores = new Array(n);
            let max = 0;
            for (let i = 0; i < n; i++) {
                const dealIndex = nextPlayer(i, n);
                const currentPlayer = candidates[dealIndex].getIndex();
                // await handlers['changeCurrent']({currentPlayer, dealer, direction});
                const card = await dealToPlayer(deck, currentPlayer);
                const score = core.cardScore(card);
                console.log(">> " + candidates[dealIndex].getName() + ": Player " + i + " draws "
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
            console.error("No cand", candidates);
        }
        currentPlayer = dealer;
        await report("changeCurrent", {currentPlayer, dealer, direction, roundover});
        console.log("dealer was chosen", currentPlayer, dealer);
    }

    async function cleanAllHands(rngFunc) {
        cardOnBoard = null;
        discardPile = [];
        for (const pl of players) {
            pl.cleanHand();
            await report("clearPlayer", pl.getIndex());
        }
        deck = await deckFunc.newShuffledDeck(onShuffle, rngFunc);
    }

    function cleanHandExternal(playerIndex) {
        cardOnBoard = null;
        discardPile = [];
        players[playerIndex].cleanHand();
        return report("clearPlayerExternal", playerIndex);
    }

    function skip() {
        currentPlayer = calcNextFromCurrent(currentPlayer, players.length);
        cardTaken = 0;
        cardDiscarded = 0;
    }

    async function calcCardEffect(card, playerInd) {
        const type = core.cardType(card);
        console.log("calcCardEffect", playerInd, currentPlayer, type);

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
        for (let round = 0; round < initialDealt; ++round) {
            const n = players.length;
            for (let i = 0; i < n; i++) {
                const dealIndex = nextPlayer(i, n);
                const currentPlayer = players[dealIndex].getIndex();
                // await handlers['changeCurrent']({currentPlayer, dealer, direction});
                await dealToPlayer(deck, currentPlayer);
            }
        }
        const card = await dealToDiscard(deck);
        currentPlayer = dealer;
        console.log("deal finished", currentPlayer, core.cardToString(card));
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
            console.log("Wrong player", currentPlayer, playerInd);
            return false;
        }

        // player has card
        if (!getCurrentPlayerObj().hasCard(card)) {
            console.log("player not has card");
            return false;
        }

        if (roundover) {
            console.log("start new round");
            return false;
        }

        if (cardDiscarded > 0) {
            console.log("already moved");
            return false;
        }

        if (core.cardType(card) === "Wild") {
            const newColor = await chooseColor(playerInd);
            if (!core.GOOD_COLORS.includes(newColor)) {
                console.error("Wrong color", newColor);
                return false;
            }
            currentColor = newColor;
            return true;
        }

        if (core.cardType(card) === "Draw4") {
            if (getCurrentPlayerObj().hasColor(currentColor)) {
                return false;
            }

            const newColor = await chooseColor(playerInd);

            if (!core.GOOD_COLORS.includes(newColor)) {
                console.error("Wrong color", newColor);
                return false;
            }
            currentColor = newColor;
            return true;
        }

        if (core.cardColor(card) === currentColor) {
            return true;
        }

        if (core.cardType(card) === core.cardType(cardOnBoard)) {
            return true;
        }

        console.log("Bad card", core.cardType(card), core.cardType(cardOnBoard), currentColor);
        return false;
    }

    function onTryMove(playerInd, card, nextColor) {
        if (playerInd !== currentPlayer) {
            console.log("Wrong player", currentPlayer, playerInd);
            return false;
        }

        // player has card
        if (!getCurrentPlayerObj().hasCard(card)) {
            console.log("player not has card");
            return false;
        }

        if (!core.matchColor(card, nextColor)) {
            console.error("Wrong next color", nextColor, card, core.cardToString(card));
            localAssert(false, "Bad color");
            return false;
        }

        if (roundover) {
            console.log("start new round");
            return false;
        }

        if (cardDiscarded > 0) {
            console.log("already moved");
            return false;
        }

        const res = core.suitable(card, cardOnBoard, currentColor, getCurrentPlayerObj().hasColor(currentColor));
        if (res) {
            return true;
        }
        console.log("Bad card", core.cardType(card), core.cardType(cardOnBoard), currentColor);
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

    async function moveToDiscard(playerIndex, card) {
        const res = await tryMove(playerIndex, card);
        if (res) {
            players[playerIndex].removeCard(card);
            cardOnBoard = card;
            discardPile.push(card);
            const newColor = core.cardColor(card);
            if (newColor != "black") {
                currentColor = newColor;
            }
            ++cardDiscarded;
            await report("move", { playerIndex, card, currentColor });
            if (applyEffects) {
                await calcCardEffect(card, currentPlayer);
                await checkGameEnd(playerIndex);
            }
        }
        return res;
    }

    async function checkGameEnd(playerIndex) {
        const player = players[playerIndex];
        if (player.pile().length === 0) {
            roundover = true;
            const diff = calcScore();
            player.updateScore(diff);
            const score = player.getScore();
            if (score >= MAX_SCORE) {
                await report("gameover", { playerIndex, score, diff });
            } else {
                await report("roundover", { playerIndex, score, diff });
            }
        }
    }

    function onNewRound(data) {
        const player = players[data.playerIndex];
        const oldScore = player.getScore();
        cardTaken = 0;
        cardDiscarded = 0;

        if (data.score != oldScore + data.diff) {
            console.error("Bad score");
            return;
        }
        player.setScore(data.score);
    }

    function onPass(playerIndex) {
        if (playerIndex != currentPlayer) {
            console.error("Bad pass", playerIndex, currentPlayer);
            return false;
        }
        if (cardTaken == 0) {
            console.error("Bad pass", playerIndex);
        }
        return next();
    }

    async function onMoveToDiscard(playerIndex, card, nextColor) {
        const res = onTryMove(playerIndex, card, nextColor);
        if (res) {
            players[playerIndex].removeCard(card);
            cardOnBoard = card;
            discardPile.push(card);
            currentColor = nextColor;
            ++cardDiscarded;
            await report("moveExternal", {playerIndex, card, currentColor});
            if (applyEffects) {
                await calcCardEffect(card, currentPlayer);
                await checkGameEnd(playerIndex);
            }
        }
        return res;
    }

    async function next() {
        skip();
        cardTaken = 0;
        cardDiscarded = 0;
        roundover = false;
        console.log("Current change", currentPlayer);
        await report("changeCurrent", {currentPlayer, dealer, direction, roundover});
        return true;
    }

    function nextDealer() {
        direction = 1;
        dealer = calcNextFromCurrent(dealer, players.length);
        currentPlayer = dealer;
        return report("changeCurrent", {currentPlayer, dealer, direction, roundover});
    }

    async function drawCurrent() {
        if (roundover) {
            console.log("start new round");
            return false;
        }

        if (cardTaken > 0) {
            await next();
            return;
        }
        cardTaken++;
        await dealToPlayer(deck, currentPlayer);
    }


    function setCurrent(c, d, dir, rover) {
        cardTaken = 0;
        cardDiscarded = 0;
        roundover = rover;
        if (d != null) {
            dealer = d;
            // roundover = false;
        }
        if (dir != null) {
            direction = dir;
        }
        currentPlayer = c;
    }

    function state() {
        return {
            currentPlayer,
            dealer,
            currentColor,
            cardOnBoard,
            color: core.cardColor(cardOnBoard),
            type: core.cardType(cardOnBoard)
        };
    }

    function resetToDefaults() {
        MAX_SCORE = 500;
        dealer = 0;
        direction = 1;
        players = [];
        deck = null;
        applyEffects = true;
        cardOnBoard = null;
        discardPile = [];
        currentPlayer = null;
        currentColor = null;
        cardTaken = 0;
        cardDiscarded = 0;
        roundover = true;
    }

    function deckSize() {
        if (deck == null) {
            return 0;
        }
        return deck.size();
    }

    // init
    resetToDefaults();
    applyEffects = settings.applyEffects;
    if (settings.maxScore) {
        MAX_SCORE = settings.maxScore;
    }
    function chooseDealer() {
        return chooseDealerInner(rngFunc);
    }
    async function deal() {
        await cleanAllHands(rngFunc);
        return dealN(settings.cardsDeal);
    }

    function setDeck(d) {
        if (deck == null) {
            deck = deckFunc.newExternalDeck(d, onShuffle, rngFunc);
        } else {
            deck.setDeck(d);
        }
    }

    return {
        chooseDealer,
        deal,
        dealN,
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
        drawCurrent,
        setDeck,
        onDraw,
        onMove,
        onDiscard,
        setCurrent,
        cleanHandExternal,
        nextDealer,
        onDrawPlayer,
        pass,
        getCurrentColor,
        getDirection,
        state,
        onNewRound,
        onPass,
        deckSize,
        setColorChooser
    };
}
