function init(engine, logger) {
    return {
        "move": (data) => {
            logger.log("onMove", data);
            return engine.onMove(data.playerIndex, data.card, data.currentColor);
        },
        "draw": (data) => {
            logger.log("onDraw", data);
            return engine.onDraw(data.playerIndex, data.card);
        }
    };
}

export default init;
