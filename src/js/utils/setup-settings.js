import {adjustMode, adjustNetwork, parseSettings} from "./parse-settings.js";
import rngFunc from "./random.js";
import settingsOriginal from "../settings.js";

export default function setupSettings(window) {
    const settings = {...settingsOriginal};
    const changed = parseSettings(window.location.search, settings);
    adjustMode(changed, settings, window.location.protocol);
    adjustNetwork(changed, settings, window.location.protocol);

    if (!settings.seed) {
        settings.seed = rngFunc.makeId(6, Math.random);
    }
    return settings;
}
