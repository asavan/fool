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

export function log(settings, message, el) {
    if (settings.logger && el) {
        if (typeof message == "object") {
            el.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + "<br />";
        } else {
            el.innerHTML += message + "<br />";
        }
    }
    console.log(message);
}

export function logHtml(message, el) {
    if (el) {
        if (typeof message == "object") {
            el.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + "<br />";
        } else {
            el.innerHTML += message + "<br />";
        }
    }
    console.log(message);
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
