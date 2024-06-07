
import {drawHand, drawCenter, drawCenterCircle, mapColor} from "./basic_views.js";

export default function drawPlayersInner({document, engine, myIndex, settings, playersExternal}, marker, logger) {
    const root = document.documentElement;
    // root.style.setProperty("--card-width", "30px");
    root.style.setProperty("--current-color", mapColor(engine.getCurrentColor()));

    const box = document.querySelector(".places");
    box.replaceChildren();
    if (settings.direction.includes("center")) {
        drawCenterCircle(box, document, engine);
    }

    const places = document.createElement("ul");
    places.classList.add("circle-wrapper");
    // places.style.position = 'relative';
    box.appendChild(places);
    const increaseDeg = 360 / engine.size();
    const players = engine.getPlayerIterator();
    const dealer = engine.getDealer();
    const currentPlayer = engine.getCurrentPlayer();
    if (marker) {
        logger.log("Draw inner", marker);
    } else {
        logger.log("Draw inner");
    }

    let i = 0;
    for (const pl of players) {
        const angleDeg = 90 + increaseDeg*(i-myIndex);
        const elem = document.createElement("li");
        elem.classList.add("show-all");
        const nameElem = document.createElement("span");
        const playerName = playersExternal[i].name;
        nameElem.textContent = playerName;
        nameElem.classList.add("player-name");
        elem.appendChild(nameElem);

        const score = pl.getScore();
        if (score > 0) {
            const scoreElem = document.createElement("span");
            scoreElem.textContent = score;
            elem.appendChild(scoreElem);
        }
        drawHand(document, elem, pl.pile(), settings);
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
    drawCenter({document, engine, settings, myIndex});
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
