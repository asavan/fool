"use strict";

import {removeElem, log} from "../helper.js";
import actionsFunc from "../actions_server.js";
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

export default function server(window, document, settings, gameFunction) {
    const clients = {};
    let index = 0;
    clients["server"] = {"index": index};


    return new Promise((resolve, reject) => {
        enterName(window, document, settings);

        const connection = connectionFunc(settings, window.location);
        const logger = document.getElementsByClassName("log")[0];
        connection.on("error", (e) => {
            log(settings, e, logger);
        });
        connection.on("socket_open", async () => {
            const code = makeQr(window, document, settings);
            //            if (navigator.mediaDevices) {
            //                await navigator.mediaDevices.getUserMedia({
            //                              audio: true,
            //                              video: true
            //                          });
            //            } else {
            //                console.log("No mediaDevices")
            //            }
            connection.on("socket_close", () => {
                removeElem(code);
            });
        });

        const queue = Queue();
        let inProgress = false;

        const game = gameFunction(window, document, settings);
        const actions = actionsFunc(game, clients);
        connection.on("recv", async (data, id) => {
            // console.log(data);
            const obj = JSON.parse(data);
            const res = obj[obj.method];
            const callback = actions[obj.method];
            if (typeof callback === "function") {
                queue.enqueue({callback, res, fName: obj.method, id, data});
            }
        });
        for (const [handlerName,] of Object.entries(actions)) {
            game.on(handlerName, (n) => connection.sendAll(toObjJson(n, handlerName)));
        }

        game.on("start", (data) => {
            connection.closeSocket();
            connection.sendAll(toObjJson(data, "start"));
        });

        connection.on("disconnect", (id) => {
            const is_disconnected = game.disconnect(id);
            if (is_disconnected) {
                --index;
                delete clients[id];
            }
            console.log(id, index);

        });

        game.on("username", (name) => game.join(0, name, "server"));
        game.on("swap", (id1, id2) => game.swap(id1, id2));


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
                console.log("Progress stop", fName, inProgress);
                inProgress = false;
            }
            window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);


        game.onConnect();
        resolve(game);

        connection.on("open", async (id) => {
            ++index;
            clients[id] = {"index": index};
        });

        connection.connect().catch(e => {
            log(settings, e, logger);
            reject(e);
        });
    });
}
