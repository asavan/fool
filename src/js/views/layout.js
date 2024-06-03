import core from "../uno/basic.js";
import {delay} from "../utils/timer.js";
import { assert } from "../utils/assert.js";

let logger = console;

function setLogger(log) {
    logger = log;
}

function repaintCard(p, cardEl) {
    cardEl.style.setProperty("--sprite-x", (1400 - (p%14)*100) + "%");
    cardEl.style.setProperty("--sprite-y", (800 - Math.floor(p/14)*100) + "%");
    cardEl.dataset.card = p;
    return cardEl;
}

function showCards(engine, settings) {
    return settings.showAll || settings.clickAll || engine.showAllCards();
}

function drawCard(p, cardItem) {
    const cardClone = cardItem.content.cloneNode(true).firstElementChild;
    return repaintCard(p, cardClone);
}

function drawBlank(document) {
    const blank = document.createElement("li");
    blank.classList.add("blank");
    return blank;
}

function drawBack(document) {
    const backItem = document.querySelector("#back");
    const backClone = backItem.content.cloneNode(true).firstElementChild;
    return backClone;
}

function drawHand(document, parent, pile, engine, settings) {
    const hand = document.createElement("ul");
    const cardItem = document.querySelector("#card");
    hand.classList.add("hand");
    if (settings && settings.sortByColor) {
        core.sortByTemplate(pile, settings.sortByColor, settings.colorOrder);
    }
    for (const p of pile) {
        hand.appendChild(drawCard(p, cardItem));
    }
    parent.appendChild(hand);
}

function drawDeck(document, parent, card, engine, clickAll, myIndex) {
    const hand = document.createElement("ul");
    const cardItem = document.querySelector("#card");
    hand.classList.add("hand");
    if (card != null) {
        hand.appendChild(drawCard(card, cardItem));
    } else {
        hand.appendChild(drawBlank(document));
    }

    if (engine.deckSize() === 0) {
        hand.appendChild(drawBlank(document));
    } else {
        const backClone = drawBack(document);
        backClone.addEventListener("click", async (e) => {
            e.preventDefault();
            let playerIndex = myIndex;
            if (clickAll) {
                playerIndex = engine.getCurrentPlayer();
            }
            const res = await engine.onDrawPlayer(playerIndex);
            if (!res) {
                await engine.pass(playerIndex);
            }
        });
        hand.appendChild(backClone);
    }

    parent.appendChild(hand);
}

function drawPlayersInner({document, engine, myIndex, settings, playersExternal}, marker) {
    const root = document.documentElement;
    // root.style.setProperty("--card-width", "30px");
    root.style.setProperty("--current-color", mapColor(engine.getCurrentColor()));

    const box = document.querySelector(".places");
    box.replaceChildren();
    if (settings.direction.includes("center")) {
        drawCenterCircle(box, document, engine);
    }

    const places = document.createElement("ul");
    places.classList.add("circle-wrapper");
    // places.style.position = 'relative';
    box.appendChild(places);
    const increaseDeg = 360 / engine.size();
    const players = engine.getPlayerIterator();
    const dealer = engine.getDealer();
    const currentPlayer = engine.getCurrentPlayer();
    if (marker) {
        logger.log("Draw inner", marker);
    } else {
        logger.log("Draw inner");
    }

    let i = 0;
    for (const pl of players) {
        const angleDeg = 90 + increaseDeg*(i-myIndex);
        const elem = document.createElement("li");
        elem.classList.add("show-all");
        const nameElem = document.createElement("span");
        const playerName = playersExternal[i].name;
        nameElem.textContent = playerName;
        nameElem.classList.add("player-name");
        elem.appendChild(nameElem);

        const score = pl.getScore();
        if (score > 0) {
            const scoreElem = document.createElement("span");
            scoreElem.textContent = score;
            elem.appendChild(scoreElem);
        }
        drawHand(document, elem, pl.pile(), engine, settings);
        elem.dataset.id = i;
        elem.dataset.angle = angleDeg + "deg";
        elem.style.setProperty("--angle-deg", angleDeg + "deg");
        elem.classList.add("circle", "player-hand", "js-player");
        if (dealer === i) {
            elem.classList.add("dealer");
        }
        if (currentPlayer === i) {
            elem.classList.add("current-player");
        }

        places.appendChild(elem);
        ++i;
    }
    drawCenter(document, engine.getCardOnBoard(), engine, settings, myIndex);
    places.addEventListener("click", async (e) => {
        e.preventDefault();
        const cardEl = e.target.parentElement;

        if (cardEl && cardEl.classList.contains("card")) {
            const playerEl = cardEl.parentElement.parentElement;
            const card = parseInt(cardEl.dataset.card);
            const playerId = parseInt(playerEl.dataset.id);
            await engine.moveToDiscard(playerId, card);
        }
    });
}

