
var Engine = (function(global) {
    var props = [];

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        stop = {stopFlag: false, typeFlag: 'lose'}, //stopFlag 标记停止或继续游戏 typeFlag 标记输赢
        heartImage, //生命值图片
        shieldImage, //防御图片
        gameTime; //游戏时间

    var gameMap = []; //用来记录整个地图的框架 0为普通块 1为石头 2为蓝宝石 3为绿宝石 4为橙宝石

    canvas.width = numCols * 101;
    canvas.height = numRows * 101 + 101;
    doc.body.appendChild(canvas);

    // 这个函数是整个游戏的主入口 负责适当的调用 update / render 函数
    function main() {
        // 如果想要更平滑的动画过度就需要获取时间间隙 因为每个人的电脑处理指令的速度是不一样的 我们需要一个对每个人都一样的常数（而不管他们的电脑有多快）
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;
        // 调用 update / render 函数 传递事件间隙给 update 函数因为这样可以使动画更加顺畅
        update(dt);
        render();

        // 设置 lastTime 变量 它会被用来决定 main 函数下次被调用的事件
        lastTime = now;

        if(stop.stopFlag !== true) {
            win.requestAnimationFrame(main);
        }else {
            if(stop.typeFlag === 'lose') {
                myPainter.paintGameOver();
                myPainter.paintRestartMessage();
                Resources.get('sounds/game_over.mp3').play();
            }else {
                myPainter.paintGameWin();
                myPainter.paintNextMessage();
                Resources.get('sounds/next_level.mp3').play();
            }
        }
    }

    // 这个函数调用一些初始化工作 特别是设置游戏必须的 lastTime 变量 这些工作只用做一次就够了
    function init() {
        var bg_sound = Resources.get('sounds/bg_sound.mp3');
        bg_sound.volume = 0.1;
        bg_sound.play();
        reset();
        lastTime = Date.now();
        main();
    }

    //每一个时间间隙更新状态
    function update(dt) {
        updateEntities(dt);
    }

    //这些更新函数应该只聚焦于更新和对象相关的数据/属性 把重绘的工作交给 render 函数。
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    //初始渲染 内部调用 renderEntities 函数 在每个游戏的时间间隙都会被调用一次
    function render() {
        // 保存着游戏关卡的特有的行对应的图片相对路径
        var rowImages = [
                'images/water-block.png',   // 这一行是河
                'images/stone-block.png',   // 第一行石头
                'images/stone-block.png',   // 第二行石头
                'images/stone-block.png',   // 第三行石头
                'images/stone-block.png',   // 第四行石头
                'images/grass-block.png',   // 第一行草地
                'images/grass-block.png'    // 第二行草地
            ],
            row, col;

        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        for(var i=0; i<props.length; i++){
            if(props[i].constructor === Rock) {
                ctx.drawImage(Resources.get(props[i].sprite), props[i].x * 101, props[i].y * 83 - 30);
            }else if(props[i].constructor === BlueGem || props[i].constructor === GreenGem || props[i].constructor === OrangeGem) {
                ctx.drawImage(Resources.get(props[i].sprite), props[i].x * 101 + 7, props[i].y * 83 - 9, 85, 135);
            }
        }
        myPainter.paintTimeBar();//当切换到其它标签页时 paintTimeBar 会停止
        renderEntities();
    }

    //石头类
    var Rock = function() {
        this.x = Math.floor(Math.random() * numCols);
        this.y = Math.floor(Math.random() * (numRows - 2)) + 1;
        this.sprite = 'images/Rock.png';
    };

    //宝石类
    var Gem = function() {
        this.x = Math.floor(Math.random() * numCols);
        this.y = Math.floor(Math.random() * (numRows - 2)) + 1;
    };
    Gem.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * 83)
    };

    //蓝宝石子类
    var BlueGem = function() {
        Gem.call(this);
        this.sprite = 'images/gem_blue.png';
    };
    BlueGem.prototype = Object.create(Gem.prototype);
    BlueGem.prototype.constructor = BlueGem;

    //绿宝石子类
    var GreenGem = function() {
        Gem.call(this);
        this.sprite = 'images/gem_green.png';
    };
    GreenGem.prototype = Object.create(Gem.prototype);
    GreenGem.prototype.constructor = GreenGem;

    //橙宝石子类
    var OrangeGem = function() {
        Gem.call(this);
        this.sprite = 'images/gem_orange.png';
    };
    OrangeGem.prototype = Object.create(Gem.prototype);
    OrangeGem.prototype.constructor = OrangeGem;

    var myPainter = {
        paintHeart: function() {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 101 * numRows, 202, 101);
            ctx.drawImage(heartImage, 0, 101 * numRows, 80, 80);
            ctx.fillStyle = 'black';
            ctx.font = '40px serif';
            ctx.fillText(':', 90, 101 * numRows + 60);
            ctx.font = '50px serif';
            ctx.fillText(player.life, 101 + 25, 101 * numRows + 65);
        },
        paintShield: function() {
            ctx.fillStyle = 'white';
            ctx.fillRect(202, 101 * numRows, 303, 101);
            ctx.drawImage(shieldImage, 220, 101 * numRows, 80, 80);
            ctx.fillStyle = 'black';
            ctx.font = '40px serif';
            ctx.fillText(':', 310, 101 * numRows + 60);
            ctx.font = '50px serif';
            ctx.fillText(player.defense + '%', 321 + 25, 101 * numRows + 65);
        },
        paintGameOver: function() {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 8;
            ctx.font = '80px sans-serif';
            ctx.strokeText('Game Over !', (numCols / 2 - 2) * 101 - 30, (numRows / 2 - 1) * 101);
            ctx.fillStyle = 'white';
            ctx.font = '80px sans-serif';
            ctx.fillText('Game Over !', (numCols / 2 - 2) * 101 - 30, (numRows / 2 - 1) * 101);
        },
        paintRestartMessage: function() {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 6;
            ctx.font = '30px sans-serif';
            ctx.strokeText('press Enter to restart game', (numCols / 2 - 2) * 101, (numRows / 2) * 101 - 20);
            ctx.fillStyle = 'white';
            ctx.font = '30px sans-serif';
            ctx.fillText('press Enter to restart game', (numCols / 2 - 2) * 101, (numRows / 2) * 101 - 20);
            doc.addEventListener('keyup', function(e){
                if(e.keyCode === 13 && stop.stopFlag === true && stop.typeFlag === 'lose') {
                    restartGame();
                }
            });
        },
        paintGameWin: function() {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 8;
            ctx.font = '80px sans-serif';
            ctx.strokeText('You Win !', (numCols / 2 - 2) * 101 + 15, (numRows / 2 - 1) * 101);
            ctx.fillStyle = 'white';
            ctx.font = '80px sans-serif';
            ctx.fillText('You Win !', (numCols / 2 - 2) * 101 + 15, (numRows / 2 - 1) * 101);
        },
        paintNextMessage: function() {
           ctx.strokeStyle = 'black';
           ctx.lineWidth = 6;
           ctx.font = '30px sans-serif';
           ctx.strokeText('press Enter to start next level', (numCols / 2 - 2) * 101, (numRows / 2) * 101 - 20);
           ctx.fillStyle = 'white';
           ctx.font = '30px sans-serif';
           ctx.fillText('press Enter to start next level', (numCols / 2 - 2) * 101, (numRows / 2) * 101 - 20);
           doc.addEventListener('keyup', function(e){
               if(e.keyCode === 13 && stop.stopFlag === true && stop.typeFlag === 'win') {
                   Resources.get('sounds/enter_sound.mp3').play();
                   nextLevel();
               }
           });
        },
        paintTimeBar: function() {
            ctx.beginPath();
            ctx.moveTo(0, (numRows - 1) * 83 + 171);
            ctx.lineTo(numCols * 101, (numRows - 1) * 83 + 171);
            ctx.strokeStyle = '#ffe34b';
            ctx.lineWidth = 8;
            ctx.stroke();
            ctx.beginPath();
            gameTime.timeRemain -= gameTime.timeInterval;
            ctx.moveTo(numCols * 101 / gameTime.totalTime * gameTime.timeRemain, (numRows - 1) * 83 + 171);
            ctx.lineTo(numCols * 101, (numRows - 1) * 83 + 171);
            ctx.strokeStyle = '#797979';
            ctx.lineWidth = 8;
            ctx.stroke();
            if(gameTime.timeRemain <= 0) {
                stopGame('lose');
            }
        },
        paintScore: function() {
            ctx.fillStyle = 'white';
            ctx.fillRect((numCols - 3) * 101, 101 * numRows - 60, 303, 202);
            ctx.drawImage(Resources.get('images/Star.png'), (numCols - 3) * 101 + 30, 101 * numRows - 56, 95, 161);
            ctx.fillStyle = 'black';
            ctx.font = '40px serif';
            ctx.fillText(':', (numCols - 2) * 101 + 36, 101 * numRows + 60);
            ctx.font = '50px serif';
            ctx.fillText('0', (numCols - 2) * 101 + 47 + 25, 101 * numRows + 65);
        }
    };

    var GameTime = function() {
        this.totalTime = 10000;
        this.timeRemain = 10000;
        this.timeInterval = 5;
    };

    //在每个时间间隙被 render 函数调用 绘制所有 enemy 和 player
    function renderEntities() {
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    //处理游戏重置逻辑 执行初始化和restart操作 只会被init调用一次
    function reset() {
        if(stop.typeFlag === 'lose') {
            player.life = 5;
            player.defense = 0;
            player.sprite = 'images/' + player.characters[player.life - 1];
        }
        player.resetPlayer();
        heartImage = Resources.get('images/myHeart.png');
        shieldImage = Resources.get('images/shield.png');
        myPainter.paintHeart();
        myPainter.paintShield();
        myPainter.paintScore();

        var rockNum = 5;// 极小概率 石头数等于列数时 所有石块在一行上 需要修复
        var gemNum = 3;// 总的宝石个数 蓝绿橙三种宝石个数随机
        props = [];
        for(var i=0; i<rockNum; i++) {
            var rock;
            do {
                rock = new Rock();
            }while(isRepeat(rock.x, rock.y));
            props.push(rock);
        }

        var blueGemNum = Math.floor(Math.random() * (gemNum + 1));
        var greenGemNum = Math.floor(Math.random() * (gemNum - blueGemNum + 1));
        var orangeGemNum = gemNum - blueGemNum - greenGemNum;
        console.log(blueGemNum+ " " +greenGemNum+ " " +orangeGemNum); //输出三种宝石个数 调试完成后删除
        for(var j=0; j<blueGemNum; j++) {
            do {
                blueGem = new BlueGem();
            }while(isRepeat(blueGem.x, blueGem.y));
            props.push(blueGem);
        }
        for(var j=0; j<greenGemNum; j++) {
            do {
                greenGem = new GreenGem();
            }while(isRepeat(greenGem.x, greenGem.y));
            props.push(greenGem);
        }
        for(var j=0; j<orangeGemNum; j++) {
            do {
                orangeGem = new OrangeGem();
            }while(isRepeat(orangeGem.x, orangeGem.y));
            props.push(orangeGem);
        }


        console.log(props); //输出小道具数组 测试完成后删除
        gameMap = [];

        for(var i=0; i<numRows; i++){
            var row = [];
            for(var j=0; j<numCols; j++){
                var flag = 0;
                for(var k=0; k<props.length; k++){
                    var a_object = props[k];
                    if(a_object.y === i && a_object.x === j) {
                        if(props[k].constructor === OrangeGem) {
                            flag = 4;
                        }
                        if(props[k].constructor === GreenGem) {
                            flag = 3;
                        }
                        if(props[k].constructor === BlueGem) {
                            flag = 2;
                        }else if(props[k].constructor === Rock) {
                            flag = 1;
                        }
                        break;
                    }
                }
                row.push(flag);
            }
            gameMap.push(row);
        }
        console.log(gameMap); //输出游戏地图 测试完成后删除

        gameTime = new GameTime();

    }

    // 加载绘制游戏关卡的图片 回调init函数 图片加载完毕的时候游戏开始
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/myHeart.png',
        'images/Rock.png',
        'images/gem_blue.png',
        'images/gem_green.png',
        'images/gem_orange.png',
        'images/shield.png',
        'images/Star.png',
        'sounds/move.mp3',
        'sounds/eat_gem.mp3',
        'sounds/next_level.mp3',
        'sounds/game_over.mp3',
        'sounds/bg_sound.mp3',
        'sounds/enter_sound.mp3'
    ]);
    Resources.onReady(init);

    var restartGame = function(){
        stop.stopFlag = false;
        allEnemies = [];
        addEnemies();
        init();
    };

    var nextLevel = function() {
        stop.stopFlag = false;
        allEnemies = [];
        addEnemies();
        init();
    };

    //检查新创建的小道具在 props 数组中是否有重叠项
    var isRepeat = function(x, y) {
        for(var i=0; i<props.length; i++) {
            if(props[i].x === x && props[i].y === y) {
                return true;
            }
        }
        return false;
    };

    //停止游戏
    var stopGame = function(type){
        stop.stopFlag = true;
        stop.typeFlag = type;
    };

    //检测运动方向上的石块
    var isRock = function(x, y) {
        if(gameMap[Math.ceil(y / 83)][x / 101] === 1) {
            return true;
        }
        return false;
    };

    //检测运动方向上的宝石
    var isGem = function(player) {
        if(gameMap[Math.ceil(player.y / 83)][player.x / 101] === 2) {
            eatGem(player, 'blue');
        }else if(gameMap[Math.ceil(player.y / 83)][player.x / 101] === 3) {
            eatGem(player, 'green');
        }else if(gameMap[Math.ceil(player.y / 83)][player.x / 101] === 4) {
            eatGem(player, 'orange');
        }
        return 0;
    };

    //拾取运动方向上的宝石
    var eatGem = function(player, gemType) {
        Resources.get('sounds/eat_gem.mp3').play();
        switch(gemType) {
            case 'blue': {
                player.defense += 50;
                if(player.defense > 100) palyer.defense = 100;
                for(var i=0; i<props.length; i++) {
                    if(props[i].constructor === BlueGem) {
                        //人物的x y 已经乘了 101 和 83 小道具的x y还没有
                        if(player.x === (props[i].x * 101) && player.y === (props[i].y * 83 - 30)) {
                            break;
                        }
                    }
                }
                myPainter.paintShield();
                gameMap[props[i].y][props[i].x] = 0; //地图上该点重置
                props.splice(i, 1); //道具移除
                break;
            }
            case 'green': {
                if(player.life < 5 ) {
                    player.life += 1;
                    player.sprite = "images/" + player.characters[player.life - 1];
                    player.render();
                    myPainter.paintHeart();
                }
                for(var i=0; i<props.length; i++) {
                    if(props[i].constructor === GreenGem) {
                        if(player.x === (props[i].x * 101) && player.y === (props[i].y * 83 - 30)) {
                            break;
                        }
                    }
                }
                gameMap[props[i].y][props[i].x] = 0;
                props.splice(i, 1);
                break;
            }
            case 'orange': {
                gameTime.timeRemain += 1000; //增加 1 秒剩余时间
                if(gameTime.timeRemain > gameTime.totalTime) {
                    gameTime.timeRemain = gameTime.totalTime;
                }
                allEnemies.forEach(function(enemy) {
                    enemy.speed -= 200;
                    if(enemy.speed < 0) enemy.speed = 80;
                    setTimeout(function() {
                        enemy.speed += 200;
                    },2000)
                });//没有写player属性变化
                for(var i=0; i<props.length; i++) {
                    if(props[i].constructor === OrangeGem) {
                        if(player.x === (props[i].x * 101) && player.y === (props[i].y * 83 - 30)) {
                            break;
                        }
                    }
                }
                gameMap[props[i].y][props[i].x] = 0;
                props.splice(i, 1);
                break;
            }
        }
    };

    global.ctx = ctx;
    global.resetGame = reset;
    global.stopGame = stopGame;
    global.isRock = isRock;
    global.isGem = isGem;
    global.myPainter = myPainter;
})(this);
