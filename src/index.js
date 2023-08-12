"use strict";

import settings from "./js/settings.js";
import gameFunction from "./js/game.js";
import install from "./js/install_as_app.js";
import {parseSettings, assert} from "./js/helper.js";

function starter(window, document) {
    parseSettings(window, document, settings);

    if (settings.mode === 'net') {
        import("./js/mode/net.js").then(netMode => {
            netMode.default(window, document, settings, gameFunction);
        });
    } else if (settings.mode === 'server') {
        import("./js/mode/server.js").then(serverMode => {
            serverMode.default(window, document, settings, gameFunction);
        });
    } else if (settings.mode === 'ai') {
        import("./js/mode/ai.js").then(ai => {
            ai.default(window, document, settings, gameFunction).then(g => {
                g.on("gameover", (score) => {
                    const btnAdd = document.querySelector('.butInstall');
                    btnAdd.classList.remove("hidden2");
                });
            });
        });
    } else {
        assert(false, "Unsupported mode");
    }
}


if (__USE_SERVICE_WORKERS__) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js', {scope: './'});
        install(window, document);
    }
}

starter(window, document);
