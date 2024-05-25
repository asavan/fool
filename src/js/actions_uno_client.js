export default function init(unoGame) {
    const engine = unoGame.getEngine();
    return {
        "move": (data) => {
            console.log("onMove", data);
            return engine.onMove(data.playerIndex, data.card, data.currentColor);
        },
        "shuffle": unoGame.onShuffle,
        "draw": ({playerIndex, card}) => {
            console.log({playerIndex, card});
            return engine.onDraw(playerIndex, card);
        },
        "changeCurrent": unoGame.onChangeCurrent,
        "clearPlayer": (cur) => {
            console.log("clearPlayer", cur);
            return engine.cleanHandExternal(cur);
        },
        "discard": engine.onDiscard,
        "roundover": unoGame.onNewRound,
        "gameover": unoGame.onGameOver
    };
}
