"use strict"; // jshint ;_;

import {shuffleArray} from "./shuffle.js";

function newDeck() {
    const deck = [ ...Array(112).keys()];
    deck.splice(56, 1); //56
    deck.splice(69, 1); //70
    deck.splice(82, 1); //84
    deck.splice(95, 1); //98
    return deck;
}

async function newShuffledDeck(onShuffle, rngFunc) {
    const deck = newExternalDeck(newDeck(), onShuffle, rngFunc);
    await deck.shuffle();
    return deck;
}

function newExternalDeck(d, onShuffle, rngFunc) {
    let deck = d;

    function deal() {
        const card = deck.pop();
        return card;
    }

    function setDeck(d) {
        deck = d;
    }

    function addCard(card) {
        deck.push(card);
    }

    function checkTop(card) {
        if (deck.length === 0) {
            console.log("empty deck");
            return false;
        }
        const res = deck.at(-1) === card;
        if (!res) {
            console.trace("bad deck", deck.at(-1), card, deck);
        }
        return res;
    }

    function topCard() {
        if (deck.length === 0) {
            return;
        }
        return deck.at(-1);
    }

    function addCardAndShuffle(card) {
        addCard(card);
        return shuffle();
    }

    function shuffle() {
        shuffleArray(deck, rngFunc);
        return onShuffle(deck);
    }

    const size = () => deck.length;

    return {deal, addCardAndShuffle, setDeck, checkTop, size, shuffle, topCard};
}

export default {
    newShuffledDeck, newExternalDeck
};
