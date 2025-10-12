import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import starterFunc from "../../src/js/starter.js";

import clicker from "../helper/clicker.js";
import {delay} from "../../src/js/utils/timer.js";

function fillName(dom, name) {
    const document = dom.window.document;
    const usernameInput = document.getElementById("nameinput");
    assert.ok(usernameInput, "No nameform");
    usernameInput.value = name;
    clicker.clickBySelector(dom, ".namesubmit");
}

function hasPile(hand, pile) {
    const cards = hand.querySelectorAll(".card");
    assert.equal(cards.length, pile.length, "Bad hand");
    for (const p of pile) {
        const card = hand.querySelector(`.card[data-card="${p}"]`);
        assert.ok(card, "No card");
    }
}

function myHandEl(document) {
    return document.querySelector(".my-hand");
}

function makeMove(dom, hand, card) {
    console.log("try click card", card);
    const selector = `.card[data-card="${card}"]`;
    const cardEl = hand.querySelector(selector);
    assert.ok(cardEl, "No card");
    const sprite = cardEl.querySelector(".sprite");
    clicker.clickByElem(dom, sprite);
    console.log("after click card", card);
}

function checkCardOnTable(document, card) {
    const table = document.querySelector(".center-pile");
    const selector = `.card[data-card="${card}"]`;
    const cardEl = table.querySelector(selector);
    assert.ok(cardEl, "No card");
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
    await delay(200);
    fillName(domServer, "Server1");
    fillName(domClient, "Client1");
    await delay(100);
    clicker.clickBySelector(domServer, ".start-button");
    await delay(8000);
    const serverHand = myHandEl(domServer.window.document);
    hasPile(serverHand, [80, 11, 103, 51, 17, 107, 100]);
    assert.ok(true, "Ended well");
});

test("server_and_client_reshuffle", async () => {
    const domServer = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost:8080/?mode=server&channelType=fake&seed=a",
    });
    assert.doesNotReject(starterFunc(domServer.window, domServer.window.document));

    const domClient = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost:8080/?mode=net&channelType=fake&seed=a",
    });
    assert.doesNotReject(starterFunc(domClient.window, domClient.window.document));
    await delay(200);
    fillName(domServer, "Server1");
    fillName(domClient, "Client1");
    await delay(100);
    clicker.clickBySelector(domServer, ".start-button");
    await delay(13000);
    const serverHand = myHandEl(domServer.window.document);
    hasPile(serverHand, [31, 73, 87, 106, 111, 26, 99]);
    checkCardOnTable(domServer.window.document, 91);
    makeMove(domServer, serverHand, 31);
    await delay(1000);
    checkCardOnTable(domServer.window.document, 31);
    const clientHandFunc = () => myHandEl(domClient.window.document);
    hasPile(clientHandFunc(), [46, 79, 52, 19, 44, 95, 30]);
    await delay(300);
    checkCardOnTable(domClient.window.document, 31);
    clicker.clickBySelector(domClient, ".js-draw");
    await delay(100);
    clicker.clickBySelector(domClient, ".js-draw");
    await delay(500);
    hasPile(clientHandFunc(), [46, 79, 52, 19, 44, 95, 30, 77]);
    assert.ok(true, "Ended well");
});
