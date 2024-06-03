import QRCode from "../lib/qrcode.js";

export function bigPicture(elem) {
    elem.addEventListener("click", () => elem.classList.toggle("big"));
}

function chomp(string, c) {
    if (string.charAt(string.length - c.length) === c) {
        return string.substr(0, string.length - c.length);
    }
    return string;
}

function qrRender(url, element) {
    const qrcode = new QRCode({
        content: url,
        container: "svg-viewbox", //Responsive use
        ecl: "L",
        join: true //Crisp rendering and 4-5x reduced file size
    });
    const svg = qrcode.svg();
    element.innerHTML = svg;
    bigPicture(element);
    return element;
}

export function removeElem(el) {
    if (el) {
        el.remove();
    }
}

export function makeQrPlain(staticHost, document, selector) {
    const url = new URL(staticHost);
    const urlStr = chomp(url.toString(), "/").toUpperCase();
    console.log("enemy url", urlStr);
    return qrRender(urlStr, document.querySelector(selector));
}

export function makeQr(window, document, settings) {
    const staticHost = settings.sh || window.location.origin;
    return makeQrPlain(staticHost, document, ".qrcode");
}
