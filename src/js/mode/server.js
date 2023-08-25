"use strict";

import {removeElem, log} from "../helper.js";
import actionsFunc from "../actions_server.js";
import qrRender from "../qrcode.js";
import connectionFunc from "../connection/server.js";

function toObjJson(v, method) {
    const value = {
        'method': method
    };
    value[method] = v;
    return JSON.stringify(value);
}

const clients = {};
let index = 0;
clients['server'] = {"index": index};

function makeQr(window, document, settings) {
    const staticHost = settings.sh || window.location.href;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const url = new URL(staticHost);
    url.search = urlParams;
    url.searchParams.delete('wh');
    url.searchParams.delete('sh');
    url.searchParams.set('mode', 'net');
    console.log("enemy url", url.toString());
    return qrRender(url.toString(), document.querySelector(".qrcode"));
}

export default function server(window, document, settings, gameFunction) {
    return new Promise(async (resolve, reject) => {
        const connection = connectionFunc(settings, window.location);
        const color = settings.color;
        const logger = document.getElementsByClassName('log')[0];
        connection.on('error', (e) => {
            log(settings, e, logger);
        });
        connection.on('socket_open', async () => {
            const code = makeQr(window, document, settings);
            if (navigator.mediaDevices) {
                await navigator.mediaDevices.getUserMedia({
                              audio: true,
                              video: true
                          });
            } else {
                console.log("No mediaDevices")
            }
            connection.on('socket_close', () => {
                removeElem(code);
            });
        });

        const game = gameFunction(window, document, settings);
        const actions = actionsFunc(game, clients);
        connection.on('recv', async (data, id) => {
            // console.log(data);
            const obj = JSON.parse(data);
            const res = obj[obj.method];
            const callback = actions[obj.method];
            if (typeof callback === 'function') {
                const validate = await callback(res, id);
                if (validate) {
                    connection.sendAll(data);
                }
            }
        });
        for (const [handlerName, callback] of Object.entries(actions)) {
            game.on(handlerName, (n) => connection.sendAll(toObjJson(n, handlerName)));
        }
        game.on('username', (name) => game.join(0, name, 'server'));
        game.on('swap', (id1, id2) => game.swap(id1, id2));
        game.onConnect();
        const grid = document.querySelector(".grid");
        grid.classList.add('hidden');
        resolve(game);

        connection.on('open', async (id) => {
            ++index;
            clients[id] = {"index": index};
        });

        try {
            connection.connect();
        } catch (e) {
            log(settings, e, logger);
            reject(e);
        }
    });
}
