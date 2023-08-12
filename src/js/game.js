"use strict"; // jshint ;_;
import {assert} from "./helper.js";

function stub() {
}

const handlers = {
    'move': stub,
    'gameover': stub
}


export default function game(window, document, settings) {
    const btnInstall = document.getElementsByClassName("install")[0];
    const fields = Array.from(document.getElementsByClassName("player"));
    const scores = Array(fields.length).fill(0);
    const onChange = (change) => {
        assert(change.index >= 0 && change.index < fields.length, "Out of bounds");
        const ind = change.index;
        scores[ind] = change.scores[ind];
        fields[ind].innerText = scores[ind];
        return true;
    };

    const move = (ind) => {
        ++scores[ind];
        fields[ind].innerText = scores[ind];
        handlers['move']({index: ind, scores: scores});
    }

    for (let i = 0; i < fields.length; ++i) {
        fields[i].addEventListener("click", function (e) {
          e.preventDefault();
          move(i);
      }, false);
    }

    for (let i = 0; i < fields.length; ++i) {
        fields[i].innerText = scores[i];
    }

    function on(name, f) {
        handlers[name] = f;
    }

    return {
       on: on,
       onChange: onChange
    }
}
