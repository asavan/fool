"use strict";(self.webpackChunkfool=self.webpackChunkfool||[]).push([[249],{249:(o,n,e)=>{e.r(n),e.d(n,{default:()=>r});var c=e(746),t=e(345);function r(o,n,e){const r=(0,c.A)(["close","disconnect","error","open","gameinit","reconnect","socket_open","socket_close"]);let l,s,i={};return{connect:function(c){return new Promise(((a,u)=>{const d=(0,t.CD)(o,c,n);s=d,d.on("error",(o=>{n.log("Connection to ws error "+o),u(o)})),d.on("message",(function(c){if(c.from!==o)if(c.to===o||"all"===c.to){if(!(c.ignore&&Array.isArray(c.ignore)&&c.ignore.includes(o)))return"connected"===c.action?e?(d.send("open",{id:o},c.from),r.call("open",{id:c.from})):void 0:r.actionKeys().includes(c.action)?(n.log("handlers.actionKeys"),r.call(c.action,c)):Object.keys(i).includes(c.action)?(n.log("callCurrentHandler"),function(o,e){const c=i[o];"function"==typeof c?l?l.add((()=>c(e.data,e.from))):n.log("No queue"):n.log("Not function")}(c.action,c)):void n.log("Unknown action "+c.action);n.log("user in ignore list")}else n.log("another user");else n.error("same user")})),d.on("close",(o=>r.call("socket_close",o))),d.on("open",(()=>(r.call("socket_open",{}),d.send("connected",{id:o},"all"),a())))}))},on:function(o,n){return r.on(o,n)},registerHandler:function(o,n){l=n,i=o},sendRawTo:(o,n,e)=>!!s&&s.send(o,n,e),sendRawAll:(o,e,c)=>!!s&&(n.log(e),s.send(o,e,"all",c))}}}}]);