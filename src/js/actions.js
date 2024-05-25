function init(game) {
    let unoGame;
    let engine;
    return {
        "move": (data) => {
            console.log("try to move " + JSON.stringify(data));
            return game.onChange(data);
        },
        "start": (p) => {
            console.log(p);
            unoGame = game.onStart(p);
            engine = unoGame.getEngine();
            return unoGame;
        },
        "shuffle": (p) => {
            console.log(p);
            return unoGame.onShuffle(p);
        },
        "draw": ({playerIndex, card}) => {
            console.log({playerIndex, card});
            return engine.onDraw(playerIndex, card);
        },
        "changeCurrent": (currentData) => {
            console.log("Change current");
            return unoGame.onChangeCurrent(currentData);
        },
        "clearPlayer": (cur) => {
            console.log("clearPlayer", cur);
            return engine.cleanHandExternal(cur);
        },
        "discard": (p) => {
            console.log("Discard", p);
            return game.onDiscard(p);
        },
        "roundover": (p) => {
            console.log("new round", p);
            return game.onNewRound(p);
        },
        "gameover": (p) => {
            console.log("game over", p);
            return game.onGameOver(p);
        }
    };
}

export default init;
