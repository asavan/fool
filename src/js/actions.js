"use strict";

function init(game) {
    return {
        'move': (data) => {
            console.log("try to move " + JSON.stringify(data));
            return game.onChange(data);
        },
        'dealer': (n) => {
            console.log("try to set dealer " + JSON.stringify(n));
            return game.setDealer(n);
        },
        'username': false,
        'start': (p) => {
            console.log(p);
            return game.onStart(p);
        },
        'shuffle': (p) => {
            console.log(p);
            return game.onShuffle(p);
        },

        'draw': ({playerIndex, card}) => {
            console.log({playerIndex, card});
            return game.onDraw(playerIndex, card);
        },
        'changeCurrent': (currentData) => {
            console.log("Change current");
            return game.onChangeCurrent(currentData);
        },
        'clearPlayer': (cur) => {
            console.log("clearPlayer", cur);
            return game.onClearHand(cur);
        },
        'discard': (p) => {
            console.log("Discard", p);
            return game.onDiscard(p);
        },
        'roundover': (p) => {
            console.log("new round", p);
            return game.onNewRound(p);
        },
        'gameover': (p) => {
            console.log("game over", p);
            return game.onGameOver(p);
        },
        'pass': false
    };
}

export default init;
