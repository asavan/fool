import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import starterFunc from "../../src/js/starter.js";

import clicker from "../helper/clicker.js";
import {delay} from "../../src/js/utils/timer.js";

function fillName(dom, name) {
    const document = dom.window.document;
    const usernameInput = document.getElementById("nameinput");
    usernameInput.value = name;
    clicker.clickBySelector(dom, ".namesubmit");
}


test("server_and_client", async () => {
    const domServer = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost:8080/?mode=server&channelType=fake&seed=h",
    });
    assert.doesNotReject(starterFunc(domServer.window, domServer.window.document));

    const domClient = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost:8080/?mode=net&channelType=fake&seed=h",
    });
    assert.doesNotReject(starterFunc(domClient.window, domClient.window.document));
    await delay(100);
    fillName(domServer, "Server1");
    fillName(domClient, "Client1");
    await delay(100);
    clicker.clickBySelector(domServer, ".start-button");
    assert.ok(true, "Ended well");
});
