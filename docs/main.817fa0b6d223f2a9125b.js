(()=>{"use strict";var e,t,n={392:(e,t,n)=>{function r(e){e&&e.classList.add("hidden")}function a(e){e&&e.classList.remove("hidden")}function o(e){e&&e.remove()}function c(e,t,n){e.logger&&(n.innerHTML+="object"==typeof t?(JSON&&JSON.stringify?JSON.stringify(t):t)+"<br />":t+"<br />")}function s(e){switch(e.toLowerCase().trim()){case"true":case"yes":case"1":return!0;case"false":case"no":case"0":case null:return!1;default:return Boolean(e)}}function l(e,t,n){const r=e.location.search,a=new URLSearchParams(r);for(const[e,t]of a)"number"==typeof n[e]?n[e]=parseInt(t,10):"boolean"==typeof n[e]?n[e]=s(t):n[e]=t}n.d(t,{Bk:()=>l,N8:()=>r,cM:()=>c,ew:()=>o,gw:()=>i,hu:()=>d,oX:()=>a});const i=e=>new Promise((t=>setTimeout(t,e)));function d(e,t){if(!e)throw t}}},r={};function a(e){var t=r[e];if(void 0!==t)return t.exports;var o=r[e]={exports:{}};return n[e](o,o.exports,a),o.exports}a.m=n,a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.f={},a.e=e=>Promise.all(Object.keys(a.f).reduce(((t,n)=>(a.f[n](e,t),t)),[])),a.u=e=>e+"."+{671:"c6c49757007916f4f371",945:"14a26e935805c7a71c0e",970:"2cd199c94aca5503619d"}[e]+".js",a.miniCssF=e=>{},a.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),e={},t="fool:",a.l=(n,r,o,c)=>{if(e[n])e[n].push(r);else{var s,l;if(void 0!==o)for(var i=document.getElementsByTagName("script"),d=0;d<i.length;d++){var u=i[d];if(u.getAttribute("src")==n||u.getAttribute("data-webpack")==t+o){s=u;break}}s||(l=!0,(s=document.createElement("script")).charset="utf-8",s.timeout=120,a.nc&&s.setAttribute("nonce",a.nc),s.setAttribute("data-webpack",t+o),s.src=n),e[n]=[r];var f=(t,r)=>{s.onerror=s.onload=null,clearTimeout(p);var a=e[n];if(delete e[n],s.parentNode&&s.parentNode.removeChild(s),a&&a.forEach((e=>e(r))),t)return t(r)},p=setTimeout(f.bind(null,void 0,{type:"timeout",target:s}),12e4);s.onerror=f.bind(null,s.onerror),s.onload=f.bind(null,s.onload),l&&document.head.appendChild(s)}},a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;a.g.importScripts&&(e=a.g.location+"");var t=a.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var n=t.getElementsByTagName("script");if(n.length)for(var r=n.length-1;r>-1&&!e;)e=n[r--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),a.p=e})(),(()=>{var e={179:0};a.f.j=(t,n)=>{var r=a.o(e,t)?e[t]:void 0;if(0!==r)if(r)n.push(r[2]);else{var o=new Promise(((n,a)=>r=e[t]=[n,a]));n.push(r[2]=o);var c=a.p+a.u(t),s=new Error;a.l(c,(n=>{if(a.o(e,t)&&(0!==(r=e[t])&&(e[t]=void 0),r)){var o=n&&("load"===n.type?"missing":n.type),c=n&&n.target&&n.target.src;s.message="Loading chunk "+t+" failed.\n("+o+": "+c+")",s.name="ChunkLoadError",s.type=o,s.request=c,r[1](s)}}),"chunk-"+t,t)}};var t=(t,n)=>{var r,o,[c,s,l]=n,i=0;if(c.some((t=>0!==e[t]))){for(r in s)a.o(s,r)&&(a.m[r]=s[r]);if(l)l(a)}for(t&&t(n);i<c.length;i++)o=c[i],a.o(e,o)&&e[o]&&e[o][0](),e[o]=0},n=self.webpackChunkfool=self.webpackChunkfool||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})(),(()=>{const e={modes:["net","ai","server"],mode:"net",wsPort:8088,logger:!0,networkDebug:!0,cardsDeal:7,maxScore:500,showAll:!1,clickAll:!1,show:!0,externalId:"server",colorOrder:["red","yellow","green","blue","black"],sortByColor:"",seed:""};function t(e,t,n,r){const a=t.querySelector(".name-form-cont"),o=e.sessionStorage.getItem("username");if(o)return r.username(o),void a.replaceChildren();if(a.childElementCount>0)return;const c=t.querySelector("#nameform").content.cloneNode(!0).firstElementChild;a.replaceChildren(c);const s=t.querySelector(".nameform"),l=t.querySelector(".nameinput"),i=t.querySelector(".container");"net"==n.mode&&i.classList.add("hidden"),s.addEventListener("submit",(function(t){var n;t.preventDefault(),e.sessionStorage.setItem("username",l.value),n=l.value,r.username(n),s.classList.add("hidden"),i.classList.remove("hidden"),a.replaceChildren()}))}function n(e,t,n,r,a){const o=t.querySelector(".places");o.replaceChildren();const c=t.createElement("ul");c.classList.add("circle-wrapper"),o.appendChild(c);const s=360/a.length;let l=90,i=null;c.addEventListener("click",(function(e){if(e.preventDefault(),e.target&&null!=e.target.dataset.id){if(i)return i.classList.remove("selected"),r.swap(i.dataset.id,e.target.dataset.id),void(i=null);i=e.target,i.classList.add("selected")}}));for(let e=0;e<a.length;++e){if(null==a[e]){l+=s;continue}const n=t.createElement("li");n.innerText=a[e].name,n.dataset.id=e,n.dataset.angle=l+"deg",n.style.setProperty("--angle-deg",l+"deg"),n.classList.add("circle","clickable"),l+=s,c.appendChild(n)}const d=t.createElement("button");d.textContent="Start",d.classList.add("start-button","clickable"),d.addEventListener("click",(function(e){e.preventDefault(),o.replaceChildren(),r.onSeatsFinished()})),o.appendChild(d)}var r=a(392);function o(e,t){for(let n=e.length-1;n>0;n--){const r=Math.floor(t()*(n+1)),a=e[n];e[n]=e[r],e[r]=a}}function c(e,t,n){let r=e;return{deal:function(){return r.pop()},addCardAndShuffle:async function(e){!function(e){r.push(e)}(e),o(r,n),await t.shuffle(r)},setDeck:function(e){r=e},checkTop:function(e){const t=r.at(-1)===e;return t}}}const s={newShuffledDeck:async function(e,t){let n=function(){const e=[...Array(112).keys()];return e.splice(56,1),e.splice(69,1),e.splice(82,1),e.splice(95,1),e}();return o(n,t),await e.shuffle(n),c(n,e,t)},newExternalDeck:c},l=["red","yellow","green","blue"];Object.freeze(l);function i(e){let t;if(e%14==13)return"black";switch(Math.floor(e/14)){case 0:case 4:t="red";break;case 1:case 5:t="yellow";break;case 2:case 6:t="green";break;case 3:case 7:t="blue"}return t}function d(e){switch(e%14){case 10:return"Skip";case 11:return"Reverse";case 12:return"Draw2";case 13:return Math.floor(e/14)>=4?"Draw4":"Wild";default:return"Number "+e%14}}function u(e){let t;switch(e%14){case 10:case 11:case 12:t=20;break;case 13:t=50;break;default:t=e%14}return t}const f={GOOD_COLORS:l,GameStage:Object.freeze({chooseDealer:1,dealing:2,round:3,gameOver:4}),cardColor:i,cardType:d,cardScore:u,sortByTemplate:function(e,t,n){e.sort(((e,r)=>{const a=i(e),o=i(r);if(a==o)return"asc"===t?u(e)-u(r):u(r)-u(e);for(const e of n){if(e==a)return"asc"===t?-1:1;if(e==o)return"asc"===t?1:-1}}))},pileHasColor:function(e,t){return null!=e.find((e=>i(e)===t))},cardToString:function(e){return i(e)+" "+d(e)}};function p(e){}function h(e){}const y={shuffle:h,deal:h,draw:h,discard:h,move:h,clearPlayer:h,ready:h,changeCurrent:h,changeDealer:h,gameover:h,roundover:h,pass:p,drawExternal:p,moveExternal:p,chooseColor:O};let w=500,m=0,g=1,C=[],v=null,b=!0,S=null,x=[],E=null,D=null,k=0,L=0,P=!0;function O(){return D}function I(){return g}function T(e,t){return(e+g+t)%t}function N(e,t){return(m+(e+1)*g+t)%t}function q(){return S}function B(e){if(!e)return!1;const t=C.length;return C.push(function(e,t){const n=e,r=t,a=[];let o=0;return{getName:()=>n,addCard:e=>a.push(e),pile:()=>[...a],getIndex:()=>r,cleanHand:()=>{a.length=0},removeCard:e=>{const t=a.indexOf(e);return t<0||a.splice(t,1),t},updateScore:e=>{o+=e},getScore:()=>o,setScore:e=>{o=e},hasColor:e=>f.pileHasColor(a,e),hasCard:e=>a.includes(e)}}(e,t)),!0}async function A(e,t,n){const r=e.deal();return C[t].addCard(r),n?await y.drawExternal({playerIndex:t,card:r}):await y.draw({playerIndex:t,card:r}),r}async function j(e,t){if(!v.checkTop(t))return;await A(v,e,!0);return k++,!0}async function M(e){if(e!==E)return;if(P)return!1;if(k>0)return;k++;return await A(v,E)}async function R(e){if(e===E){if(P)return!1;if(0!=k)return await ne(),await y.pass({playerIndex:e}),!0}}async function H(e,t,n){const r=await async function(e,t,n){const r=await async function(e,t,n){if(e!==E)return!1;if(!Q().hasCard(t))return!1;if(!f.GOOD_COLORS.includes(n))return!1;if(P)return!1;if(L>0)return!1;if("Wild"===f.cardType(t))return!0;if("Draw4"===f.cardType(t))return!Q().hasColor(D);if(f.cardColor(t)!=n)return!1;if(f.cardColor(t)==D)return!0;if(f.cardType(t)==f.cardType(S))return!0;return!1}(e,t,n);if(r){C[e].removeCard(t);S=t,x.push(t),D=n,++L,await y.moveExternal({playerIndex:e,card:t,currentColor:D}),b&&(await X(t,E),await Z(e))}return r}(e,t,n);return r}async function _(e){if(!v.checkTop(e))return;v.deal();S=e,await y.discard(e);const t=f.cardColor(e);"black"!==t&&(x.push(e),D=t)}function G(e,t){y[e]=t}function z(){return{[Symbol.iterator](){let e=0;return{next:()=>e>=C.length?{done:!0,value:e}:{done:!1,value:C[e++]},return:()=>({done:!0})}}}}function W(){return C.length}function F(){return m}function J(){return E}async function $(e){S=null,x=[],C[e].cleanHand(),await y.clearPlayer(e)}function U(){E=T(E,C.length),k=0,L=0}async function X(e,t){const n=f.cardType(e);if("Reverse"===n&&(g*=-1,2===C.length&&U()),"Skip"===n&&U(),"Draw2"===n){U();for(let e=0;e<2;++e)await A(v,E)}if("Draw4"===n){U();for(let e=0;e<4;++e)await A(v,E)}await ne()}async function K(e,t){await async function(e){S=null,x=[];for(const e of C)e.cleanHand(),await y.clearPlayer(e.getIndex());v=await s.newShuffledDeck(y,e)}(t);for(let t=0;t<e;++t){const e=C.length;for(let t=0;t<e;t++){const n=N(t,e),r=C[n].getIndex();await A(v,r)}}const n=await async function(e){P=!1,E=m,await y.changeCurrent({currentPlayer:E,dealer:m,direction:g});let t=e.deal();for(S=t,await y.discard(t);"black"===f.cardColor(t);)S=null,await e.addCardAndShuffle(t),t=e.deal(),S=t,await y.discard(t);return x.push(t),D=f.cardColor(t),t}(v);await X(n)}function Q(){return C[E]}async function V(e,t){if(e!==E)return!1;if(!Q().hasCard(t))return!1;if(P)return!1;if(L>0)return!1;if("Wild"===f.cardType(t)){const t=await y.chooseColor(e);return!!f.GOOD_COLORS.includes(t)&&(D=t,!0)}if("Draw4"===f.cardType(t)){if(Q().hasColor(D))return!1;const t=await y.chooseColor(e);return!!f.GOOD_COLORS.includes(t)&&(D=t,!0)}return f.cardColor(t)==D||f.cardType(t)==cardType(S)}async function Y(e,t){const n=await V(e,t);if(n){C[e].removeCard(t);S=t,x.push(t);const n=f.cardColor(t);"black"!=n&&(D=n),++L,await y.move({playerIndex:e,card:t,currentColor:D}),b&&(await X(t),await Z(e))}return n}async function Z(e,t){const n=C[e];if(0===n.pile().length){P=!0;const t=function(){let e=0;const t=z();for(const n of t)for(const t of n.pile())e+=f.cardScore(t);return e}();n.updateScore(t),n.getScore()>=w?await y.gameover({playerIndex:e,score:n.getScore(),diff:t}):await y.roundover({playerIndex:e,score:n.getScore(),diff:t})}}async function ee(e){const t=C[e.playerIndex],n=t.getScore();k=0,L=0,P=!1,e.score==n+e.diff&&t.setScore(e.score)}function te(e){return e==E&&ne()}async function ne(){return U(),k=0,L=0,await y.changeCurrent({currentPlayer:E,dealer:m,direction:g}),!0}async function re(){return g=1,m=T(m,C.length),E=m,P=!1,k=0,L=0,await y.changeCurrent({currentPlayer:E,dealer:m,direction:g})}async function ae(){if(P)return!1;k>0?await ne():(k++,await A(v,E))}function oe(e,t,n){k=0,L=0,null!=t&&(m=t,P=!1),null!=n&&(g=n),E=e}function ce(){return{currentPlayer:E,dealer:m,currentColor:D,cardOnBoard:S,color:f.cardColor(S),type:f.cardType(S)}}function se(e,t){return e.maxScore&&(w=e.maxScore),{chooseDealer:function(){return async function(e){v=await s.newShuffledDeck(y,e);let t=[...C];for(;t.length>1;){const e=t.length;let n=new Array(e),r=0;for(let a=0;a<e;a++){const o=N(a,e);E=t[o].getIndex();const c=await A(v,E),s=f.cardScore(c);n[o]=s,r=Math.max(r,s)}const a=[];for(let o=0;o<e;o++)n[o]===r&&a.push(t[o]);t=a}t.length>=1&&(m=t[0].getIndex()),E=m,await y.changeCurrent({currentPlayer:E,dealer:m,direction:g})}(t)},deal:function(){return K(e.cardsDeal,t)},getPlayerIterator:z,addPlayer:B,size:W,on:G,getDealer:F,getCurrentPlayer:J,getCardOnBoard:q,tryMove:V,moveToDiscard:Y,drawCurrent:ae,setDeck:function(e){b=!1,null==v?v=s.newExternalDeck(e,y,t):v.setDeck(e)},onDraw:j,onMove:H,onDiscard:_,setCurrent:oe,cleanHand:$,nextDealer:re,onDrawPlayer:M,pass:R,getCurrentColor:O,getDirection:I,state:ce,onNewRound:ee,onPass:te}}function le(e,t,n,r){return n.on("chooseColor",(()=>function(e,t){return new Promise(((n,r)=>{t.inColorChoose=!0;const a=e.querySelector(".color-picker-holder");a.replaceChildren();const o=e.createElement("ul");o.classList.add("color-grid"),a.appendChild(o);for(const r of f.GOOD_COLORS){const c=e.createElement("li");c.classList.add(r),c.addEventListener("click",(e=>{e.preventDefault(),a.replaceChildren(),t.inColorChoose=!1,n(r)})),o.appendChild(c)}const c=e.createElement("li");c.classList.add("cancel-color"),c.addEventListener("click",(e=>{e.preventDefault(),a.replaceChildren(),t.inColorChoose=!1,n("black")})),o.appendChild(c)}))}(t,r))),{}}function ie(e,t){const n=t.content.cloneNode(!0).firstElementChild;return n.style.setProperty("--sprite-x",1400-e%14*100+"%"),n.style.setProperty("--sprite-y",800-100*Math.floor(e/14)+"%"),n.dataset.card=e,n}function de(e,t,n,r,a){const o=e.createElement("ul"),c=e.querySelector("#card");o.classList.add("hand"),a&&a.sortByColor&&f.sortByTemplate(n,a.sortByColor,a.colorOrder);for(const e of n)o.appendChild(ie(e,c));t.appendChild(o)}function ue(e,t,n,r,a,o){const c=t.querySelector(".places");let s=c.querySelector(".center-pile");s?s.replaceChildren():(s=t.createElement("div"),s.classList.add("center-pile"),c.appendChild(s)),null!==n&&function(e,t,n,r,a,o){const c=e.createElement("ul"),s=e.querySelector("#card");c.classList.add("hand"),c.appendChild(ie(n,s));const l=e.querySelector("#back").content.cloneNode(!0).firstElementChild;c.appendChild(l),l.addEventListener("click",(async e=>{e.preventDefault(),"ai"===a?await r.drawCurrent():null==await r.onDrawPlayer(o)&&await r.pass(o)})),t.appendChild(c)}(t,s,n,r,a,o)}function fe(e){const t={green:"rgba(85, 170, 85, 0.4)",red:"rgba(255, 85, 85, 0.4)",yellow:"rgba(255, 170, 0, 0.4)",blue:"rgba(85, 85, 255, 0.4)"}[e];return null!=t?t:"aliceblue"}function pe(e,t,n,r,a){const o=t.documentElement;o.style.setProperty("--card-width","50px"),o.style.setProperty("--current-color",fe(n.getCurrentColor()));const c=t.querySelector(".places");c.replaceChildren();const s=t.createElement("ul");s.classList.add("circle-wrapper"),c.appendChild(s);const l=360/n.size(),i=n.getPlayerIterator();let d=0;const u=n.getDealer(),f=n.getCurrentPlayer();let p=null;for(const e of i){if(d===r){p=e,++d;continue}const n=90+l*(d-r),o=t.createElement("li");if(a.show)de(t,o,e.pile(),0,a);else{const n=t.createElement("div");n.classList.add("player-name"),n.innerText=e.pile().length,o.appendChild(n)}const c=t.createElement("div");let i=e.getName();u===d&&(i+="*"),c.innerText=i,o.appendChild(c);const h=e.getScore();if(h>0){const e=t.createElement("div");e.innerText=h,o.appendChild(e)}o.dataset.id=d,o.dataset.angle=n+"deg",o.style.setProperty("--angle-deg",n+"deg"),o.classList.add("circle"),f===d&&o.classList.add("current-player"),++d,s.appendChild(o)}ue(0,t,n.getCardOnBoard(),n,"net",r),function(e,t,n,r,a,o,c){const s=t.createElement("div");s.classList.add("my-hand");const l=t.createElement("div");l.classList.add("row");const i=t.createElement("span");let d=a.getName();n.getDealer()===r&&(d+="*"),i.innerText=d,l.appendChild(i);const u=a.getScore();if(u>0){const e=t.createElement("span");e.innerText=u,l.appendChild(e)}const f=t.createElement("span");f.classList.add("sprite-container");const p=t.createElement("div");n.getDirection()>0?p.classList.add("direction-forward"):p.classList.add("direction-back"),f.appendChild(p),l.appendChild(f),s.appendChild(l),s.dataset.id=r,s.classList.add("player-name"),n.getDealer(),n.getCurrentPlayer()===r&&s.classList.add("current-player"),de(t,s,a.pile(),0,c),s.addEventListener("click",(async e=>{e.preventDefault();const t=e.target.parentElement;if(t&&t.classList.contains("card")){const e=parseInt(t.dataset.card);await n.moveToDiscard(r,e)}})),o.appendChild(s)}(0,t,n,r,p,c,a)}const he={drawCenter:ue,drawPlayers:function(e,t,n,r,a){a.clickAll?function(e,t,n,r,a){const o=t.documentElement;o.style.setProperty("--card-width","40px"),o.style.setProperty("--current-color",fe(n.getCurrentColor()));const c=t.querySelector(".places");c.replaceChildren();const s=t.createElement("ul");s.classList.add("circle-wrapper"),c.appendChild(s);const l=360/n.size(),i=n.getPlayerIterator();let d=0;const u=n.getDealer(),f=n.getCurrentPlayer();for(const e of i){const n=90+l*(d-r),o=t.createElement("li"),c=t.createElement("span");c.innerText=e.getName(),o.appendChild(c);const i=e.getScore();if(i>0){const e=t.createElement("span");e.innerText=i,o.appendChild(e)}de(t,o,e.pile(),0,a),o.dataset.id=d,o.dataset.angle=n+"deg",o.style.setProperty("--angle-deg",n+"deg"),o.classList.add("circle","player-name"),u===d&&o.classList.add("dealer"),f===d&&o.classList.add("current-player"),s.appendChild(o),++d}ue(0,t,n.getCardOnBoard(),n,"ai",r),s.addEventListener("click",(async e=>{e.preventDefault();const t=e.target.parentElement;if(t&&t.classList.contains("card")){const e=t.parentElement.parentElement,r=parseInt(t.dataset.card),a=parseInt(e.dataset.id);await n.moveToDiscard(a,r)}}))}(0,t,n,r,a):pe(0,t,n,r,a)},drawLayout:pe};function ye(e,t,n){let r=n&&n.state;r&&("object"==typeof r&&t.copy(r,t),e.state=()=>t.copy(t,{}))}class we{constructor(e){null==e&&(e=+new Date);let t=4022871197;function n(e){e=String(e);for(let n=0;n<e.length;n++){t+=e.charCodeAt(n);let r=.02519603282416938*t;t=r>>>0,r-=t,r*=t,t=r>>>0,r-=t,t+=4294967296*r}return 2.3283064365386963e-10*(t>>>0)}this.c=1,this.s0=n(" "),this.s1=n(" "),this.s2=n(" "),this.s0-=n(e),this.s0<0&&(this.s0+=1),this.s1-=n(e),this.s1<0&&(this.s1+=1),this.s2-=n(e),this.s2<0&&(this.s2+=1)}next(){let{c:e,s0:t,s1:n,s2:r}=this,a=2091639*t+2.3283064365386963e-10*e;return this.s0=n,this.s1=r,this.s2=a-(this.c=0|a)}copy(e,t){return t.c=e.c,t.s0=e.s0,t.s1=e.s1,t.s2=e.s2,t}}function me(e,t,n,a,o){let c=function(e,t){let n=new we(e),r=()=>n.next();return r.double=()=>r()+11102230246251565e-32*(2097152*r()|0),r.int32=()=>4294967296*n.next()|0,r.quick=r,ye(r,n,t),r}(n.seed);const s=se(n,c);let l=0,i=0;function d(){he.drawPlayers(e,t,s,i,n)}for(const e of a)s.addPlayer(e.name),e.external_id==n.externalId&&(i=l),++l;function u(e,n){const r=t.getElementsByClassName("overlay")[0],a=t.getElementsByClassName("close")[0],o=t.getElementsByClassName("install")[0];a.addEventListener("click",(function(e){e.preventDefault(),r.classList.remove("show")}),!1);r.querySelector("h2").textContent=e;r.querySelector(".content").textContent=n,r.classList.add("show"),o.classList.remove("hidden2")}return s.on("draw",(async({playerIndex:e,card:t})=>{d();const a=Date.now();e!==i&&"server"!==n.mode||await o.draw({playerIndex:e,card:t});const c=Date.now();await(0,r.gw)(150-c+a)})),s.on("drawExternal",(async({playerIndex:e,card:t})=>{d();const a=Date.now();"server"===n.mode&&await o.draw({playerIndex:e,card:t});const c=Date.now();await(0,r.gw)(200-c+a)})),s.on("changeCurrent",(async({currentPlayer:a,dealer:c,direction:l})=>{he.drawPlayers(e,t,s,i,n),"server"===n.mode&&await o.changeCurrent({currentPlayer:a,dealer:c,myIndex:i,direction:l}),await(0,r.gw)(50)})),s.on("pass",(async({playerIndex:e})=>{await o.pass({playerIndex:e,myIndex:i})})),s.on("move",(async a=>{he.drawPlayers(e,t,s,i,n),await(0,r.gw)(30),a.playerIndex!==i&&"server"!==n.mode||await o.move(a)})),s.on("moveExternal",(async a=>{he.drawPlayers(e,t,s,i,n),await(0,r.gw)(30),"server"===n.mode&&await o.move(a)})),s.on("discard",(async e=>{d(),await o.discard(e),await(0,r.gw)(30)})),s.on("shuffle",(async e=>{d(),await o.shuffle(e),await(0,r.gw)(300)})),s.on("deal",(()=>{})),s.on("gameover",(async e=>{d();u(a[e.playerIndex].name+" wins","with score "+e.score),await o.gameover(e)})),s.on("clearPlayer",(async e=>{await o.clearPlayer(e)})),le(0,t,s,{inColorChoose:!1,inExternalMove:!1}),s.on("roundover",(async e=>{"net"!==n.mode?(await o.roundover(e),await(0,r.gw)(300),await s.nextDealer(),await s.deal()):d()})),{start:async function(){await s.chooseDealer(),await(0,r.gw)(1e3),n.showAll?n.show=!0:n.show=!1,await s.deal()},onShuffle:async function(r){await s.setDeck(r),he.drawPlayers(e,t,s,i,n)},onDraw:function(e,t){return s.onDraw(e,t)},onDiscard:function(e){return s.onDiscard(e)},onChangeCurrent:async function(e){s.getCurrentPlayer()!==e.myIndex&&"server"==n.mode||(n.showAll?n.show=!0:n.show=!1,s.setCurrent(e.currentPlayer,e.dealer,e.direction),d())},onClearHand:async function(e){await s.cleanHand(e),d()},onMove:function(e){return s.onMove(e.playerIndex,e.card,e.currentColor)},onNewRound:async function(e){const t=await s.onNewRound(e);return d(),t},onGameOver:async function(e){return d(),u("","with score "+e.score),!0},onPass:function(e){return s.onPass(e.playerIndex)}}}function ge(e){}function Ce(e){}function ve(e){let t="";for(const n of e)t+=n.external_id;return t}function be(e,r,a){const o={move:ge,moveExternal:ge,drawExternal:ge,gameover:ge,username:ge,start:Ce,swap:Ce,pass:Ce,"uno-start":Ce,shuffle:Ce,draw:Ce,discard:Ce,chooseColor:Ce,clearPlayer:ge,changeCurrent:ge,roundover:ge};let c=null,s=[];function l(e,t){o[e]=t}const i=()=>{o.start(s)},d=r.querySelector(".start");d&&d.addEventListener("click",i),"ai"!=a.mode&&t(e,r,a,o);const u=async()=>{i(),a.seed||(a.seed=ve(s)),c=me(e,r,a,s,o),await c.start()};l("onSeatsFinished",u);return{on:l,onChange:function(e){if(null!=c)return c.onMove(e)},join:(e,t,a)=>(s[e]={name:t,external_id:a},n(0,r,0,o,s),!0),start:i,onConnect:()=>{t(e,r,a,o)},swap:(e,t)=>{const a=s[e];s[e]=s[t],s[t]=a,n(0,r,0,o,s)},onStart:t=>{s=t,a.seed=ve(s),c=me(e,r,a,s,o);r.getElementsByClassName("places")[0].classList.remove("connected","loading","flying-cards")},afterAllJoined:u,onShuffle:e=>{if(null!=c)return c.onShuffle(e)},onDraw:(e,t)=>{if(null!=c)return c.onDraw(e,t)},onDiscard:e=>{if(null!=c)return c.onDiscard(e)},onNewRound:e=>{if(null!=c)return c.onNewRound(e)},onChangeCurrent:e=>{if(null!=c)return c.onChangeCurrent(e)},onClearHand:e=>{if(null!=c)return c.onClearHand(e)},onGameOver:e=>{if(null!=c)return c.onGameOver(e)},disconnect:e=>{const t=s.length;s=s.filter((t=>t.external_id!=e));const a=s.length;return n(0,r,0,o,s),t>a},onPass:e=>{if(null!=c)return c.onPass(e)}}}"serviceWorker"in navigator&&(navigator.serviceWorker.register("./sw.js",{scope:"./"}),function(e,t){const n=t.querySelector(".butInstall");let a;n.addEventListener("click",(e=>{e.preventDefault(),(0,r.N8)(n),a.prompt(),a.userChoice.then((e=>{}))})),e.addEventListener("beforeinstallprompt",(e=>{e.preventDefault(),a=e,(0,r.oX)(n)}))}(window,document)),function(t,n){(0,r.Bk)(t,n,e),"net"===e.mode?a.e(970).then(a.bind(a,970)).then((r=>{r.default(t,n,e,be)})):"server"===e.mode?a.e(671).then(a.bind(a,671)).then((r=>{r.default(t,n,e,be)})):"ai"===e.mode?a.e(945).then(a.bind(a,945)).then((r=>{r.default(t,n,e,be)})):(0,r.hu)(!1,"Unsupported mode")}(window,document)})()})();