import {assert} from "../helper.js";
import core from "../uno/basic.js";

function checkCardMatchColor(card, currentColor) {
    const colorFromCard = core.cardColor(card);
    if (colorFromCard !== "black") {
        assert(currentColor === colorFromCard, "Bad color");
    } else {
        assert(core.GOOD_COLORS.includes(currentColor), "Bad color2");
    }
}

function sameColor(card, currentColor) {
    return core.cardColor(card) === currentColor;
}

function sameColorOrWild(card, currentColor) {
    return sameColor(card, currentColor) || core.cardType(card) === "Wild";
}

function sameColorOrBlack(card, currentColor) {
    return sameColor(card, currentColor) || core.cardColor(card) === "black";
}

function suitable(hasColor, currentColor) {
    if (hasColor) {
        return (card) => sameColorOrWild(card, currentColor);
    }
    return (card) => sameColorOrBlack(card, currentColor);
}

function findGoodCards(pile, card, currentColor) {
    checkCardMatchColor(card, currentColor);
    const hasColor = core.pileHasColor(pile, currentColor);
    const goodColors = pile.filter(suitable(hasColor, currentColor));
    return goodColors;
}

function findBestScoreCard(pile) {
    const bestCard = pile.reduce((max, card) => core.cardScore(max) > core.cardScore(card) ? max : card);
    return bestCard;
}

function findBestGoodCard(pile, card, currentColor) {
    return findBestScoreCard(findGoodCards(pile, card, currentColor));
}

export default {
    findGoodCards,
    findBestScoreCard,
    findBestGoodCard
};
