
var Enemy = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = 'images/enemy-bug.png';
};

// 用来更新敌人的位置 dt 表示时间间隙
Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt;
    if(this.x > 101 * 5){
        var row = Math.floor(Math.random() * 4 + 1);
        this.speed = Math.floor(Math.random() * 400) +50;
        this.y = row * 83 -20;
        this.x = -2 * 101;
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
    this.sprite = "images/" + this.characters[this.life - 1];
};

Player.prototype.update = function(dt) {
    if(this.checkCollision() === true){
        this.life = this.life - 1;

        if(this.life === 0){
            stopGame();
            ctx.fillStyle = 'white';
            ctx.fillRect(this.life * 101, 606, 80, 80);
        }else {
            this.sprite = "images/" + this.characters[this.life - 1];
            ctx.fillStyle = 'white';
            ctx.fillRect(this.life * 101, 606, 80, 80);
            this.resetPlayer();
        }
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.resetPlayer = function() {
    this.x = 101 * 2;
    this.y = 5 * 83 - 30;
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

//处理键盘方向键输入
Player.prototype.handleInput = function(direction) {
    switch(direction) {
        case 'left': {
            if(this.x - 101 >=0 && isRock(this.x - 101, this.y) === false) {
                this.x -= 101;
            }
            break;
        }
        case 'up': {
            if(this.y - 83 >= -30 + 83 ) {
                if(isRock(this.x, this.y - 83) === false)
                    this.y -= 83;
            }else {
                if(isRock(this.x, this.y - 83) === false) {
                    window.alert("You Win The Game!!!");
                    this.resetPlayer();
                }
            }
            break;
        }
        case 'right': {
            if(this.x + 101 <= 404 && isRock(this.x + 101, this.y) === false){
                this.x += 101;
            }
            break;
        }
        case 'down': {
            if(this.y + 83 <= 385 && isRock(this.x, this.y + 83) === false){
                this.y += 83;
            }
            break;
        }
    }
};

//检测运动方向上的石块
var isRock = function(x, y) {
    if(gameMap[Math.ceil(y / 83)][x / 101] === 1){
        return true;
    }
    return false;
};

Player.prototype.characters = ["char-boy.png", "char-cat-girl.png", "char-horn-girl.png", "char-pink-girl.png", "char-princess-girl.png"];

var numRows = 5,
    numCols = 6;
var allEnemies = [];
var player = new Player((numRows-1)/2 * 101, (numCols-1) * 83 - 30);
var win = false;
for(var i=0; i<4; i++){
    var row = Math.floor(Math.random() * 4 + 1);
    var speed = Math.floor(Math.random() * 400) +50;
    allEnemies.push(new Enemy(-2 * 101, row * 83 - 20, speed));
}

document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
