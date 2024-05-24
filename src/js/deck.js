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

async function newShuffledDeck(handlers, rngFunc) {
    const deck = newDeck();
    shuffleArray(deck, rngFunc);
    await handlers.call("shuffle", deck);

    return newExternalDeck(deck, handlers, rngFunc);
}

function newExternalDeck(d, handlers, rngFunc) {
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

    function addCardAndShuffle(card) {
        addCard(card);
        shuffleArray(deck, rngFunc);
        return handlers.call("shuffle", deck);
    }

    function shuffle() {
        shuffleArray(deck, rngFunc);
        return handlers.call("shuffle", deck);
    }

    const size = () => deck.length;

    return {deal, addCardAndShuffle, setDeck, checkTop, size, shuffle};
}

export default {
    newShuffledDeck, newExternalDeck
};
