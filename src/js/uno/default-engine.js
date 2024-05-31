import core from "./basic.js";

function emptyPlayer() {
    return {score: 0, pile: []};
}
function emptyPlayers(count) {
    const playersRaw = [];
    for (let i = 0; i < count; ++i) {
        playersRaw.push(emptyPlayer());
    }
    return playersRaw;
}

export default function emptyEngine(settings, count) {
    const playersRaw = emptyPlayers(count);
    const dealer = 0;
    const direction = 1;
    const deckRaw = [];
    const discardPile = [];
    const currentPlayer = 0;
    const cardTaken = 0;
    const cardDiscarded = 0;
    const gameState = core.GameStage.CHOOSE_DEALER;
    const maxScore = settings.maxScore || 500;
    return {
        playersRaw,
        dealer,
        direction,
        deckRaw,
        discardPile,
        currentPlayer,
        gameState,
        cardTaken,
        cardDiscarded,
        maxScore
    };
}
