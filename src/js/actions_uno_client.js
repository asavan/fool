import commonActions from "./actions_uno_common.js";

export default function init(unoGame, logger) {
    const engine = unoGame.getEngine();
    return Object.assign({}, commonActions(engine, logger), {
        "shuffle": unoGame.onShuffle,
        "changeCurrent": unoGame.onChangeCurrent,
        "clearPlayer": (cur) => {
            logger.log("clearPlayer", cur);
            return engine.cleanHandExternal(cur);
        },
        "discard": engine.onDiscard,
        "roundover": unoGame.onNewRound,
        "gameover": unoGame.onGameOver
    });
}
