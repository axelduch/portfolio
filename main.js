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
            cancelAnimationFrame(currentAnimationFrameRequests[key]) ;
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
        var baseLine = h * 0.75;

        loop();

        function loop() {
            delete currentAnimationFrameRequests.introEffects;
            update();
            draw();
            currentAnimationFrameRequests.introEffects = requestAnimationFrame(loop);
        }

        function update() {
            time += 0.01;
        }

        function clear() {
            ctx.clearRect(0, 0, w, h);
        }

        function draw() {
            //clear();
            drawWave();
            drawParticles();
        }


        function drawParticles() {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';

            for (var j = 0; j < 3; j++) {
                for (var i = 0; i < 75; i++) {
                    var x = Math.cos(time * 0.05 + (Math.sin(i) + Math.cos(j)) * Math.sin(i * j)) * w + w * 0.25;
                    var y = Math.sin(time * 0.03 + x / baseLine * j) * baseLine + baseLine * 0.15;
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
