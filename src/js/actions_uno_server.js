import commonActions from "./actions_uno_common.js";

function shouldNotHappen() {
    console.error("Should Not Happen");
}

function init(engine) {
    return Object.assign({}, commonActions(engine), {
        "pass": (data) => {
            console.log("on pass", data);
            return engine.onPass(data.playerIndex);
        },
        "changeCurrent": shouldNotHappen
    });
}

export default init;
