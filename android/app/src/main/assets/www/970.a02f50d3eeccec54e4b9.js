"use strict";(self.webpackChunkfool=self.webpackChunkfool||[]).push([[970],{970:(n,e,o)=>{function t(n){}o.r(e),o.d(e,{default:()=>w});let a="";const c={recv:t,open:t,socket_open:t,socket_close:t,close:t,error:t};const s=function(n){let e=n;return{init:function(n){e=n},log:function(n){e&&e.networkDebug}}}(null);function r(n,e,o){const t={from:a,action:n,data:e};return s.log("Sending ["+a+"] "+JSON.stringify(e)),o.send(JSON.stringify(t))}function i(n){return new Promise(((e,o)=>{const a=new WebSocket(n),i={onmessage:t,send:(n,e)=>r(n,e,a),close:()=>{c.error=t,a.close()}};return a.onopen=function(){s.log("Websocket opened"),c.socket_open(),r("connected",{},a),e(i)},a.onclose=function(){s.log("Websocket closed"),c.socket_close()},a.onmessage=function(n){if(n.data instanceof Blob){const e=new FileReader;e.onload=()=>{i.onmessage(e.result)},e.readAsText(n.data)}else i.onmessage(n.data)},a.onerror=function(n){c.error(function(n){const e={};for(let o in n)e[o]=n[o];return JSON.stringify(e,((n,e)=>e instanceof Node?"Node":e instanceof Window?"Window":e)," ")}(n)),o(n)},i}))}const d=function(n,e,o){a=o;let t=!1,r=null;return s.init(n),{connect:async function(){const o=n.wh?n.wh:"https:"===e.protocol?null:"ws://"+e.hostname+":"+n.wsPort;if(null==o)throw"Can't determine ws address";const d=await i(o),l=new RTCPeerConnection(null);l.onicecandidate=n=>{const e={type:"candidate",candidate:null};n.candidate&&(e.candidate=n.candidate.candidate,e.sdpMid=n.candidate.sdpMid,e.sdpMLineIndex=n.candidate.sdpMLineIndex),s.log({candidate:n.candidate}),d.send("candidate",e)},l.oniceconnectionstatechange=()=>{l.iceConnectionState},r=l.createDataChannel("gamechannel"),function(n,e){n.onmessage=function(n){s.log("data get "+n.data),c.recv(n.data)},n.onopen=function(){s.log("------ DATACHANNEL OPENED ------"),t=!0,e.send("close",{}),e.close(),c.open()},n.onclose=function(){s.log("------ DC closed! ------"),t=!1},n.onerror=function(){}}(r,d);const u=await l.createOffer();await l.setLocalDescription(u),d.send("offer",{type:"offer",sdp:u.sdp}),d.onmessage=async function(n){const e=JSON.parse(n);e.from!==a&&"server"===e.from&&e.to===a&&(s.log("Websocket message received: "+n),"candidate"===e.action?(s.log("ON CANDIDATE"),e.data.candidate?await l.addIceCandidate(e.data):await l.addIceCandidate(null)):"answer"===e.action?l.setRemoteDescription(e.data):"connected"===e.action||e.action)}},sendMessage:function(n){return s.log("data send1 "+n),!!r&&(!!t&&(s.log("data send "+n),r.send(n),t))},on:function(n,e){c[n]=e}}};const l=function(n){return{move:e=>n.onChange(e),dealer:e=>n.setDealer(e),username:!1,start:e=>n.onStart(e),shuffle:e=>n.onShuffle(e),draw:({playerIndex:e,card:o})=>n.onDraw(e,o),changeCurrent:e=>n.onChangeCurrent(e),clearPlayer:e=>n.onClearHand(e),discard:e=>n.onDiscard(e),roundover:e=>n.onNewRound(e),gameover:e=>n.onGameOver(e),pass:!1}};var u=o(559),f=o(176),g=o(392),m=o(971);function p(n,e){const o={method:e};return o[e]=n,JSON.stringify(o)}function w(n,e,o,t){return new Promise(((a,c)=>{(0,m.Z)(n,e,o);const s=(r=6,f.Z.makeId(r,Math.random));var r;const i=d(o,n.location,s),w=e.getElementsByClassName("log")[0];i.on("error",(n=>{(0,g.cM)(o,n,w)})),function(n,e){e.on("socket_open",(()=>{const o=n.getElementsByClassName("places")[0];o.classList.add("loading"),e.on("socket_close",(()=>{o.classList.remove("loading"),o.classList.add("flying-cards")}))}))}(e,i),i.on("open",(()=>{const c=(0,u.Z)();o.externalId=s;const r=t(n,e,o),d=l(r);!function(n,e,o){n.on("recv",(async n=>{const t=JSON.parse(n),a=t[t.method],c=o[t.method];"function"==typeof c&&e.enqueue({callback:c,res:a,fName:t.method})}))}(i,c,d),function(n,e,o){for(const[t]of Object.entries(e))n.on(t,(n=>o.sendMessage(p(n,t))))}(r,d,i),r.onConnect(),function(n,e){let o=!1;e.requestAnimationFrame((async function t(){if(!n.isEmpty()&&!o){const{callback:e,res:t,fName:a}=n.dequeue();o=!0,await e(t),o=!1}e.requestAnimationFrame(t)}))}(c,n),a(r)})),i.connect().catch((n=>{(0,g.cM)(o,n,w),c(n)}))}))}},559:(n,e,o)=>{function t(){let n={},e=0,o=0;function t(){return o-e}return{enqueue:function(e){n[o]=e,o++},dequeue:function(){const o=n[e];return e++,o},peek:function(){return n[e]},length:t,isEmpty:function(){return 0===t()}}}o.d(e,{Z:()=>t})},176:(n,e,o)=>{o.d(e,{Z:()=>t});const t={makeId:function(n,e){let o="";const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let a=0;a<n;a++)o+=t.charAt(Math.floor(62*e));return o}}}}]);