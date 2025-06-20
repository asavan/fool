import rngFunc from "../utils/random.js";

export function getMyId(window, settings, rngEngine) {
    const data = window.sessionStorage.getItem(settings.idNameInStorage);
    if (data) {
        return data;
    }
    const newId = rngFunc.makeId(settings.idNameLen, rngEngine);
    window.sessionStorage.setItem(settings.idNameInStorage, newId);
    return newId;
}

export function getWebSocketUrl(settings, location) {
    if (settings.wh) {
        return settings.wh;
    }
    if (location.protocol === "https:") {
        return;
    }
    return "ws://" + location.hostname + ":" + settings.wsPort;
}
