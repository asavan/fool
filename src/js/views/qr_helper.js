import {QRCodeSVG} from "@akamfoad/qrcode";

export function bigPicture(elem) {
    elem.addEventListener("click", () => elem.classList.toggle("big"));
}

async function writeClipboardText(text) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
        }
    } catch (error) {
        console.error(error.message);
    }
}

function shareAndCopy(elem, url) {
    const shareData = {
        title: "Suno game",
        url: url,
    };
    elem.addEventListener("dblclick", async () => {
        await writeClipboardText(url);
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            }
        } catch (err) {
            console.error(err);
        }
    });
}

function chomp(string, c) {
    if (string.endsWith(c)) {
        return string.slice(0, -c.length);
    }
    return string;
}

function renderQRCodeSVG(text, divElement) {
    const qrSVG = new QRCodeSVG(text, {
        level: "M",
        padding: 3,
        image: {
            source: "./../../images/reverse_black.svg",
            width: "10%",
            height: "20%",
            x: "center",
            y: "center",
        },
    });
    divElement.innerHTML = qrSVG.toString();
}

export function removeElem(el) {
    if (el) {
        el.remove();
    }
}

export function makeQrString(window, settings) {
    const staticHost = settings.sh || (window.location.origin + window.location.pathname);
    const url = new URL(staticHost);
    if (settings.seed) {
        url.searchParams.set("seed", settings.seed);
    }
    const urlStr = chomp(url.toString(), "/");
    return urlStr;
}

export function makeQrPlain(urlStr, document, selector) {
    console.log("enemy url", urlStr);
    const el = document.querySelector(selector);
    if (!el) {
        console.log("No qr");
        return el;
    }
    renderQRCodeSVG(urlStr, el);
    // bigPicture(el);
    shareAndCopy(el, urlStr);
    return el;
}

export function makeQr(window, document, settings) {
    return makeQrPlain(makeQrString(window, settings), document, ".qrcode");
}
