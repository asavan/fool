"use strict";(self.webpackChunkfool=self.webpackChunkfool||[]).push([[251],{251:(n,e,c)=>{c.r(e),c.d(e,{default:()=>a});var t=c(746),o=c(345);const a=function(n,e){const c=(0,t.A)(["recv","open","error","close","socket_open","socket_close","disconnect"]);function a(n,t,o){const a=o[n];a&&a.pc.close();const d=function(n,c){const t=new RTCPeerConnection(null);return t.onicecandidate=t=>{const o={type:"candidate",candidate:null};t.candidate&&(o.candidate=t.candidate.candidate,o.sdpMid=t.candidate.sdpMid,o.sdpMLineIndex=t.candidate.sdpMLineIndex),e.log({candidate:t.candidate}),n.send("candidate",o,c)},t}(t,n);return d.ondatachannel=t=>{!function(n,t,o){n.onmessage=function(n){return e.log("get data "+n.data),c.call("recv",n.data)},n.onopen=function(){return e.log("------ DATACHANNEL OPENED ------"),c.call("open",{sendRawTo:s,id:t})},n.onclose=async function(){e.log("------ DATACHANNEL CLOSED ------"),await c.call("disconnect",t),delete o[t]},n.onerror=function(){return c.call("disconnect",t)}}(t.channel,n,o),o[n].dc=t.channel},o[n]={pc:d,dc:null},d}const d={};const s=(c,t,o)=>{const a={from:n,to:o,action:c,data:t},s=d[o];if(s&&s.dc)return s.dc.send(JSON.stringify(a));e.log("No chanel "+o)};return{connect:function(t){const s=(0,o.CD)(n,t,e);return s.on("close",(n=>c.call("socket_close",n))),s.on("open",(()=>{c.call("socket_open",{}),s.send("connected",{id:n},"all")})),s.on("error",(n=>c.call("error",n))),s.on("message",(async function(c){if(c.from!==n)if(e.log("Websocket message received: ",c),"candidate"===c.action){const n=d[c.from];if(!n)return;const e=n.pc;c.data.candidate?await e.addIceCandidate(c.data):await e.addIceCandidate(null)}else if("offer"===c.action){const n=a(c.from,s,d);await async function(n,c,t,o){e.log("------ PROCESSED OFFER ------"),await c.setRemoteDescription(n);const a=await c.createAnswer();t.send("answer",{type:"answer",sdp:a.sdp},o),await c.setLocalDescription(a)}(c.data,n,s,c.from)}else"connected"===c.action||c.action})),Promise.resolve(s)},on:function(n,e){return c.on(n,e)},registerHandler:function(n,e){c.setOnce("recv",(c=>{const t=JSON.parse(c),o=t.data,a=n[t.action];"function"==typeof a&&e.add((()=>a(o,t.from)))}))},sendRawTo:s,sendRawAll:(c,t,o)=>{e.log(t);const a={from:n,to:"all",action:c,data:t};for(const[n,c]of Object.entries(d))if(o&&o.includes(n))e.log("ignore "+n);else if(c.dc)try{c.dc.send(JSON.stringify(a))}catch(n){}}}}}}]);