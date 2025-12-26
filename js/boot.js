/**
 * @author Victor Zegarra
 * @date 25/12/2025
 */

GAME_WIDTH = 160;
GAME_HEIGHT = 400;

GAME_WIDTH_HALF = GAME_WIDTH >> 1;
GAME_HEIGHT_HALF = GAME_HEIGHT >> 1;

document.addEventListener("DOMContentLoaded", () => {
    player_dies = new Audio('assets/sfx/player_dies.mp3');
    player_dies.volume = 0.1;
    bg_music = new Audio('assets/sfx/bg_music.wav');
    bg_music.loop = true;
    bg_music.volume = 1;

    game = createGame(null, 0, 0, GAME_WIDTH, GAME_HEIGHT, false);
    game.addScene('game', game_scene);
    game.startScene('game');
});