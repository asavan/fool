import commonActions from "./actions_uno_common.js";

export default function init(engine, logger) {
    return Object.assign({}, commonActions(engine, logger), {
        "changeCurrent": engine.setCurrentObj,
        "shuffle": engine.setDeck,
        "clearPlayer": engine.cleanHandExternal,
        "discard": engine.onDiscard,
        "roundover": engine.onEndRound,
        "gameover": engine.onEndRound
    });
}
