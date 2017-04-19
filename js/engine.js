
var Engine = (function(global) {
    var numRows, numCols, rocks = [];

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        stop = false;

    var gameMap = []; //用来记录整个地图的框架 0为草地或河 1为石头

    canvas.width = 707;
    canvas.height = 808;
    doc.body.appendChild(canvas);

    // 这个函数是整个游戏的主入口 负责适当的调用 update / render 函数
    function main() {
        /* 如果你想要更平滑的动画过度就需要获取时间间隙 因为每个人的电脑处理指令的
         * 速度是不一样的 我们需要一个对每个人都一样的常数（而不管他们的电脑有多快）
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;
        /* 调用我们的 update / render 函数， 传递事件间隙给 update 函数因为这样
         * 可以使动画更加顺畅。
         */
        update(dt);
        render();

        /* 设置我们的 lastTime 变量，它会被用来决定 main 函数下次被调用的事件。 */
        lastTime = now;

        /* 在浏览准备好调用重绘下一个帧的时候，用浏览器的 requestAnimationFrame 函数
         * 来调用这个函数
         */
        if(stop !== true) {
            win.requestAnimationFrame(main);
        }
    }

    // 这个函数调用一些初始化工作 特别是设置游戏必须的 lastTime 变量 这些工作只用做一次就够了
    function init() {
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

    /* 这个函数做了一些游戏的初始渲染，然后调用 renderEntities 函数。记住，这个函数
     * 在每个游戏的时间间隙都会被调用一次（或者说游戏引擎的每个循环），因为这就是游戏
     * 怎么工作的，他们就像是那种每一页上都画着不同画儿的书，快速翻动的时候就会出现是
     * 动画的幻觉，但是实际上，他们只是不停的在重绘整个屏幕。
     */
    function render() {
        // 保存着游戏关卡的特有的行对应的图片相对路径
        var rowImages = [
                'images/water-block.png',   // 这一行是河。
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

        for(var i=0; i<rocks.length; i++){
            ctx.drawImage(Resources.get(rocks[i].sprite), rocks[i].x * 101, rocks[i].y * 83 - 30);
        }

        renderEntities();
    }

    var Rock = function(x, y) {
        this.x = x;
        this.y = y;
        this.sprite = 'images/Rock.png';
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
        numRows = 7;
        numCols = 7;
        player.life = 5;
        player.sprite = "images/char-boy.png";
        player.resetPlayer();
        var heartImage = Resources.get('images/myHeart.png');
        for(var i=0; i<player.life; i++){
            ctx.drawImage(heartImage, i * 101, 101 * numRows, 80, 80);
        }

        var rockNum = 5;// 有可能填满河岸下的所有格子 多块石头可能重叠 需要修复
        rocks = [];
        for(var i=0; i<rockNum; i++){
            var y = Math.floor(Math.random() * (numRows - 2)) + 1;
            var x = Math.floor(Math.random() * numCols);
            rocks.push(new Rock(x, y));
        }

        gameMap = [];
        for(var i=0; i<numRows; i++){
            var row = [];
            for(var j=0; j<numCols; j++){
                var flag = 0;
                for(var k=0; k<rocks.length; k++){
                    var a_rock = rocks[k];
                    if(a_rock.y === i && a_rock.x === j) {
                        flag = 1;
                        break
                    }
                }
                row.push(flag);
            }
            gameMap.push(row);
        }
        console.log(gameMap);

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
        'images/Rock.png'
    ]);
    Resources.onReady(init);

    var restartGame = function(){
        stop = false;
        var restartGameButton = doc.getElementsByTagName('button')[0];
        var div = restartGameButton.parentElement;//每次留下div标签对 需要修复
        div.removeChild(restartGameButton);
        init();
    };

    var stopGame = function(){
        stop = true;
        var divTag = doc.createElement('div');
        var restartGameButton = doc.createElement('button');
        var buttonName = doc.createTextNode("Restart");
        restartGameButton.appendChild(buttonName);
        divTag.appendChild(restartGameButton);
        doc.body.appendChild(divTag);
        restartGameButton.addEventListener("click", restartGame); //在点击多次restart（30+）后游戏开始变得卡顿 需要修复
    };

    //检测运动方向上的石块
    var isRock = function(x, y) {
        console.log(x / 101 + "----" + Math.ceil(y / 83));
        console.log(gameMap);
        if(gameMap[Math.ceil(y / 83)][x / 101] === 1){
            return true;
        }
        return false;
    };

    global.ctx = ctx;
    global.resetGame = reset;
    global.stopGame = stopGame;
    global.isRock = isRock;
})(this);
