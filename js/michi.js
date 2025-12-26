/**
 * Minimalist 2D game engine
 * @author Victor Zegarra (Retromantis)
 * @date 21/12/2025
 * @version 1.01
 */

const GAME_FPS = 25;

// Player direction constants
const DIR_NONE = 0;
const DIR_LEFT = 1;
const DIR_RIGHT = 2;
const DIR_UP = 4;
const DIR_DOWN = 8;

//  Player state constants
const STATE_NONE = 16;
const STATE_IDLE = 32;
const STATE_WALKING = 64;
const STATE_RUNNING = 128;
const STATE_ROLLING = 256;
const STATE_SPINNING = 512;
const STATE_CROUCHING = 1024;
const STATE_SLIDING = 2048;
const STATE_JUMPING = 4096;
const STATE_FALLING = 8192;
const STATE_ATTACKING = 16384;
const STATE_HURT = 32768;
const STATE_DYING = 65536;
const STATE_DEAD = 131072;
// Example: Player is running to left = STATE_RUNNING | DIR_LEFT

// Game states constants
const GAME_IDLE = -1;
const GAME_PLAYING = -2;
const GAME_PAUSED = -3;
const GAME_OVER = -4;
const GAME_VICTORY = -5;

let requestAnimationFrame;

function random(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Carga un archivo de audio.
 *
 * @param {string} filename - El nombre del archivo de audio.
 * @param {function} callback - La función a llamar cuando el audio se haya cargado.
 * @returns {Audio} El objeto de audio cargado.
 */
function loadAudio(filename, callback) {
    var audio = new Audio();
    audio.src = filename;
    audio.onloadeddata = callback;
    audio.load();
    return audio;
}

/**
 * Carga un archivo de imagen.
 *
 * @param {string} filename - El nombre del archivo de imagen.
 * @param {function} callback - La función a llamar cuando la imagen se haya cargado.
 * @returns {Image} El objeto de imagen cargado.
 */
function loadImage(filename, callback) {
    var image = new Image();
    image.src = filename;
    image.onload = callback;
    return image;
}

function createGame(canvas_id, canvas_width, canvas_height, game_width, game_height, smooth) {
    currscene = new MiScene();   // Dummy Scene

    WINDOW_WIDTH = window.innerWidth;
    WINDOW_HEIGHT = window.innerHeight;

    //    alert("Scene size: " + WINDOW_WIDTH + "x" + WINDOW_HEIGHT);

    CANVAS_WIDTH = canvas_width || WINDOW_WIDTH;
    CANVAS_HEIGHT = canvas_height || WINDOW_HEIGHT;

    GAME_WIDTH = game_width || CANVAS_WIDTH;
    GAME_HEIGHT = game_height || CANVAS_HEIGHT;

    if (CANVAS_WIDTH > WINDOW_WIDTH) CANVAS_WIDTH = WINDOW_WIDTH;
    if (CANVAS_HEIGHT > WINDOW_HEIGHT) CANVAS_HEIGHT = WINDOW_HEIGHT;

    let scale = Math.min(CANVAS_WIDTH / GAME_WIDTH, CANVAS_HEIGHT / GAME_HEIGHT);
    let final_canvas_width = Math.floor(GAME_WIDTH * scale);
    let final_canvas_height = Math.floor(GAME_HEIGHT * scale);

    if (canvas_id) {
        canvas = document.getElementById(canvas_id);
    } else {
        canvas = document.createElement('canvas');
    }
    canvas.width = final_canvas_width;
    canvas.height = final_canvas_height;

    canvas.style.background = "#000000";

    document.addEventListener("keydown", keyDownListener, false);
    document.addEventListener("keyup", keyUpListener, false);

    document.addEventListener("mousedown", mouseDownListener, false);
    // document.addEventListener("mousemove", mouseMoveListener, false);
    document.addEventListener("mouseup", mouseUpListener, false);
    document.addEventListener("touchstart", touchStartListener, { passive: false });
    // document.addEventListener("touchmove", touchMoveListener, false);
    document.addEventListener("touchend", touchEndListener, { passive: false });

    // window.addEventListener("resize", () => {
    //     const width = window.innerWidth;
    //     const height = window.innerHeight;

    //     console.log(`Nuevo tamaño: ${width} x ${height}`);
    // });


    SCALE_WIDTH = canvas.width / GAME_WIDTH;
    SCALE_HEIGHT = canvas.height / GAME_HEIGHT;

    ctx = canvas.getContext('2d');
    ctx.scale(SCALE_WIDTH, SCALE_HEIGHT);

    if (smooth == false) {
        ctx.imageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
    }

    if (!canvas_id) {
        div_canvas = document.createElement("div");
        div_canvas.style.position = "absolute";
        div_canvas.style.left = ((WINDOW_WIDTH - canvas.width) >> 1) + "px";
        div_canvas.style.top = ((WINDOW_HEIGHT - canvas.height) >> 1) + "px";

        document.body.appendChild(div_canvas);
        div_canvas.appendChild(canvas);
    }

    let clientRect = canvas.getBoundingClientRect();
    canvasX = clientRect.left;
    canvasY = clientRect.top;


    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    fpsInterval = 1000 / GAME_FPS;
    lastTime = Date.now();

    return new MiGame();
}

function main_loop() {
    let now = Date.now();
    let elapsed = now - lastTime;

    if (elapsed > fpsInterval) {
        lastTime = now - (elapsed % fpsInterval);

        currscene.update();
        currscene.draw(ctx);
    }
    window.requestAnimationFrame(main_loop);
}

function keyDownListener(event) {
    event.preventDefault();
    currscene.keyDown(event);
}

function keyUpListener(event) {
    event.preventDefault();
    currscene.keyUp(event);
}

function mouseDownListener(event) {
    var x = Math.floor((event.clientX - canvasX) / SCALE_WIDTH);
    var y = Math.floor((event.clientY - canvasY) / SCALE_HEIGHT);
    // console.log(`Mouse down at: ${x}, ${y}`);
    currscene.touchStart(x, y);
}

function mouseUpListener(event) {
    var x = Math.floor((event.clientX - canvasX) / SCALE_WIDTH);
    var y = Math.floor((event.clientY - canvasY) / SCALE_HEIGHT);
    currscene.touchEnd(x, y);
}

function touchStartListener(event) {
    event.preventDefault();
    var touch = event.changedTouches[0];
    var x = Math.floor((touch.pageX - canvasX) / SCALE_WIDTH);
    var y = Math.floor((touch.pageY - canvasY) / SCALE_HEIGHT);
    // console.log(`Touch down at: ${x}, ${y}`);
    currscene.touchStart(x, y);
}

function touchEndListener(event) {
    event.preventDefault();
    var touch = event.changedTouches[0];
    var x = Math.floor((touch.pageX - canvasX) / SCALE_WIDTH);
    var y = Math.floor((touch.pageY - canvasY) / SCALE_HEIGHT);
    currscene.touchEnd(x, y);
}

// function mouseDownListener(event) {
//     var x = (event.clientX - canvasX) / SCALE_WIDTH;
//     var y = (event.clientY - canvasY) / SCALE_HEIGHT;
//     currscene.ontouch(this, PRESSED, x, y);
// }
// 
// function mouseMoveListener(event) {
//     var x = (event.clientX - canvasX) / SCALE_WIDTH;
//     var y = (event.clientY - canvasY) / SCALE_HEIGHT;
//     currscene.ontouch(this, MOVED, x, y);
// }
// 
// function mouseUpListener(event) {
//     var x = (event.clientX - canvasX) / SCALE_WIDTH;
//     var y = (event.clientY - canvasY) / SCALE_HEIGHT;
//     currscene.ontouch(this, RELEASED, x, y);
// }
// 
// function touchStartListener(event) {
//     event.preventDefault();
//     var touch = event.changedTouches[0];
//     currscene.ontouch(this, PRESSED, touch.pageX, touch.pageY);
// }
// 
// function touchMoveListener(event) {
//     event.preventDefault();
//     var touch = event.changedTouches[0];
//     currscene.ontouch(this, MOVED, touch.pageX, touch.pageY);
// }
// 
// function touchEndListener(event) {
//     event.preventDefault();
//     var touch = event.changedTouches[0];
//     currscene.ontouch(this, RELEASED, touch.pageX, touch.pageY);
// }


/*
    MiGame
*/

function MiGame() {
    this.scenes = [];
    this.sceneTags = [];
    this.nPreload = 0;
}

MiGame.prototype.preload = function (scene, callback) {
    var loadedCounter = scene.preloadImages.length;
    if (loadedCounter > 0) {
        scene.preloadImages.forEach((item) => {
            item.image = loadImage(item.file, () => {
                loadedCounter--;
                if (loadedCounter == 0) {
                    callback();
                }
            });
        });
    } else callback();
}

MiGame.prototype.addScene = function (tag, scene) {
    if (scene instanceof MiScene) {
        this.sceneTags.push(tag);
        this.nPreload++;
        scene.tag = tag;
        scene.preload();
        this.preload(scene, () => {
            this.nPreload--;
            this.scenes[tag] = scene;
        });
    }
}

MiGame.prototype.startScene = function (tag, param) {
    if (this.nPreload > 0) {
        this.createScene(tag, param);
    } else {
        let scene = this.scenes[tag];
        if (scene instanceof MiScene) {
            currscene = scene;
            currscene.start(param);
            window.requestAnimationFrame(main_loop);
        }
    }
}

MiGame.prototype.createScene = function (tag, param) {
    let id = setInterval(() => {
        if (this.nPreload <= 0) {
            clearInterval(id);
            for (let tag of this.sceneTags) {
                let scene = this.scenes[tag];
                scene.create();
                scene.super_update = MiScene.prototype.update;
                scene.super_draw = MiScene.prototype.draw;
            }
            this.startScene(tag, param);
        }
    }, 100);
}


/*
    MiRect
*/

function MiRect() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
}

