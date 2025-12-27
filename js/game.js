/**
 * @author Victor Zegarra
 * @date 25/12/2025
 */

game_scene = new MiScene();

const TYPE_BG = 0;
const TYPE_LADDER = 1;


game_scene.preload = function () {
    this.loadImage('top_ground', 'assets/images/game/top_ground.png');
    this.loadImage('bottom_ground', 'assets/images/game/bottom_ground.png');
    this.loadImage('floor', 'assets/images/game/floor.png');
    this.loadImage('player', 'assets/images/game/player.png');
    this.loadImage('ladder', 'assets/images/game/ladder.png');
}

game_scene.create = function () {

    this.map = [
        { bg: 0, entities: [] },
        { bg: 1, entities: [] },
        { bg: 2, entities: [{ type: TYPE_LADDER, x: 140, y: 0 }] },
        { bg: 2, entities: [{ type: TYPE_LADDER, x: 8, y: 0 }] },
        { bg: 2, entities: [{ type: TYPE_LADDER, x: 140, y: 0 }] },
        { bg: 2, entities: [{ type: TYPE_LADDER, x: 8, y: 0 }] },
        { bg: 2, entities: [{ type: TYPE_LADDER, x: 140, y: 0 }] },
        { bg: 0, entities: [{ type: TYPE_LADDER, x: 8, y: 0 }] }
    ];

    this.FLOOR_HEIGHT = 48;

    this.PLAYER_WIDTH = 18;
    this.PLAYER_HEIGHT = 22;
    this.PLAYER_SPEED = 2;


    this.player = new MiSprite(this.getImage('player'), this.PLAYER_WIDTH, this.PLAYER_HEIGHT);
    this.player.setCollider(4, 5, 10, 17);
    this.player.position(0, 0);

    this.player.anims = [];
    this.player.anims[STATE_RUNNING | DIR_LEFT] = { frames: [0, 1], delay: 2, loop: true };
    this.player.anims[STATE_RUNNING | DIR_RIGHT] = { frames: [2, 3], delay: 2, loop: true };

    this.player.setAnimation(this.player.anims[STATE_RUNNING | DIR_LEFT]);

    this.player.update = this.player_update;
    this.player.to_left = this.player_to_left;
    this.player.to_right = this.player_to_right;

    this.player.bounds = { x1: 0, y1: 0, x2: GAME_WIDTH - this.PLAYER_WIDTH, y2: GAME_HEIGHT - this.PLAYER_HEIGHT };

    this.layer = new MiLayer();
    this.add(this.layer);

    this.LADDER_WIDTH = 11;
    this.LADDER_HEIGHT = 48;
}

// game_scene.update = function () {
//     this.super_update(); // Call parent update method first
//     // if (this.layer.y >= 0) {
//     //     this.floors.shift();
//     //     let tile = new MiImage(this.getImage('floor'));
//     // }
// }

game_scene.player_update = function () {
    this.animate();
    this.move(this.vx, this.vy);
    if (this.dir === DIR_UP) {
        this.distance_to_climb -= game_scene.PLAYER_SPEED;
        if (this.distance_to_climb <= 0) {
            this.dir = this.lastdir;
            this.vy = 0;
            if (this.dir === DIR_LEFT) {
                this.to_right();
            } else {
                this.to_left();
            }
        }
        // console.log("Climbing... " + this.distance_to_climb);
        game_scene.layer.move(0, game_scene.PLAYER_SPEED);
        game_scene.y_position += game_scene.PLAYER_SPEED;

        if (game_scene.y_position >= 0) {
            game_scene.remove_floor();
            game_scene.spawn_floor({ bg: 1, entities: [{ type: TYPE_LADDER, x: 140, y: 0 }] }, -game_scene.FLOOR_HEIGHT);
            game_scene.y_position -= game_scene.FLOOR_HEIGHT;
            game_scene.layer.remove(game_scene.player);
            game_scene.layer.add(game_scene.player);
            // console.log("Spawn new floor " + game_scene.y_position);
        }

        return;
    }
    if (this.x < this.bounds.x1) {
        this.x = this.bounds.x1;
        this.to_right();
    } else if (this.x > this.bounds.x2) {
        this.x = this.bounds.x2;
        this.to_left();
    }
}

