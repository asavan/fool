import bestCardBot from "./best_card.bot.js";

export default function setupBots({players, engine, queue, logger, settings}) {
    if (queue == null) {
        logger.log("No queue - no bots");
        return;
    }

    const botIndexes = [];
    let index = 0;
    for (const player of players) {
        if (player.is_bot) {
            botIndexes.push(index);
        }
        ++index;
    }
    if (botIndexes.length === 0) {
        logger.log("No bots, skipping");
        return;
    }

    const bot = bestCardBot({engine, queue, logger, botIndexes, settings});

    engine.on("changeCurrent", (data) => {
        bot.tryMove(data);
    });
}
