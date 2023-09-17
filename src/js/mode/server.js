"use strict";

import {removeElem, log} from "../helper.js";
import actionsFunc from "../actions_server.js";
import actionsFuncUno from "../actions_uno_server.js";
import qrRender from "../lib/qrcode.js";
import Queue from "../utils/queue.js";
import connectionFunc from "../connection/server.js";
import enterName from "../names.js";

function toObjJson(v, method) {
    const value = {
        "method": method
    };
    value[method] = v;
    return JSON.stringify(value);
}

function makeQr(window, document, settings) {
    const staticHost = settings.sh || window.location.href;
    const url = new URL(staticHost);
    console.log("enemy url", url.toString());
    return qrRender(url.toString(), document.querySelector(".qrcode"));
}

function loop(queue, window) {
    let inProgress = false;

    async function step() {
        if (!queue.isEmpty() && !inProgress) {
            const {callback, res, fName, id, data} = queue.dequeue();
            console.log("Progress start", fName, inProgress);
            inProgress = true;
            const validate = await callback(res, id);
            if (validate) {
                // connection.sendAll(data);
            } else {
                console.error("Bad move", data);
            }
            // console.log("Progress stop", fName, inProgress);
            inProgress = false;
        }
        window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
}

function setupProtocol(connection, actions, queue) {
    connection.on("recv", (data, id) => {
        // console.log(data);
        const obj = JSON.parse(data);
        const res = obj[obj.method];
        const callback = actions[obj.method];
        if (typeof callback === "function") {
            queue.enqueue({callback, res, fName: obj.method, id, data});
        }
    });
}

//function setupMedia() {
//    if (navigator.mediaDevices) {
//        return navigator.mediaDevices.getUserMedia({
//            audio: true,
//            video: true
//        });
//    } else {
//        console.log("No mediaDevices");
//    }
//}

export default function server(window, document, settings, gameFunction) {
    const clients = {};
    let index = 0;
    clients["server"] = {"index": index};

    return new Promise((resolve, reject) => {

        const connection = connectionFunc(settings, window.location);
        const logger = document.getElementsByClassName("log")[0];
        connection.on("error", (e) => {
            log(settings, e, logger);
        });
        connection.on("socket_open", async () => {
            const code = makeQr(window, document, settings);
            connection.on("socket_close", () => {
                removeElem(code);
            });
        });

        const queue = Queue();
        const game = gameFunction(window, document, settings);
        const actions = actionsFunc(game, clients);
        setupProtocol(connection, actions, queue);
        for (const handlerName of game.actionKeys()) {
            game.on(handlerName, (n) => connection.sendAll(toObjJson(n, handlerName)));
        }

        game.on("username", actions["username"]);

        game.on("start", ({players, engine}) => {
            connection.closeSocket();
            const unoActions = actionsFuncUno(engine);
            setupProtocol(connection, unoActions, queue);
            console.log(players);
            connection.sendAll(toObjJson(players, "start"));
        });

        game.on("onSeatsFinished", () => game.afterAllJoined());
        game.on("swap", (id1, id2) => game.swap(id1, id2));
        enterName(window, document, settings, game.getHandlers());

        connection.on("disconnect", (id) => {
            const is_disconnected = game.disconnect(id);
            if (is_disconnected) {
                --index;
                delete clients[id];
            }
            console.log(id, index);
        });

        connection.on("open", async (id) => {
            ++index;
            clients[id] = {"index": index};
        });

        game.onConnect();
        loop(queue, window);
        resolve(game);

        connection.connect().catch(e => {
            log(settings, e, logger);
            reject(e);
        });
    });
}
