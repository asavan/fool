import PromiseQueue from "../utils/async-queue.js";
import loggerFunc from "../views/logger.js";

export default function ai(window, document, settings, gameFunction) {
    return new Promise((resolve) => {
        const playerName = "Player";
        const myId = playerName;
        const logger = loggerFunc(3, null, settings);
        const queue = PromiseQueue(logger);
        const game = gameFunction({window, document, settings, myId});
        game.setQueue(queue);

        game.join(playerName, playerName, settings.playerIsBot);

        for (let i = 0; i < settings.botCount; ++i) {
            game.addBot();
        }

        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
        });
        resolve(game);
        game.afterAllJoined();
    });
}
