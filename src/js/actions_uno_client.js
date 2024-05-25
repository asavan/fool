import commonActions from "./actions_uno_common.js";

export default function init(unoGame) {
    const engine = unoGame.getEngine();
    return Object.assign({}, commonActions(engine), {
        "shuffle": unoGame.onShuffle,
        "changeCurrent": unoGame.onChangeCurrent,
        "clearPlayer": (cur) => {
            console.log("clearPlayer", cur);
            return engine.cleanHandExternal(cur);
        },
        "discard": engine.onDiscard,
        "roundover": unoGame.onNewRound,
        "gameover": unoGame.onGameOver
    });
}
