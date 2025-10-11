import gameFunction from "./game.js";
import {assert} from "./utils/assert.js";
import wakeLock from "./utils/wake-lock.js";
import loggerFunc from "./views/logger.js";
import setupSettings from "./utils/setup-settings.js";

export default async function starter(window, document) {
    const settings = setupSettings(window);

    let mode;
    if (settings.mode === "net") {
        mode = await import("./mode/net.js");
    } else if (settings.mode === "server") {
        mode = await import("./mode/server.js");
    } else if (settings.mode === "ai") {
        mode = await import("./mode/ai.js");
    } else if (settings.mode === "hotseat") {
        mode = await import("./mode/hotseat.js");
    } else if (settings.mode === "test") {
        mode = await import("./mode/test.js");
    } else {
        assert(false, "Unsupported mode");
    }
    const gameStarted = await mode.default(window, document, settings, gameFunction);
    const locker = wakeLock(loggerFunc(1, null, settings), document);
    locker.init(document.querySelector(".container"));
    return gameStarted;
}
