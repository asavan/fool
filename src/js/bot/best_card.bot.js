import actionsFuncUno from "../actions_uno_server.js";
import simpleBot from "../bot/simple.bot.js";
import { delay } from "../helper.js";
import rngFunc from "../utils/random.js";

export default function bot(engine, queue, logger, botIndexes, currentChangeData) {
    if (currentChangeData.roundover) {
        logger.log("best_card_bot roundover");
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
    const pile = pl.pile();
    const unoActions = actionsFuncUno(engine, logger);
    const calcAction = (trycount) => {
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
            data = { playerIndex, card: bestCard, currentColor: simpleBot.bestColor(pile, bestCard, (arr) => rngFunc.randomEl(arr, Math.random)) };
            ++moveCount;
        }

        const action = async () => {
            await callback(data);
            return moveCount;
        };
        return action;
    };

    const action = async () => {
        await delay(700);
        const moveCount = await calcAction(0)();
        // await delay(700);
        if (moveCount === 0) {
            await delay(300);
            await calcAction(1)();
            // await delay(700);
        }
    };
    queue.add(action);
}