function drawCenterCircle(box, document, engine) {
    addDirectionElem(engine.size(), engine.getDirection(), box, document, "big-circle");
}

function drawCenter(document, p, engine, settings, myIndex) {
    const box = document.querySelector(".places");
    let discardPile = box.querySelector(".center-pile");
    if (!discardPile) {
        discardPile = document.createElement("div");
        discardPile.classList.add("center-pile");
        box.appendChild(discardPile);
    } else {
        discardPile.replaceChildren();
    }
    drawDeck(document, discardPile, p, engine, settings.clickAll, myIndex);
}

function addDirectionElem(size, direction, parent, document, className, className2) {
    if (size === 2 || direction === 0) {
        return;
    }
    const old = parent.querySelector("." + className);
    if (old) {
        old.remove();
    }
    const directionElem = document.createElement("span");
    directionElem.classList.add(className);

    const directionElem1 = document.createElement("div");
    directionElem1.classList.add("direction");
    if (className2) {
        directionElem1.classList.add(className2);
    }

    if (direction === 1) {
        directionElem1.classList.add("mirror");
    }
    directionElem.appendChild(directionElem1);
    parent.appendChild(directionElem);
}

function drawMyHand({document, engine, myIndex, settings, playersExternal}, box) {
    const myPlayer = engine.getPlayerByIndex(myIndex);
    const elem = document.createElement("div");
    elem.classList.add("my-hand", "js-player");
    const statusRow = document.createElement("div");
    statusRow.classList.add("row");
    const nameElem = document.createElement("span");
    const playerName = playersExternal[myIndex].name;
    nameElem.textContent = playerName;
    nameElem.classList.add("player-name");
    statusRow.appendChild(nameElem);

    const score = myPlayer.getScore();
    if (score > 0) {
        const scoreElem = document.createElement("span");
        scoreElem.textContent = score;
        statusRow.appendChild(scoreElem);
    }

    if (settings.direction && settings.direction.includes("hand")) {
        addDirectionElem(engine.size(), engine.getDirection(), statusRow, document, "sprite-container");
    }
    elem.appendChild(statusRow);


    elem.dataset.id = myIndex;

    if (engine.getCurrentPlayer() === myIndex) {
        elem.classList.add("current-player");
    }
    if (engine.getDealer() === myIndex) {
        elem.classList.add("dealer");
    }

    drawHand(document, elem, myPlayer.pile(), engine, settings);
    elem.addEventListener("click", async (e) => {
        e.preventDefault();
        const cardEl = e.target.parentElement;
        if (cardEl && cardEl.classList.contains("card")) {
            const card = parseInt(cardEl.dataset.card);
            await engine.moveToDiscard(myIndex, card);
        }
    });

    box.appendChild(elem);
}


function mapColor(color) {
    const colors = {
        "green": "rgba(85, 170, 85, 0.4)",
        "red" : "rgba(255, 85, 85, 0.4)",
        "yellow": "rgba(255, 170, 0, 0.4)",
        "blue": "rgba(85, 85, 255, 0.4)",
    };
    const c = colors[color];
    if (c != null) {
        return c;
    }
    return "rgba(240, 248, 255, 0.3)"; // aliceblue;
}


function drawLayout({document, engine, myIndex, settings, playersExternal}) {
    const root = document.documentElement;
    root.style.setProperty("--current-color", mapColor(engine.getCurrentColor()));
    const box = document.querySelector(".places");
    box.replaceChildren();
    if (settings.direction.includes("center")) {
        drawCenterCircle(box, document, engine);
    }
    const places = document.createElement("ul");
    places.classList.add("circle-wrapper");
    box.appendChild(places);
    const increaseDeg = 360 / engine.size();
    assert(engine.size() === playersExternal.length,
        "engine not equal to presenter " + JSON.stringify({e: engine.size(), p: playersExternal.length}));
    const players = engine.getPlayerIterator();
    let i = 0;
    const dealer = engine.getDealer();
    const currentPlayer = engine.getCurrentPlayer();
    for (const pl of players) {
        if (i === myIndex) {
            ++i;
            continue;
        }
        const angleDeg = 90 + increaseDeg*(i-myIndex);

        const elem = document.createElement("li");
        elem.classList.add("js-player");

        if (showCards(engine, settings)) {
            // elem.classList.add("show-all");
            drawHand(document, elem, pl.pile(), engine, settings);
        } else {
            const pileElem = document.createElement("div");

            pileElem.textContent = pl.pile().length;
            pileElem.classList.add("card-count");
            elem.appendChild(pileElem);
        }

        const nameElem = document.createElement("div");
        nameElem.classList.add("player-name");
        const playerName = playersExternal[i].name;
        nameElem.textContent = playerName;
        elem.appendChild(nameElem);

        const score = pl.getScore();
        if (score > 0) {
            const scoreElem = document.createElement("div");
            scoreElem.textContent = score;
            elem.appendChild(scoreElem);
        }


        elem.dataset.id = i;
        elem.dataset.angle = angleDeg + "deg";
        elem.style.setProperty("--angle-deg", angleDeg + "deg");
        elem.classList.add("circle");
        if (currentPlayer === i) {
            elem.classList.add("current-player");
        }
        if (dealer === i) {
            elem.classList.add("dealer");
        }
        ++i;

        places.appendChild(elem);
    }
    drawCenter(document, engine.getCardOnBoard(), engine, settings, myIndex);
    drawMyHand({document, engine, myIndex, settings, playersExternal}, box);
}

