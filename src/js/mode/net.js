"use strict";

import connectionFunc from "../connection/client.js";
import actionsFunc from "../actions.js";
import Queue from "../utils/queue.js";
import {log} from "../helper.js";

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

function onConnectionAnimation(document, connection) {
    connection.on('socket_open', () => {
        const grid = document.getElementsByClassName('places')[0];
        grid.classList.add('loading');
        connection.on('socket_close', () => {
            grid.classList.remove('loading');
            grid.classList.add('flying-cards');
        });
    });
}

function setupOnData(connection, queue, actions) {
    connection.on('recv', async (data) => {
        // console.log(data);
        const obj = JSON.parse(data);
        const res = obj[obj.method];
        const callback = actions[obj.method];
        if (typeof callback === 'function') {
            queue.enqueue({callback, res, fName: obj.method});
        }
    });
}

function setupActions(game, actions, connection) {
    for (const [handlerName,] of Object.entries(actions)) {
        game.on(handlerName, (n) => connection.sendMessage(toObjJson(n, handlerName)));
    }
}

function loop(queue, window) {
    let inProgress = false;

    async function step() {
        if (!queue.isEmpty() && !inProgress) {
            const {callback, res, fName} = queue.dequeue();
            console.log("Progress start", fName, inProgress);
            inProgress = true;
            await callback(res);
            console.log("Progress stop", fName, inProgress);
            inProgress = false;
        }
        window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
}

export default function netMode(window, document, settings, gameFunction) {
    return new Promise(async (resolve, reject) => {
        const myId = makeid(6);
        const connection = connectionFunc(settings, window.location, myId);
        const logger = document.getElementsByClassName('log')[0];
        connection.on('error', (e) => {
            log(settings, e, logger);
        });
        onConnectionAnimation(document, connection);
        connection.on('open', () => {
            const queue = Queue();
            settings['externalId'] = myId;
            const game = gameFunction(window, document, settings);
            const actions = actionsFunc(game);
            setupOnData(connection, queue, actions);
            setupActions(game, actions, connection);
            game.onConnect();
            loop(queue, window);
            resolve(game);
        });

        try {
            await connection.connect();
        } catch (e) {
            log(settings, e, logger);
            reject(e);
        }
    });
}