MiRect.prototype.inBounds = function (px, py) {
    return ((px >= this.x) && (px < (this.x + this.width)) && (py >= this.y) && (py < (this.y + this.height)));
}

MiRect.prototype.collidesWith = function (rect) {
    if ((this.x + this.width) <= rect.x) return false;
    if (this.x >= (rect.x + rect.width)) return false;
    if ((this.y + this.height) <= rect.y) return false;
    return this.y < (rect.y + rect.height);
}


/*
    MiDrawable
*/

function MiDrawable() {
    this.parent = undefined;

    // last position x,y
    this.lx = 0;
    this.ly = 0;

    // content rectangle: x,y,width,height
    this.cx = 0;
    this.cy = 0;
    this.cwidth = 0;
    this.cheight = 0;

    // anchor x,y
    this.ax = 0;
    this.ay = 0;

    // relative x,y from parent
    this.px = 0;
    this.py = 0;

    // if drawable must be centered (x,y)
    this.centerX = 0;
    this.centerY = 0;
}

// MiDrawable extends NickRect
MiDrawable.prototype = Object.create(MiRect.prototype);

// if visible then draw it
MiDrawable.prototype.isVisible = true;

MiDrawable.prototype.position = function (x, y) {
    this.lx = this.ax;
    this.x = this.ax = x;
    if (this.centerX) {
        this.x -= (this.width >> 1);
    }
    this.ly = this.ay;
    this.y = this.ay = y;
    if (this.centerY) {
        this.y -= (this.height >> 1);
    }
    this.cx = this.x;
    this.cy = this.y;

    if (this.parent) {
        this.px = this.ax - this.parent.x;
        this.py = this.ay - this.parent.y;
    }
}

