(()=>{"use strict";const n="cache-only-1.0.0";function e(e){return caches.open(n).then((function(n){return n.match(e,{ignoreSearch:!0}).then((function(n){return n||Promise.reject("request-not-in-cache")}))}))}self.addEventListener("install",(function(e){e.waitUntil(function(){const e=[{'revision':null,'url':'25c444c4f582dbc97530.svg'},{'revision':null,'url':'377dcbde62f67ce002a7.svg'},{'revision':null,'url':'6877d353ccbb7e25cf37.svg'},{'revision':null,'url':'749.10295f5ee7e0dd6dc65a.js'},{'revision':null,'url':'945.14a26e935805c7a71c0e.js'},{'revision':null,'url':'970.ea0459bcabaca8a6a07c.js'},{'revision':'64db3e3cce020c1620609f62c1b533ca','url':'images/deck.svg'},{'revision':'7561a9f885f3b87bf421781bf0f400bb','url':'images/icon192.png'},{'revision':'0609bca91e24d38df7bbceb468da0c28','url':'images/icon512.png'},{'revision':'fc74f4bd70b39db80c4c3539e1569b2c','url':'images/icon_reverse.svg'},{'revision':'c315b7be1b4e86271dc106b355755900','url':'images/reload.svg'},{'revision':'9e9e9cb884ebf854693a65b1efc6804f','url':'images/reverse_yellow.svg'},{'revision':'4b924115cc38f614aad515aee6a985af','url':'images/uno.svg'},{'revision':null,'url':'main.4a54a40e5f17430ce9fb.js'},{'revision':'4c70d33ed764c72b26a4fe0c6fb1a698','url':'manifest.json'}].map((n=>n.url));return caches.open(n).then((function(n){return n.addAll(["./",...e])}))}().then((function(){return self.skipWaiting()})))})),self.addEventListener("activate",(function(e){e.waitUntil(caches.keys().then((function(e){return Promise.all(e.map((function(e){if(e!==n)return caches.delete(e)})))})).then((function(){return self.clients.claim()})))})),self.addEventListener("fetch",(function(n){var t;n.respondWith((t=n.request,fetch(t).then((function(n){return n.ok?n:e(t)})).catch((function(){return e(t)}))))}))})();