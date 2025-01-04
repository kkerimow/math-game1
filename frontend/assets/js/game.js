// frontend/assets/js/game.js
const params = new URLSearchParams(window.location.search);
const gameId = params.get('gameId');

async function fetchGameDetails() {
    try {
        const response = await fetch(`http://localhost:5000/api/games/${gameId}`);
        const game = await response.json();

        const players = game.players.map(p => p.username).join(' vs ');
        document.querySelector('.scoreboard').textContent = players;
    } catch (error) {
        console.error('Error fetching game details:', error);
    }
}

fetchGameDetails();
