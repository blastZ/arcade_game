
var Engine = (function(global) {
    var numRows, numCols, props = [];

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        stop = false;

    var gameMap = []; //用来记录整个地图的框架 0为草地或河 1为石头 2为蓝宝石

    canvas.width = 707;
    canvas.height = 808;
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

        //在浏览准备好调用重绘下一个帧的时候 用浏览器的 requestAnimationFrame 函数来调用这个函数
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
            }else if(props[i].constructor === BlueGem) {
                ctx.drawImage(Resources.get(props[i].sprite), props[i].x * 101 + 5, props[i].y * 83 - 20, 91, 150);
            }
        }

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

        var rockNum = 5;// 极小概率 石头数等于列数时 所有石块在一行上 需要修复
        var gemNum = 3;// 宝石个数 先只考虑蓝宝石 记得后续加上
        props = [];
        for(var i=0; i<rockNum; i++) {
            var rock;
            do {
                rock = new Rock();
            }while(isRepeat(rock.x, rock.y));
            props.push(rock);
        }
        for(var i=0; i<gemNum; i++) {
            var blueGem;
            do {
                blueGem = new BlueGem();
            }while(isRepeat(blueGem.x, blueGem.y));
            props.push(blueGem);
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
        'images/gem_orange.png'
    ]);
    Resources.onReady(init);

    var restartGame = function(){
        stop = false;
        var div = document.getElementsByTagName('div')[0];
        document.body.removeChild(div);
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
        if(gameMap[Math.ceil(y / 83)][x / 101] === 1) {
            return true;
        }
        return false;
    };

    //检测运动方向上的宝石
    var isGem = function(player) {
        if(gameMap[Math.ceil(player.y / 83)][player.x / 101] === 2) {
            eatGem(player, 'blue');
        }
        return 0;
    };

    //拾取运动方向上的宝石
    var eatGem = function(player, gemType) {
        switch(gemType) {
            case 'blue': {
                player.defense += 1; //还没有写 防御减少的函数
                var result = -1;
                for(var i=0; i<props.length; i++) {
                    if(props[i].constructor === BlueGem) {
                        //人物的x y 已经乘了 101 和 83 小道具的x y还没有
                        if(player.x === (props[i].x * 101) && player.y === (props[i].y * 83 - 30)) {
                            result = i;
                            break;
                        }
                    }
                }
                props.splice(i, 1);
                break;
            }
            case 'green':break;
            case 'orange':break;
        }
    };

    global.ctx = ctx;
    global.resetGame = reset;
    global.stopGame = stopGame;
    global.isRock = isRock;
    global.isGem = isGem;
})(this);
