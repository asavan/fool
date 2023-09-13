"use strict";

const GOOD_COLORS = ["red", "yellow", "green", "blue"];
Object.freeze(GOOD_COLORS);

const GameStage = Object.freeze({
    chooseDealer: 1,
    dealing: 2,
    round: 3,
    gameOver: 4
});


/**
 * Given a card number, returns its color
 * @function
 * @param {Number} num Number of the card position in deck
 * @return {String} Card color. Either black, red, yellow, green or blue.
 */
function cardColor(num) {
    let color;
    if (num % 14 === 13) {
        return "black";
    }
    switch (Math.floor(num / 14)) {
    case 0:
    case 4:
        color = "red";
        break;
    case 1:
    case 5:
        color = "yellow";
        break;
    case 2:
    case 6:
        color = "green";
        break;
    case 3:
    case 7:
        color = "blue";
        break;
    }
    return color;
}

/**
 * Given a card number, returns its type
 * @function
 * @param {Number} num Number of the card position in deck
 * @return {String} Card type. Either skip, reverse, draw2, draw4, wild or number.
 */
function cardType(num) {
    switch (num % 14) {
    case 10: //Skip
        return "Skip";
    case 11: //Reverse
        return "Reverse";
    case 12: //Draw 2
        return "Draw2";
    case 13: //Wild or Wild Draw 4
        if (Math.floor(num / 14) >= 4) {
            return "Draw4";
        } else {
            return "Wild";
        }
    default:
        return "Number " + (num % 14);
    }
}

/**
 * Given a card number, returns its scoring
 * @function
 * @param {Number} num Number of the card position in deck
 * @return {Number} Points value.
 */
function cardScore(num) {
    let points;
    switch (num % 14) {
    case 10: //Skip
    case 11: //Reverse
    case 12: //Draw 2
        points = 20;
        break;
    case 13: //Wild or Wild Draw 4
        points = 50;
        break;
    default:
        points = num % 14;
        break;
    }
    return points;
}



function sortByTemplate(pile, sortDirection, colors) {
    pile.sort((p1, p2) => {
        const c1 = cardColor(p1);
        const c2 = cardColor(p2);
        if (c1 === c2) {
            if (sortDirection === "asc") {
                return cardScore(p1) - cardScore(p2);
            } else {
                return cardScore(p2) - cardScore(p1);
            }
        }
        for (const c of colors) {
            if (c === c1) {
                if (sortDirection === "asc") {
                    return -1;
                } else {
                    return 1;
                }
            }

            if (c === c2) {
                if (sortDirection === "asc") {
                    return 1;
                } else {
                    return -1;
                }
            }
        }
    });
}

function pileHasColor(pile, color) {
    return pile.find(card => cardColor(card) === color) != null;
}

function cardToString(card) {
    return cardColor(card) + " " + cardType(card);
}

export default {
    GOOD_COLORS,
    GameStage,
    cardColor,
    cardType,
    cardScore,
    sortByTemplate,
    pileHasColor,
    cardToString
};
