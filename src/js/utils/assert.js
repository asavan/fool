export function assert(b, message) {
    if (!__USE_DEBUG_ASSERT__) {
        return;
    }
    if (b) return;
    console.error(message);
    console.trace(message);
    throw message;
}
