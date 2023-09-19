"use strict";

function stub(message) {
    console.log("Stub " + message);
}

let user = "";

const handlers = {
    "recv": stub,
    "open": stub,
    "socket_open": stub,
    "socket_close": stub,
    "close": stub,
    "error": stub,
};

function stringifyEvent(e) {
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

function logFunction(s) {
    let settings = s;
    function init(set) {
        settings = set;
    }
    function log(obj) {
        if (settings && settings.networkDebug) {
            console.log(obj);
        }
    }
    return {init, log};
}

const logger = logFunction(null);


function sendNegotiation(type, sdp, ws) {
    const json = {from: user, action: type, data: sdp};
    logger.log("Sending [" + user + "] " + JSON.stringify(sdp));
    return ws.send(JSON.stringify(json));
}


function createSignalingChannel(socketUrl) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(socketUrl);

        const send = (type, sdp) => {
            return sendNegotiation(type, sdp, ws);
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
            sendNegotiation("connected", {}, ws);
            resolve(result);
        };

        ws.onclose = function () {
            logger.log("Websocket closed");
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
            handlers["error"](stringifyEvent(e));
            reject(e);
        };
        return result;
    });
}

const connectionFunc = function (settings, location, id) {

    user = id;

    let isConnected = false;
    let dataChannel = null;
    logger.init(settings);

    function on(name, f) {
        handlers[name] = f;
    }

    function getWebSocketUrl() {
        if (settings.wh) {
            return settings.wh;
        }
        if (location.protocol === "https:") {
            return null;
        }
        return "ws://" + location.hostname + ":" + settings.wsPort;
    }

    // inspired by http://udn.realityripple.com/docs/Web/API/WebRTC_API/Perfect_negotiation#Implementing_perfect_negotiation
    // and https://w3c.github.io/webrtc-pc/#perfect-negotiation-example
    async function connect() {
        const socketUrl = getWebSocketUrl();
        if (socketUrl == null) {
            throw "Can't determine ws address";
        }
        const signaling = await createSignalingChannel(socketUrl);
        const peerConnection = new RTCPeerConnection(null);

        peerConnection.onicecandidate = e => {
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
            signaling.send("candidate", message);
        };
        // window.pc = peerConnection;

        peerConnection.oniceconnectionstatechange = () => {
            if (peerConnection.iceConnectionState === "failed") {
                console.error("failed");
            // peerConnection.restartIce();
            }
        };

        dataChannel = peerConnection.createDataChannel("gamechannel");

        setupDataChannel(dataChannel, signaling);

        // const sdpConstraints = {offerToReceiveAudio: false, offerToReceiveVideo: false};

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signaling.send("offer", {type: "offer", sdp: offer.sdp});


        signaling.onmessage = async function(text) {
            const json = JSON.parse(text);
            if (json.from === user) {
                console.error("same user");
                return;
            }

            if (json.from !== "server") {
                console.log("not from server");
                return;
            }

            if (json.to !== user) {
                console.log("wrong recipient", user, json.to);
                return;
            }
            logger.log("Websocket message received: " + text);

            if (json.action === "candidate") {
                logger.log("ON CANDIDATE");
                if (!json.data.candidate) {
                    await peerConnection.addIceCandidate(null);
                } else {
                    await peerConnection.addIceCandidate(json.data);
                }

            } else if (json.action === "answer") {
                peerConnection.setRemoteDescription(json.data);
            } else if (json.action === "connected") {
                // WHY we need this?
            } else if (json.action === "close") {
                // need for server
            } else {
                console.error("Unknown type " + json.action);
            }
        };
    }


    function setupDataChannel(dataChannel, signaling) {
        dataChannel.onmessage = function (e) {
            logger.log("data get " + e.data);
            handlers["recv"](e.data);
        };

        dataChannel.onopen = function () {
            logger.log("------ DATACHANNEL OPENED ------");
            isConnected = true;
            signaling.send("close", {});
            signaling.close();
            handlers["open"]();
        };

        dataChannel.onclose = function () {
            logger.log("------ DC closed! ------");
            isConnected = false;
        };

        dataChannel.onerror = function () {
            console.log("DC ERROR!!!");
        };
    }

    function sendMessage(messageBody) {
        logger.log("data send1 " + messageBody);
        if (!dataChannel) {
            return false;
        }
        if (!isConnected) {
            console.error("Not connected");
            return false;
        }
        logger.log("data send " + messageBody);
        dataChannel.send(messageBody);
        return isConnected;
    }

    return {connect, sendMessage, on};
};

export default connectionFunc;
