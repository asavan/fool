import { assert } from "../helper.js";
import core from "../uno/basic.js";

function findMostFrequentElement(arr, toIgnore) {
    let mostFrequentElement;
    let mostFrequentCount = 0;

    for (let i = 0; i < arr.length; i++) {
        let currentCount = 0;
        if (arr[i] === toIgnore) {
            continue;
        }
        for (let j = 0; j < arr.length; j++) {
            if (arr[j] === arr[i]) {
                currentCount++;
            }
        }

        if (currentCount > mostFrequentCount) {
            mostFrequentElement = arr[i];
            mostFrequentCount = currentCount;
        }
    }
    return mostFrequentElement;
}

function findGoodCards(pile, cardOnBoard, currentColor) {
    assert(core.matchColor(cardOnBoard, currentColor), "Bad color " + JSON.stringify({pile, cardOnBoard, currentColor}) + " " + core.cardToString(cardOnBoard));
    const hasColor = core.pileHasColor(pile, currentColor);
    const goodColors = pile.filter((card) => core.suitable(card, cardOnBoard, currentColor, hasColor));
    return goodColors;
}

function findBestScoreCard(pile) {
    if (pile.length === 0) {
        return;
    }
    const bestCard = pile.reduce((max, card) => core.cardScore(max) > core.cardScore(card) ? max : card);
    return bestCard;
}

function findBestGoodCard(pile, cardOnBoard, currentColor) {
    return findBestScoreCard(findGoodCards(pile, cardOnBoard, currentColor));
}

function bestColor(pile, card, randomEl) {
    assert(pile.includes(card));
    const color = core.cardColor(card);
    if (core.GOOD_COLORS.includes(color)) {
        return color;
    }
    if (color === "black") {
        const colors = pile.map(core.cardColor);
        const mostFrequent = findMostFrequentElement(colors, "black");
        if (mostFrequent !== undefined) {
            return mostFrequent;
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
