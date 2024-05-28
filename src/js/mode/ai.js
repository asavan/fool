"use strict";

import rngFunc from "../utils/random.js";
import simpleBot from "../bot/simple.bot.js";
import PromiseQueue from "../utils/async-queue.js";
import actionsFuncUno from "../actions_uno_server.js";
import { loggerFunc, delay } from "../helper.js";



export default function ai(window, document, settings, gameFunction) {
    return new Promise((resolve) => {
        const playerName = "Player";
        settings.externalId = playerName;
        // settings.seed = rngFunc.makeId(6, Math.random);
        // settings.cardsDeal = 2;
        const logger = loggerFunc(70, null, settings);
        const loggerActions = loggerFunc(5, null, settings);
        const queue = PromiseQueue(logger);
        const game = gameFunction(window, document, settings);
        const simpleBotIndexes = [];
        game.on("changeCurrent", (currentChangeData) => {
            if (currentChangeData.roundover) {
                logger.log("onchangeCurrent roundover");
                return;

            }
            const engine = game.getEngine();
            const playerIndex = engine.getCurrentPlayer();
            if (currentChangeData.currentPlayer !== playerIndex) {
                logger.error("onchangeCurrent bad player", playerIndex, currentChangeData, currentChangeData.currentPlayer);
                return;
            }
            if (!simpleBotIndexes.includes(playerIndex)) {
                logger.log("onchangeCurrent not bot", playerIndex);
                return;
            }
            logger.log("onchangeCurrent", currentChangeData);
            const pl = engine.getPlayerByIndex(playerIndex);
            const pile = pl.pile();
            const unoActions = actionsFuncUno(engine, loggerActions);
            let moveCount = 0;
            const calcAction = (trycount) => {
                const bestCard = simpleBot.findBestGoodCard(pile, engine.getCardOnBoard(), engine.getCurrentColor());
                let callback;
                let data;
                if (bestCard === undefined) {
                    data = { playerIndex, card: engine.secretlySeeTopCard() };
                    if (trycount > 0) {
                        callback = unoActions["pass"];
                    } else {
                        callback = unoActions["draw"];
                    }
                } else {
                    callback = unoActions["move"];
                    data = { playerIndex, card: bestCard, currentColor: simpleBot.bestColor(pile, bestCard, (arr) => rngFunc.randomEl(arr, Math.random)) };
                    ++moveCount;
                }

                const action = () => callback(data);
                return action;
            };

            const action = async () => {
                // await delay(700);
                await calcAction(0)();
                await delay(100);
                if (moveCount === 0) {
                    await calcAction(1)();
                }
            };
            queue.add(action);
        });

        game.join(playerName, playerName);
        simpleBotIndexes.push(0);
        for (let i = 1; i < 4; ++i) {
            const name = "bot" + i;
            game.join(name, name);
            simpleBotIndexes.push(i);
        }

        game.afterAllJoined();

        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
        });

        resolve(game);
    });
}
