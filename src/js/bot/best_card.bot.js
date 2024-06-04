import actionsFuncUno from "../actions/actions_uno_server.js";
import { delay } from "../utils/timer.js";
import rngFunc from "../utils/random.js";
import core from "../uno/basic.js";
import simpleBot from "./simple.bot.js";

export default function bestCardBot({engine, queue, logger, botIndexes, settings}) {
    const tryMove = (currentChangeData) => {
        if (currentChangeData.gameState !== core.GameStage.ROUND) {
            logger.log("round not started yet");
            return;
        }

        const playerIndex = engine.getCurrentPlayer();
        if (currentChangeData.currentPlayer !== playerIndex) {
            logger.error("best_card_bot bad player", playerIndex, currentChangeData, currentChangeData.currentPlayer);
            return;
        }
        if (!botIndexes.includes(playerIndex)) {
            logger.log("best_card_bot not bot", playerIndex);
            return;
        }
        const pl = engine.getPlayerByIndex(playerIndex);
        const unoActions = actionsFuncUno(engine, logger);
        const calcAction = (trycount) => {
            const pile = pl.pile();
            const bestCard = simpleBot.findBestGoodCard(pile, engine.getCardOnBoard(), engine.getCurrentColor());
            let callback;
            let data;
            let moveCount = 0;
            if (bestCard === undefined) {
                data = { playerIndex, card: engine.secretlySeeTopCard() };
                if (trycount > 0) {
                    callback = unoActions["pass"];
                } else {
                    callback = unoActions["draw"];
                }
            } else {
                callback = unoActions["move"];
                const randEl = (arr) => rngFunc.randomEl(arr, Math.random);
                const currentColor = simpleBot.bestColor(pile, bestCard, randEl);
                data = { playerIndex, card: bestCard, currentColor };
                ++moveCount;
            }

            const action = async () => {
                await callback(data);
                return moveCount;
            };
            return action;
        };

        const action = async () => {
            await delay(settings.botMovePause);
            const moveCount = await calcAction(0)();
            if (moveCount === 0) {
                await delay(settings.botSecondMovePause);
                await calcAction(1)();
            }
        };
        queue.add(action);
    };
    return { tryMove };
}
