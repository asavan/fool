import {assert} from "./assert.js";

export default function handlersFunc(arr) {
    const handlers = {};
    for (const f of arr) {
        handlers[f] = [];
    }

    const actionKeys = () => Object.keys(handlers);
    const getSafe = (name) => {
        const arr = handlers[name];
        assert(Array.isArray(arr), "No key " + name);
        return arr;
    };
    const on = (name, callback) => getSafe(name).push(callback);
    const setOnce = (name, callback) => {handlers[name] = [callback];};
    const reset = (name) => { handlers[name] = []; };
    const set = (f, arr1) => handlers[f] = arr1;
    const call = (name, arg) => {
        const promises = [];
        for (const f of getSafe(name)) {
            if (typeof f !== "function") {
                console.error("bad call", name);
                continue;
            }
            promises.push(f(arg));
        }
        return Promise.allSettled(promises);
    };

    return {
        on,
        set,
        setOnce,
        call,
        reset,
        actionKeys
    };
}
