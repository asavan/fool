import {delay} from "../utils/timer.js";


export default async function heightGoodCards({engine, hand, myIndex, logger, settings}) {
    if (!engine.isMyMove(myIndex)) {
        return;
    }
    const goodCards = engine.getCurrentSuitable();
    logger.log("goodCards", goodCards);
    let selector = ".js-draw";
    if (!engine.canDraw()) {
        selector = ".js-pass";
    }
    const actionEl = document.querySelector(selector);
    if (goodCards.length === 0) {
        if (actionEl) {
            actionEl.classList.add("highlight-good");
        }
    }
    for (const cardEl of hand.children) {
        const card = parseInt(cardEl.dataset.card);
        if (goodCards.includes(card)) {
            cardEl.classList.add("highlight-good");
        } else {
            cardEl.classList.add("highlight-bad");
        }
    }

    await delay(settings.highlightDelay);
    for (const cardEl of hand.children) {
        cardEl.classList.remove("highlight-good");
        cardEl.classList.remove("highlight-bad");
    }
    if (actionEl) {
        actionEl.classList.remove("highlight-good");
    }
}
