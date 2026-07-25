function toggleFullScreen(elem) {
    if (!document.fullscreenElement) {
        // If the document is not in full screen mode
        // make the video full screen
        elem.requestFullscreen();
    } else {
        // Otherwise exit the full screen
        document.exitFullscreen?.();
    }
}

function fullScreen() {
    const body = document.querySelector('body');
    body.addEventListener("dblclick", (e) => {
        console.log(e.target);
        toggleFullScreen(body);
    });
}
fullScreen();
