"use strict";(self.webpackChunksuno=self.webpackChunksuno||[]).push([[433],{433:(e,n,t)=>{t.r(n),t.d(n,{default:()=>s});var o=t(746),c=t(158);function s(e,n,t){const s=(0,o.A)(["close","disconnect","error","open","gameinit","reconnect","socket_open","socket_close"]);let a,u={};return{connect:async function(){setTimeout((()=>{s.call("socket_open",{})}),10),setTimeout((()=>{s.call("open",{id:"client1"})}),20),setTimeout((()=>{if(t){!function(e,t){const o=u[e];"function"==typeof o?a?a.add((()=>o(t.data,t.from))):n.log("No queue"):n.log("Not function")}("username",{from:e,to:"server",action:"username",data:{name:"client 1",externalId:"client1"}})}}),40),await(0,c.c)(100)},on:function(e,n){return s.on(e,n)},registerHandler:function(e,n){a=n,u=e},sendRawTo:()=>{},sendRawAll:()=>{}}}}}]);