MiDrawable.prototype.move = function (x, y) {
    this.position(this.ax + x, this.ay + y);
}

MiDrawable.prototype.draw = function (context) { }

MiDrawable.prototype.update = function () { }


/*
    MiImage
*/

function MiImage(image) {
    if (image instanceof Image) {
        this.setImage(image);
    }
}

MiImage.prototype = Object.create(MiDrawable.prototype);

MiImage.prototype.setImage = function (image) {
    this.image = image;
    this.x = 0;
    this.y = 0;
    this.ax = 0;
    this.ay = 0;
    this.width = this.image.width;
    this.height = this.image.height;
    this.cwidth = this.width;
    this.cheight = this.height;
}

MiImage.prototype.draw = function (context) {
    context.drawImage(this.image, this.x, this.y);
}


/*
    MiSprite
*/

MiSprite = function (image, frameWidth, frameHeight) {
    this.x = 0;
    this.y = 0;
    // direction, horizontal speed, vertical speed
    this.dir = DIR_NONE;
    this.state = STATE_NONE;
    this.vx = 0;
    this.vy = 0;
    this.id = 0;

    this.image = image;
    this.bAnimated = false;

    this.frameCount;
    this.frameIndex;

    this.frameAnim = [];
    this.frameAnimIndex = 0;
    this.frameAnimCount = 0;
    this.frameAnimDelay = 0;
    this.frameAnimLoop = false;

    this.width = this.image.width;
    this.height = this.image.height;

    this.frameWidth = frameWidth || this.width;
    this.frameHeight = frameHeight || this.height;

    this.cols = Math.floor(this.width / this.frameWidth);
    this.rows = Math.floor(this.height / this.frameHeight);

    this.frameCount = this.cols * this.rows;
    this.frames = new Array(this.frameCount);
    for (let idx = 0; idx < this.frameCount; idx++) {
        this.frames[idx] = new Array(12);
    }
    idx = 0;
    for (var row = 0, ofsy = 0; row < this.rows; row++, ofsy += this.frameHeight) {
        for (var col = 0, ofsx = 0; col < this.cols; col++, ofsx += this.frameWidth) {
            this.frames[idx][0] = ofsx;
            this.frames[idx][1] = ofsy;
            this.frames[idx][2] = this.frameWidth;
            this.frames[idx][3] = this.frameHeight;
            this.frames[idx][4] = 0;
            this.frames[idx][5] = 0;
            this.frames[idx][6] = this.frameWidth;
            this.frames[idx][7] = this.frameHeight;
            // this.frames[idx][8] = 0;
            // this.frames[idx][9] = 0;
            // this.frames[idx][10] = this.frameWidth;
            // this.frames[idx][11] = this.frameHeight;
            idx++;
        }
    }

    this.width = frameWidth;
    this.height = frameHeight;
    this.cwidth = this.width;
    this.cheight = this.height;
    this.frameIndex = 0;
}

