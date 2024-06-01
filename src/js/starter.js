import settingsOriginal from "./settings.js";
import gameFunction from "./game.js";
import {parseSettings} from "./helper.js";
import {assert} from "./utils/assert.js";

export default async function starter(window, document) {
    const settings = parseSettings(window, document, settingsOriginal);

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
