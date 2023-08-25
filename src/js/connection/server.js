"use strict";

function stub(message) {
    console.log("Stub " + message);
}

const user = 'server';

const clients = {}

const handlers = {
    'recv': stub,
    'open': stub,
    'socket_open': stub,
    'socket_close': stub,
    'close': stub,
    'error': stub,
}

function stringifyEvent(e) {
  const obj = {};
  for (let k in e) {
    obj[k] = e[k];
  }
  return JSON.stringify(obj, (k, v) => {
    if (v instanceof Node) return 'Node';
    if (v instanceof Window) return 'Window';
    return v;
  }, ' ');
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


function setupDataChannel(dataChannel, signaling, id) {
    dataChannel.onmessage = function (e) {
        handlers['recv'](e.data, id);
    };

    dataChannel.onopen = function () {
        logger.log("------ DATACHANNEL OPENED ------");
        handlers['open'](id);
    };

    dataChannel.onclose = function () {
        logger.log("------ DC closed! ------");
    };

    dataChannel.onerror = function () {
        console.error("DC ERROR!!!")
    };
}


async function SetupFreshConnection(signaling, id) {
    const peerConnection = new RTCPeerConnection(null);
    // window.pc = peerConnection;

    peerConnection.onicecandidate = e => {
        if (!e) {
            console.error("No ice");
        }
        const message = {
          type: 'candidate',
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
    const sdpConstraints = {
        'mandatory':
            {
                'OfferToReceiveAudio': false,
                'OfferToReceiveVideo': false
            }
    };

    logger.log("------ PROCESSED OFFER ------");
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    signaling.send("answer", {type: 'answer', sdp: answer.sdp}, id);
    await peerConnection.setLocalDescription(answer);
}


async function ConnectionData(id, signaling) {
    const client = clients[id];
    if (client) {
        // cleanup
        client.pc.close();
    }
    const pc = await SetupFreshConnection(signaling, id);

    pc.ondatachannel = (ev) => {
        setupDataChannel(ev.channel, signaling, id);
        clients[id].dc = ev.channel;
    };
    clients[id] = {pc: pc, dc: null};
    return pc;
}


function createSignalingChannel(socketUrl) {
    const ws = new WebSocket(socketUrl);

    const send = (type, sdp, to) => {
        const json = {from: "server", to: to, action: type, data: sdp};
        logger.log("Sending [server] to [" + to + "]: " + JSON.stringify(sdp));
        return ws.send(JSON.stringify(json));
    }

    const close = () => {
        // iphone fires "onerror" on close socket
        handlers['error'] = stub;
        ws.close();
    }

    const onmessage = stub;
    const result = {onmessage, send, close};

    ws.onopen = function (e) {
        logger.log("Websocket opened");
        handlers['socket_open']();
    }
    ws.onclose = function (e) {
        console.log("Websocket closed");
        handlers['socket_close']();
    }

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
    }
    ws.onerror = function (e) {
        console.error(e);
        handlers['error'](stringifyEvent(e));
    }
    return result;
}

const connectionFunc = function (settings, location) {

    logger.init(settings);

    function on(name, f) {
        handlers[name] = f;
    }

    function getWebSocketUrl() {
        if (settings.wh) {
            return settings.wh;
        }
        if (location.protocol === 'https:') {
            return null;
        }
        return "ws://" + location.hostname + ":" + settings.wsPort
    }

// inspired by http://udn.realityripple.com/docs/Web/API/WebRTC_API/Perfect_negotiation#Implementing_perfect_negotiation
// and https://w3c.github.io/webrtc-pc/#perfect-negotiation-example
    function connect() {
        const socketUrl = getWebSocketUrl();
        if (socketUrl == null) {
            throw "Can't determine ws address";
        }
        const signaling = createSignalingChannel(socketUrl);

        signaling.onmessage = async function(text) {
            const json = JSON.parse(text);
            if (json.from === "server") {
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
                const pc = await ConnectionData(json.from, signaling);
                await processOffer(json.data, pc, signaling, json.from);
            } else if (json.action === "connected") {
                // TODO delete?
            } else if (json.action === "close") {
                // need for server
            } else {
                console.error("Unknown type " + json.action);
            }
        }
    }

    const sendAll = (data) => {
        for (const client of Object.values(clients)) {
            if (client.dc) {
                client.dc.send(data);
            }
        }
    }

    return {connect, sendAll, on};
};

export default connectionFunc;
