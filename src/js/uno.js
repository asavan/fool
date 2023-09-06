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
    if (!deck.checkTop(card)) {
        console.error("Different engines");
        return;
    }
    const cardFromDeck = await dealToPlayer(deck, playerIndex);
}

async function onMove(playerIndex, card) {
    const res = await moveToDiscard(playerIndex, card);
    if (!res) {
        console.error("Different engines");
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

function reverse() {
    direction *= -1;
    return next();
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
    await handlers['changeCurrent']({currentPlayer, dealer});
    console.log('dealer was choosen', currentPlayer, dealer);
}

async function cleanAllHands() {
    cardOnBoard = null;
    discardPile = [];
    for (const pl of players) {
        await pl.cleanHand();
    }
    deck = await deckFunc.newShuffledDeck(handlers);
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
    return next();
}

async function calcCardEffect(card, playerInd) {
    console.log("calcCardEffect");
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
    console.log("Before next");
    await next();
    console.log("after next");
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
        await handlers["move"]({playerIndex, card, currentColor});
        await calcCardEffect(card, currentPlayer);
        if (players[playerIndex].pile().length === 0) {
            roundover = true;
            players[playerIndex].updateScore(calcScore());
            if (players[playerIndex].getScore() > MAX_SCORE) {
                await handlers['gameover']();
            } else {
                await handlers['roundover']();
            }
        }
    }
    return res;
}

async function next() {
    currentPlayer = calcNextFromCurrent(currentPlayer, players.length);
    cardTaken = 0;
    console.log("Current change", currentPlayer);
    return await handlers['changeCurrent']({currentPlayer, dealer});
}

async function nextDealer() {
    direction = 1;
    dealer = calcNextFromCurrent(dealer, players.length);
    currentPlayer = dealer;
    roundover = false;
    return await handlers['changeCurrent']({currentPlayer, dealer});
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

async function setDeck(d) {
    console.log("Deck setted");
    if (deck == null) {
        deck = deckFunc.newExternalDeck(d, handlers);
    } else {
        deck.setDeck(d);
    }
    console.log("Deck setted2");
}

function setCurrent(c, d) {
    currentPlayer = c;
    if (d != null) {
        dealer = d;
    }
}

export default function initCore(settings) {
    if (settings.cardsDeal) {
        INITIAL_DEALT = settings.cardsDeal;
    }
    if (settings.maxScore) {
        MAX_SCORE = settings.maxScore;
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
        cleanAllHands,
        cleanHand,
        nextDealer
    }
}
