export default {
    modes: ["net", "ai", "server", "hotseat"],
    mode: "net",
    connections: ["webrtc", "websocket"],
    connection: "websocket",
    wsPort : 8088,
    logger: true,
    loggerAnchor: ".log",
    networkDebug: false,
    logLevel: 7,
    cardsDeal: 7,
    botCount: 3,
    playerIsBot: false,
    idNameInStorage: "my-id",
    idNameLen : 6,
    maxScore: 500,
    showAll: false,
    clickAll: false,
    show: true,
    applyEffects: true,
    colorOrder: ["red", "yellow", "green", "blue", "black"],
    sortByColor: "",
    direction: ["center"],
    seed: "",
    dealAnim: 500,
    moveAnim: 250,
    maxNameLen: 15
};
