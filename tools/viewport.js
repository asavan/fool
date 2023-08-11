function throttle(func, ms) {

    let isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper() {

        if (isThrottled) { // (2)
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        func.apply(this, arguments); // (1)

        isThrottled = true;

        setTimeout(function() {
            isThrottled = false; // (3)
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
}

function viewport(document, window) {
    const res = window.innerWidth + "x" + window.innerHeight;
    const el = document.querySelector(".grid");
    el.innerText = res;
}

viewport(document, window);

const throttleViewport = throttle(viewport, 500);

window.addEventListener("resize", () => throttleViewport(document, window));
