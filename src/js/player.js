"use strict"; // jshint ;_;

import core from "./uno/basic.js";

export default function newPlayer(name, ind) {
    const n = name;
    const i = ind;
    const deck = [];
    let score = 0;

    const getName = () => n;
    const getIndex = () => i;
    const addCard = (card) => deck.push(card);
    const pile = () => [...deck];
    const cleanHand = () => {deck.length = 0;};
    const updateScore = (s) => { score += s; };
    const setScore = (s) => { score = s; };
    const getScore = () => score;
    const hasColor = (color) => core.pileHasColor(deck, color);
    const hasCard = (card) => deck.includes(card);
    const hasEmptyHand = () => deck.length === 0;

    const removeCard = (card) => {
        const removeIndex = deck.indexOf(card);
        if (removeIndex < 0) {
            console.error("Wrong card to delete");
            return removeIndex;
        }
        deck.splice(removeIndex, 1);
        return removeIndex;
    };

    return {
        getName,
        addCard,
        pile,
        getIndex,
        cleanHand,
        removeCard,
        updateScore,
        getScore,
        setScore,
        hasEmptyHand,
        hasColor,
        hasCard
    };
}
