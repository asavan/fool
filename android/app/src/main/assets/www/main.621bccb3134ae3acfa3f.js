(()=>{"use strict";var e,t,n={392:(e,t,n)=>{function r(e){e&&e.remove()}function a(e,t,n){e.logger&&(n.innerHTML+="object"==typeof t?(JSON&&JSON.stringify?JSON.stringify(t):t)+"<br />":t+"<br />")}function o(e){switch(e.toLowerCase().trim()){case"true":case"yes":case"1":return!0;case"false":case"no":case"0":case null:return!1;default:return Boolean(e)}}function c(e,t,n){const r=e.location.search,a=new URLSearchParams(r);for(const[e,t]of a)"number"==typeof n[e]?n[e]=parseInt(t,10):"boolean"==typeof n[e]?n[e]=o(t):n[e]=t}n.d(t,{Bk:()=>c,cM:()=>a,ew:()=>r,gw:()=>l,hu:()=>s});const l=e=>new Promise((t=>setTimeout(t,e)));function s(e,t){if(!e)throw t}},971:(e,t,n)=>{function r(e,t,n,r){const a=t.querySelector(".name-form-cont"),o=e.sessionStorage.getItem("username");if(o)return a.replaceChildren(),void(r&&r.username(o,"server"));const c=t.querySelector("#nameform").content.cloneNode(!0).firstElementChild;a.replaceChildren(c);const l=t.querySelector(".nameform"),s=t.querySelector(".nameinput"),i=t.querySelector(".container");"net"===n.mode&&i.classList.add("hidden"),l.addEventListener("submit",(function(t){var n;t.preventDefault(),n=s.value,e.sessionStorage.setItem("username",n),r&&r.username(n,"server"),l.classList.add("hidden"),i.classList.remove("hidden"),a.replaceChildren()}))}n.d(t,{Z:()=>r})}},r={};function a(e){var t=r[e];if(void 0!==t)return t.exports;var o=r[e]={exports:{}};return n[e](o,o.exports,a),o.exports}a.m=n,a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.f={},a.e=e=>Promise.all(Object.keys(a.f).reduce(((t,n)=>(a.f[n](e,t),t)),[])),a.u=e=>e+"."+{297:"19f6941c4105feaf1765",745:"1442be4fbacc6446a429",945:"6466e1705e9b6987ab7c",970:"d9038fd8850abd5b0bf0"}[e]+".js",a.miniCssF=e=>{},a.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),e={},t="fool:",a.l=(n,r,o,c)=>{if(e[n])e[n].push(r);else{var l,s;if(void 0!==o)for(var i=document.getElementsByTagName("script"),d=0;d<i.length;d++){var u=i[d];if(u.getAttribute("src")==n||u.getAttribute("data-webpack")==t+o){l=u;break}}l||(s=!0,(l=document.createElement("script")).charset="utf-8",l.timeout=120,a.nc&&l.setAttribute("nonce",a.nc),l.setAttribute("data-webpack",t+o),l.src=n),e[n]=[r];var f=(t,r)=>{l.onerror=l.onload=null,clearTimeout(p);var a=e[n];if(delete e[n],l.parentNode&&l.parentNode.removeChild(l),a&&a.forEach((e=>e(r))),t)return t(r)},p=setTimeout(f.bind(null,void 0,{type:"timeout",target:l}),12e4);l.onerror=f.bind(null,l.onerror),l.onload=f.bind(null,l.onload),s&&document.head.appendChild(l)}},a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;a.g.importScripts&&(e=a.g.location+"");var t=a.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var n=t.getElementsByTagName("script");if(n.length)for(var r=n.length-1;r>-1&&!e;)e=n[r--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),a.p=e})(),(()=>{var e={179:0};a.f.j=(t,n)=>{var r=a.o(e,t)?e[t]:void 0;if(0!==r)if(r)n.push(r[2]);else{var o=new Promise(((n,a)=>r=e[t]=[n,a]));n.push(r[2]=o);var c=a.p+a.u(t),l=new Error;a.l(c,(n=>{if(a.o(e,t)&&(0!==(r=e[t])&&(e[t]=void 0),r)){var o=n&&("load"===n.type?"missing":n.type),c=n&&n.target&&n.target.src;l.message="Loading chunk "+t+" failed.\n("+o+": "+c+")",l.name="ChunkLoadError",l.type=o,l.request=c,r[1](l)}}),"chunk-"+t,t)}};var t=(t,n)=>{var r,o,[c,l,s]=n,i=0;if(c.some((t=>0!==e[t]))){for(r in l)a.o(l,r)&&(a.m[r]=l[r]);if(s)s(a)}for(t&&t(n);i<c.length;i++)o=c[i],a.o(e,o)&&e[o]&&e[o][0](),e[o]=0},n=self.webpackChunkfool=self.webpackChunkfool||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})(),(()=>{const e={modes:["net","ai","server"],mode:"net",wsPort:8088,logger:!0,networkDebug:!0,cardsDeal:7,maxScore:500,showAll:!1,clickAll:!1,show:!0,externalId:"server",applyEffects:!0,colorOrder:["red","yellow","green","blue","black"],sortByColor:"",direction:["center"],seed:""};var t=a(971);function n(e,t,n,r,a){const o=t.querySelector(".places");o.replaceChildren();const c=t.createElement("ul");c.classList.add("circle-wrapper"),o.appendChild(c);const l=360/a.length;let s=90,i=null;c.addEventListener("click",(function(e){if(e.preventDefault(),e.target&&null!=e.target.dataset.id){if(i)return i.classList.remove("selected"),r.swap(i.dataset.id,e.target.dataset.id),void(i=null);i=e.target,i.classList.add("selected")}}));for(let e=0;e<a.length;++e){if(null==a[e]){s+=l;continue}const n=t.createElement("li");n.innerText=a[e].name,n.dataset.id=e,n.dataset.angle=s+"deg",n.style.setProperty("--angle-deg",s+"deg"),n.classList.add("circle","clickable"),s+=l,c.appendChild(n)}const d=t.createElement("button");d.textContent="Start",d.classList.add("start-button","clickable"),d.addEventListener("click",(function(e){e.preventDefault(),o.replaceChildren(),r.onSeatsFinished()})),o.appendChild(d)}var r=a(392);function o(e,t){for(let n=e.length-1;n>0;n--){const r=Math.floor(t()*(n+1)),a=e[n];e[n]=e[r],e[r]=a}}function c(e,t,n){let r=e;return{deal:function(){return r.pop()},addCardAndShuffle:function(e){return function(e){r.push(e)}(e),o(r,n),t.shuffle(r)},setDeck:function(e){r=e},checkTop:function(e){if(0===r.length)return!1;const t=r.at(-1)===e;return t},size:()=>r.length,shuffle:function(){return o(r,n),t.shuffle(r)}}}const l={newShuffledDeck:async function(e,t){const n=function(){const e=[...Array(112).keys()];return e.splice(56,1),e.splice(69,1),e.splice(82,1),e.splice(95,1),e}();return o(n,t),await e.shuffle(n),c(n,e,t)},newExternalDeck:c},s=["red","yellow","green","blue"];Object.freeze(s);function i(e){let t;if(e%14==13)return"black";switch(Math.floor(e/14)){case 0:case 4:t="red";break;case 1:case 5:t="yellow";break;case 2:case 6:t="green";break;case 3:case 7:t="blue"}return t}function d(e){switch(e%14){case 10:return"Skip";case 11:return"Reverse";case 12:return"Draw2";case 13:return Math.floor(e/14)>=4?"Draw4":"Wild";default:return"Number "+e%14}}function u(e){let t;switch(e%14){case 10:case 11:case 12:t=20;break;case 13:t=50;break;default:t=e%14}return t}const f={GOOD_COLORS:s,GameStage:Object.freeze({chooseDealer:1,dealing:2,round:3,gameOver:4}),cardColor:i,cardType:d,cardScore:u,sortByTemplate:function(e,t,n){const r="asc"===t?1:-1;e.sort(((e,t)=>{const a=i(e),o=i(t);if(a===o){const n=u(e)-u(t);return 0===n?(e-t)*r:n*r}for(const e of n){if(e===a)return-1;if(e===o)return 1}return 0}))},pileHasColor:function(e,t){return null!=e.find((e=>i(e)===t))},cardToString:function(e){return i(e)+" "+d(e)}};function p(e){}function h(e){}function y(e,t){(0,r.hu)(e,t)}const w={shuffle:h,deal:h,draw:h,discard:h,move:h,clearPlayer:h,changeCurrent:h,changeDealer:h,gameover:h,roundover:h,pass:p,drawExternal:p,moveExternal:p,chooseColor:T};let g=500,m=0,C=0,v=[],b=null,S=!0,x=null,E=[],D=null,L=null,k=0,P=0,O=!0;function T(){return L}function I(){return C}function N(e,t){return y(t>0,"Bad usage"),(e+C+t)%t}function B(e,t){return(m+(e+1)*C+t)%t}function q(){return x}function A(e){if(!e)return!1;const t=v.length;return v.push(function(e,t){const n=e,r=t,a=[];let o=0;return{getName:()=>n,addCard:e=>a.push(e),pile:()=>[...a],getIndex:()=>r,cleanHand:()=>{a.length=0},removeCard:e=>{const t=a.indexOf(e);return t<0||a.splice(t,1),t},updateScore:e=>{o+=e},getScore:()=>o,setScore:e=>{o=e},hasColor:e=>f.pileHasColor(a,e),hasCard:e=>a.includes(e)}}(e,t)),!0}async function j(e,t,n){if(null==e||0===e.size())return null;const r=e.deal();return null==r?null:(v[t].addCard(r),n?await async function(e,...t){const n=w[e];if("function"==typeof n)return await n(...t)}("drawExternal",{playerIndex:t,card:r}):await w.draw({playerIndex:t,card:r}),0===e.size()&&await function(){const e=E.pop();return b.setDeck(E),E=[e],b.shuffle()}(),r)}async function M(e,t){if(!b.checkTop(t))return!1;await j(b,e,!0);return k++,!0}async function z(e){if(e!==D)return!1;if(O)return!1;if(k>0)return!1;k++;return null!=await j(b,D)}async function R(e){if(e===D){if(O)return!1;if(0!=k)return await re(),await w.pass({playerIndex:e}),!0}}async function H(e,t,n){const r=await async function(e,t,n){const r=await async function(e,t,n){if(e!==D)return!1;if(!V().hasCard(t))return!1;if(!f.GOOD_COLORS.includes(n))return!1;if(O)return!1;if(P>0)return!1;if("Wild"===f.cardType(t))return!0;if("Draw4"===f.cardType(t))return!V().hasColor(L);if(f.cardColor(t)!==n)return!1;if(f.cardColor(t)===L)return!0;if(f.cardType(t)===f.cardType(x))return!0;return!1}(e,t,n);r&&(v[e].removeCard(t),x=t,E.push(t),L=n,++P,await w.moveExternal({playerIndex:e,card:t,currentColor:L}),S&&(await K(t,D),await ee(e)));return r}(e,t,n);return r}async function _(e){if(null==b||!b.checkTop(e))return;y(b.deal()===e,"Different cards"),x=e,await w.discard(e);const t=f.cardColor(e);"black"!==t&&(E.push(e),L=t)}function G(e,t){w[e]=t}function F(){return{[Symbol.iterator](){let e=0;return{next:()=>e>=v.length?{done:!0,value:e}:{done:!1,value:v[e++]},return:()=>({done:!0})}}}}function J(){return v.length}function W(){return m}function $(){return D}async function U(e){x=null,E=[],v[e].cleanHand(),await w.clearPlayer(e)}function Z(){D=N(D,v.length),k=0,P=0}async function K(e,t){const n=f.cardType(e);if("Reverse"===n&&(C*=-1,2===v.length&&Z()),"Skip"===n&&Z(),"Draw2"===n){Z();for(let e=0;e<2;++e)await j(b,D)}if("Draw4"===n){Z();for(let e=0;e<4;++e)await j(b,D)}await re()}async function Q(e){for(let t=0;t<e;++t){const e=v.length;for(let t=0;t<e;t++){const n=B(t,e),r=v[n].getIndex();await j(b,r)}}const t=await async function(e){O=!1,D=m,await w.changeCurrent({currentPlayer:D,dealer:m,direction:C});let t=e.deal();for(x=t,await w.discard(t);"black"===f.cardColor(t);)x=null,await e.addCardAndShuffle(t),t=e.deal(),x=t,await w.discard(t);return E.push(t),L=f.cardColor(t),t}(b);D=m,await K(t)}function V(){return v[D]}async function X(e,t){if(e!==D)return!1;if(!V().hasCard(t))return!1;if(O)return!1;if(P>0)return!1;if("Wild"===f.cardType(t)){const t=await w.chooseColor(e);return!!f.GOOD_COLORS.includes(t)&&(L=t,!0)}if("Draw4"===f.cardType(t)){if(V().hasColor(L))return!1;const t=await w.chooseColor(e);return!!f.GOOD_COLORS.includes(t)&&(L=t,!0)}return f.cardColor(t)===L||f.cardType(t)===f.cardType(x)}async function Y(e,t){const n=await X(e,t);if(n){v[e].removeCard(t),x=t,E.push(t);const n=f.cardColor(t);"black"!=n&&(L=n),++P,await w.move({playerIndex:e,card:t,currentColor:L}),S&&(await K(t),await ee(e))}return n}async function ee(e){const t=v[e];if(0===t.pile().length){O=!0;const n=function(){let e=0;const t=F();for(const n of t)for(const t of n.pile())e+=f.cardScore(t);return e}();t.updateScore(n),t.getScore()>=g?await w.gameover({playerIndex:e,score:t.getScore(),diff:n}):await w.roundover({playerIndex:e,score:t.getScore(),diff:n})}}async function te(e){const t=v[e.playerIndex],n=t.getScore();k=0,P=0,O=!1,e.score==n+e.diff&&t.setScore(e.score)}function ne(e){return e==D&&re()}async function re(){return Z(),k=0,P=0,await w.changeCurrent({currentPlayer:D,dealer:m,direction:C}),!0}async function ae(){return C=1,m=N(m,v.length),D=m,O=!1,k=0,P=0,await w.changeCurrent({currentPlayer:D,dealer:m,direction:C})}async function oe(){if(O)return!1;k>0?await re():(k++,await j(b,D))}function ce(e,t,n){k=0,P=0,null!=t&&(m=t,O=!1),null!=n&&(C=n),D=e}function le(){return{currentPlayer:D,dealer:m,currentColor:L,cardOnBoard:x,color:f.cardColor(x),type:f.cardType(x)}}function se(){return null==b?0:b.size()}function ie(e,t){return g=500,m=0,C=1,v=[],b=null,S=!0,x=null,E=[],D=null,L=null,k=0,P=0,O=!0,S=e.applyEffects,e.maxScore&&(g=e.maxScore),{chooseDealer:function(){return async function(e){b=await l.newShuffledDeck(w,e);let t=[...v];for(;t.length>1;){const e=t.length,n=new Array(e);let r=0;for(let a=0;a<e;a++){const o=B(a,e),c=t[o].getIndex(),l=await j(b,c),s=f.cardScore(l);n[o]=s,r=Math.max(r,s)}const a=[];for(let o=0;o<e;o++)n[o]===r&&a.push(t[o]);t=a}t.length>=1&&(m=t[0].getIndex()),D=m,await w.changeCurrent({currentPlayer:D,dealer:m,direction:C})}(t)},deal:async function(){return await async function(e){x=null,E=[];for(const e of v)e.cleanHand(),await w.clearPlayer(e.getIndex());b=await l.newShuffledDeck(w,e)}(t),Q(e.cardsDeal)},dealN:Q,getPlayerIterator:F,addPlayer:A,size:J,on:G,getDealer:W,getCurrentPlayer:$,getCardOnBoard:q,tryMove:X,moveToDiscard:Y,drawCurrent:oe,setDeck:function(e){null==b?b=l.newExternalDeck(e,w,t):b.setDeck(e)},onDraw:M,onMove:H,onDiscard:_,setCurrent:ce,cleanHand:U,nextDealer:ae,onDrawPlayer:z,pass:R,getCurrentColor:T,getDirection:I,state:le,onNewRound:te,onPass:ne,deckSize:se}}function de(e,t,n,r){return n.on("chooseColor",(()=>function(e,t){return new Promise((n=>{t.inColorChoose=!0;const r=e.querySelector(".color-picker-holder");r.replaceChildren();const a=e.createElement("ul");a.classList.add("color-grid"),r.appendChild(a);for(const o of f.GOOD_COLORS){const c=e.createElement("li");c.classList.add(o),c.addEventListener("click",(e=>{e.preventDefault(),r.replaceChildren(),t.inColorChoose=!1,n(o)})),a.appendChild(c)}const o=e.createElement("li");o.classList.add("cancel-color"),o.addEventListener("click",(e=>{e.preventDefault(),r.replaceChildren(),t.inColorChoose=!1,n("black")})),a.appendChild(o)}))}(t,r))),{}}function ue(e,t){const n=t.content.cloneNode(!0).firstElementChild;return n.style.setProperty("--sprite-x",1400-e%14*100+"%"),n.style.setProperty("--sprite-y",800-100*Math.floor(e/14)+"%"),n.dataset.card=e,n}function fe(e){const t=e.createElement("li");return t.classList.add("blank"),t}function pe(e,t,n,r,a){const o=e.createElement("ul"),c=e.querySelector("#card");o.classList.add("hand"),a&&a.sortByColor&&f.sortByTemplate(n,a.sortByColor,a.colorOrder);for(const e of n)o.appendChild(ue(e,c));t.appendChild(o)}function he(e,t,n){we(n.size(),n.getDirection(),e,t,"big-circle",n.getCurrentColor())}function ye(e,t,n,r,a,o){const c=t.querySelector(".places");let l=c.querySelector(".center-pile");l?l.replaceChildren():(l=t.createElement("div"),l.classList.add("center-pile"),c.appendChild(l)),function(e,t,n,r,a,o){const c=e.createElement("ul"),l=e.querySelector("#card");if(c.classList.add("hand"),null!==n?c.appendChild(ue(n,l)):c.appendChild(fe(e)),0===r.deckSize())c.appendChild(fe(e));else{const t=e.querySelector("#back").content.cloneNode(!0).firstElementChild;t.addEventListener("click",(async e=>{e.preventDefault(),"ai"===a?await r.drawCurrent():await r.onDrawPlayer(o)||await r.pass(o)})),c.appendChild(t)}t.appendChild(c)}(t,l,n,r,a,o)}function we(e,t,n,r,a,o){if(2===e||0===t)return;const c=r.createElement("span");c.classList.add(a);const l=r.createElement("div");l.classList.add("direction"),o&&l.classList.add(o),1===t&&l.classList.add("mirror"),c.appendChild(l),n.appendChild(c)}function ge(e){const t={green:"rgba(85, 170, 85, 0.4)",red:"rgba(255, 85, 85, 0.4)",yellow:"rgba(255, 170, 0, 0.4)",blue:"rgba(85, 85, 255, 0.4)"}[e];return null!=t?t:"aliceblue"}function me(e,t,n,r,a){const o=t.documentElement;o.style.setProperty("--card-width","50px"),o.style.setProperty("--current-color",ge(n.getCurrentColor()));const c=t.querySelector(".places");c.replaceChildren(),he(c,t,n);const l=t.createElement("ul");l.classList.add("circle-wrapper"),c.appendChild(l);const s=360/n.size(),i=n.getPlayerIterator();let d=0;const u=n.getDealer(),f=n.getCurrentPlayer();let p=null;for(const e of i){if(d===r){p=e,++d;continue}const n=90+s*(d-r),o=t.createElement("li");if(a.show)pe(t,o,e.pile(),0,a);else{const n=t.createElement("div");n.innerText=e.pile().length,n.classList.add("card-count"),o.appendChild(n)}const c=t.createElement("div");c.classList.add("player-name"),c.innerText=e.getName(),o.appendChild(c);const i=e.getScore();if(i>0){const e=t.createElement("div");e.innerText=i,o.appendChild(e)}o.dataset.id=d,o.dataset.angle=n+"deg",o.style.setProperty("--angle-deg",n+"deg"),o.classList.add("circle"),f===d&&o.classList.add("current-player"),u===d&&o.classList.add("dealer"),++d,l.appendChild(o)}ye(0,t,n.getCardOnBoard(),n,"net",r),function(e,t,n,r,a,o,c){const l=t.createElement("div");l.classList.add("my-hand");const s=t.createElement("div");s.classList.add("row");const i=t.createElement("span");i.innerText=a.getName(),i.classList.add("player-name"),s.appendChild(i);const d=a.getScore();if(d>0){const e=t.createElement("span");e.innerText=d,s.appendChild(e)}c.direction&&c.direction.includes("hand")&&we(n.size(),n.getDirection(),s,t,"sprite-container"),l.appendChild(s),l.dataset.id=r,n.getCurrentPlayer()===r&&l.classList.add("current-player"),n.getDealer()===r&&l.classList.add("dealer"),pe(t,l,a.pile(),0,c),l.addEventListener("click",(async e=>{e.preventDefault();const t=e.target.parentElement;if(t&&t.classList.contains("card")){const e=parseInt(t.dataset.card);await n.moveToDiscard(r,e)}})),o.appendChild(l)}(0,t,n,r,p,c,a)}const Ce={drawCenter:ye,drawPlayers:function(e,t,n,r,a,o){a.clickAll?function(e,t,n,r,a,o){const c=t.documentElement;c.style.setProperty("--card-width","30px"),c.style.setProperty("--current-color",ge(n.getCurrentColor()));const l=t.querySelector(".places");l.replaceChildren(),he(l,t,n);const s=t.createElement("ul");s.classList.add("circle-wrapper"),l.appendChild(s);const i=360/n.size(),d=n.getPlayerIterator();let u=0;const f=n.getDealer(),p=n.getCurrentPlayer();for(const e of d){const n=90+i*(u-r),o=t.createElement("li"),c=t.createElement("span");c.innerText=e.getName(),c.classList.add("player-name"),o.appendChild(c);const l=e.getScore();if(l>0){const e=t.createElement("span");e.innerText=l,o.appendChild(e)}pe(t,o,e.pile(),0,a),o.dataset.id=u,o.dataset.angle=n+"deg",o.style.setProperty("--angle-deg",n+"deg"),o.classList.add("circle","player-hand"),f===u&&o.classList.add("dealer"),p===u&&o.classList.add("current-player"),s.appendChild(o),++u}ye(0,t,n.getCardOnBoard(),n,"ai",r),s.addEventListener("click",(async e=>{e.preventDefault();const t=e.target.parentElement;if(t&&t.classList.contains("card")){const e=t.parentElement.parentElement,r=parseInt(t.dataset.card),a=parseInt(e.dataset.id);await n.moveToDiscard(a,r)}}))}(0,t,n,r,a):me(0,t,n,r,a)},drawLayout:me};function ve(e,t,n){let r=n&&n.state;r&&("object"==typeof r&&t.copy(r,t),e.state=()=>t.copy(t,{}))}class be{constructor(e){null==e&&(e=+new Date);let t=4022871197;function n(e){e=String(e);for(let n=0;n<e.length;n++){t+=e.charCodeAt(n);let r=.02519603282416938*t;t=r>>>0,r-=t,r*=t,t=r>>>0,r-=t,t+=4294967296*r}return 2.3283064365386963e-10*(t>>>0)}this.c=1,this.s0=n(" "),this.s1=n(" "),this.s2=n(" "),this.s0-=n(e),this.s0<0&&(this.s0+=1),this.s1-=n(e),this.s1<0&&(this.s1+=1),this.s2-=n(e),this.s2<0&&(this.s2+=1)}next(){let{c:e,s0:t,s1:n,s2:r}=this,a=2091639*t+2.3283064365386963e-10*e;return this.s0=n,this.s1=r,this.s2=a-(this.c=0|a)}copy(e,t){return t.c=e.c,t.s0=e.s0,t.s1=e.s1,t.s2=e.s2,t}}function Se(e,t,n,a,o){const c=function(e,t){let n=new be(e),r=()=>n.next();return r.double=()=>r()+11102230246251565e-32*(2097152*r()|0),r.int32=()=>4294967296*n.next()|0,r.quick=r,ve(r,n,t),r}(n.seed),l=ie(n,c);let s=0,i=0;function d(r){Ce.drawPlayers(e,t,l,i,n,r)}for(const e of a)l.addPlayer(e.name),e.external_id==n.externalId&&(i=s),++s;function u(e,n){const r=t.getElementsByClassName("overlay")[0],a=t.getElementsByClassName("close")[0],o=t.getElementsByClassName("install")[0];a.addEventListener("click",(function(e){e.preventDefault(),r.classList.remove("show")}),!1);r.querySelector("h2").textContent=e;r.querySelector(".content").textContent=n,r.classList.add("show"),o.classList.remove("hidden2")}l.on("draw",(async({playerIndex:e,card:t})=>{d("draw");const a=Date.now();e!==i&&"server"!==n.mode||await o.draw({playerIndex:e,card:t});const c=Date.now();await(0,r.gw)(150-c+a)})),l.on("drawExternal",(async({playerIndex:e,card:t})=>{d("drawExternal");const a=Date.now();"server"===n.mode&&await o.draw({playerIndex:e,card:t});const c=Date.now();await(0,r.gw)(200-c+a)})),l.on("changeCurrent",(async({currentPlayer:e,dealer:t,direction:a})=>{d("changeCurrent"),"server"===n.mode&&await o.changeCurrent({currentPlayer:e,dealer:t,myIndex:i,direction:a}),await(0,r.gw)(50)})),l.on("pass",(async({playerIndex:e})=>{await o.pass({playerIndex:e,myIndex:i})})),l.on("move",(async e=>{d("move"),e.playerIndex!==i&&"server"!==n.mode||await o.move(e),await(0,r.gw)(30)})),l.on("moveExternal",(async e=>{d("moveExternal"),"server"===n.mode&&await o.move(e),await(0,r.gw)(30)})),l.on("discard",(async e=>{d("discard"),await o.discard(e),await(0,r.gw)(30)})),l.on("shuffle",(async e=>{d("shuffle"),await o.shuffle(e),await(0,r.gw)(300)})),l.on("deal",(()=>{})),l.on("gameover",(async e=>{d();u(a[e.playerIndex].name+" wins","with score "+e.score),await o.gameover(e)})),l.on("clearPlayer",(async e=>{await o.clearPlayer(e),d()})),de(0,t,l,{inColorChoose:!1,inExternalMove:!1}),l.on("roundover",(async e=>{"net"!==n.mode?(await o.roundover(e),await(0,r.gw)(300),await l.nextDealer(),await l.deal()):d()}));return{on:function(e,t){o[e]=t},start:async function(){await o.start({players:a,engine:l}),await l.chooseDealer(),await(0,r.gw)(1e3),n.showAll?n.show=!0:n.show=!1,await l.deal()},onShuffle:async function(r){await l.setDeck(r),Ce.drawPlayers(e,t,l,i,n)},onDraw:function(e,t){return l.onDraw(e,t)},onDiscard:function(e){return l.onDiscard(e)},onChangeCurrent:async function(e){l.getCurrentPlayer()!==e.myIndex&&"server"==n.mode||(n.showAll?n.show=!0:n.show=!1,l.setCurrent(e.currentPlayer,e.dealer,e.direction),d())},onClearHand:async function(e){await l.cleanHand(e)},onMove:function(e){return l.onMove(e.playerIndex,e.card,e.currentColor)},onNewRound:async function(e){const t=await l.onNewRound(e);return d(),t},onGameOver:async function(e){return d(),u("","with score "+e.score),!0},onPass:function(e){return l.onPass(e.playerIndex)},getEngine:()=>l}}function xe(e){}function Ee(e){}function De(e){let t="";for(const n of e)t+=n.external_id;return t}function Le(e,r,a){const o={move:xe,username:xe,draw:Ee,pass:Ee,changeCurrent:xe,discard:Ee,shuffle:Ee,clearPlayer:xe,roundover:xe,gameover:xe,start:Ee,swap:Ee,onSeatsFinished:Ee};let c=null,l=[];return{on:function(e,t){o[e]=t},onChange:function(e){if(null!=c)return c.onMove(e)},join:(e,t,a)=>(l[e]={name:t,external_id:a},n(0,r,0,o,l),!0),onConnect:()=>{(0,t.Z)(e,r,a,o)},swap:(e,t)=>{const a=l[e];l[e]=l[t],l[t]=a,n(0,r,0,o,l)},onStart:t=>{l=t,a.seed=De(l),c=Se(e,r,a,l,o);r.getElementsByClassName("places")[0].classList.remove("connected","loading","flying-cards")},afterAllJoined:async()=>{a.seed||(a.seed=De(l)),c=Se(e,r,a,l,o),await c.start()},onShuffle:e=>{if(null!=c)return c.onShuffle(e)},onDraw:(e,t)=>{if(null!=c)return c.onDraw(e,t)},onDiscard:e=>{if(null!=c)return c.onDiscard(e)},onNewRound:e=>{if(null!=c)return c.onNewRound(e)},onChangeCurrent:e=>{if(null!=c)return c.onChangeCurrent(e)},onClearHand:e=>{if(null!=c)return c.onClearHand(e)},onGameOver:e=>{if(null!=c)return c.onGameOver(e)},disconnect:e=>{const t=l.length;l=l.filter((t=>t.external_id!=e));const a=l.length;return n(0,r,0,o,l),t>a},onPass:e=>{if(null!=c)return c.onPass(e)},actionKeys:()=>Object.keys(o),getHandlers:()=>o}}(function(t,n){(0,r.Bk)(t,n,e),"net"===e.mode?a.e(970).then(a.bind(a,970)).then((r=>{r.default(t,n,e,Le).catch((e=>{}))})):"server"===e.mode?a.e(745).then(a.bind(a,745)).then((r=>{r.default(t,n,e,Le)})):"ai"===e.mode?a.e(945).then(a.bind(a,945)).then((r=>{r.default(t,n,e,Le)})):"test"===e.mode?a.e(297).then(a.bind(a,297)).then((r=>{r.default(t,n,e,Le)})):(0,r.hu)(!1,"Unsupported mode")})(window,document)})()})();