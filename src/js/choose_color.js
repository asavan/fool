"use strict"; // jshint ;_;

function stub(message) {
    console.log("Stub " + message);
}


const GOOD_COLORS = ['red', 'yellow', 'green', 'blue'];

function chooseColorInternal(document) {
    return new Promise((resolve, reject) => {
            const box = document.querySelector(".color-picker-holder");
            box.replaceChildren();
            const places = document.createElement("ul");
            places.classList.add('color-grid');
            box.appendChild(places);

            for (const color of GOOD_COLORS) {

                const colorItem = document.createElement("li");
                colorItem.classList.add(color);
                // places.appendChild(colorItem);
                colorItem.addEventListener("click", e => {
                    e.preventDefault();
                    box.replaceChildren();
                    resolve(color);
                });
                places.appendChild(colorItem);
            }
    });
}


export default function chooseColor(window, document, engine) {
    engine.on("chooseColor", () => chooseColorInternal(document));
    return {}
}
