export default function choosePlace(document, {onSeatsFinished, onSwap, onAddBot, onClick}, players) {
    const box = document.querySelector(".places");
    box.replaceChildren();
    const places = document.createElement("ul");
    places.classList.add("circle-wrapper");
    box.appendChild(places);
    const nonBannedPlayers = players.filter(p => !p.banned);
    const increaseDeg = 360 / nonBannedPlayers.length;
    let angleDeg = 90;
    let selected = null;
    function onSelect(e) {
        e.preventDefault();
        if (!e.target || e.target.dataset.id == null) {
            console.log("WRONG TARGET");
            return;
        }
        onClick(parseInt(e.target.dataset.id));

        if (selected) {
            selected.classList.remove("selected");
            onSwap(selected.dataset.id, e.target.dataset.id);
            selected = null;
            return;
        }

        selected = e.target;
        selected.classList.add("selected");
    }

    function onAllSeated(e) {
        e.preventDefault();
        box.replaceChildren();
        return onSeatsFinished();
    }

    function onBotAdd(e) {
        e.preventDefault();
        return onAddBot();
    }

    places.addEventListener("click", onSelect);
    for (let i = 0; i < players.length; ++i) {
        const player = players[i];
        if (player == null) {
            angleDeg += increaseDeg;
            continue;
        }
        if (player.banned) {
            continue;
        }
        const elem = document.createElement("li");
        elem.innerText = players[i].name;
        elem.dataset.id = i;
        elem.dataset.angle = angleDeg + "deg";
        elem.style.setProperty("--angle-deg", angleDeg + "deg");
        elem.classList.add("circle", "clickable", "player-name");
        angleDeg += increaseDeg;
        places.appendChild(elem);
    }

    {
        const start = document.createElement("button");
        start.textContent = "Start";
        start.classList.add("start-button", "clickable", "flat-button");
        start.addEventListener("click", onAllSeated);
        box.appendChild(start);
    }
    {
        const botButton = document.createElement("button");
        botButton.textContent = "add bot";
        botButton.classList.add("bot-button", "clickable", "flat-button");
        botButton.addEventListener("click", onBotAdd);
        box.appendChild(botButton);
    }

}
