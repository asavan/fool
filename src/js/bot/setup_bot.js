import bestCardBot from "./best_card.bot.js";

export default function setupBots(players, engine, queue, loggerBot) {
    if (queue == null) {
        loggerBot.log("No queue - no bots");
        return;
    }

    const simpleBotIndexes = [];
    let index = 0;
    for (const player of players) {
        if (player.is_bot) {
            simpleBotIndexes.push(index);
        }
        ++index;
    }
    if (simpleBotIndexes.length === 0) {
        loggerBot.log("No bots, skipping");
        return;
    }
    engine.on("changeCurrent", (currentChangeData) => {
        bestCardBot(engine, queue, loggerBot, simpleBotIndexes, currentChangeData);
    });
}
