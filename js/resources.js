//资源加载器

(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    /* 这是公开访问的资源加载函数 它接受一个指向文件的字符串的数组或者是单个文件的
     * 路径字符串 然后再调用私有的资源加载函数
     */
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            /* 如果开发者传进来一个资源数组 循环访问每个值 然后调用私有的资源加载器 */
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        } else {
            /* 如果传进来的不是一个数组 那么就可以认为参数值是一个字符串
             * 然后立即调用私有的资源加载器即可
             */
            _load(urlOrArr);
        }
    }

    /* 私有资源加载函数 它会被公有的资源加载函数调用 */
    function _load(url) {
        if(resourceCache[url]) {
            /* 如果这个 URL 之前已经被加载了 那么它会被放进我们的资源缓存数组里面
             * 然后直接返回资源文件即可
             */
            return resourceCache[url];
        } else {
            /* 否则 这个 URL 之前没被加载过而且在缓存里面不存在 那么我们得加载这个资源
             */
            var type = url.split('.').pop();
            if(type === 'png') {
                var img = new Image();
                img.onload = function () {
                    /* 一旦我们的图片已经被加载了 就把它放进我们的缓存 然后我们在开发者试图
                     * 在未来再次加载这个图片的时候我们就可以简单的返回即可
                     */
                    resourceCache[url] = img;
                    /* 一旦我们的图片已经被加载和缓存 调用所有我们已经定义的回调函数
                     */
                    if (isReady()) {
                        readyCallbacks.forEach(function (func) {
                            func();
                        });
                    }
                };

                /* 将一开始的缓存值设置成 false 在图片的 onload 事件回调被调用的时候会
                 * 改变这个值 最后 将图片的 src 属性值设置成传进来的 URl
                 */
                resourceCache[url] = false;
                img.src = url;
            }else if(type === 'mp3') {
                var audio = new Audio();
                audio.preload = 'auto';
                audio.onloadeddata = function() {
                    resourceCache[url] = audio;
                    if(isReady()) {
                        readyCallbacks.forEach(function(func) {
                            func();
                        });
                    }
                };
                resourceCache[url] = false;
                audio.src = url;
            }
        }
    }

    /* 这个函数用来让开发者拿到他们已经加载的资源的引用 如果这个资源被缓存了
     * 这个函数的作用和在那个 URL 上调用 load() 函数的作用一样
     */
    function get(url) {
        return resourceCache[url];
    }

    /* 这个函数是检查所有被请求加载的资源是否都已经被加载了
     */
    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    /* 这个函数 会在被请求的函数 都被加载了 这个事件的 回调函数栈里面 增加一个函数 */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /* 用来访问资源的公有对象 */
    window.Resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();
