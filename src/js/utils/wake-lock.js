// Create a reference for the Wake Lock.
export default function lokker(logger, document) {
    let wakeLock = null;

    // create an async function to request a wake lock
    async function lock() {
        try {
            if (!navigator || !navigator.wakeLock) {
                logger.log("no wake lock");
                return;
            }
            wakeLock = await navigator.wakeLock.request("screen");
            logger.log("Awake");
        } catch (err) {
            logger.error("wakeLock rejected", err);
        }
    }

    function init(elem) {
        if (elem) {
            elem.addEventListener("dblclick", ()=>{
                lock();
                document.addEventListener("visibilitychange", async () => {
                    logger.log("visibilitychange", document.visibilityState);
                    if (document.visibilityState === "visible") {
                        await lock();
                    }
                });
            });
        }
    }

    function release() {
        if (!wakeLock) {
            return;
        }
        wakeLock.release().then(() => {
            wakeLock = null;
        });
    }
    return {lock, init, release};
}
