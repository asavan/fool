"use strict";

import {shuffleArray} from "./shuffle.js";

function stub(message) {
    console.log("Stub " + message);
}

const handlers = {
    'shuffle': stub,
    'deal': stub,
    'draw': stub,
    'move': stub
}

let dealer = 0;
let players = [];

let deck = null;



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
    const addCard = (card) => deck.push(card);
    const pile = () => [...deck];

    return {
            getName,
            addCard,
            pile,
            getIndex
          };
}

function addPlayer(name) {
    const n = players.length;
    players.push(newPlayer(name, n));
}

async function dealToPlayer(deck, playerIndex) {
    const card = deck.deal();
    await handlers['draw'](playerIndex, card);
    players[playerIndex].addCard(card);
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

async function chooseDealer() {
    deck = await newShuffledDeck();
    console.log(deck);
    let candidates = [...players];
    console.log('Deciding dealer');
    while (candidates.length > 1) {
        const n = candidates.length;
        let scores = new Array(n);
        let max = 0;
        for (let i = 0; i < n; i++) {
          	  const card = await dealToPlayer(deck, candidates[i].getIndex());
              const score = cardScore(card);
              console.log('>> ' + candidates[i].getName() + ': Player ' + i + ' draws ' + cardType(card) + ' '
                + cardColor(card) + ' and gets ' + score + ' points');
              scores[i] = score;
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
    console.log('dealer was choosen');
}

export default function initCore() {
    return {
        chooseDealer,
        getPlayerIterator,
        addPlayer,
        size,
        on,
        dealToPlayer,
        cardScore,
        cardColor,
        cardType
    }
}
