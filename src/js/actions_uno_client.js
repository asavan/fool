export default function init(unoGame) {
    const engine = unoGame.getEngine();
    return {
        "move": unoGame.onMove,
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
        "discard": unoGame.onDiscard,
        "roundover": unoGame.onNewRound,
        "gameover": unoGame.onGameOver
    };
}
