"use strict";

import {shuffleArray} from "./shuffle.js";

function stub(message) {
    console.log("Stub " + message);
}

const handlers = {
    'shuffle': stub,
    'deal': stub,
    'draw': stub,
    'discard': stub,
    'move': stub,
    'clearPlayer': stub
}

const INITIAL_DEALT = 7;
let dealer = 0;
let direction = 1;
let players = [];
let deck = null;
let cardOnBoard = null;


function nextPlayer(ind, size) {
    return (dealer + (ind + 1) * direction + size) % size;
}

function getCardOnBoard() {
    return cardOnBoard;
}


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

function newDeck() {
    let deck = [ ...Array(112).keys()];
    deck.splice(56, 1); //56
    deck.splice(69, 1); //70
    deck.splice(82, 1); //84
    deck.splice(95, 1); //98
    return deck;
}

async function newShuffledDeck() {
    const deck = newDeck();
    shuffleArray(deck);
    await handlers['shuffle']();

    function deal() {
        const card = deck.pop();
        console.log(card);
        return card;
    }

    return {deal: deal};
}

function newPlayer(name, ind) {
    const n = name;
    const i = ind;
    const deck = [];

    const getName = () => {return n};
    const getIndex = () => {return i};
    const addCard = (card) => {
        deck.push(card);
        console.log(name, deck);
    }
    const pile = () => [...deck];
    const cleanHand = async () => {
        console.log("clean hand");
        console.log("clean hand");
        deck.length = 0;
        await handlers['clearPlayer'](i);
    }

    return {
            getName,
            addCard,
            pile,
            getIndex,
            cleanHand
          };
}

function addPlayer(name) {
    const n = players.length;
    players.push(newPlayer(name, n));
}

async function dealToPlayer(deck, playerIndex) {
    const card = deck.deal();
    players[playerIndex].addCard(card);
    await handlers['draw'](playerIndex, card);
    return card;
}

async function dealToDiscard(deck) {
    const card = deck.deal();
    cardOnBoard = card;
    await handlers['discard'](card);
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

function reverse() {
    direction *= -1;
}

async function chooseDealer() {
    deck = await newShuffledDeck();
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
    console.log('dealer was choosen');
}

async function cleanAllHands() {
    cardOnBoard = null;
    for (const pl of players) {
        await pl.cleanHand();
    }
    deck = await newShuffledDeck();
}

async function deal() {
    await cleanAllHands();
    for (let round = 0; round < INITIAL_DEALT; ++round) {
        const n = players.length;
        for (let i = 0; i < n; i++) {
            const dealIndex = nextPlayer(i, n);
            const card = await dealToPlayer(deck, players[dealIndex].getIndex());
        }
    }
    dealToDiscard(deck);
}

export default function initCore() {
    return {
        chooseDealer,
        deal,
        getPlayerIterator,
        addPlayer,
        size,
        on,
        dealToPlayer,
        cardScore,
        cardColor,
        cardType,
        getDealer,
        getCardOnBoard
    }
}