function drawPlayers(data, marker) {
    if (marker) {
        logger.log("drawPlayers", marker);
    } else {
        logger.trace("drawPlayers", marker);
    }
    if (data.settings.clickAll) {
        drawPlayersInner(data, marker);
        return;
    }

    drawLayout(data);
}

async function drawDiscard(document, engine, myIndex, settings) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const flipItem = document.querySelector("#flip-card");
    const flipClone = flipItem.content.cloneNode(true).firstElementChild;
    const flipList = flipClone.querySelector(".card-flip");
    const cardItem = document.querySelector("#card");
    const newCard = drawCard(engine.getCardOnBoard(), cardItem);
    newCard.classList.add("card-face");
    const backClone = drawBack(document);
    backClone.classList.add("card-face", "card-face-back");
    flipList.appendChild(newCard);
    flipList.appendChild(backClone);
    list.appendChild(flipClone);
    await delay(200);
    flipList.classList.remove("is-flipped");
    await delay(800);
    drawCenter(document, engine.getCardOnBoard(), engine, settings, myIndex);
}

function drawCurrent(document, engine) {
    const players = document.querySelectorAll(".js-player");
    for (const player of players) {
        player.classList.remove("current-player", "dealer");
        const playerId = parseInt(player.dataset.id);
        if (engine.getCurrentPlayer() === playerId) {
            player.classList.add("current-player");
        }
        if (engine.getDealer() === playerId) {
            player.classList.add("dealer");
        }
    }
    if (engine.getCurrentColor()) {
        document.documentElement.style.setProperty("--current-color", mapColor(engine.getCurrentColor()));
        const box = document.querySelector(".places");
        drawCenterCircle(box, document, engine);
    }
}

async function drawDeal(window, document, card, animTime) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const flipItem = document.querySelector("#flip-card");
    const flipClone = flipItem.content.cloneNode(true).firstElementChild;
    const flipList = flipClone.querySelector(".card-flip");
    const cardItem = document.querySelector("#card");
    const newCard = drawCard(card, cardItem);
    newCard.classList.add("card-face");
    const backClone = drawBack(document);
    backClone.classList.add("card-face", "card-face-back");
    flipList.appendChild(newCard);
    flipList.appendChild(backClone);
    list.appendChild(flipClone);

    const myHand = document.querySelector(".my-hand .hand");
    const newCard1 = drawCard(card, cardItem);
    newCard1.classList.add("transparent");
    myHand.appendChild(newCard1);

    const dx = newCard1.getBoundingClientRect().x - flipList.getBoundingClientRect().x;
    const dy = newCard1.getBoundingClientRect().y - flipList.getBoundingClientRect().y;

    const newspaperSpinning = [
        { transform: "rotateY(180deg)" },
        { transform: `rotateY(0) translate(calc(${dx}px + 100%), ${dy}px)` },
    ];

    const newspaperTiming = {
        duration: animTime,
        easing: "ease-out",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(newspaperSpinning, newspaperTiming);
        await delay(animTime);
    }
    flipClone.remove();
    newCard1.classList.remove("transparent");
}

async function drawDealOther(window, document, card, animTime, target, newCount) {
    if (!target) {
        logger.error("No target");
        return;
    }
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const flipItem = document.querySelector("#flip-card");
    const flipClone = flipItem.content.cloneNode(true).firstElementChild;
    const flipList = flipClone.querySelector(".card-flip");
    const cardItem = document.querySelector("#card");
    const newCard = drawCard(card, cardItem);
    newCard.classList.add("card-face");
    const backClone = drawBack(document);
    backClone.classList.add("card-face", "card-face-back");
    flipList.appendChild(newCard);
    flipList.appendChild(backClone);
    list.appendChild(flipClone);

    const tRect = target.getBoundingClientRect();
    const dx = -tRect.x + flipList.getBoundingClientRect().x - tRect.width/2;
    const dy = tRect.y - flipList.getBoundingClientRect().y + tRect.height/2;

    const newspaperSpinning = [
        { transform: "rotateY(180deg)" },
        { transform: `rotateY(180deg) translate(calc(${dx}px), ${dy}px) scale(0)`},
    ];

    const newspaperTiming = {
        duration: animTime,
        easing: "ease-out",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(newspaperSpinning, newspaperTiming);
        await delay(animTime/2);
    }
    target.textContent = newCount;
    await delay(animTime/2);
    flipClone.remove();
}


