import core from "./basic.js";
import { assert } from "../utils/assert.js";

async function chooseDealer({players, logger, dealToPlayer, dealer, deck, direction}) {
    let candidates = [...players];

    while (candidates.length > 1) {
        const n = candidates.length;
        const scores = new Array(n);
        let max = 0;
        for (let i = 0; i < n; i++) {
            const dealIndex = core.nextPlayer(i, n, direction, dealer);
            const currentPlayer = candidates[dealIndex].getIndex();
            const card = await dealToPlayer(deck, currentPlayer);
            assert(card !== undefined);
            const score = core.cardScore(card);
            logger.log(">> Player " + i + " draws "
                            + core.cardToString(card) + " and gets " + score + " points");
            scores[dealIndex] = score;
            max = Math.max(max, score);
        }
        const newCand = [];
        for (let i = 0; i < n; i++) {
            if (scores[i] === max) {
                newCand.push(candidates[i]);
            }
        }
        candidates = newCand;
    }
    if (candidates.length >= 1) {
        dealer = candidates[0].getIndex();
    } else {
        logger.error("No cand", candidates);
    }
    return dealer;
}

export default chooseDealer;
