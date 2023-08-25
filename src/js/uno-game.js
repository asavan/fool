"use strict"; // jshint ;_;
import {assert} from "./helper.js";
import coreUnoFunc from "./uno.js";

function stub(message) {
    console.log("Stub " + message);
}


let players = [];
let dealer = 0;

function drawHand(document, parent, pile) {
    const hand = document.createElement("ul");
    const cardItem = document.querySelector('#card');
    hand.classList.add('hand');
    for (const p of pile) {
        const cardClone = cardItem.content.cloneNode(true).firstElementChild;
        cardClone.style.setProperty('--sprite-x', (1400 - (p%14)*100) + '%');
        cardClone.style.setProperty('--sprite-y', (800 - Math.floor(p/14)*100) + '%');
        hand.appendChild(cardClone);
    }
    parent.appendChild(hand);
}

function drawPlayers(window, document, engine) {
    console.log("DRAWING PLAYERS");
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
}


export default function unoGame(window, document, settings, playersExternal, handlers) {



    const engine = coreUnoFunc(settings);
    players = playersExternal;
    console.log(playersExternal);
    for (const p of players) {
        engine.addPlayer(p.name);
    }

    const handCont = document.querySelector('.hand-cont');
    engine.on("draw", () => {
        console.log("draw");
        drawPlayers(window, document, engine);
    });

    engine.on("shuffle", () => {
        console.log("shuffle");
    });

    engine.on("deal", () => {
            console.log("deal");
    });

    async function chooseDealer() {
        await engine.chooseDealer();
    }

    async function deal() {
        await engine.deal();
    }

    async function draw() {
        await engine.deal();
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
