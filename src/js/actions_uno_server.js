import commonActions from "./actions_uno_common.js";

function shouldNotHappen(logger) {
    logger.error("Should Not Happen");
}

function init(engine, logger) {
    return Object.assign({}, commonActions(engine, logger), {
        "pass": (data) => {
            logger.log("on pass", data);
            return engine.onPass(data.playerIndex);
        },
        "changeCurrent": () => shouldNotHappen(logger)
    });
}

export default init;
