(function () {
    var cancelAnimationFrame = window.cancelAnimationFrame;
    var requestAnimationFrame = window.requestAnimationFrame;
    var currentAnimationFrameRequests = {};

    start();

    function start() {
        initCanvas();
        startIntroEffects();
    }

    window.addEventListener('resize', start);

    function cancelAnimationFrameRequests () {
        for (var key in currentAnimationFrameRequests) {
            cancelAnimationFrame(currentAnimationFrameRequests[key]);
            delete currentAnimationFrameRequests[key];
        }
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
            update();
            draw();
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
            //drawWave();
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


        function drawParticles() {
            var colors = palette();
            var color = colors[Math.random() * colors.length | 0];

            ctx.save();
            ctx.fillStyle = 'rgba(' + color.join(',') + ',' + (0.4 + Math.sin(time * 0.01)) * 0.03 + ')';

            var skipCount = 0;
            for (var j = 2; j > 0.2; j -= 0.008) {
                for (var i = 0; i < 20; i += 0.1) {
                    var x = Math.cos(time * 0.04 + (Math.sin(i) + Math.cos(j)) * Math.sin(i * j) + 2) * w + w * 0.25;
                    var y = Math.sin(time * 0.07 + x / baseLine * j) * baseLine + baseLine * 0.25;

                    if (x > w || x < 0 || y < 0 || y > h) {
                        continue;
                    }

                    var size = Math.floor(Math.max(1, Math.cos(time * 0.4) * 2)) + 0.5;
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
