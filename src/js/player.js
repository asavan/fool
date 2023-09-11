"use strict"; // jshint ;_;

function newPlayer(name, ind, handlers) {
    const n = name;
    const i = ind;
    const deck = [];
    let score = 0;

    const getName = () => { return n };
    const getIndex = () => { return i };
    const addCard = (card) => {
        deck.push(card);
    }
    const pile = () => [...deck];
    const cleanHand = async () => {
        deck.length = 0;
        await handlers['clearPlayer'](i);
    }

    const updateScore = (s) => { score += s; }
    const setScore = (s) => { score = s; }
    const getScore = () => { return score; }

    const removeCard = (card) => {
        const removeIndex = deck.indexOf(card);
        if (removeIndex < 0) {
            console.error("Wrong card to delete");
            return removeIndex;
        }
        deck.splice(removeIndex, 1);
        return removeIndex;
    }

    return {
        getName,
        addCard,
        pile,
        getIndex,
        cleanHand,
        removeCard,
        updateScore,
        getScore,
        setScore
    };
}

export default {
    newPlayer
}
