"use strict";(self.webpackChunksuno=self.webpackChunksuno||[]).push([[723],{233:(e,t,n)=>{function o(e){let t=Promise.resolve();return{add:n=>new Promise(((o,s)=>{t=t.then(n).then(o).catch((t=>{e.log(t),s(t)}))}))}}n.d(t,{A:()=>o})},723:(e,t,n)=>{n.r(t),n.d(t,{default:()=>u});var o=n(272),s=n(233),r=n(42);function u(e,t,n,u){return new Promise((d=>{const l="Player",a=l;n.seed||(n.seed=o.A.makeId(6,Math.random));const c=(0,r.A)(3,null,n),i=(0,s.A)(c),h=u({window:e,document:t,settings:n,myId:a});h.setQueue(i),h.join(l,l,n.playerIsBot);for(let e=0;e<n.botCount;++e)h.addBot();h.on("gameover",(()=>{t.querySelector(".butInstall").classList.remove("hidden2")})),h.afterAllJoined().then((()=>{d(h)}))}))}}}]);