MiSprite.prototype = Object.create(MiDrawable.prototype);

MiSprite.prototype.setImage = function (image) {
    this.image = image;
}

MiSprite.prototype.getFrameWidth = function () {
    return this.frames[this.frameIndex][2];
}

MiSprite.prototype.getFrameHeight = function () {
    return this.frames[this.frameIndex][3];
}

MiSprite.prototype.setAnimation = function (animation) {
    this.frameAnimLoop = animation.loop;
    this.frameAnimTag = animation.tag;
    this.frameAnimIndex = 0;
    if (animation == null) {
        this.frameAnim = new Array(this.frameCount);
        for (var idx = 0; idx < this.frameCount; idx++) {
            this.frameAnim[idx] = idx;
        }
    } else {
        this.frameAnim = animation.frames;
    }
    this.frameIndex = this.frameAnim[this.frameAnimIndex];
    this.updateCollider();
    this.bAnimated = this.frameAnim.length > 1;
    this.frameAnimDelay = animation.delay;
}

MiSprite.prototype.setFrame = function (index, fromSeq) {
    // if(fromSeq && this.frameAnim != null) {
    if (this.frameAnim) {
        this.frameAnimIndex = index;
        this.frameIndex = this.frameAnim[this.frameAnimIndex];
    } else {
        this.frameIndex = index;
    }
    this.updateCollider();
}

MiSprite.prototype.getFrame = function (fromAnim) {
    if (fromAnim && this.frameAnim != null) {
        return this.frameAnim[this.frameAnimIndex];
    } else return this.frameIndex;
}

MiSprite.prototype.animate = function () {
    if (this.bAnimated) {
        if (this.frameAnimCount > this.frameAnimDelay) {
            this.frameAnimCount = 0;
            if (this.frameAnimIndex < (this.frameAnim.length - 1)) {
                this.frameAnimIndex++;
            } else if (this.frameAnimLoop) {
                this.frameAnimIndex = 0;
            } else {
                this.onEndAnimation(this.frameAnimTag);
            }
            this.frameIndex = this.frameAnim[this.frameAnimIndex];
            this.updateCollider();
        } else {
            this.frameAnimCount++;
        }
    }
}

MiSprite.prototype.onEndAnimation = function (tag) { }

