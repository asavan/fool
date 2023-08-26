"use strict";

import connectionFunc from "../connection/client.js";
import actionsFunc from "../actions.js";
import {removeElem, log} from "../helper.js";

function toObjJson(v, method) {
    const value = {
        'method': method
    };
    value[method] = v;
    return JSON.stringify(value);
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export default function netMode(window, document, settings, gameFunction) {
    return new Promise((resolve, reject) => {
        const connection = connectionFunc(settings, window.location, makeid(6));
        const logger = document.getElementsByClassName('log')[0];
        connection.on('error', (e) => {
            log(settings, e, logger);
        });
        connection.on('socket_open', () => {
            const grid = document.getElementsByClassName('places')[0];
            grid.style.backgroundColor = "#AA0000";
            connection.on('socket_close', () => {
                grid.style.backgroundColor = "black";
            });
        });

        connection.on('open', () => {
            const game = gameFunction(window, document, settings);
            const actions = actionsFunc(game);
            connection.on('recv', (data) => {
                // console.log(data);
                const obj = JSON.parse(data);
                const res = obj[obj.method];
                const callback = actions[obj.method];
                if (typeof callback === 'function') {
                    callback(res);
                }
            });
            for (const [handlerName, callback] of Object.entries(actions)) {
                game.on(handlerName, (n) => connection.sendMessage(toObjJson(n, handlerName)));
            }
            game.onConnect();
            resolve(game);
        });

        try {
            connection.connect();
        } catch (e) {
            log(settings, e, logger);
            reject(e);
        }
    });
}
