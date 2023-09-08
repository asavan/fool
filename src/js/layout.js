"use strict"; // jshint ;_;

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

function drawDeck(document, parent, card, engine, mode, myIndex) {
    const hand = document.createElement("ul");
    const cardItem = document.querySelector('#card');
    hand.classList.add('hand');
    hand.appendChild(drawCard(card, cardItem));

    const backItem = document.querySelector('#back');
    const backClone = backItem.content.cloneNode(true).firstElementChild;
    hand.appendChild(backClone);

    backClone.addEventListener("click", async (e) => {
        e.preventDefault();
        if (mode === 'ai') {
            await engine.drawCurrent();
        } else {
            const res = await engine.onDrawPlayer(myIndex);
            if (res == null) {
                await engine.pass(myIndex);
            }
        }
    });
    parent.appendChild(hand);
}

function drawPlayersInner(window, document, engine, myIndex) {
    const box = document.querySelector(".places");
    box.replaceChildren();
    const places = document.createElement("ul");
    places.classList.add('circle-wrapper');
    // places.style.position = 'relative';
    box.appendChild(places);
    const increaseDeg = 360 / engine.size();
    const players = engine.getPlayerIterator();
    let i = 0;
    const dealer = engine.getDealer();
    const currentPlayer = engine.getCurrentPlayer();
    for (const pl of players) {
        const angleDeg = 90 + increaseDeg*(i-myIndex);
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

        places.appendChild(elem);
        ++i;
    }
    drawCenter(window, document, engine.getCardOnBoard(), engine, "ai", myIndex);
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
    if (p !== null) {
        // drawHand(document, discardPile, [p]);
        drawDeck(document, discardPile, p, engine, mode, myIndex);
    }
}

function drawMyHand(window, document, engine, myIndex, myPlayer, box) {
    const elem = document.createElement("div");
    elem.classList.add('my-hand');
    const nameElem = document.createElement("span");
    nameElem.innerText = myPlayer.getName();
    elem.appendChild(nameElem);

    elem.dataset.id = myIndex;
    elem.classList.add('player-name');
    const dealer = engine.getDealer();
    const currentPlayer = engine.getCurrentPlayer();
    if (dealer === myIndex) {
        elem.classList.add('dealer');
    }
    if (currentPlayer === myIndex) {
        elem.classList.add('current-player');
    }

    const score = myPlayer.getScore();
    if (score > 0) {
        const scoreElem = document.createElement("span");
        scoreElem.innerText = score;
        elem.appendChild(scoreElem);
    }

    drawHand(document, elem, myPlayer.pile());
    elem.addEventListener("click", async (e) => {
        e.preventDefault();
        const cardEl = e.target.parentElement;

        if (cardEl && cardEl.classList.contains('card')) {
            const card = parseInt(cardEl.dataset.card);
            await engine.moveToDiscard(myIndex, card);
        }
    });

    box.appendChild(elem);
}


function mapColor(color) {
    const colors = {
        'green': 'rgba(85, 170, 85, 0.3)',
        'red' : 'rgba(255, 85, 85, 0.3)',
        'yellow': 'rgba(255, 170, 0, 0.3)',
        'blue': 'rgba(85, 85, 255, 0.3)',
    }
    const c = colors[color];
    if (c != null) {
        return c;
    }
    return 'aliceblue';
}


function drawLayout(window, document, engine, myIndex) {
    const root = document.documentElement;
    root.style.setProperty('--card-width', "50px");
    root.style.setProperty('--current-color', mapColor(engine.getCurrentColor()));
    const box = document.querySelector(".places");
    box.replaceChildren();
    const places = document.createElement("ul");
    places.classList.add('circle-wrapper');
    box.appendChild(places);
    const increaseDeg = 360 / engine.size();
    // let angleDeg = 90;
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
        console.log(i, pl);
        const angleDeg = 90 + increaseDeg*(i-myIndex);

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
        if (i === myIndex) {
            drawHand(document, elem, pl.pile());
            elem.addEventListener("click", async (e) => {
                    e.preventDefault();
                    const cardEl = e.target.parentElement;

                    if (cardEl && cardEl.classList.contains('card')) {
                        const playerEl = cardEl.parentElement.parentElement;
                        const card = parseInt(cardEl.dataset.card);
                        const playerId = parseInt(playerEl.dataset.id);
                        await engine.moveToDiscard(playerId, card);
                    }
                });
        } else {
            const nameElem = document.createElement("div");
            nameElem.innerText = pl.pile().length;
            elem.appendChild(nameElem);
        }

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
        ++i;

        places.appendChild(elem);
    }
    drawCenter(window, document, engine.getCardOnBoard(), engine, "net", myIndex);
    drawMyHand(window, document, engine, myIndex, myPlayer, box);
}

function drawPlayers(window, document, engine, myIndex, settings) {
    console.log("drawPlayers", engine.state());
    if (settings.show) {
        drawPlayersInner(window, document, engine, myIndex);
        return;
    }

    drawLayout(window, document, engine, myIndex);
}

export default {
    drawCenter,
    drawPlayers,
    drawLayout
}
