import layout from "../../src/js/layout.js";

export default function setup() {
    const centerPile = document.querySelector(".center-pile");
    if (!centerPile) return;
    centerPile.onclick = () => {
        layout.drawDeal(window, document, 5, 500);
    };
    const myHand = document.querySelector(".my-hand");
    if (!myHand) return;
    myHand.addEventListener("click", async (e) => {
        e.preventDefault();
        const cardEl = e.target.parentElement;
        if (cardEl && cardEl.classList.contains("card")) {
            await layout.drawMove(window, document, cardEl, 200);
        }
    });

    const activePlayer = document.querySelector(".current-player");
    if (!activePlayer) return;
    const dealer = document.querySelector(".dealer");
    if (!dealer) return;
    let counter = 7;
    activePlayer.onclick = (e) => {
        e.preventDefault();
        ++counter;
        return layout.drawDealOther(window, document, 35, 250, activePlayer.querySelector(".card-count"), counter);
    };

    dealer.onclick = (e) => {
        e.preventDefault();
        ++counter;
        return layout.drawMoveOther(window, document, dealer.querySelector(".card-count"), 200, counter, counter);
    };
}

setup();
