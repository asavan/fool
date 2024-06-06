import {drawBack} from "../../src/js/views/basic_views.js";
import {delay} from "../../src/js/utils/timer.js";
import randomFunc from "../../src/js/utils/random.js";
import settings from "../../src/js/settings.js";

async function shuffle(settings) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");
    const backOld = list.querySelector(".sprite-back");
    const backCont = backOld.parentElement;

    const movingCards = [];
    for (let i = 0; i < 15; ++i) {
        const backClone = drawBack(document);
        backClone.classList.add("absolute", "above", "long-animation");
        backCont.insertBefore(backClone, backOld);
        movingCards.push(backClone);
    }

    const randDiff = (size) => randomFunc.randomInteger(-size, size, Math.random);
    const betweenCardMove = () => delay(settings.shuffleSmallDelay* Math.random());
    await betweenCardMove();
    for (let k = 0; k < 2; ++k) {
        for (const elem of movingCards) {
            elem.style.setProperty("--dx", randDiff(150));
            elem.style.setProperty("--dy", randDiff(170));
            elem.classList.add("slide");
            await betweenCardMove();
        }
        await delay(settings.shuffleOutDelay);
        for (const elem of movingCards) {
            elem.classList.remove("slide");
            await betweenCardMove();
        }
        await delay(settings.shuffleInDelay);
    }
    await delay(settings.shuffleWaitDelay);
    for (const elem of movingCards) {
        elem.remove();
    }
}

shuffle(settings);

export default shuffle;