game_scene.player_to_left = function () {
    this.vx = -game_scene.PLAYER_SPEED;
    this.setAnimation(this.anims[STATE_RUNNING | DIR_LEFT]);
    this.dir = DIR_LEFT;
}

game_scene.player_to_right = function () {
    this.vx = game_scene.PLAYER_SPEED;
    this.setAnimation(this.anims[STATE_RUNNING | DIR_RIGHT]);
    this.dir = DIR_RIGHT;
}

game_scene.start = function () {
    this.layer.clear();
    this.layer.position(0, -this.FLOOR_HEIGHT);

    this.floors = [];
    this.y_position = GAME_HEIGHT - 32
    for (let i = 0; i < this.map.length; i++) {
        this.spawn_floor(this.map[i], this.y_position);
        this.y_position -= this.FLOOR_HEIGHT;
    }
    this.y_position = -this.FLOOR_HEIGHT;

    this.layer.add(this.player);
    this.player.position(GAME_WIDTH_HALF - (this.PLAYER_WIDTH >> 1), GAME_HEIGHT - this.PLAYER_HEIGHT - 80);

    this.player.setAnimation(this.player.anims[STATE_RUNNING | DIR_LEFT]);
    this.player.vx = -this.PLAYER_SPEED;
    this.player.dir = DIR_LEFT;
}

// game_scene.keyDown = function (event) {
//     // console.log(event.key + " " + event.code);
//     switch (event.key) {
//         case 'PageUp':
//             this.layer.move(0, -16);
//             break;
//         case 'PageDown':
//             this.layer.move(0, 16);
//             this.y_position += 16;
//             if (this.y_position >= 0) {
//                 this.remove_floor();
//                 this.spawn_floor({ bg: 1, entities: [] }, -this.FLOOR_HEIGHT);
//                 this.y_position -= this.FLOOR_HEIGHT;
//                 // console.log("Spawn new floor " + this.y_position);
//             }
//             break;
//     }
// }

game_scene.remove_floor = function () {
    let removed_tile = this.floors.shift();
    this.layer.remove(removed_tile);
}

game_scene.spawn_floor = function (floor_data, y_position) {
    let floor = [];
    let tag = 'floor';
    switch (floor_data.bg) {
        case 0:
            tag = 'bottom_ground';
            break;
        case 1:
            tag = 'top_ground';
            break;
        case 2:
            tag = 'floor';
            break;
    }

    let bg = new MiImage(this.getImage(tag));
    this.layer.add(bg);
    bg.position(0, y_position);
    floor.push(bg);

    for (let i = 0; i < floor_data.entities.length; i++) {
        let entity = floor_data.entities[i];
        switch (entity.type) {
            case TYPE_LADDER:
                let ladder = new MiSprite(game_scene.getImage('ladder'), this.LADDER_WIDTH, this.LADDER_HEIGHT);
                this.layer.add(ladder);
                ladder.position(entity.x, y_position - (this.LADDER_HEIGHT - this.FLOOR_HEIGHT));
                ladder.setCollider(0, 0, this.LADDER_WIDTH, this.LADDER_HEIGHT);
                ladder.hasCollided = false;
                ladder.update = game_scene.update_ladder;
                floor.push(ladder);
                break;
        }
    }
    this.floors.push(floor);
}

game_scene.update_ladder = function () {
    if (!this.hasCollided && this.collidesWith(game_scene.player)) {
        this.hasCollided = true;
        game_scene.player.lastdir = game_scene.player.dir;
        game_scene.player.dir = DIR_UP;
        game_scene.player.vx = 0;
        game_scene.player.vy = -game_scene.PLAYER_SPEED;
        game_scene.player.distance_to_climb = game_scene.FLOOR_HEIGHT;
    }
}