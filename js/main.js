/* DEADMISTRY - Main Entry Point */
let game = null;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // Menu buttons
    document.getElementById('btn-play').addEventListener('click', () => {
        showScreen('game-screen');
        game = new Game();
        game.start();
    });

    document.getElementById('btn-encyclopedia').addEventListener('click', () => {
        initEncyclopedia();
        showScreen('encyclopedia-screen');
    });

    document.getElementById('btn-how-to-play').addEventListener('click', () => {
        showScreen('howto-screen');
    });

    // Back buttons
    document.getElementById('enc-back').addEventListener('click', () => {
        showScreen('menu-screen');
    });

    document.getElementById('howto-back').addEventListener('click', () => {
        showScreen('menu-screen');
    });

    // Game over buttons
    document.getElementById('btn-restart').addEventListener('click', () => {
        if (game) game.stop();
        game = new Game();
        game.start();
        document.getElementById('game-over').classList.add('hidden');
    });

    document.getElementById('btn-menu').addEventListener('click', () => {
        if (game) game.stop();
        showScreen('menu-screen');
    });
});