async function drawMove(window, document, newCard1, animTime) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const card = parseInt(newCard1.dataset.card, 10);

    const flipItem = document.querySelector("#flip-card");
    const flipClone = flipItem.content.cloneNode(true).firstElementChild;
    const flipList = flipClone.querySelector(".card-flip");
    const cardItem = document.querySelector("#card");
    const newCard = drawCard(card, cardItem);
    newCard.classList.add("card-face");
    const backClone = drawBack(document);
    backClone.classList.add("card-face", "card-face-back");
    flipList.appendChild(newCard);
    flipList.appendChild(backClone);
    list.appendChild(flipClone);


    const dx = newCard1.getBoundingClientRect().x - flipList.getBoundingClientRect().x;
    const dy = newCard1.getBoundingClientRect().y - flipList.getBoundingClientRect().y;
    newCard1.classList.add("transparent");

    const slide = [
        { transform: `translate(calc(${dx}px + 100%), ${dy}px)` },
        { transform: "translate(0, 0)" }
    ];

    const shrink = [
        {},
        { width: "0%" }
    ];

    const timing = {
        duration: animTime,
        easing: "linear",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(slide, timing);
        newCard1.animate(shrink, timing);
        await delay(animTime);
    }
    const cardToRepaint = list.querySelector(".card");
    repaintCard(card, cardToRepaint);
    newCard1.remove();
    flipClone.remove();
}

async function drawMoveOther(window, document, fromEl, animTime, card, newCount) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const flipItem = document.querySelector("#flip-card");
    const flipClone = flipItem.content.cloneNode(true).firstElementChild;
    const flipList = flipClone.querySelector(".card-flip");
    const cardItem = document.querySelector("#card");
    const newCard = drawCard(card, cardItem);
    newCard.classList.add("card-face");
    const backClone = drawBack(document);
    backClone.classList.add("card-face", "card-face-back");
    flipList.appendChild(newCard);
    flipList.appendChild(backClone);
    list.appendChild(flipClone);


    const dx = fromEl.getBoundingClientRect().x - flipList.getBoundingClientRect().x;
    const dy = fromEl.getBoundingClientRect().y - flipList.getBoundingClientRect().y;

    const slide = [
        { transform: `translate(calc(${dx}px + 100%), ${dy}px) scale(0)` },
        { transform: "translate(0, 0) scale(1)" }
    ];

    const timing = {
        duration: animTime,
        easing: "linear",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(slide, timing);
        await delay(animTime/2);
    }

    fromEl.textContent = newCount;
    await delay(animTime/2);
    const cardToRepaint = list.querySelector(".card");
    repaintCard(card, cardToRepaint);
    flipClone.remove();
}

function drawMoveByCard(window, document, card, animTime) {
    const myHand = document.querySelector(".my-hand .hand");
    const cardEl = myHand.querySelector(`[data-card="${card}"]`);
    return drawMove(window, document, cardEl, animTime);
}

function drawPlayersDeal(window, {document, engine, myIndex, settings, playersExternal}, marker, card, playerIndex) {
    if (showCards(engine, settings)) {
        drawPlayers({document, engine, myIndex, settings, playersExternal}, marker);
        return;
    }

    if (playerIndex !== myIndex) {
        const player = document.querySelector(`[data-id="${playerIndex}"]`);
        // TODO change to one selector
        const elemCardCount = player.querySelector(".card-count");
        const pl = engine.getPlayerByIndex(playerIndex);
        return drawDealOther(window, document, card, settings.moveAnim, elemCardCount, pl.pile().length);
    }

    return drawDeal(window, document, card, settings.dealAnim);
}

function drawPlayersMove(window, {document, engine, myIndex, settings, playersExternal}, marker, card, playerIndex) {
    if (showCards(engine, settings)) {
        return drawPlayers({document, engine, myIndex, settings, playersExternal}, marker);
    }
    if (playerIndex !== myIndex) {
        const player = document.querySelector(`[data-id="${playerIndex}"]`);
        // TODO change to one selector
        const elemCardCount = player.querySelector(".card-count");
        const pl = engine.getPlayerByIndex(playerIndex);
        return drawMoveOther(window, document, elemCardCount, settings.moveAnim, card, pl.pile().length);
    }
    return drawMoveByCard(window, document, card, settings.moveAnim);
}

export default {
    drawPlayers,
    drawDiscard,
    drawCurrent,
    drawDeal,
    drawPlayersDeal,
    drawMoveOther,
    drawDealOther,
    drawMoveByCard,
    drawMove,
    drawPlayersMove,
    setLogger
};