MiSprite.prototype.draw = function (context) {
    if (this.isVisible && this.frameIndex >= 0) {
        context.drawImage(this.image, this.frames[this.frameIndex][0], this.frames[this.frameIndex][1],
            this.frames[this.frameIndex][2], this.frames[this.frameIndex][3], this.x, this.y,
            this.frames[this.frameIndex][2], this.frames[this.frameIndex][3]);

        // /* for debugging */
        // context.strokeStyle = "#FF00FF";
        // context.strokeRect(this.cx, this.cy, this.cwidth, this.cheight);

        // if(typeof this.coll !== 'undefined') {
        //     context.strokeStyle="#00FFFF";
        //     context.strokeRect(this.coll.x,this.coll.y,this.coll.width,this.coll.height);
        // }
    }
}

MiSprite.prototype.update = function () { }

MiSprite.prototype.position = function (x, y) {
    let frameIndex = this.frameIndex < 0 ? 0 : this.frameIndex;
    this.lx = this.ax;
    this.x = this.ax = x;
    if (this.centerX) {
        this.x -= (this.frames[frameIndex][2] >> 1);
    }
    this.ly = this.ay;
    this.y = this.ay = y;
    if (this.centerY) {
        this.y -= (this.frames[frameIndex][3] >> 1);
    }
    this.updateCollider();

    if (this.parent) {
        this.px = this.ax - this.parent.x;
        this.py = this.ay - this.parent.y;
    }
}

MiSprite.prototype.setCollider = function (ofsX, ofsY, width, height) {
    for (var idx = 0; idx < this.frameCount; idx++) {
        this.frames[idx][4] = ofsX;
        this.frames[idx][5] = ofsY;
        this.frames[idx][6] = width;
        this.frames[idx][7] = height;
    }
    this.updateCollider();
}

// MiSprite.prototype.setCollRect = function(x, y, width, height) {
//     for(var idx=0; idx < this.frameCount; idx++) {
//         this.frames[idx][8]  = x;
//         this.frames[idx][9]  = y;
//         this.frames[idx][10] = width;
//         this.frames[idx][11] = height;
//     }
//     if(typeof this.coll === 'undefined') {
//         this.coll = new MiRect();
//     }
//     this.updateCollider();
// }

MiSprite.prototype.setColliderIndex = function (idx, ofsx, ofsy, width, height) {
    this.frames[idx][4] = ofsx;
    this.frames[idx][5] = ofsy;
    this.frames[idx][6] = width;
    this.frames[idx][7] = height;
    this.updateCollider();
}

// MiSprite.prototype.setCollRectIndex = function(idx, x, y, width, height) {
//     this.frames[idx][8]  = x;
//     this.frames[idx][9]  = y;
//     this.frames[idx][10] = width;
//     this.frames[idx][11] = height;
//     if(typeof this.coll === 'undefined') {
//         this.coll = new MiRect();
//     }
//     this.updateCollider();
// }

MiSprite.prototype.updateCollider = function () {
    let frameIndex = this.frameIndex < 0 ? 0 : this.frameIndex;
    this.cx = this.x + this.frames[frameIndex][4];
    this.cy = this.y + this.frames[frameIndex][5];
    this.cwidth = this.frames[frameIndex][6];
    this.cheight = this.frames[frameIndex][7];
    // if(typeof this.coll !== 'undefined') {
    //     this.coll.x = this.x + this.frames[index][8];
    //     this.coll.y = this.y + this.frames[index][9];
    //     this.coll.width  = this.frames[index][10];
    //     this.coll.height = this.frames[index][11];
    // }
}

MiSprite.prototype.inBounds = function (x, y) {
    return ((x >= this.cx) && (x < (this.cx + this.cwidth)) && (y >= this.cy) && (y < (this.cy + this.cheight)));
}

MiSprite.prototype.collidesWith = function (drawable) {
    if ((this.cx + this.cwidth) <= drawable.cx) return false;
    if (this.cx >= (drawable.cx + drawable.cwidth)) return false;
    if ((this.cy + this.cheight) <= drawable.cy) return false;
    return this.cy < (drawable.cy + drawable.cheight);
}

MiSprite.prototype.collidesRect = function (rect) {
    if ((this.cx + this.cwidth) <= rect.x) return false;
    if (this.cx >= (rect.x + rect.width)) return false;
    if ((this.cy + this.cheight) <= rect.y) return false;
    return this.cy < (rect.y + rect.height);
}


