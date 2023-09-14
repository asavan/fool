"use strict";

function clickBySelector(dom, selector) {
    console.log(selector);
    dom.window.document.querySelector(selector).dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}

export default {
    clickBySelector
};
