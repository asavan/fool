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
    let deck = newDeck();
    shuffleArray(deck, rngFunc);
    console.log("New deck");
    await handlers["shuffle"](deck);

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
        const res = deck.at(-1) === card;
        if (!res) {
            console.log("bad deck", deck.at(-1), card);
        }
        return res;
    }

    async function addCardAndShuffle(card) {
        addCard(card);
        shuffleArray(deck, rngFunc);
        await handlers["shuffle"](deck);
    }

    return {deal, addCardAndShuffle, setDeck, checkTop};
}


export default {
    newShuffledDeck, newExternalDeck
};
