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
    await delay(animTime/2);
    backClone.remove();
}


async function clearHandOther({playerIndex, document, animTime, logger}) {
    const elemCardCount = document.querySelector(`[data-id="${playerIndex}"] .card-count`);
    let cardsCount = parseInt(elemCardCount.textContent);
    for (cardsCount; cardsCount > 0; --cardsCount) {
        logger.log("clear one", cardsCount);
        await clearOther({document, fromEl: elemCardCount, animTime, newCount: (cardsCount-1), logger});
    }
}

async function clearMyHand(data) {
    const myHand = document.querySelector(".my-hand .hand");
    for (const cardElem of myHand.children) {
        await cleanHandMeOne(data, cardElem);
    }
    myHand.replaceChildren();
}

async function cleanHandMeOne({document, logger, settings}, cardElem) {
    if (!cardElem) {
        return;
    }
    const animTime = settings.drawMy;
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const card = parseInt(cardElem.dataset.card);

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
        await delay(animTime);
    }
    flipClone.remove();
}

function cleanHand(data) {
    if (data.playerIndex === data.myIndex) {
        return clearMyHand(data);
    }
    return clearHandOther(data);
}

export default {
    clearHandOther,
    cleanHand
};
