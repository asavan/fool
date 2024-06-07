
import {drawBack, drawCard, drawCenter} from "./basic_views.js";
import {delay} from "../utils/timer.js";

export async function drawDiscard({document, engine, myIndex, settings}) {
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
    await delay(settings.discardAnimBeforeFlip);
    flipList.classList.remove("is-flipped");
    await delay(settings.discardAnimAfterFlip);
    drawCenter({document, engine, settings, myIndex});
}

export async function drawAntiDiscard({document, engine, myIndex, settings}) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const cardEl = list.querySelector(".card");
    if (!cardEl || cardEl.classList.contains("transparent")) {
        return;
    }
    const card = parseInt(cardEl.dataset.card);
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
    flipList.classList.remove("is-flipped");
    list.appendChild(flipClone);
    cardEl.classList.add("transparent");
    await delay(settings.discardAnimBeforeFlip);
    flipList.classList.add("is-flipped");
    await delay(settings.discardAnimAfterFlip);
    drawCenter({document, engine, settings, myIndex});
}
