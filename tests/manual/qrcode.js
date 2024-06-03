import * as QRCodeSVG1 from "./qrcode_bundled.js";
import {makeQrPlain, bigPicture} from "../../src/js/views/qr_helper.js";

function defaultSh() {
    return "192.168.0.1";
}

function defaultHost(sh) {
    return "http://" + sh() + ":8080";
}

function defaultWh(sh) {
    return "ws://" + sh() + ":8088";
}

function addWhParam(host, param) {
    const url = new URL(host);
    url.searchParams.set("wh", param);
    return url.toString();
}

function renderQRCodeSVG(text, selector, level) {
    const divElement = document.querySelector(selector);
    const qrSVG = new window.QRCodeSVG(text, {
        level: level,
        padding: 3,
        image: {
          source: "../../src/images/reverse_black.svg",
          width: '10%',
          height: '20%',
          x: 'center',
          y: 'center',
        },
      });
      divElement.innerHTML = qrSVG.toString();
      bigPicture(divElement);
}


export default function setup() {
    const toCode = defaultHost(defaultSh);
    const toCodeLong = addWhParam(toCode, defaultWh(defaultSh));
    console.log(toCode.length, toCodeLong.length);
    makeQrPlain(toCode, document, ".qrcode0");
    renderQRCodeSVG(toCode, ".qrcode1", "L");
    renderQRCodeSVG(toCode.toUpperCase(), ".qrcode2", "L");
    renderQRCodeSVG(toCode, ".qrcode3", "M");
    renderQRCodeSVG(toCode, ".qrcode4", "Q");
    makeQrPlain(toCodeLong, document, ".qrcode5");
    renderQRCodeSVG(toCodeLong, ".qrcode6", "L");
}

setup();
