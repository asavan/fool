"use strict";

import deckFunc from "./deck.js";
import playerFunc from "./player.js";

function stub(message) {
    console.log("Stub22 " + message);
}

function stub1(message) {
    console.log("Stub11 " + message);
}

const handlers = {
    'shuffle': stub1,
    'deal': stub1,
    'draw': stub1,
    'discard': stub1,
    'move': stub1,
    'clearPlayer': stub1,
    'ready': stub1,
    'changeCurrent': stub1,
    'changeDealer': stub1,
    'gameover': stub1,
    'roundover': stub1,
    'pass': stub,
    'drawExternal': stub,
    'moveExternal': stub,
    'chooseColor': getCurrentColor
}

async function report(callbackName, ...args) {
    const callback = handlers[callbackName];
    if (typeof(callback) === 'function') {
        console.log(callbackName);
        return await callback(...args);
    } else {
        stub(callbackName);
    }
}

let INITIAL_DEALT = 7;
let MAX_SCORE = 500;
let dealer = 0;
let direction = 1;
let players = [];
let deck = null;
let isServer = true;
let cardOnBoard = null;
let discardPile = [];
let currentPlayer = null;
let currentColor = null;
let cardTaken = 0;
let cardDiscarded = 0;
let gameover = false;
let roundover = true;


function getCurrentColor() {
    return currentColor;
}

function getDirection() {
    return direction;
}

function calcNextFromCurrent(ind, size) {
    return (ind + direction + size) % size;
}

function nextPlayer(ind, size) {
    return (dealer + (ind + 1) * direction + size) % size;
}

function getCardOnBoard() {
    return cardOnBoard;
}

const GOOD_COLORS = ['red', 'yellow', 'green', 'blue'];


/**
 * Given a card number, returns its color
 * @function
 * @param {Number} num Number of the card position in deck
 * @return {String} Card color. Either black, red, yellow, green or blue.
 */
function cardColor(num) {
  let color;
  if (num % 14 === 13) {
    return 'black';
  }
  switch (Math.floor(num / 14)) {
    case 0:
    case 4:
      color = 'red';
      break;
    case 1:
    case 5:
      color = 'yellow';
      break;
    case 2:
    case 6:
      color = 'green';
      break;
    case 3:
    case 7:
      color = 'blue';
      break;
  }
  return color;
}

/**
 * Given a card number, returns its type
 * @function
 * @param {Number} num Number of the card position in deck
 * @return {String} Card type. Either skip, reverse, draw2, draw4, wild or number.
 */
function cardType(num) {
  switch (num % 14) {
    case 10: //Skip
      return 'Skip';
    case 11: //Reverse
      return 'Reverse';
    case 12: //Draw 2
      return 'Draw2';
    case 13: //Wild or Wild Draw 4
      if (Math.floor(num / 14) >= 4) {
        return 'Draw4';
      } else {
        return 'Wild';
      }
    default:
      return 'Number ' + (num % 14);
  }
}

/**
 * Given a card number, returns its scoring
 * @function
 * @param {Number} num Number of the card position in deck
 * @return {Number} Points value.
 */
function cardScore(num) {
  let points;
  switch (num % 14) {
    case 10: //Skip
    case 11: //Reverse
    case 12: //Draw 2
      points = 20;
      break;
    case 13: //Wild or Wild Draw 4
      points = 50;
      break;
    default:
      points = num % 14;
      break;
  }
  return points;
}

function addPlayer(name) {
    if (!name) {
        return false;
    }
    const n = players.length;
    players.push(playerFunc.newPlayer(name, n, handlers));
    return true;
}

async function dealToPlayer(deck, playerIndex, external) {
    const card = deck.deal();
    players[playerIndex].addCard(card);
    if (!external) {
        await handlers['draw']({playerIndex, card});
    } else {
        await handlers['drawExternal']({playerIndex, card});
    }
    return card;
}

async function onDraw(playerIndex, card) {
    if (!deck.checkTop(card)) {
        console.error("Different engines");
        return;
    }
    if (playerIndex !== currentPlayer) {
        console.error("draw not for current player");
        // return;
    }
    const cardFromDeck = await dealToPlayer(deck, playerIndex, true);
    cardTaken++;
    return true;
}

async function onDrawPlayer(playerIndex) {
    if (playerIndex !== currentPlayer) {
        console.log("draw not for current player");
        return;
    }

    if (roundover) {
        console.log("start new round");
        return false;
    }

    if (cardTaken > 0) {
        console.log("alreadyDrawn");
        return;
    }
    cardTaken++;
    const cardFromDeck = await dealToPlayer(deck, currentPlayer);
    return cardFromDeck;
}

