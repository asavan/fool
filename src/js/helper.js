"use strict";

export function hideElem(el) {
    if (el) {
        el.classList.add("hidden");
    }
}

export function showElem(el) {
    if (el) {
        el.classList.remove("hidden");
    }
}

export function removeElem(el) {
    if (el) {
        el.remove();
    }
}

function stringToBoolean(string){
    switch(string.toLowerCase().trim()){
    case "true": case "yes": case "1": return true;
    case "false": case "no": case "0": case null: return false;
    default: return Boolean(string);
    }
}

export function parseSettings(window, document, settings) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
        if (typeof settings[key] === "number") {
            settings[key] = parseInt(value, 10);
        } else if (typeof settings[key] === "boolean") {
            settings[key] = stringToBoolean(value);
        } else {
            settings[key] = value;
        }
    }
}

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export function promiseState(promise) {
    const pendingState = { status: "pending" };

    return Promise.race([promise, pendingState]).then(
        (value) =>
            value === pendingState ? value : { status: "fulfilled", value },
        (reason) => ({ status: "rejected", reason }),
    );
}

export function assert(b, message) {
    if (b) return;
    console.error(message);
    console.trace(message);
    throw message;
}

export function pluralize(count, noun, suffix = "s"){
    return `${count} ${noun}${count !== 1 ? suffix : ""}`;
}

export function stringifyEvent(e) {
    const obj = {};
    for (const k in e) {
        obj[k] = e[k];
    }
    return JSON.stringify(obj, (k, v) => {
        if (v instanceof Node) return "Node";
        if (v instanceof Window) return "Window";
        return v;
    }, " ");
}

export function setupMedia() {
    if (navigator.mediaDevices) {
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
    } else {
        console.log("No mediaDevices");
    }
}

export function loggerFunc(level, el, settings) {
    const logHtml = (message) => {
        if (el) {
            if (typeof message == "object" && JSON && JSON.stringify ) {
                el.innerHTML += JSON.stringify(message) + "<br />";
            } else {
                el.innerHTML += message + "<br />";
            }
        }
    };

    const logInner = (data, ...args) => {
        if (level < settings.logLevel) {
            return;
        }
        logHtml(data);
        return console.log(data, ...args);
    };
    const errorInner = (data, ...args) => {
        if (level >= settings.logLevel) {
            logHtml(data);
        }
        return console.error(data, ...args);
    };
    
    return {
        log: logInner,
        error: errorInner
    };
}
