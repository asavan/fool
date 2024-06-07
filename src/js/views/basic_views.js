import core from "../uno/basic.js";

function drawBlank(document) {
    const blank = document.createElement("li");
    blank.classList.add("blank");
    return blank;
}

export function drawBack(document) {
    const backItem = document.querySelector("#back");
    const backClone = backItem.content.cloneNode(true).firstElementChild;
    return backClone;
}

export function repaintCard(p, cardEl) {
    cardEl.style.setProperty("--sprite-x", (1400 - (p%14)*100) + "%");
    cardEl.style.setProperty("--sprite-y", (800 - Math.floor(p/14)*100) + "%");
    cardEl.dataset.card = p;
    return cardEl;
}

export function drawCard(p, cardItem) {
    const cardClone = cardItem.content.cloneNode(true).firstElementChild;
    return repaintCard(p, cardClone);
}


function drawDeck({document, parent, card, engine, clickAll, myIndex, settings}) {
    const hand = document.createElement("ul");
    const cardItem = document.querySelector("#card");
    hand.classList.add("hand");
    if (card != null) {
        const cardEl = drawCard(card, cardItem);
        hand.appendChild(cardEl);
        if (settings.passAnchor === "card") {
            cardEl.classList.add("clickable");
            cardEl.classList.add("js-pass");
            cardEl.addEventListener("click", (e) => {
                e.preventDefault();
                let playerIndex = myIndex;
                if (clickAll) {
                    playerIndex = engine.getCurrentPlayer();
                }
                return engine.pass(playerIndex);
            });
        }
    } else {
        hand.appendChild(drawBlank(document));
    }

    if (engine.deckSize() === 0) {
        // TODO reconsider
        hand.appendChild(drawBlank(document));
    } else {
        const backClone = drawBack(document);
        backClone.classList.add("js-draw");
        if ((!settings.passAnchor || settings.passAnchor === "deck")) {
            backClone.classList.add("js-pass");
        }
        backClone.addEventListener("click", async (e) => {
            e.preventDefault();
            let playerIndex = myIndex;
            if (clickAll) {
                playerIndex = engine.getCurrentPlayer();
            }
            const res = await engine.onDrawPlayer(playerIndex);
            if (!res && (!settings.passAnchor || settings.passAnchor === "deck")) {
                await engine.pass(playerIndex);
            }
        });
        hand.appendChild(backClone);
    }

    parent.appendChild(hand);
}

function addDirectionElem(size, direction, parent, document, className) {
    if (size === 2 || direction === 0) {
        return;
    }
    const old = parent.querySelector("." + className);
    if (old) {
        const directionElem1 = old.querySelector(".direction");
        if (!directionElem1) {
            // TODO log
            return;
        }
        if (direction === 1) {
            directionElem1.classList.add("mirror");
        } else {
            directionElem1.classList.remove("mirror");
        }
        return;
    }
    const directionElem = document.createElement("span");
    directionElem.classList.add(className);

    const directionElem1 = document.createElement("div");
    directionElem1.classList.add("direction");
    if (direction === 1) {
        directionElem1.classList.add("mirror");
    }
    directionElem.appendChild(directionElem1);
    parent.appendChild(directionElem);
}

export function drawHand(document, parent, pile, settings) {
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
    return hand;
}

export function drawCenterCircle(box, document, engine) {
    addDirectionElem(engine.size(), engine.getDirection(), box, document, "big-circle");
}

export function drawCenter({document, engine, settings, myIndex}) {
    const box = document.querySelector(".places");
    let discardPile = box.querySelector(".center-pile");
    if (!discardPile) {
        discardPile = document.createElement("div");
        discardPile.classList.add("center-pile");
        box.appendChild(discardPile);
    } else {
        discardPile.replaceChildren();
    }
    const card = engine.getCardOnBoard();
    drawDeck({document, parent: discardPile, card, engine, clickAll: settings.clickAll, myIndex, settings});
}


export function mapColor(color) {
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
