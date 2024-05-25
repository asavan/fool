function init(engine) {
    return {
        "move": (data) => {
            console.log("onMove", data);
            return engine.onMove(data.playerIndex, data.card, data.currentColor);
        },
        "draw": (data) => {
            console.log("onDraw", data);
            return engine.onDraw(data.playerIndex, data.card);
        }
    };
}

export default init;