/*
    MiNumber
*/

MiNumber = function (image, frameWidth, frameHeight) {
    this.value = '0';
    this.spacing = 0;

    this.x = 0;
    this.y = 0;

    this.image = image;
    this.width = this.image.width;
    this.height = this.image.height;

    this.cols = Math.floor(this.width / frameWidth);
    this.rows = Math.floor(this.height / frameHeight);

    this.frameCount = this.cols * this.rows;
    this.frames = new Array(this.frameCount);
    for (let idx = 0; idx < this.frameCount; idx++) {
        this.frames[idx] = new Array(8);
    }
    idx = 0;
    for (var row = 0, ofsy = 0; row < this.rows; row++, ofsy += frameHeight) {
        for (var col = 0, ofsx = 0; col < this.cols; col++, ofsx += frameWidth) {
            this.frames[idx][0] = ofsx;
            this.frames[idx][1] = ofsy;
            this.frames[idx][2] = frameWidth;
            this.frames[idx][3] = frameHeight;
            idx++;
        }
    }

    this.width = frameWidth;
    this.height = frameHeight;
}

MiNumber.prototype = Object.create(MiDrawable.prototype);

MiNumber.prototype.setValue = function (value) {
    let number = 0;
    if (Number.isInteger(value)) {
        number = Math.abs(value);
    }
    this.value = number.toString();
    let count = this.value.length;
    this.width = 0;
    for (let idx = 0; idx < count; idx++) {
        let frame = this.value.charCodeAt(idx) - 48;
        this.width += this.frames[frame][2] + this.spacing;
    }
    this.position(this.ax, this.ay);
}

MiNumber.prototype.position = function (x, y) {
    this.x = this.ax = x;
    if (this.centerX) {
        this.x -= (this.width >> 1);
    }
    this.y = this.ay = y;
    if (this.centerY) {
        this.y -= (this.height >> 1);
    }
    if (this.parent) {
        this.px = this.ax - this.parent.x;
        this.py = this.ay - this.parent.y;
    }
}


MiNumber.prototype.draw = function (context) {
    // if(this.isVisible) {
    let count = this.value.length;
    let ofsX = this.x;
    for (let idx = 0; idx < count; idx++) {
        let frame = this.value.charCodeAt(idx) - 48;
        context.drawImage(this.image, this.frames[frame][0], this.frames[frame][1],
            this.frames[frame][2], this.frames[frame][3], ofsX, this.y,
            this.frames[frame][2], this.frames[frame][3]);
        ofsX += this.frames[frame][2] + this.spacing;
    }
    // }
}


/*
    MiPath
*/

function MiPath(sprite, path, id) {
    this.sprite = sprite;
    this.path = path;
    this.id = id || 0;
    this.rewind();
}

MiPath.prototype.rewind = function () {
    this.idx = 0;
    this.delay = this.path[0][0];
    this.vx = this.path[0][1];
    this.vy = this.path[0][2];
}

MiPath.prototype.nextStep = function () {
    if (--this.delay < 0) {
        if (++this.idx >= this.path.length) {
            if (this.onEndPath(this.id)) {
                this.rewind();
            }
        } else {
            this.delay = this.path[this.idx][0];
            this.vx = this.path[this.idx][1];
            this.vy = this.path[this.idx][2];
        }
    } else {
        this.sprite.move(this.vx, this.vy);
    }
}

MiPath.prototype.onEndPath = function (id) {
    return true;
}


/*
    MiText
*/

function MiText(font) {
    this.font = font;
    this.text = '';
    this.x = 0;
    this.y = 0;
    this.style = 'black';
    this.align = 'left';
    this.baseline = 'top';
}

MiText.prototype = Object.create(MiDrawable.prototype);

MiText.prototype.draw = function (context) {
    context.font = this.font;
    context.fillStyle = this.style;
    context.textAlign = this.align;
    context.textBaseline = this.baseline;
    context.fillText(this.text, this.x, this.y);
}


/*
    MiRunnable
*/

function MiRunnable() { }

MiRunnable.prototype.run = function (sender) { }


/*
    MiLayer
*/

