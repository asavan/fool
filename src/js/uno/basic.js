const GOOD_COLORS = Object.freeze(["red", "yellow", "green", "blue"]);
const BLACK_COLOR = "black";

const GameStage = Object.freeze({
    CHOOSE_DEALER: 1,
    DEALING: 2,
    ROUND: 3,
    ROUND_OVER: 4,
    GAME_OVER: 5
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
    const sign = sortDirection === "asc" ? 1 : -1;
    pile.sort((p1, p2) => {
        const c1 = cardColor(p1);
        const c2 = cardColor(p2);
        if (c1 === c2) {
            const scoreDiff = cardScore(p1) - cardScore(p2);
            if (scoreDiff === 0) {
                return (p1 - p2) * sign;
            }
            return scoreDiff * sign;
        }
        for (const c of colors) {
            if (c === c1) {
                return -1;
            }

            if (c === c2) {
                return 1;
            }
        }
        // should not happen
        return 0;
    });
}

function pileHasColor(pile, color) {
    return pile.find(card => cardColor(card) === color) != null;
}

function cardToString(card) {
    return cardColor(card) + " " + cardType(card);
}

function matchColor(card, color) {
    if (!GOOD_COLORS.includes(color)) {
        return false;
    }
    return (cardColor(card) === color) || (cardColor(card) === BLACK_COLOR);
}

function sameColorOrType(card, cardOnBoard, currentColor) {
    return (cardColor(card) === currentColor) || (cardType(card) === cardType(cardOnBoard));
}

function sameColorOrTypeNonBlack(card, cardOnBoard, currentColor) {
    if (cardColor(card) === BLACK_COLOR) {
        return false;
    }
    return sameColorOrType(card, cardOnBoard, currentColor);
}

function suitable(card, cardOnBoard, currentColor, hasColor) {
    if (cardType(card) === "Wild") {
        return true;
    }

    if (cardType(card) === "Draw4") {
        return !hasColor;
    }

    return sameColorOrType(card, cardOnBoard, currentColor);
}

function isDrawCard(card) {
    return (cardType(card) === "Draw4") || (cardType(card) === "Draw2");
}

function nextPlayer(diff, size, direction, cur) {
    // localAssert(size > 0, "Bad usage");
    // localAssert(direction === 1 || direction === -1, "Bad usage direction");
    return (cur + (diff + 1) * direction + size) % size;
}

export default {
    GOOD_COLORS,
    BLACK_COLOR,
    GameStage,
    cardColor,
    cardType,
    cardScore,
    sortByTemplate,
    pileHasColor,
    cardToString,
    suitable,
    sameColorOrTypeNonBlack,
    isDrawCard,
    nextPlayer,
    matchColor
};
