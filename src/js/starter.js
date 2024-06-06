import settingsOriginal from "./settings.js";
import gameFunction from "./game.js";
import {parseSettings} from "./utils/parse-settings.js";
import {assert} from "./utils/assert.js";

function adjustMode(changed, settings, location) {
    const keepModes = ["mode", "wh"];
    for (const keepMode of keepModes) {
        if (changed.includes[keepMode]) {
            return;
        }
    }
    if (location.protocol === "https:") {
        settings.mode = "ai";
    }
    if (!changed.includes("botCount") && settings.mode === "server") {
        settings.botCount = 0;
    }
}

export default async function starter(window, document) {
    const settings = {...settingsOriginal};
    const changed = parseSettings(window.location.search, settings);
    adjustMode(changed, settings, window.location);

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
        catch((error) => {console.error(error);});
}
