(function () {
    var cancelAnimationFrame = window.cancelAnimationFrame;
    var requestAnimationFrame = window.requestAnimationFrame;
    var currentAnimationFrameRequests = {};

    var imageData = null;
    var imgFetchThrottleId = null;
    var img = new Image();
    var iteration = 0;
    var MAX_ITERATION = 4500;
    var fullPageReady = false;
    img.crossOrigin = 'Anonymous';

    img.addEventListener('load', start, false);
    window.addEventListener('load', onLoadWindow);
    window.addEventListener('resize', onResizeWindow);

    function fullPageIt() {
        $el = $('#fullpage');

        if (fullPageReady) {
            $.fn.fullpage.destroy($el);
        } else {
            fullPageReady = true;
        }

        $el.fullpage();
    }

    function onLoadWindow() {
        fullPageIt();

        var windowInnerSize = getWindowInnerSize();

        if (windowInnerSize.width >= 800) {
            fetchNewImage();
        }
    }


    function onResizeWindow() {
        var windowInnerSize = getWindowInnerSize();

        cancelAnimationFrameRequests();
        fitIntroEffectsCanvasToWindow();

        fullPageIt();

        if (windowInnerSize.width >= 800) {
            if (imgFetchThrottleId !== null) {
                clearTimeout(imgFetchThrottleId);
            }

            imgFetchThrottleId = setTimeout(function () {
                fetchNewImage();
                imgFetchThrottleId = null;
            }, 1000);
        }
    }


    function isDevice () {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }


    function getWindowInnerSize() {
        var innerWidth;
        var innerHeight;

        if (isDevice()) {
            innerWidth =  window.screen.width;
            innerHeight = window.screen.height;
        } else {
            innerWidth = window.innerWidth;
            innerHeight = window.innerHeight;
        }

        return {
            width: innerWidth,
            height: innerHeight
        };
    }


    function askAPIavailableImages() {
        return $.get('/available-images');
    }


    function fetchNewImage() {
        askAPIavailableImages().then(function (availableImages) {
            var image = availableImages[Math.random() * availableImages.length | 0];
            var idealImageSize = idealSizeForCloudinaryImage(image);
            img.src = getCloudinaryImageSrc(image, idealImageSize.width, idealImageSize.height);
            iteration = 0;
        });
    }


    function idealSizeForCloudinaryImage(cloudinaryImageData) {
        var originalWidth = cloudinaryImageData.width;
        var originalHeight = cloudinaryImageData.height;
        var windowInnerSize = getWindowInnerSize();
        var w = windowInnerSize.width;
        var h = windowInnerSize.height;
        var idealWidth;
        var idealHeight;
        var approximationCount = 0;
        var maxApproximationCount = 1000;


        // landscape screen size
        idealHeight = originalHeight / originalWidth * w;

        while (idealHeight < h && approximationCount < maxApproximationCount) {
            idealHeight *= 1.5;
            approximationCount++;
        }

        idealHeight = Math.ceil(idealHeight);

        // if value is undefined then it means auto
        return {
            width: idealWidth,
            height: idealHeight
        }
    }


    function getCloudinaryImageSrc(cloudinaryImageData, width, height) {
        var urlParts = cloudinaryImageData.secure_url.split('/upload/');
        var params = [];

        if (width !== undefined) {
            params.push('w_' + width);
        }

        if (height !== undefined) {
            params.push('h_' + height);
        }

        var imageParamsString = params.join();

        urlParts.splice(1, 0, '/upload/' + imageParamsString + '/')

        return urlParts.join('');
    }


    function start() {
        var windowInnerSize = getWindowInnerSize();

        if (windowInnerSize.width >= 800) {
            imageData = createImageCanvasAndGetImageData();

            initCanvas();
            startIntroEffects();
        }
    }


    function cancelAnimationFrameRequests () {
        for (var key in currentAnimationFrameRequests) {
            cancelAnimationFrame(currentAnimationFrameRequests[key]);
            delete currentAnimationFrameRequests[key];
        }
    }


    function createImageCanvasAndGetImageData() {
        var imageCanvas = document.createElement('canvas');
        var ctx = imageCanvas.getContext('2d');

        imageCanvas.width = img.width;
        imageCanvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        return ctx.getImageData(0, 0, img.width, img.height);
    }


    function initCanvas() {
        cancelAnimationFrameRequests();
        fitIntroEffectsCanvasToWindow();
        initCanvasStyles();
    }


    function getIntroEffectsCanvas() {
        return document.getElementById('introEffects');
    }


    function getIntroEffectsContext() {
        return getIntroEffectsCanvas().getContext('2d');
    }


    function fitIntroEffectsCanvasToWindow() {
        var canvas = getIntroEffectsCanvas();
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }


    function initCanvasStyles() {
        var ctx = getIntroEffectsContext();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#eee';
        ctx.fillStyle = '#fff';
        ctx.lineWidth = 10.5;
    }


    function startIntroEffects() {
        var ctx = getIntroEffectsContext();
        var time = 0;
        var w = ctx.canvas.width;
        var h = ctx.canvas.height;
        var numPoints = 30;
        var baseLine = h * 1;

        loop();

        function loop() {
            delete currentAnimationFrameRequests.introEffects;

            if (iteration <= MAX_ITERATION) {
                update();
                draw();
                iteration += 0.1;
            }

            currentAnimationFrameRequests.introEffects = requestAnimationFrame(loop);
        }

        function update() {
            time += 0.007;
        }

        function clear() {
            ctx.clearRect(0, 0, w, h);
        }

        function draw() {
            //clear();
            // drawWave();
            drawParticles();
        }


        function palette() {
            return [
                [255, 255, 255],
                [50, 50, 50],
                [0, 0, 0],
                [255, 100, 100],
                [255, 255, 200],
                [255, 255, 200],
                [255, 255, 200]
            ];
        }


        function getImageDataPixelAt(imageData, x, y) {
            var pixelColorIndex = Math.floor(x) * 4 + Math.floor(y) * img.width * 4;

            return [
                imageData.data[pixelColorIndex + 0],
                imageData.data[pixelColorIndex + 1],
                imageData.data[pixelColorIndex + 2]
            ];
        }


        function computeDistanceMap(color, palette) {
            var distanceMap = new Array(palette.length);

            var colorAverage = (color[0] + color[1] + color[2]) / 3;

            // compute distanceMap
            for (var i = 0, l = palette.length; i < l; i++) {
                // average channel distance and max channel distance
                var paletteColor = palette[i];
                var paletteColorAverage = (paletteColor[0] + paletteColor[1] + paletteColor[2]) / 3;
                var paletteColorAverageDist = Math.abs(colorAverage - paletteColorAverage);
                var maxChannelDist = 0;

                for (var j = 0; j < 3; j++) {
                    var channelDist = Math.abs(paletteColor[j] - color[j]);

                    if (channelDist > maxChannelDist) {
                        maxChannelDist =  channelDist;
                    }
                }

                distanceMap[i] = [paletteColorAverageDist, maxChannelDist];
            }

            return distanceMap;
        }


        function nearestColor(color, palette) {
            var distanceMap = computeDistanceMap(color, palette);

            // lowest score wins
            var bestScore = Infinity;
            var bestColor;

            for (var i = 0, l = distanceMap.length; i < l; i++) {
                var currentScore = distanceMap[i][0] * 2 + distanceMap[i][1] * 3;
                if (currentScore < bestScore) {
                    bestScore = currentScore;
                    bestColor = palette[i];
                }
            }

            return bestColor;
        }


        function nearestColorInPaletteAt(x, y) {
            var pixelColor = getImageDataPixelAt(imageData, x, y);
            var computedColor = nearestColor(pixelColor, palette());

            return computedColor;
        }


        function drawParticles() {
            var colors = palette();
            var color = colors[Math.random() * colors.length | 0];
            var alpha = (0.4 + Math.sin(time * 0.01)) * 0.03;
            var colorString = 'rgba(' + color.join(',') + ',' + alpha + ')';

            ctx.save();
            ctx.fillStyle = colorString;

            var skipCount = 0;
            for (var j = 2; j > 0.2; j -= 0.008) {
                for (var i = 0; i < 20; i += 0.1) {
                    var x = Math.cos(time * 0.04 + (Math.sin(i) + Math.cos(j)) * Math.sin(i * j) + 2) * w + w * 0.25;
                    var y = Math.sin(time * 0.07 + x / baseLine * j) * baseLine + baseLine * 0.25;
                    var size;

                    if (x > w || x < 0 || y < 0 || y > h) {
                        continue;
                    }

                    var xyInImage = x < img.width && y < img.height;

                    if (xyInImage && Math.random() < 0.02) {
                        var pixelColor = nearestColorInPaletteAt(x, y);
                        ctx.fillStyle = 'rgba(' + pixelColor.join(',') + ',' + alpha + ')';

                    } else if (xyInImage && Math.random() < 0.07) {
                        var pixelColor = getImageDataPixelAt(imageData, x, y);
                        ctx.fillStyle = 'rgba(' + pixelColor.join(',') + ',' + 0.05 + ')';

                    } else {
                        size = Math.floor(Math.max(1, Math.cos(time * 0.4) * 2)) + 0.5;
                        ctx.fillStyle = colorString;
                    }


                    ctx.fillRect(x, y, size, size);
                }
            }

            ctx.restore();
        }


        function drawWave() {
            var lastX;
            var lastY;

            ctx.beginPath();

            ctx.moveTo(0, baseLine);

            for (var i = 0; i < numPoints; i++) {
                var x = computeXStep(i);
                var y = computeYStep(x);

                ctx.lineTo(x, y);

                lastX = x;
                lastY = y;
            }

            ctx.lineTo(w, lastY);

            // stroke its outline
            ctx.stroke();

            // stroke a smaller outline within the outline
            ctx.save();
            ctx.lineWidth = 6.5;
            ctx.strokeStyle = '#000';
            ctx.stroke();
            ctx.restore();

            ctx.lineTo(w, h);

            // fill the wavey shape
            ctx.lineTo(0, h);
            ctx.lineTo(0, baseLine);
            ctx.fill();

            ctx.closePath();
        }


        function computeXStep(iteration) {
            var stepX = w / numPoints;
            return stepX * iteration;
        }


        function computeYStep(x) {
            return baseLine + h * 0.002 * Math.cos(time * 2 * x / baseLine);
        }
    }

    function dist(pointA, pointB) {
        var dx = pointB.x - pointA.x;
        var dy = pointB.y - pointA.y;

        return Math.sqrt(dx * dx + dy * dy);
    }
}());
