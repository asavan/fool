function safe_query(document, selector) {
    if (!selector) {
        return null
    }
    return document.querySelector(selector);
}

export {
    safe_query
}
