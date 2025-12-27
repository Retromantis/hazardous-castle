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

    this.FLOOR_HEIGHT = 48;

    this.PLAYER_WIDTH = 18;
    this.PLAYER_HEIGHT = 22;
    this.PLAYER_SPEED = 2;
    this.PLAYER_JUMP_IMPULSE = -4;
    this.PLAYER_JUMP_GRAVITY = 0.4;

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
    if (this.jumping) {
        this.vy += game_scene.PLAYER_JUMP_GRAVITY;
        if (this.y >= this.START_Y) {
            this.y = this.START_Y;
            this.vy = 0;
            this.jumping = false;
        }
    }

    if (this.dir === DIR_UP) {
        this.distance_to_climb -= game_scene.PLAYER_SPEED;
        if (this.distance_to_climb <= 0) {
            if (this.scroll_remain > 0) {
                // let scroll_amount = Math.min(this.scroll_remain, game_scene.PLAYER_SPEED);
                game_scene.layer.move(0, this.scroll_remain);
                game_scene.top_floor_y += this.scroll_remain;
                // this.scroll_remain = 0;
            }
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
        game_scene.top_floor_y += game_scene.PLAYER_SPEED;

        if (game_scene.top_floor_y >= 0) {
            if (this.scroll_remain > 0) {
                game_scene.layer.position(0, game_scene.last_layer_y + game_scene.FLOOR_HEIGHT);
                this.position(this.x, this.START_Y);
            }
            game_scene.top_floor_y = 0;
            game_scene.remove_floor();
            let new_floor = game_scene.spawn_floor();
            game_scene.add_floor(new_floor, -game_scene.FLOOR_HEIGHT);
            game_scene.top_floor_y -= game_scene.FLOOR_HEIGHT;
            game_scene.layer.remove(game_scene.player);
            game_scene.layer.add(game_scene.player);
            // console.log("Spawn new floor " + game_scene.top_floor_y);
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
    let nFloors = Math.floor(GAME_HEIGHT / this.FLOOR_HEIGHT);
    this.top_floor_y = nFloors * this.FLOOR_HEIGHT;

    this.ladder_dir = DIR_NONE;

    this.add_floor({ bg: 0, entities: [] }, this.top_floor_y);
    this.top_floor_y -= this.FLOOR_HEIGHT;
    this.add_floor({ bg: 1, entities: [] }, this.top_floor_y);
    this.top_floor_y -= this.FLOOR_HEIGHT;

    for (let i = 0; i < nFloors; i++) {
        let floor_data = this.spawn_floor();
        this.add_floor(floor_data, this.top_floor_y);
        this.top_floor_y -= this.FLOOR_HEIGHT;
    }
    this.top_floor_y = -this.FLOOR_HEIGHT;

    this.layer.add(this.player);
    this.player.position(GAME_WIDTH_HALF - (this.PLAYER_WIDTH >> 1), (nFloors * this.FLOOR_HEIGHT) - this.FLOOR_HEIGHT - this.PLAYER_HEIGHT);
    this.player.START_Y = this.player.y;

    this.player.setAnimation(this.player.anims[STATE_RUNNING | DIR_LEFT]);
    this.player.vx = -this.PLAYER_SPEED;
    this.player.dir = DIR_LEFT;
    this.player.jumping = false;
}

game_scene.keyDown = function (event) {
    console.log(event.key + " " + event.code);
    switch (event.code) {
        case 'Space':
            this.jump();
            break;
    }
}

game_scene.touchStart = function (x, y) {
    this.jump();
}

game_scene.jump = function () {
    if (!this.player.jumping) {
        this.player.vy = this.PLAYER_JUMP_IMPULSE;
        this.player.jumping = true;
    }
}

game_scene.remove_floor = function () {
    let removed_tile = this.floors.shift();
    this.layer.remove(removed_tile);
}

game_scene.spawn_floor = function () {
    let floor_data = {
        bg: 2,
        entities: []
    }
    let x = 8;
    switch (this.ladder_dir) {
        case DIR_NONE:
            this.ladder_dir = Math.floor(Math.random() * 2) + 1;
            if (this.ladder_dir === DIR_RIGHT) {
                x = 140;
            }
            break;
        case DIR_LEFT:
            this.ladder_dir = DIR_RIGHT;
            x = 140;
            break;
        case DIR_RIGHT:
            this.ladder_dir = DIR_LEFT;
            x = 8;
            break;
    }
    let ladder = { type: TYPE_LADDER, x: x, y: 0 };
    floor_data.entities.push(ladder);

    return floor_data;
}

game_scene.add_floor = function (floor_data, top_floor_y) {
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
    bg.position(0, top_floor_y);
    floor.push(bg);

    for (let i = 0; i < floor_data.entities.length; i++) {
        let entity = floor_data.entities[i];
        switch (entity.type) {
            case TYPE_LADDER:
                let ladder = new MiSprite(game_scene.getImage('ladder'), this.LADDER_WIDTH, this.LADDER_HEIGHT);
                this.layer.add(ladder);
                ladder.position(entity.x, top_floor_y - (this.LADDER_HEIGHT - this.FLOOR_HEIGHT));
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
        let player = game_scene.player;
        game_scene.last_layer_y = game_scene.layer.y;
        player.lastdir = game_scene.player.dir;
        player.dir = DIR_UP;
        player.vx = 0;
        player.vy = -game_scene.PLAYER_SPEED;
        player.distance_to_climb = game_scene.FLOOR_HEIGHT;
        player.scroll_remain = 0;
        if (player.jumping) {
            player.jumping = false;
            player.distance_to_climb -= (player.START_Y - Math.floor(player.y));
            player.scroll_remain = game_scene.FLOOR_HEIGHT - player.distance_to_climb;
        }
    }
}