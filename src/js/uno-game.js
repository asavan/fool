"use strict"; // jshint ;_;
import {assert, delay} from "./helper.js";
import coreUnoFunc from "./uno.js";

function stub(message) {
    console.log("Stub " + message);
}


let players = [];
let dealer = 0;

function drawCard(p, cardItem) {
    const cardClone = cardItem.content.cloneNode(true).firstElementChild;
    cardClone.style.setProperty('--sprite-x', (1400 - (p%14)*100) + '%');
    cardClone.style.setProperty('--sprite-y', (800 - Math.floor(p/14)*100) + '%');
    return cardClone;
}

function drawHand(document, parent, pile) {
    const hand = document.createElement("ul");
    const cardItem = document.querySelector('#card');
    hand.classList.add('hand');
    for (const p of pile) {
        hand.appendChild(drawCard(p, cardItem));
    }
    parent.appendChild(hand);
}

function drawPlayers(window, document, engine) {
    const box = document.querySelector(".places");
    box.replaceChildren();
    const places = document.createElement("ul");
    places.classList.add('circle-wrapper');
    // places.style.position = 'relative';
    box.appendChild(places);
    const increaseDeg = 360 / engine.size();
    let angleDeg = 90;
    const players = engine.getPlayerIterator();
    let i = 0;
    for (const pl of players) {
        const elem = document.createElement("li");
        const nameElem = document.createElement("span");
        nameElem.innerText = pl.getName();
        elem.appendChild(nameElem);
        drawHand(document, elem, pl.pile());
        elem.dataset.id = i;
        elem.dataset.angle = angleDeg + 'deg';
        elem.style.setProperty('--angle-deg', angleDeg + 'deg');
        elem.classList.add('circle');
        angleDeg += increaseDeg;

        places.appendChild(elem);
        ++i;
    }
    drawCenter(window, document, engine.getCardOnBoard());
}


function drawCenter(window, document, p) {
    const box = document.querySelector(".places");
    let discardPile = box.querySelector(".center-pile");
    if (!discardPile) {
        discardPile = document.createElement("div");
        discardPile.classList.add("center-pile");
        box.appendChild(discardPile);
    } else {
        discardPile.replaceChildren();
    }
    if (p !== null) {
        drawHand(document, discardPile, [p]);
    }
}


export default function unoGame(window, document, settings, playersExternal, handlers) {

    const engine = coreUnoFunc(settings);
    players = playersExternal;
    console.log(playersExternal);
    for (const p of players) {
        engine.addPlayer(p.name);
    }

    const handCont = document.querySelector('.hand-cont');
    engine.on("draw", async () => {
        drawPlayers(window, document, engine);
        await delay(300);
    });

    engine.on("discard", async (p) => {
        drawCenter(window, document, p);
        await delay(300);
    });

    engine.on("shuffle", async () => {
        // TODO play shuffle animation
        drawPlayers(window, document, engine);
        await delay(300);
    });

    engine.on("deal", () => {
            console.log("deal");
    });

    async function chooseDealer() {
        return await engine.chooseDealer();
    }

    async function deal() {
        return await engine.deal();
    }

    async function draw(playerIndex) {
        return await engine.deal();
    }

    function start() {
    }

    return {
       chooseDealer,
       deal,
       draw,
       start
    }
}
