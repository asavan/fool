import handlersFunc from "../utils/handlers.js";
import { delay } from "../utils/timer.js";

export default function connectionFunc(id, logger, isServer) {
    const handlers = handlersFunc([
        "close",
        "disconnect",
        "error",
        "open",
        "gameinit",
        "reconnect",
        "socket_open",
        "socket_close"
    ]);

    function on(name, f) {
        return handlers.on(name, f);
    }

    let currentHandler = {};
    let queue;

    function registerHandler(handler, q) {
        queue = q;
        currentHandler = handler;
    }

    function callCurrentHandler(method, data) {
        const callback = currentHandler[method];
        if (typeof callback !== "function") {
            logger.log("Not function");
            return;
        }
        if (!queue) {
            logger.log("No queue");
            return;
        }
        queue.add(() => callback(data.data, data.from));
    }

    async function connect() {
        setTimeout(() => {handlers.call("socket_open", {});}, 100);
        setTimeout(() => {handlers.call("open", {id: "client1"});}, 200);
        setTimeout(() => {
            if (isServer) {
                const json = {from: id, to: "server", action: "username", data: "client1"};
                callCurrentHandler("username", json);
            }
        }, 400);
        await delay(1000);
    }

    const sendRawTo = () => {};

    const sendRawAll = () => {};

    return {
        connect,
        on,
        registerHandler,
        sendRawTo,
        sendRawAll,
    };
}