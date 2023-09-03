"use strict"; // jshint ;_;
import {assert, delay} from "./helper.js";
import coreUnoFunc from "./uno.js";
import colorChooser from "./choose_color.js";

function stub(message) {
    console.log("Stub " + message);
}


let players = [];
let dealer = 0;

function drawCard(p, cardItem) {
    const cardClone = cardItem.content.cloneNode(true).firstElementChild;
    cardClone.style.setProperty('--sprite-x', (1400 - (p%14)*100) + '%');
    cardClone.style.setProperty('--sprite-y', (800 - Math.floor(p/14)*100) + '%');
    cardClone.dataset.card = p;
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


function drawDeck(document, parent, card, engine) {
    const hand = document.createElement("ul");
    const cardItem = document.querySelector('#card');
    hand.classList.add('hand');
    hand.appendChild(drawCard(card, cardItem));

    const backItem = document.querySelector('#back');
    const backClone = backItem.content.cloneNode(true).firstElementChild;
    hand.appendChild(backClone);

    backClone.addEventListener("click", async (e) => {
        e.preventDefault();
        await engine.drawCurrent();
    });
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
    const dealer = engine.getDealer();
    const currentPlayer = engine.getCurrentPlayer();
    for (const pl of players) {
        const elem = document.createElement("li");
        const nameElem = document.createElement("span");
        nameElem.innerText = pl.getName();
        elem.appendChild(nameElem);

        const score = pl.getScore();
        if (score > 0) {
            const scoreElem = document.createElement("span");
            scoreElem.innerText = score;
            elem.appendChild(scoreElem);
        }

        drawHand(document, elem, pl.pile());
        elem.dataset.id = i;
        elem.dataset.angle = angleDeg + 'deg';
        elem.style.setProperty('--angle-deg', angleDeg + 'deg');
        elem.classList.add('circle', 'player-name');
        if (dealer === i) {
            elem.classList.add('dealer');
        }
        if (currentPlayer === i) {
            elem.classList.add('current-player');
        }
        angleDeg += increaseDeg;

        places.appendChild(elem);
        ++i;
    }
    drawCenter(window, document, engine.getCardOnBoard(), engine);
    places.addEventListener("click", async (e) => {
        e.preventDefault();
        const cardEl = e.target.parentElement;

        if (cardEl && cardEl.classList.contains('card')) {
            const playerEl = cardEl.parentElement.parentElement;
            const card = parseInt(cardEl.dataset.card);
            const playerId = parseInt(playerEl.dataset.id);
            await engine.moveToDiscard(playerId, card);
        }
    });
}


function drawCenter(window, document, p, engine) {
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
        // drawHand(document, discardPile, [p]);
        drawDeck(document, discardPile, p, engine);
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
    engine.on("draw", async ({playerIndex, card}) => {
        drawPlayers(window, document, engine);
        await delay(30);
        await handlers['draw']({playerIndex, card});
    });

    engine.on("changeCurrent", async (card) => {
            drawPlayers(window, document, engine);
            await delay(30);
            await handlers['changeCurrent'](card);
    });

    engine.on("move", async (card) => {
            drawPlayers(window, document, engine);
            await delay(30);
            await handlers['move'](card);
    });

    engine.on("discard", async (p) => {
        drawCenter(window, document, p, engine);
        await delay(30);
        await handlers['discard'](p);
    });

    engine.on("shuffle", async (deck) => {
        // TODO play shuffle animation
        drawPlayers(window, document, engine);
        await delay(300);
        await handlers['shuffle'](deck);
    });

    engine.on("deal", () => {
        console.log("deal");
    });

    engine.on("gameover", async () => {
        await handlers['gameover']();
    });

    engine.on("clearPlayer", async (playerIndex) => {
        await handlers['clearPlayer'](playerIndex);
    });

    colorChooser(window, document, engine);

    engine.on("roundover", async () => {
        await delay(200);
        await engine.cleanAllHands();
        await delay(300);
        await engine.nextDealer();
        await engine.deal();
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

    async function onShuffle(deck) {
        await engine.setDeck(deck);
        console.log("onShuffle");
        drawPlayers(window, document, engine);
    }

    async function onDraw(playerIndex, card) {
        console.log("onDraw");
        return engine.onDraw(playerIndex, card);
    }

    async function onDiscard(card) {
            console.log("onDiscard");
            return engine.onDiscard(card);
    }

    async function onChangeCurrent(cur) {
        engine.setCurrent(cur);
        drawPlayers(window, document, engine);
    }

    async function onClearHand(playerIndex) {
        await engine.cleanAllHands();
        drawPlayers(window, document, engine);
    }

    return {
       chooseDealer,
       deal,
       draw,
       start,
       onShuffle,
       onDraw,
       onDiscard,
       onChangeCurrent,
       onClearHand
    }
}
