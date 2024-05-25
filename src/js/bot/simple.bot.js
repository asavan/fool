import {assert} from "../helper.js";
import core from "../uno/basic.js";

function findGoodCards(pile, cardOnBoard, currentColor) {
    assert(core.matchColor(cardOnBoard, currentColor), "Bad color");
    const hasColor = core.pileHasColor(pile, currentColor);
    const goodColors = pile.filter((card) => core.suitable(card, cardOnBoard, currentColor, hasColor));
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
