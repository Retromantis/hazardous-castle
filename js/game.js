/**
 * @author Victor Zegarra
 * @date 25/12/2025
 */

game_scene = new MiScene();

game_scene.preload = function () {
    this.loadImage('floor_left', 'assets/images/game/floor_left.png');
    this.loadImage('floor_right', 'assets/images/game/floor_right.png');
}

game_scene.create = function () {
    this.floor_left = new MiImage(this.getImage('floor_left'));
    this.add(this.floor_left);
}

