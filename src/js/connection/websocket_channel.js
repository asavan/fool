import handlersFunc from "../utils/handlers.js";

function stub() {
    // do nothing.
}

function getConnectionUrl(settings, location) {
    if (settings.wh) {
        return settings.wh;
    }
    if (location.protocol === "https:") {
        throw new Error("Invalid protocol");
    }
    return "ws://" + location.hostname + ":" + settings.wsPort;
}

function createSignalingChannel(id, socketUrl, logger) {
    const handlers = handlersFunc(["error", "open", "message", "beforeclose", "close"]);
    const ws = new WebSocket(socketUrl);

    const send = (type, sdp, to, ignore) => {
        const json = {from: id, to: to, action: type, data: sdp, ignore};
        logger.log("Sending [" + id + "] to [" + to + "]: " + JSON.stringify(sdp));
        return ws.send(JSON.stringify(json));
    };

    const close = async () => {
        // iphone fires "onerror" on close socket
        await handlers.call("beforeclose", id);
        ws.onerror = stub;
        return ws.close();
    };

    function ready() {
        return new Promise((resolve) => {
            if (ws.readyState === 1) {
                resolve();
            } else {
                ws.addEventListener("open", resolve);
            }
        });
    }

    const on = (name, f) => handlers.on(name, f);

    function onMessageInner(text) {
        logger.log("Websocket message received: " + text);
        const json = JSON.parse(text);
        return handlers.call("message", json);
    }

    ws.addEventListener("open", () => handlers.call("open", id));

    ws.onclose = function (e) {
        logger.log("Websocket closed " + e.code + " " + e.reason);
        return handlers.call("close", id);
    };

    ws.onmessage = async function (e) {
        if (e.data instanceof Blob) {
            const text = await e.data.text();
            return onMessageInner(text);
        } else {
            return onMessageInner(e.data);
        }
    };
    ws.onerror = function (e) {
        logger.error(e);
        return handlers.call("error", id);
    };
    return {on, send, close, ready};
}

export default {
    getConnectionUrl,
    createSignalingChannel
};
