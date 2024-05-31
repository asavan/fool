function stub(message) {
    console.log("Stub " + message);
}

function getWebSocketUrl(settings, location) {
    if (settings.wh) {
        return settings.wh;
    }
    if (location.protocol === "https:") {
        return;
    }
    return "ws://" + location.hostname + ":" + settings.wsPort;
}

const connectionFunc = function (id, logger) {

    const handlers = {
        "recv": stub,
        "open": stub,
        "socket_open": stub,
        "socket_close": stub,
        "close": stub,
        "error": stub,
        "disconnect": stub,
    };



    function SetupFreshConnection(signaling, id) {
        const peerConnection = new RTCPeerConnection(null);
        // window.pc = peerConnection;

        peerConnection.onicecandidate = e => {
            if (!e) {
                console.error("No ice");
            }
            const message = {
                type: "candidate",
                candidate: null,
            };
            if (e.candidate) {
                message.candidate = e.candidate.candidate;
                message.sdpMid = e.candidate.sdpMid;
                message.sdpMLineIndex = e.candidate.sdpMLineIndex;
            }
            logger.log({"candidate": e.candidate});
            signaling.send("candidate", message, id);
        };

        return peerConnection;
    }

    async function processOffer(offer, peerConnection, signaling, id) {
        //    const sdpConstraints = {
        //        'mandatory':
        //            {
        //                'OfferToReceiveAudio': false,
        //                'OfferToReceiveVideo': false
        //            }
        //    };

        logger.log("------ PROCESSED OFFER ------");
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        signaling.send("answer", {type: "answer", sdp: answer.sdp}, id);
        await peerConnection.setLocalDescription(answer);
    }


    function ConnectionData(id, signaling, clients) {
        const client = clients[id];
        if (client) {
        // cleanup
            client.pc.close();
        }
        const pc = SetupFreshConnection(signaling, id);

        pc.ondatachannel = (ev) => {
            setupDataChannel(ev.channel, id, clients);
            clients[id].dc = ev.channel;
        };
        clients[id] = {pc: pc, dc: null};
        return pc;
    }


    function createSignalingChannel(socketUrl) {
        const ws = new WebSocket(socketUrl);

        const send = (type, sdp, to) => {
            const json = {from: id, to: to, action: type, data: sdp};
            logger.log("Sending [server] to [" + to + "]: " + JSON.stringify(sdp));
            return ws.send(JSON.stringify(json));
        };

        const close = () => {
        // iphone fires "onerror" on close socket
            handlers["error"] = stub;
            ws.close();
        };

        const onmessage = stub;
        const result = {onmessage, send, close};

        ws.onopen = function () {
            logger.log("Websocket opened");
            handlers["socket_open"]();
        };
        ws.onclose = function () {
            console.log("Websocket closed");
            handlers["socket_close"]();
        };

        ws.onmessage = function (e) {
            if (e.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    result.onmessage(reader.result);
                };
                reader.readAsText(e.data);
            } else {
                result.onmessage(e.data);
            }
        };
        ws.onerror = function (e) {
            console.error(e);
            handlers["error"](e);
        };
        return result;
    }

    //init

    const clients = {};

    let signalChannel = null;

    function on(name, f) {
        handlers[name] = f;
    }


    // inspired by http://udn.realityripple.com/docs/Web/API/WebRTC_API/Perfect_negotiation#Implementing_perfect_negotiation
    // and https://w3c.github.io/webrtc-pc/#perfect-negotiation-example
    function connect(socketUrl) {
        const signaling = createSignalingChannel(socketUrl);

        signaling.onmessage = async function(text) {
            const json = JSON.parse(text);
            if (json.from === id) {
                console.error("same user");
                return;
            }

            logger.log("Websocket message received: " + text);

            if (json.action === "candidate") {
                const client = clients[json.from];
                if (!client) {
                    console.error("No client");
                    return;
                }
                const pc = client.pc;
                if (!json.data.candidate) {
                    await pc.addIceCandidate(null);
                } else {
                    await pc.addIceCandidate(json.data);
                }

            } else if (json.action === "offer") {
                const pc = ConnectionData(json.from, signaling, clients);
                await processOffer(json.data, pc, signaling, json.from);
            } else if (json.action === "connected") {
                // TODO delete?
            } else if (json.action === "close") {
                // need for server
            } else {
                console.error("Unknown type " + json.action);
            }
        };
        signalChannel = signaling;
        return signaling;
    }

    function closeSocket() {
        if (signalChannel) {
            signalChannel.close();
            signalChannel = undefined;
        }
    }

    const sendRawAll = (action, data, ignore) => {
        logger.log(data);
        const json = {from: id, to: "all", action, data};
        for (const [id, client] of Object.entries(clients)) {
            if (ignore && ignore.includes(id)) {
                logger.log("ignore " + id);
                continue;
            }
            if (client.dc) {
                try {
                    client.dc.send(JSON.stringify(json));
                } catch(e) {
                    console.log(e, client);
                }
            } else {
                console.error("No connection", client);
            }
        }
    };

    const sendRawTo = (action, data, to) => {
        const json = {from: id, to, action, data};
        const client = clients[to];
        if (!client || !client.dc) {
            logger.log("No chanel " + to);
            return;
        }
        return client.dc.send(JSON.stringify(json));
    };

    function setupDataChannel(dataChannel, id, clients) {
        dataChannel.onmessage = function (e) {
            logger.log("get data " + e.data);
            handlers["recv"](e.data, id);
        };

        dataChannel.onopen = function () {
            logger.log("------ DATACHANNEL OPENED ------");
            // TODO make sendRawTo to send to this dataChannel
            handlers["open"]({sendRawTo, id});
        };

        dataChannel.onclose = function () {
            logger.log("------ DATACHANNEL CLOSED ------");
            handlers["disconnect"](id);
            delete clients[id];
        };

        dataChannel.onerror = function () {
            console.error("DC ERROR!!!");
            handlers["disconnect"](id);
        };
    }

    function registerHandler(actions, queue) {
        on("recv", (data) => {
            // console.log(data);
            const obj = JSON.parse(data);
            const res = obj.data;
            const callback = actions[obj.action];
            if (typeof callback === "function") {
                queue.add(() => callback(res, obj.from));
            }
        });
    }

    return {
        connect, 
        on, 
        getWebSocketUrl,
        registerHandler,
        sendRawTo, 
        sendRawAll, 
        closeSocket
    };
};

export default connectionFunc;
