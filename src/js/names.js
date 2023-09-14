"use strict"; // jshint ;_;

export default function enterName(window, document, settings, handlers) {
    const formCont = document.querySelector(".name-form-cont");
    const data = window.sessionStorage.getItem("username");
    if (data) {
        formCont.replaceChildren();
        if (handlers) {
            console.log("Send name data", data);
            handlers["username"](data);
        }
        return;
    }

    if (formCont.childElementCount > 0) {
        return;
    }
    const formItem = document.querySelector("#nameform");
    const formClone = formItem.content.cloneNode(true).firstElementChild;
    formCont.replaceChildren(formClone);

    const form = document.querySelector(".nameform");
    const input = document.querySelector(".nameinput");
    const field = document.querySelector(".container");
    if (settings.mode == "net") {
        field.classList.add("hidden");
    }

    function onName(name) {
        console.log("On name", name);
        if (handlers) {
            handlers["username"](name);
        }
        form.classList.add("hidden");
        field.classList.remove("hidden");
        formCont.replaceChildren();
    }

    form.addEventListener("submit", function(evt) {
        evt.preventDefault();
        window.sessionStorage.setItem("username", input.value);
        onName(input.value);
    });
}
