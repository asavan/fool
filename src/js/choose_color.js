"use strict"; // jshint ;_;

import core from "./uno/basic.js";

function chooseColorInternal(document, gameState) {
    return new Promise((resolve) => {
        gameState.inColorChoose = true;
        const box = document.querySelector(".color-picker-holder");
        box.replaceChildren();
        const places = document.createElement("ul");
        places.classList.add("color-grid");
        box.appendChild(places);

        for (const color of core.GOOD_COLORS) {
            const colorItem = document.createElement("li");
            colorItem.classList.add(color);
            colorItem.addEventListener("click", e => {
                e.preventDefault();
                box.replaceChildren();
                gameState.inColorChoose = false;
                resolve(color);
            });
            places.appendChild(colorItem);
        }
        const cancel = document.createElement("li");
        cancel.classList.add("cancel-color");

        cancel.addEventListener("click", e => {
            e.preventDefault();
            box.replaceChildren();
            gameState.inColorChoose = false;
            resolve("black");
        });
        places.appendChild(cancel);
    });
}

export default function chooseColor(window, document, engine, gameState) {
    engine.on("chooseColor", () => chooseColorInternal(document, gameState));
    return {};
}
