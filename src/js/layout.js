"use strict"; // jshint ;_;
import core from "./uno/basic.js";
import {delay} from "./helper.js";

function drawCard(p, cardItem) {
    const cardClone = cardItem.content.cloneNode(true).firstElementChild;
    cardClone.style.setProperty("--sprite-x", (1400 - (p%14)*100) + "%");
    cardClone.style.setProperty("--sprite-y", (800 - Math.floor(p/14)*100) + "%");
    cardClone.dataset.card = p;
    return cardClone;
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

function drawDeck(document, parent, card, engine, mode, myIndex) {
    console.log("drawDeck");
    const hand = document.createElement("ul");
    const cardItem = document.querySelector("#card");
    hand.classList.add("hand");
    if (card !== null) {
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
            if (mode === "ai") {
                await engine.drawCurrent();
            } else {
                const res = await engine.onDrawPlayer(myIndex);
                if (!res) {
                    await engine.pass(myIndex);
                }
            }
        });
        hand.appendChild(backClone);
    }

    parent.appendChild(hand);
}

function drawPlayersInner(window, document, engine, myIndex, settings, marker) {
    const root = document.documentElement;
    // root.style.setProperty("--card-width", "30px");
    root.style.setProperty("--current-color", mapColor(engine.getCurrentColor()));

    const box = document.querySelector(".places");
    box.replaceChildren();
    drawCenterCircle(box, document, engine);

    const places = document.createElement("ul");
    places.classList.add("circle-wrapper");
    // places.style.position = 'relative';
    box.appendChild(places);
    const increaseDeg = 360 / engine.size();
    const players = engine.getPlayerIterator();
    let i = 0;
    const dealer = engine.getDealer();
    const currentPlayer = engine.getCurrentPlayer();
    if (marker) {
        console.log("Draw inner", marker);
    } else {
        console.log("Draw inner");
    }

    for (const pl of players) {
        const angleDeg = 90 + increaseDeg*(i-myIndex);
        const elem = document.createElement("li");
        elem.classList.add("show-all");
        const nameElem = document.createElement("span");
        nameElem.textContent = pl.getName();
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
    drawCenter(window, document, engine.getCardOnBoard(), engine, "ai", myIndex);
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
    addDirectionElem(engine.size(), engine.getDirection(), box, document, "big-circle", engine.getCurrentColor());
}

function drawCenter(window, document, p, engine, mode, myIndex) {
    const box = document.querySelector(".places");
    let discardPile = box.querySelector(".center-pile");
    if (!discardPile) {
        discardPile = document.createElement("div");
        discardPile.classList.add("center-pile");
        box.appendChild(discardPile);
    } else {
        discardPile.replaceChildren();
    }
    drawDeck(document, discardPile, p, engine, mode, myIndex);
}

function addDirectionElem(size, direction, parent, document, className, className2) {
    if (size === 2 || direction === 0) {
        return;
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

function drawMyHand(window, document, engine, myIndex, myPlayer, box, settings) {
    const elem = document.createElement("div");
    elem.classList.add("my-hand", "js-player");
    const statusRow = document.createElement("div");
    statusRow.classList.add("row");
    const nameElem = document.createElement("span");
    nameElem.textContent = myPlayer.getName();
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


function drawLayout(window, document, engine, myIndex, settings) {
    const root = document.documentElement;
    root.style.setProperty("--current-color", mapColor(engine.getCurrentColor()));
    const box = document.querySelector(".places");
    box.replaceChildren();
    drawCenterCircle(box, document, engine);
    const places = document.createElement("ul");
    places.classList.add("circle-wrapper");
    box.appendChild(places);
    const increaseDeg = 360 / engine.size();
    const players = engine.getPlayerIterator();
    let i = 0;
    const dealer = engine.getDealer();
    const currentPlayer = engine.getCurrentPlayer();
    let myPlayer = null;
    for (const pl of players) {
        if (i === myIndex) {
            myPlayer = pl;
            ++i;
            continue;
        }
        const angleDeg = 90 + increaseDeg*(i-myIndex);

        const elem = document.createElement("li");
        elem.classList.add("js-player");

        if (settings.show) {
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

        nameElem.textContent = pl.getName();
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
    drawCenter(window, document, engine.getCardOnBoard(), engine, "net", myIndex);
    drawMyHand(window, document, engine, myIndex, myPlayer, box, settings);
}

function drawPlayers(window, document, engine, myIndex, settings, marker) {
//    console.log("drawPlayers", engine.state());
    if (settings.clickAll) {
        drawPlayersInner(window, document, engine, myIndex, settings, marker);
        return;
    }

    drawLayout(window, document, engine, myIndex, settings);
}

async function drawDiscard(window, document, engine, myIndex) {
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
    await delay(1000);
    drawCenter(window, document, engine.getCardOnBoard(), engine, "net", myIndex);
}

function drawCurrent(window, document, engine) {
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
}

export default {
    drawCenter,
    drawPlayers,
    drawLayout,
    drawDiscard,
    drawCurrent
};
