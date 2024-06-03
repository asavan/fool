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

function renderQRCodeSVG(text, selector) {
    const divElement = document.querySelector(selector);
    const qrSVG = new window.QRCodeSVG(text, {
        level: 'M',
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
    makeQrPlain(toCode, document, ".qrcode0");
    makeQrPlain(toCodeLong, document, ".qrcode1");
    renderQRCodeSVG(toCode, ".qrcode2");
    renderQRCodeSVG(toCodeLong, ".qrcode3");
}

setup();
