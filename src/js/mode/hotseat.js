export default async function hotseat(window, document, settings, gameFunction) {
    const myId = "client1";
    settings.clickAll = true;
    const game = gameFunction({window, document, settings, myId});
    game.join("server", "server");
    for (let i = 1; i < settings.botCount + 1; ++i) {
        const name = "client" + i;
        game.join(name, name);
    }

    game.on("gameover", () => {
        const btnAdd = document.querySelector(".butInstall");
        btnAdd.classList.remove("hidden2");
    });
    await game.afterAllJoined();
    return game;
}