async function pass(playerIndex) {
    if (playerIndex !== currentPlayer) {
        console.log("pass not for current player");
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
    await handlers['pass']({playerIndex});
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
    if (!deck.checkTop(card)) {
        console.error("Different engines");
        return;
    }

    const cardFromDeck = deck.deal();
    cardOnBoard = card;
    await handlers['discard'](card);
    const newColor = cardColor(card);
    if (newColor !== 'black') {
        discardPile.push(card);
        currentColor = newColor;
    }

    // calcCardEffect(card, currentPlayer);
}

async function dealToDiscard(deck) {
    console.log("dealToDiscard");
    roundover = false;

    currentPlayer = dealer;
    await handlers['changeCurrent']({currentPlayer, dealer, direction});

    let card = deck.deal();
    cardOnBoard = card;
    await handlers['discard'](card);
    while (cardColor(card) === 'black') {
        cardOnBoard = null;
        await deck.addCardAndShuffle(card);
        card = deck.deal();
        cardOnBoard = card;
        await handlers['discard'](card);
    }
    discardPile.push(card);
    currentColor = cardColor(card);
    return card;
}

function on(name, f) {
    handlers[name] = f;
}

function getPlayer(ind) {
    return players[ind];
}

function getPlayerIterator() {
    return  {
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
    deck = await deckFunc.newShuffledDeck(handlers, rngFunc);
    let candidates = [...players];

    while (candidates.length > 1) {
        const n = candidates.length;
        let scores = new Array(n);
        let max = 0;
        for (let i = 0; i < n; i++) {
              const dealIndex = nextPlayer(i, n);
              currentPlayer = candidates[dealIndex].getIndex();
              // await handlers['changeCurrent']({currentPlayer, dealer, direction});
          	  const card = await dealToPlayer(deck, currentPlayer);
              const score = cardScore(card);
              console.log('>> ' + candidates[dealIndex].getName() + ': Player ' + i + ' draws ' + cardType(card) + ' '
                + cardColor(card) + ' and gets ' + score + ' points');
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
    await handlers['changeCurrent']({currentPlayer, dealer, direction});
    console.log('dealer was chosen', currentPlayer, dealer);
}

async function cleanAllHands(rngFunc) {
    cardOnBoard = null;
    discardPile = [];
    for (const pl of players) {
        await pl.cleanHand();
    }
    deck = await deckFunc.newShuffledDeck(handlers, rngFunc);
}

async function cleanHand(playerIndex) {
    cardOnBoard = null;
    discardPile = [];
    players[playerIndex].cleanHand();
}


function setActivePlayer(ind) {
    currentPlayer = ind;
    handlers["ready"](ind);
}


function skip() {
    currentPlayer = calcNextFromCurrent(currentPlayer, players.length);
    cardTaken = 0;
    cardDiscarded = 0;
}

async function calcCardEffect(card, playerInd) {
    console.log("calcCardEffect");
    const type = cardType(card);

    if (type === 'Reverse') {
        reverse();
        if (players.length < 3) {
            skip();
        }
    }

    if (type === 'Skip') {
         skip();
    }

    if (type === 'Draw2') {
        skip();
        for (let i = 0; i < 2; ++i) {
            await dealToPlayer(deck, currentPlayer);
        }
    }

    if (type === 'Draw4') {
        skip();
        for (let i = 0; i < 4; ++i) {
            await dealToPlayer(deck, currentPlayer);
        }
    }
    await next();
}

async function dealN(initialDealt, rngFunc) {
    await cleanAllHands(rngFunc);
    for (let round = 0; round < initialDealt; ++round) {
        const n = players.length;
        for (let i = 0; i < n; i++) {
            const dealIndex = nextPlayer(i, n);
            currentPlayer = players[dealIndex].getIndex();
            // await handlers['changeCurrent']({currentPlayer, dealer, direction});
            await dealToPlayer(deck, currentPlayer);
        }
    }
    const card = await dealToDiscard(deck);
    console.log("deal finished");
    await calcCardEffect(card, currentPlayer);
}

function playerHasColor(playerInd, currentColor) {
    return players[playerInd].pile().find(c => cardColor(c) === currentColor);
}

function playerHasCard(playerInd, card) {
    return players[playerInd].pile().includes(card);
}

async function tryMove(playerInd, card) {
    if (playerInd !== currentPlayer) {
        console.log("Wrong player", currentPlayer, playerInd);
        return false;
    }

    // player has card
    if (!playerHasCard(playerInd, card)) {
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

    if (cardType(card) === 'Wild') {
        const newColor = await handlers["chooseColor"](playerInd);
        if (!GOOD_COLORS.includes(newColor)) {
            console.error("Wrong color", newColor);
            return false;
        }
        currentColor = newColor;
        return true;
    }

    if (cardType(card) === 'Draw4') {
        if (playerHasColor(playerInd, currentColor)) {
            return false;
        }

        const newColor = await handlers["chooseColor"](playerInd);

        if (!GOOD_COLORS.includes(newColor)) {
            console.error("Wrong color", newColor);
            return false;
        }
        currentColor = newColor;
        return true;
    }

    if (cardColor(card) == currentColor) {
        return true;
    }

    if (cardType(card) == cardType(cardOnBoard)) {
         return true;
    }

    console.log("Bad card", cardType(card), cardType(cardOnBoard), currentColor);
    return false;
}

async function onTryMove(playerInd, card, nextColor) {
    if (playerInd !== currentPlayer) {
        console.log("Wrong player", currentPlayer, playerInd);
        return false;
    }

    // player has card
    if (!playerHasCard(playerInd, card)) {
        console.log("player not has card");
        return false;
    }

    if (!GOOD_COLORS.includes(nextColor)) {
        console.error("Wrong color", nextColor);
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

    if (cardType(card) === 'Wild') {
        return true;
    }

    if (cardType(card) === 'Draw4') {
        return !playerHasColor(playerInd, currentColor);
    }

    if (cardColor(card) != nextColor) {
        console.error("Wrong next color", nextColor, card);
        return false;
    }

    if (cardColor(card) == currentColor) {
        return true;
    }

    if (cardType(card) == cardType(cardOnBoard)) {
        return true;
    }

    console.log("Bad card", cardType(card), cardType(cardOnBoard), currentColor);
    return false;
}


function calcScore() {
    let score = 0;
    const players = getPlayerIterator();
    for (const pl of players) {
        for (const card of pl.pile()) {
            score += cardScore(card);
        }
    }
    return score;
}

async function moveToDiscard(playerIndex, card) {
    const res = await tryMove(playerIndex, card);
    if (res) {
        const cardInd = players[playerIndex].removeCard(card);
        cardOnBoard = card;
        discardPile.push(card);
        const newColor = cardColor(card);
        if (newColor != 'black') {
            currentColor = newColor;
        }
        ++cardDiscarded;
        await handlers["move"]({playerIndex, card, currentColor});
        if (isServer) {
            await calcCardEffect(card, currentPlayer);
            await checkGameEnd(playerIndex);
        }
    }
    return res;
}

async function checkGameEnd(playerIndex, maxScore) {
    const player = players[playerIndex];
    if (player.pile().length === 0) {
        roundover = true;
        const diff = calcScore();
        player.updateScore(diff);
        if (player.getScore() >= MAX_SCORE) {
            await handlers['gameover']({playerIndex, score: player.getScore(), diff});
        } else {
            await handlers['roundover']({playerIndex, score: player.getScore(), diff});
        }
    }
}

async function onNewRound(data) {
    const player = players[data.playerIndex];
    const oldScore = player.getScore();
    cardTaken = 0;
    cardDiscarded = 0;
    roundover = false;

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
    const res = await onTryMove(playerIndex, card, nextColor);
    if (res) {
        const cardInd = players[playerIndex].removeCard(card);
        cardOnBoard = card;
        discardPile.push(card);
        currentColor = nextColor;
        ++cardDiscarded;
        await handlers["moveExternal"]({playerIndex, card, currentColor});
        if (isServer) {
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
    console.log("Current change", currentPlayer);
    await handlers['changeCurrent']({currentPlayer, dealer, direction});
    return true;
}

async function nextDealer() {
    direction = 1;
    dealer = calcNextFromCurrent(dealer, players.length);
    currentPlayer = dealer;
    roundover = false;
    cardTaken = 0;
    cardDiscarded = 0;
    return await handlers['changeCurrent']({currentPlayer, dealer, direction});
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


function setCurrent(c, d, dir) {
    cardTaken = 0;
    cardDiscarded = 0;
    if (d != null) {
        dealer = d;
        roundover = false;
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
        color: cardColor(cardOnBoard),
        type: cardType(cardOnBoard)
    }
}

function sortByTemplate(pile, sortDirection, colors) {
    pile.sort((p1, p2) => {
        const c1 = cardColor(p1);
        const c2 = cardColor(p2);
        if (c1 == c2) {
            if (sortDirection === 'asc') {
                return cardScore(p1)-cardScore(p2);
            } else {
                return cardScore(p2)-cardScore(p1);
            }
        }
        for (const c of colors) {
            if (c == c1) {
                if (sortDirection === 'asc') {
                    return -1;
                } else {
                    return 1;
                }
            }

            if (c == c2) {
                if (sortDirection === 'asc') {
                    return 1;
                } else {
                    return -1;
                }
            }
        }
    });
}

export default function initCore(settings, rngFunc) {

    if (settings.maxScore) {
        MAX_SCORE = settings.maxScore;
    }
    function chooseDealer() {
        return chooseDealerInner(rngFunc);
    }
    function deal() {
        return dealN(settings.cardsDeal, rngFunc);
    }

    function setDeck(d) {
        isServer = false;
        if (deck == null) {
            deck = deckFunc.newExternalDeck(d, handlers, rngFunc);
        } else {
            deck.setDeck(d);
        }
    }

    return {
        chooseDealer,
        deal,
        getPlayerIterator,
        addPlayer,
        size,
        on,
        cardScore,
        cardColor,
        cardType,
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
        cleanHand,
        nextDealer,
        onDrawPlayer,
        pass,
        getCurrentColor,
        getDirection,
        state,
        onNewRound,
        onPass,
        sortByTemplate
    }
}
