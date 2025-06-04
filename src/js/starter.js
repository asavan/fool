import settingsOriginal from "./settings.js";
import gameFunction from "./game.js";
import {parseSettings, adjustMode, adjustNetwork} from "./utils/parse-settings.js";
import {assert} from "./utils/assert.js";
import wakeLock from "./utils/wake-lock.js";
import loggerFunc from "./views/logger.js";
import rngFunc from "./utils/random.js";


export default async function starter(window, document) {
    const settings = {...settingsOriginal};
    const changed = parseSettings(window.location.search, settings);
    adjustMode(changed, settings, window.location.protocol);
    adjustNetwork(changed, settings, window.location.protocol);

    if (!settings.seed) {
        settings.seed = rngFunc.makeId(6, Math.random);
    }

    wakeLock(loggerFunc(1, null, settings), document).init();

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
    mode.default(window, document, settings, gameFunction).
        catch((error) => {
            console.error(error);
        });
}