function MiLayer() {
    this.x = 0;
    this.y = 0;
    this.width = 0;//parent.width;
    this.height = 0;//parent.height;
    this.drawables = [];
    this.updateables = [];
}

MiLayer.prototype = Object.create(MiDrawable.prototype);

MiLayer.prototype.nDrawables = 0;
MiLayer.prototype.nUpdateables = 0;

// MiLayer.prototype.drawables = [];
// MiLayer.prototype.updateables = [];

MiLayer.prototype.create = function () { }

MiLayer.prototype.add = function (child) {
    if (child instanceof MiDrawable) {
        child.parent = this;
        this.drawables.push(child);
        this.nDrawables++;

        if (typeof child.update === 'function') {
            this.updateables.push(child);
            this.nUpdateables++;
        }
    }
}

MiLayer.prototype.remove = function (child) {
    if (child instanceof MiDrawable) {
        this.drawables.forEach((item, index) => {
            if (item === child) {
                this.drawables.splice(index, 1);
                this.nDrawables--;

                if (typeof (child.update) === 'function') {
                    this.updateables.forEach((item, index) => {
                        if (item === child) {
                            this.updateables.splice(index, 1);
                            this.nUpdateables--;
                        }
                    });
                }
            }
        });
    }
}

MiLayer.prototype.draw = function (context) {
    for (var idx = 0; idx < this.nDrawables; idx++) {
        let drawable = this.drawables[idx];
        if (drawable.isVisible) {
            drawable.draw(context);
        }
    }
    // /* for debugging */
    // context.strokeStyle = "#FF00FF";
    // context.strokeRect(this.x, this.y, this.width, this.height);
}

MiLayer.prototype.update = function () {
    for (var idx = 0; idx < this.nUpdateables; idx++) {
        let updateable = this.updateables[idx];
        if (updateable.isVisible) {
            updateable.update();
        }
    }
}

MiLayer.prototype.setCollider = function (ofsX, ofsY, width, height) {
    this.ofsX = ofsX;
    this.ofsY = ofsY;
    this.cwidth = width;
    this.cheight = height;
}

MiLayer.prototype.move = function (ofsX, ofsY) {
    this.position(this.x + ofsX, this.y + ofsY);
}

MiLayer.prototype.position = function (x, y) {
    let lastX = this.x;
    let lastY = this.y;

    this.lx = this.ax;
    this.x = this.ax = x;
    if (this.centerX) {
        this.x -= (this.width >> 1);
    }
    this.ly = this.ay;
    this.y = this.ay = y;
    if (this.centerY) {
        this.y -= (this.height >> 1);
    }
    // console.log(`Layer X: ${this.x}, ${this.cx}`);
    // console.log(`Layer Y: ${this.y}, ${this.cy}`);
    this.cx = this.x + this.ofsX;
    this.cy = this.y + this.ofsY;

    if (this.parent) {
        this.px = this.ax - this.parent.x;
        this.py = this.ay - this.parent.y;
    }

    let ofsX = this.x - lastX;
    let ofsY = this.y - lastY;

    for (var idx = 0; idx < this.nDrawables; idx++) {
        let drawable = this.drawables[idx];
        drawable.move(ofsX, ofsY);
        drawable.px = drawable.ax - this.x;
        drawable.py = drawable.ay - this.y;
    }
}


/*
    MiScene
*/

function MiScene() {
    this.x = 0;
    this.y = 0;
    this.state = 0;
    this.drawables = [];
    this.updateables = [];
    this.preloadImages = [];
}

MiScene.prototype = Object.create(MiLayer.prototype);

MiScene.prototype.loadImage = function (tagname, filename) {
    this.preloadImages.push({ tag: tagname, file: filename, image: null });
}

MiScene.prototype.getImage = function (tagname) {
    return (this.preloadImages.find(imagen => imagen.tag === tagname)).image;
}

MiScene.prototype.preload = function () { }

MiScene.prototype.start = function () { }

MiScene.prototype.create = function () { }

MiScene.prototype.keyDown = function (event) { }

MiScene.prototype.keyUp = function (event) { }

MiScene.prototype.touchDown = function (x, y) { }

MiScene.prototype.touchUp = function (x, y) { }

MiScene.prototype.onBack = function () { }
