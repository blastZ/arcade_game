
var Enemy = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = 'images/enemy-bug.png';
};

// 用来更新敌人的位置 dt 表示时间间隙
Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt;
    if(this.x > BLOCK_WITH * numCols){
        var row = Math.floor(Math.random() * (numRows - 2) + 1);
        this.speed = Math.floor(Math.random() * 400) +50;
        this.y = row * BLOCK_HEIGHT -20;
        this.x = -2 * BLOCK_WITH;
    }
    // 每一次的移动都乘以 dt 参数 以此来保证游戏在所有的电脑上 都是以同样的速度运行
};

Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

var Player = function(x, y) {
    this.x = x;
    this.y = y;
    this.life = 5;
    this.defense = 0;
    this.characters = ["char-princess-girl.png", "char-horn-girl.png", "char-pink-girl.png", "char-cat-girl.png", "char-boy.png"];
    this.sprite = "images/" + this.characters[this.life - 1];
    this.score = 0;
    this.targetScore = 1;
    this.level = 1;
};

Player.prototype.update = function() {
    if(this.checkCollision() === true){
        if(this.defense > 0) {
            this.defense -= 5;
            myPainter.paintShield();
        }else {
            Resources.get('sounds/lost_life.mp3').play();
            this.life -= 1;
            if(this.life === 0){
                stopGame('lose');
                myPainter.paintHeart();
            }else {
                this.sprite = "images/" + this.characters[this.life - 1];
                myPainter.paintHeart();
                this.resetPlayer();
            }
        }
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.resetPlayer = function() {
    this.x = BLOCK_WITH * (numCols - 1) / 2;
    this.y = (numRows - 1) * BLOCK_HEIGHT - 30;
};

Player.prototype.move = function(direction) {
    var move_sound = Resources.get('sounds/move.mp3');
    move_sound.volume = 0.1;
    move_sound.play();
    switch(direction) {
        case 'left': {
            if(this.x - BLOCK_WITH >=0 && !isRock(this.x - BLOCK_WITH, this.y)) {
                this.x -= BLOCK_WITH;
                isGem(this);
            }
            break;
        }
        case 'up': {
            if(this.y - BLOCK_HEIGHT >= -30 + BLOCK_HEIGHT ) {
                if(!isRock(this.x, this.y - BLOCK_HEIGHT)) {
                    this.y -= BLOCK_HEIGHT;
                    isGem(this);
                }
            }else {
                if(!isRock(this.x, this.y - BLOCK_HEIGHT)) {
                    if(player.beyondTargetScore() === true) {
                        player.score = Math.floor(player.score / 2);
                        stopGame('win');
                    }else {
                        Resources.get('sounds/error.mp3').play();
                    }
                }
            }
            break;
        }
        case 'right': {
            if(this.x + BLOCK_WITH <= BLOCK_WITH * (numCols - 1) && !isRock(this.x + BLOCK_WITH, this.y)){
                this.x += BLOCK_WITH;
                isGem(this);
            }
            break;
        }
        case 'down': {
            if(this.y + BLOCK_HEIGHT <= (numRows - 1) * BLOCK_HEIGHT && !isRock(this.x, this.y + BLOCK_HEIGHT)){
                this.y += BLOCK_HEIGHT;
                isGem(this);
            }
            break;
        }
    }
};

//碰撞检测 遭遇敌人后 设置碰撞 flag 为 true 并返回
Player.prototype.checkCollision = function() {
    var flag = false;
    allEnemies.forEach(function(enemy){
        if(enemy.y-10 === player.y){
            if(enemy.x-60 < player.x && player.x < enemy.x+60 ){
                flag = true;
            }
        }
    });
    return flag;
};

Player.prototype.beyondTargetScore = function() {
    if(this.score >= this.targetScore) {
        return true;
    }
    return false;
};

//处理键盘输入
Player.prototype.handleInput = function(keyword) {
    switch(keyword) {
        case 'left': {
            this.move('left');
            break;
        }
        case 'up': {
            this.move('up');
            break;
        }
        case 'right': {
            this.move('right');
            break;
        }
        case 'down': {
            this.move('down');
            break;
        }
        case 'space': {
            isStarGate();
        }
    }
};

//游戏地图的大小
var BLOCK_WITH = 101,
    BLOCK_HEIGHT = 83,
    numRows = 7 , //当改变 numRows 时 还需要改变 engine 的 rowImages
    numCols = 9 + 2;
var allEnemies = [];
var player = new Player((numRows-1)/2 * BLOCK_WITH, (numCols-1) * BLOCK_HEIGHT - 30);
var winGame = false;
function addEnemies() {
    for(var i=0; i<4; i++){
        var row = Math.floor(Math.random() * (numRows - 2) + 1);
        var speed = Math.floor(Math.random() * 400) + 80;
        allEnemies.push(new Enemy(-2 * BLOCK_WITH, row * BLOCK_HEIGHT - 20, speed));
    }
}
addEnemies();
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
