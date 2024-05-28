import { assert } from "../helper.js";
import core from "../uno/basic.js";

function findGoodCards(pile, cardOnBoard, currentColor) {
    assert(core.matchColor(cardOnBoard, currentColor), "Bad color " + JSON.stringify({pile, cardOnBoard, currentColor}) + " " + core.cardToString(cardOnBoard));
    const hasColor = core.pileHasColor(pile, currentColor);
    const goodColors = pile.filter((card) => core.suitable(card, cardOnBoard, currentColor, hasColor));
    return goodColors;
}

function findGoodNonBlackCards(pile, cardOnBoard, currentColor) {
    assert(core.matchColor(cardOnBoard, currentColor), "Bad color " + JSON.stringify({pile, cardOnBoard, currentColor}) + " " + core.cardToString(cardOnBoard));
    return pile.filter((card) => core.sameColorOrType(card, cardOnBoard, currentColor));
}

function findBestScoreCard(pile) {
    if (pile.length === 0) {
        return;
    }
    const bestCard = pile.reduce((max, card) => core.cardScore(max) > core.cardScore(card) ? max : card);
    return bestCard;
}

function findBestGoodCard(pile, cardOnBoard, currentColor) {
    const nonBlack = findGoodNonBlackCards(pile, cardOnBoard, currentColor);
    if (nonBlack.length > 0) {
        return findBestScoreCard(nonBlack);
    }
    return findBestScoreCard(findGoodCards(pile, cardOnBoard, currentColor));
}

function mostWeightedColor(nonBlackCards) {
    assert(nonBlackCards.length > 0);
    const colorStats = Object.fromEntries(core.GOOD_COLORS.map((color) => [color, 0]));
    for (const card of nonBlackCards) {
        colorStats[core.cardColor(card)] += core.cardScore(card);
    }
    let maxScore = 0;
    let maxColor;
    for (const [color, score] of Object.entries(colorStats)) {
        if (maxScore > score) {
            maxColor = color;
        }
    }
    assert(maxColor !== undefined);
    return maxColor;
}

function bestColor(pile, card, randomEl) {
    assert(pile.includes(card));
    const color = core.cardColor(card);
    if (core.GOOD_COLORS.includes(color)) {
        return color;
    }
    if (color === core.BLACK_COLOR) {
        const nonBlack = pile.filter(c => core.cardColor(c) !== core.BLACK_COLOR);
        if (nonBlack.length > 0) {
            return mostWeightedColor(nonBlack);
        }
        return randomEl(core.GOOD_COLORS);
    }
    assert(false);
}

export default {
    findGoodCards,
    findBestScoreCard,
    findBestGoodCard,
    bestColor
};
