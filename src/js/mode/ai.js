"use strict";

import rngFunc from "../utils/random.js";
import bestCardBot from "../bot/best_card.bot.js";
import PromiseQueue from "../utils/async-queue.js";
import { loggerFunc } from "../helper.js";


export default function ai(window, document, settings, gameFunction) {
    return new Promise((resolve) => {
        const playerName = "Player";
        settings.externalId = playerName;
        if (!settings.seed) {
            settings.seed = rngFunc.makeId(6, Math.random); 
        }
        const logger = loggerFunc(20, null, settings);
        const loggerActions = loggerFunc(5, null, settings);
        const queue = PromiseQueue(logger);
        const game = gameFunction(window, document, settings);
        const simpleBotIndexes = [];
        // game.on("changeCurrent", (currentChangeData) => {
        //     const engine = game.getEngine();
        //     return bestCardBot(engine, queue, loggerActions, simpleBotIndexes, currentChangeData);
        // });

        game.join(playerName, playerName);
        for (let i = 1; i < 4; ++i) {
            const name = "bot" + i;
            game.join(name, name);
            simpleBotIndexes.push(i);
        }
        
        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
        });

        const unoGame = game.createUnoGame();
        const engine = unoGame.getEngine();
        engine.on("changeCurrent", (currentChangeData) => {
            // const engine = game.getEngine();
            bestCardBot(engine, queue, loggerActions, simpleBotIndexes, currentChangeData);
        });
        const afterStart = unoGame.start();
        
        afterStart.then(() => {
            resolve(game);
        });
    });
}
