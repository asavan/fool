export default function test(window, document, settings, gameFunction) {
    return new Promise((resolve) => {
        const myId = "server";
        settings.cardsDeal = 1;
        settings.seed = "c";
        settings.maxScore = 3;
        settings.clickAll = true;
        const game = gameFunction({window, document, settings, myId});

        game.join("server", "server");
        for (let i = 1; i < 4; ++i) {
            const name = "client" + i;
            game.join(name, name);
        }

        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
        });

        game.afterAllJoined();
        resolve(game);
    });
}
