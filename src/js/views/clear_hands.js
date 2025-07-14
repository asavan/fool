"use strict";

import {drawBack, drawCard} from "./basic_views.js";
import {delay} from "../utils/timer.js";

async function clearOther({document, fromEl, animTime, newCount, logger}) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");
    const backOld = list.querySelector(".sprite-back");
    const backCont = backOld.parentElement;

    const backClone = drawBack(document);
    backClone.classList.add("absolute", "above");
    backCont.insertBefore(backClone, backOld);

    const dx = fromEl.getBoundingClientRect().x - backOld.getBoundingClientRect().x;
    const dy = fromEl.getBoundingClientRect().y - backOld.getBoundingClientRect().y;

    const slide = [
        { transform: `translate(calc(${dx}px + 100%), ${dy}px) scale(0)` },
        { transform: "translate(0, 0) scale(1)" }
    ];

    const timing = {
        duration: animTime,
        easing: "linear",
        fill: "forwards"
    };

    if (typeof backClone.animate === "function") {
        logger.log("flipList", dx, dy);
        backClone.animate(slide, timing);
        await delay(animTime/2);
    }
    fromEl.textContent = newCount;
    fromEl.dataset.count = newCount;
    await delay(animTime/2);
    backClone.remove();
}


async function clearHandOther({playerIndex, document, animTime, logger}) {
    const elemCardCount = document.querySelector(`[data-id="${playerIndex}"] .card-count`);
    if (!elemCardCount) {
        logger.log("No element count", playerIndex);
        return;
    }
    let cardsCount = Number.parseInt(elemCardCount.textContent, 10);
    logger.log("clearHandOther", playerIndex, cardsCount);
    for (cardsCount; cardsCount > 0; --cardsCount) {
        logger.log("clear one", cardsCount);
        await clearOther({document, fromEl: elemCardCount, animTime, newCount: (cardsCount-1), logger});
    }
}

async function clearOpenHand(data) {
    const {settings, document} = data;
    const myHand = document.querySelector(`[data-id="${data.playerIndex}"] .hand`);
    for (const cardElem of myHand.children) {
        await cleanHandMeOne(data, cardElem);
    }
    await delay(settings.drawShow);
    myHand.replaceChildren();
}

async function cleanHandMeOne({document, logger, settings, showAll}, cardElem) {
    if (!cardElem) {
        logger.log("No elem cleanHandMeOne");
        return;
    }
    let factor = 1;
    if (showAll) {
        factor = 4;
    }
    const animTime = settings.drawMy * factor;
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const card = Number.parseInt(cardElem.dataset.card, 10);

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

    const dx = cardElem.getBoundingClientRect().x - flipList.getBoundingClientRect().x;
    const dy = cardElem.getBoundingClientRect().y - flipList.getBoundingClientRect().y;
    cardElem.classList.add("transparent");

    const newspaperSpinning = [
        { transform: `rotateY(0) translate(calc(${dx}px + 100%), ${dy}px)` },
        { transform: "rotateY(180deg)" },
    ];

    const newspaperTiming = {
        duration: animTime,
        easing: "ease-in",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(newspaperSpinning, newspaperTiming);
        logger.log("animate cleanHandMeOne");
        await delay(animTime);
    }
    flipClone.remove();
}

async function cleanHand(data) {
    const {logger, playerIndex, showAll, myIndex} = data;
    if (playerIndex === myIndex || showAll) {
        logger.log("clearOpenHand", data);
        await clearOpenHand(data);
    }
    logger.log("before clearHandOther", data);
    await clearHandOther(data);
}

export default {
    clearHandOther,
    cleanHand
};
