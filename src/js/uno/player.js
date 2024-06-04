import core from "./basic.js";

export default function newPlayer(arr, ind, oldScore) {
    const i = ind;
    const deck = [...arr];
    let score = oldScore || 0;

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
    const isUno = () => deck.length === 1;

    const removeCard = (card) => {
        const removeIndex = deck.indexOf(card);
        if (removeIndex < 0) {
            console.error("Wrong card to delete");
            return removeIndex;
        }
        deck.splice(removeIndex, 1);
        return removeIndex;
    };

    const toJson = () => {
        return {
            score,
            pile: pile()
        };
    };

    return {
        toJson,
        addCard,
        pile,
        isUno,
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
