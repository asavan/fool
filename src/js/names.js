"use strict"; // jshint ;_;
import {assert} from "./helper.js";


export default function enterName(window, document, settings, handlers) {
    const formCont = document.querySelector(".name-form-cont");
    if (formCont.childElementCount > 0) {
        return;
    }
    const formItem = document.querySelector('#nameform');
    const formClone = formItem.content.cloneNode(true).firstElementChild;
    formCont.replaceChildren(formClone);

    const form = document.querySelector(".nameform");
    const input = document.querySelector(".nameinput");
    const field = document.querySelector(".container");
    let data = window.sessionStorage.getItem("username");
    if (settings.mode == 'net') {
        field.classList.add('hidden');
    }

    function onName(name) {
        handlers['username'](name);
        console.log("On name", name);
        form.classList.add('hidden');
        field.classList.remove('hidden');
        formCont.replaceChildren();
    }

    if (data) {
        onName(data);
    }

    form.addEventListener("submit", function(evt) {
        evt.preventDefault();
        window.sessionStorage.setItem("username", input.value);
        onName(input.value);
    });
}
