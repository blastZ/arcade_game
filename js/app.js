
var Enemy = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = 'images/enemy-bug.png';
};

// 用来更新敌人的位置 dt 表示时间间隙
Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt;
    if(this.x > 101 * numCols){
        var row = Math.floor(Math.random() * (numRows - 2) + 1);
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
    this.defense = 0;
    this.sprite = "images/" + this.characters[this.life - 1];
};

Player.prototype.update = function() {
    if(this.checkCollision() === true){
        this.life = this.life - 1;
        if(this.life === 0){
            stopGame();
            ctx.fillStyle = 'white';
            ctx.fillRect(this.life * 101, 101 * numRows, 80, 80);
        }else {
            this.sprite = "images/" + this.characters[this.life - 1];
            ctx.fillStyle = 'white';
            ctx.fillRect(this.life * 101, 101 * numRows, 80, 80);
            this.resetPlayer();
        }
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.resetPlayer = function() {
    this.x = 101 * (numCols - 1) / 2;
    this.y = (numRows - 1) * 83 - 30;
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
            if(this.x - 101 >=0 && !isRock(this.x - 101, this.y)) {
                this.x -= 101;
                isGem(this);
            }
            break;
        }
        case 'up': {
            if(this.y - 83 >= -30 + 83 ) {
                if(!isRock(this.x, this.y - 83)) {
                    this.y -= 83;
                    isGem(this);
                }
            }else {
                if(!isRock(this.x, this.y - 83)) {
                    window.alert("You Win The Game!!!"); //简单的重置人物位置 并没有写进入下一关的函数 不要忘记写
                    this.resetPlayer();
                }
            }
            break;
        }
        case 'right': {
            if(this.x + 101 <= 101 * (numCols - 1) && !isRock(this.x + 101, this.y)){
                this.x += 101;
                isGem(this);
            }
            break;
        }
        case 'down': {
            if(this.y + 83 <= (numRows - 1) * 83 && !isRock(this.x, this.y + 83)){
                this.y += 83;
                isGem(this);
            }
            break;
        }
    }
};

Player.prototype.characters = ["char-boy.png", "char-cat-girl.png", "char-horn-girl.png", "char-pink-girl.png", "char-princess-girl.png"];

//游戏地图的大小 engine中同样有一对地图大小的变量 改变地图时都要修改 ！！！如何修改能使engine和app共用一对行列变量
var numRows = 7,
    numCols = 7;
var allEnemies = [];
var player = new Player((numRows-1)/2 * 101, (numCols-1) * 83 - 30);
var win = false;
for(var i=0; i<4; i++){
    var row = Math.floor(Math.random() * (numRows - 2) + 1);
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
