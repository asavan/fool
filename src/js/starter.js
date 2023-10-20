"use strict";

import settings from "./settings.js";
import gameFunction from "./game.js";
import {parseSettings, assert} from "./helper.js";

export default async function starter(window, document) {
    parseSettings(window, document, settings);

    let mode = null;
    if (settings.mode === "net") {
        mode = await import("./mode/net.js");
    } else if (settings.mode === "server") {
        mode = await import("./mode/server.js");
    } else if (settings.mode === "ai") {
        mode = await import("./mode/ai.js");
    } else if (settings.mode === "test") {
        mode = await import("./mode/test.js");
    } else {
        assert(false, "Unsupported mode");
    }
    mode.default(window, document, settings, gameFunction).
        catch((error) => {console.error(error);});
}
