"use strict";

import deckFunc from "./deck.js";
import playerFunc from "./player.js";

function stub(message) {
    console.log("Stub " + message);
}

const handlers = {
    'shuffle': stub,
    'deal': stub,
    'draw': stub,
    'discard': stub,
    'move': stub,
    'clearPlayer': stub,
    'ready': stub,
    'changeCurrent': stub,
    'gameover': stub,
    'roundover': stub,
    'chooseColor': getCurrentColor
}

async function report(callbackName, ...args) {
    const callback = handlers[callbackName];
    if (typeof(callback) === 'function') {
        return await callback(...args);
    } else {
        stub(callbackName);
    }
}

const INITIAL_DEALT = 7;
let dealer = 0;
let direction = 1;
let players = [];
let deck = null;
let cardOnBoard = null;
let discardPile = [];
let currentPlayer = null;
let currentColor = null;
let cardTaken = 0;
let gameover = false;
let roundover = false;

function getCurrentColor() {
    return currentColor;
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
    const n = players.length;
    players.push(playerFunc.newPlayer(name, n, handlers));
}

async function dealToPlayer(deck, playerIndex) {
    const card = deck.deal();
    players[playerIndex].addCard(card);
    await handlers['draw']({playerIndex, card});
    return card;
}

async function onDraw(playerIndex, card) {
    const cardFromDeck = await dealToPlayer(deck, playerIndex);
    if (cardFromDeck !== card) {
        console.error("Different engines");
    }
}

async function onDiscard(card) {
    const cardFromDeck = await dealToDiscard(deck);
    if (cardFromDeck !== card) {
        console.error("Different engines");
    }
}

async function dealToDiscard(deck) {
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

async function reverse() {
    direction *= -1;
    currentPlayer = calcNextFromCurrent(currentPlayer, players.length);
    return await report("changeCurrent", currentPlayer);
}

async function chooseDealer() {
    deck = await deckFunc.newShuffledDeck(handlers);
    let candidates = [...players];

    while (candidates.length > 1) {
        const n = candidates.length;
        let scores = new Array(n);
        let max = 0;
        for (let i = 0; i < n; i++) {
              const dealIndex = nextPlayer(i, n);
          	  const card = await dealToPlayer(deck, candidates[dealIndex].getIndex());
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
    console.log('dealer was choosen');
}

async function cleanAllHands() {
    cardOnBoard = null;
    discardPile = [];
    for (const pl of players) {
        await pl.cleanHand();
    }
    deck = await deckFunc.newShuffledDeck(handlers);
}



function setActivePlayer(ind) {
    currentPlayer = ind;
    handlers["ready"](ind);
}


async function skip() {
    currentPlayer = calcNextFromCurrent(currentPlayer + direction, players.length);
    return await handlers['changeCurrent'](currentPlayer);
}

async function calcCardEffect(card, playerInd) {
    const type = cardType(card);
    const newColor = cardColor(card);
    if (newColor != 'black') {
        currentColor = newColor;
    }
    if (currentPlayer != null) {
        if (currentPlayer != playerInd) {
            console.error(playerInd, currentPlayer);
        }
    }
    if (type === 'Reverse') {
        if (players.length === 2) {
            await skip();
        } else {
            await reverse();
        }
        return;
    }

    if (type === 'Skip') {
         await skip();
         return;
    }

    if (type === 'Draw2') {
        for (let i = 0; i < 2; ++i) {
            await dealToPlayer(deck, calcNextFromCurrent(currentPlayer, players.length));
        }
        await skip();
        return;
    }

    if (type === 'Draw4') {
        for (let i = 0; i < 4; ++i) {
            await dealToPlayer(deck, calcNextFromCurrent(currentPlayer, players.length));
        }
        await skip();
        return;
    }

    next();
}

async function deal() {
    await cleanAllHands();
    for (let round = 0; round < INITIAL_DEALT; ++round) {
        const n = players.length;
        for (let i = 0; i < n; i++) {
            const dealIndex = nextPlayer(i, n);
            await dealToPlayer(deck, players[dealIndex].getIndex());
        }
    }
    const card = await dealToDiscard(deck);
    console.log("deal finished");
    await calcCardEffect(card, currentPlayer);
}

function playerHasColor(playerInd, currentColor) {
    return players[playerInd].pile().find(c => cardColor(c) === currentColor);
}

async function tryMove(playerInd, card) {
    if (playerInd !== currentPlayer) {
        console.log("Wrong player", currentPlayer, playerInd);
        return false;
    }

    if (roundover) {
        console.log("start new round");
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

async function calcScore() {
    let score = 0;
    const players = getPlayerIterator();
    for (const pl of players) {
        for (const card of pl.pile()) {
            score += cardScore(card);
        }
    }
    return score;
}

async function moveToDiscard(playerInd, card) {
    const res = await tryMove(playerInd, card);
    if (res) {
        const cardInd = players[playerInd].removeCard(card);
        cardOnBoard = card;
        discardPile.push(card);
        await handlers["move"](cardInd);
        await calcCardEffect(card, currentPlayer);
        if (players[playerInd].pile().length === 0) {
            roundover = true;
            players[playerInd].updateScore(calcScore());
            await handlers['roundover']();
        }
    }
}

async function next() {
    currentPlayer = calcNextFromCurrent(currentPlayer, players.length);
    return await handlers['changeCurrent'](currentPlayer);
}

async function nextDealer() {
    dealer = calcNextFromCurrent(currentPlayer, players.length);
    roundover = false;
    return await report("nextDealer", dealer);
}

async function drawCurrent() {
    if (cardTaken > 0) {
        cardTaken = 0;
        await next();
        return;
    }
    cardTaken++;
    await dealToPlayer(deck, currentPlayer);
}

async function setDeck(d) {
    console.log("Deck setted");
    if (deck == null) {
        deck = deckFunc.newExternalDeck(d, handlers);
    } else {
        deck.setDeck(d);
    }
    console.log("Deck setted2");
}

function setCurrent(c) {
    currentPlayer = c;
}

export default function initCore() {
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
        onDiscard,
        setCurrent,
        cleanAllHands,
        nextDealer
    }
}
