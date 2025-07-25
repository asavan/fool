import {delay} from "../utils/timer.js";
import {assert} from "../utils/assert.js";

import {
    drawBack, drawCard, repaintCard,
    drawHand,
    drawCenterCircle, drawCenter,
    mapColor
} from "./basic_views.js";

import {drawDiscard} from "./discard.js";

import drawPlayersInner from "./legacy.js";

import shuffle from "./shuffle.js";

import ClearHands from "./clear_hands.js";

import highlight from "./highlight.js";

let logger = console;

function setLogger(log) {
    logger = log;
}


function showCards(engine, settings) {
    return settings.showAll || settings.clickAll || engine.showAllCards();
}


function drawMyHand({document, engine, myIndex, settings, playersExternal, logger}, box) {
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

    elem.appendChild(statusRow);
    elem.dataset.id = myIndex;

    if (engine.getCurrentPlayer() === myIndex) {
        elem.classList.add("current-player");
    }
    if (engine.getDealer() === myIndex) {
        elem.classList.add("dealer");
    }

    const hand = drawHand(document, elem, myPlayer.pile(), settings);
    elem.addEventListener("click", async (e) => {
        e.preventDefault();
        const cardEl = e.target.parentElement;
        if (cardEl && cardEl.classList.contains("card")) {
            const card = Number.parseInt(cardEl.dataset.card, 10);
            const res = await engine.moveToDiscard(myIndex, card);
            if (!res && settings.highlight === "aftermove") {
                highlight({document, engine, hand, myIndex, logger, settings});
            }
        }
    });

    box.appendChild(elem);
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
    // DANGER
    const movingContainer = document.createElement("li");
    movingContainer.classList.add("moving-container");
    places.appendChild(movingContainer);
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
        const angleDeg = 90 + increaseDeg * (i - myIndex);

        const elem = document.createElement("li");
        elem.classList.add("js-player");

        if (showCards(engine, settings)) {
            // elem.classList.add("show-all");
            drawHand(document, elem, pl.pile(), settings);
            if (settings.clickAll) {
                const plNum = i;
                elem.addEventListener("click", (e) => {
                    e.preventDefault();
                    const cardEl = e.target.parentElement;
                    if (cardEl && cardEl.classList.contains("card")) {
                        const card = Number.parseInt(cardEl.dataset.card, 10);
                        return engine.moveToDiscard(plNum, card);
                    }
                });
            }
        } else {
            const pileElem = document.createElement("div");

            pileElem.textContent = pl.pile().length;
            pileElem.dataset.count = pl.pile().length;
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
    drawCenter({document, engine, settings, myIndex});
    drawMyHand({document, engine, myIndex, settings, playersExternal, logger}, box);
}

function drawPlayers(data, marker) {
    if (marker) {
        logger.log("drawPlayers", marker);
    } else {
        logger.trace("drawPlayers", marker);
    }
    if (data.settings.legacyView) {
        drawPlayersInner(data, marker, logger);
        return Promise.resolve();
    }

    drawLayout(data);
    return Promise.resolve();
}

async function drawCurrent(document, engine, myIndex, settings) {
    const players = document.querySelectorAll(".js-player");
    const prevCurrent = document.querySelector(".js-player.current-player");
    let boundingRectPrev = null;
    if (prevCurrent) {
        boundingRectPrev = prevCurrent.getBoundingClientRect();
    }
    let activeCurrent = null;
    for (const player of players) {
        player.classList.remove("dealer");
        const playerId = Number.parseInt(player.dataset.id, 10);
        if (engine.getCurrentPlayer() === playerId) {
            activeCurrent = player;
        }
        if (engine.getDealer() === playerId) {
            player.classList.add("dealer");
        }
    }
    let movingCurrent = null;
    const animTime = settings.changeCurrentPause;
    const mainContainer = document.querySelector(".circle-wrapper");
    const movingContainer = document.querySelector(".moving-container");
    if (activeCurrent && boundingRectPrev && movingContainer) {
        const mcbr = mainContainer.getBoundingClientRect();
        const boundingRect = activeCurrent.getBoundingClientRect();
        activeCurrent.classList.add("rounded");
        movingCurrent = document.createElement("div");
        movingCurrent.classList.add("moving-current", "rounded");
        movingCurrent.style.top = (boundingRect.top-mcbr.top) + "px";
        movingCurrent.style.left = (boundingRect.left- mcbr.left) + "px";

        movingContainer.appendChild(movingCurrent);
        const dx = -boundingRect.x + boundingRectPrev.x;
        const dy = -boundingRect.y + boundingRectPrev.y;
        mainContainer?.classList.add("blur-container");

        const moveAnim = [
            {transform: `translate(${dx}px, ${dy}px) scale(${boundingRectPrev.width}, ${boundingRectPrev.height})`},
            {transform: `translate(0, 0) scale(${boundingRect.width}, ${boundingRect.height})`},
        ];

        const timingFunc = {
            duration: animTime,
            easing: "ease-out",
            fill: "forwards"
        };
        if (typeof movingCurrent.animate === "function") {
            movingCurrent.animate(moveAnim, timingFunc);
        }
    }
    if (engine.getCurrentColor()) {
        document.documentElement.style.setProperty("--current-color", mapColor(engine.getCurrentColor()));
        const box = document.querySelector(".places");
        drawCenterCircle(box, document, engine);
    }
    await delay(animTime/2);
    for (const player of players) {
        player.classList.remove("current-player");
    }
    activeCurrent?.classList.add("current-player");
    await delay(animTime/2);
    activeCurrent?.classList.remove("rounded");
    mainContainer?.classList.remove("blur-container");
    movingCurrent?.remove();
    movingCurrent = null;
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
        {transform: "rotateY(180deg)"},
        {transform: `rotateY(0) translate(calc(${dx}px + 100%), ${dy}px)`},
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
    const dx = -tRect.x + flipList.getBoundingClientRect().x - tRect.width / 2;
    const dy = tRect.y - flipList.getBoundingClientRect().y + tRect.height / 2;

    const newspaperSpinning = [
        {transform: "rotateY(180deg)"},
        {transform: `rotateY(180deg) translate(calc(${dx}px), ${dy}px) scale(0)`},
    ];

    const newspaperTiming = {
        duration: animTime,
        easing: "ease-out",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(newspaperSpinning, newspaperTiming);
        await delay(animTime / 2);
    }
    target.textContent = newCount;
    target.dataset.count = newCount;
    await delay(animTime / 2);
    flipClone.remove();
}


async function drawMove(window, document, newCard1, animTime) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const card = Number.parseInt(newCard1.dataset.card, 10);

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
        {transform: `translate(calc(${dx}px + 100%), ${dy}px)`},
        {transform: "translate(0, 0)"}
    ];

    const shrink = [
        {},
        {width: "0%"}
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
        {transform: `translate(calc(${dx}px + 100%), ${dy}px) scale(0)`},
        {transform: "translate(0, 0) scale(1)"}
    ];

    const timing = {
        duration: animTime,
        easing: "linear",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(slide, timing);
        await delay(animTime / 2);
    }

    fromEl.textContent = newCount;
    fromEl.dataset.count = newCount;
    await delay(animTime / 2);
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
        return drawPlayers({document, engine, myIndex, settings, playersExternal}, marker);
    }

    if (playerIndex !== myIndex) {
        const player = document.querySelector(`[data-id="${playerIndex}"]`);
        // TODO change to one selector
        let elemCardCount = player.querySelector(".card-count");
        const pl = engine.getPlayerByIndex(playerIndex);
        if (!elemCardCount) {
            elemCardCount = document.createElement("li");
            elemCardCount.textContent = pl.pile().length;
            elemCardCount.dataset.count = pl.pile().length;
            elemCardCount.classList.add("card-count");
            const hand = player.querySelector(".hand");
            hand?.appendChild(elemCardCount);
        }

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
        return drawMoveOther(window, document, elemCardCount, settings.moveOtherAnim, card, pl.pile().length);
    }
    return drawMoveByCard(window, document, card, settings.moveAnim);
}

function cleanHand(data) {
    const showAll = showCards(data.engine, data.settings);
    return ClearHands.cleanHand(Object.assign(data, {showAll}));
}

export default {
    clearHandOther: ClearHands.clearHandOther,
    cleanHand,
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
    drawShuffle: shuffle,
    setLogger
};
