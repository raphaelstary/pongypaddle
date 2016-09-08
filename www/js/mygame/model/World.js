G.World = (function (Math, Object, Vectors, UI) {
    "use strict";

    function World(device, player, scenery, balls, obstacles, paddleHitFn, gameOverFn) {
        this.scenery = scenery;
        this.player = player;
        this.balls = balls;
        this.obstacles = obstacles;

        this.paddleHitFn = paddleHitFn;
        this.gameOverFn = gameOverFn;

        this.resize(device);
    }

    var airResistance = 0.9;

    World.prototype.resize = function (event) {
        var one = event.height / UI.HEIGHT;

        this.gravity = Math.floor(one * UI.GRAVITY);

        var widthHalf = UI.WIDTH / 2 * one;
        var screenWidthHalf = event.width / 2;

        var tile = Math.floor(one * UI.TILE);

        this.cornerX = Math.floor(screenWidthHalf - widthHalf) + tile;
        this.endX = Math.floor(screenWidthHalf + widthHalf) - tile;

        this.cornerY = tile;
        this.endY = event.height - tile;
    };

    World.prototype.updatePlayerMovement = function () {
        var player = this.player;

        var forceX = 0;
        var forceY = 0;

        forceY += this.gravity;

        player.forceX *= airResistance;
        player.forceY *= airResistance;

        forceX += player.forceX;
        forceY += player.forceY;

        player.lastX = player.x;
        player.lastY = player.y;

        player.x += Math.round(forceX);
        player.y += Math.round(forceY);
    };

    World.prototype.updateBallMovement = function () {
        this.balls.forEach(function (ball) {
            var forceX = 0;
            var forceY = 0;

            forceX += ball.forceX;
            forceY += ball.forceY;

            ball.lastX = ball.x;
            ball.lastY = ball.y;

            ball.x += Math.round(forceX);
            ball.y += Math.round(forceY);
        }, this);
    };

    World.prototype.checkBallPaddleCollision = function () {
        this.balls.forEach(function (ball) {
            var ballWidthHalf = ball.getWidthHalf();
            var ballHeightHalf = ball.getHeightHalf();

            var player = this.player;
            var playerWidthHalf = player.getWidthHalf();
            var playerHeightHalf = player.getHeightHalf();

            var playerBoundingLeft, playerBoundingTop, playerBoundingRight, playerBoundingBottom;
            if (player.x > player.lastX) {
                // lastX is left & x is right
                playerBoundingLeft = player.lastX - playerWidthHalf;
                playerBoundingRight = player.x + playerWidthHalf;
            } else {
                // x is left & lastX is right
                playerBoundingLeft = player.x - playerWidthHalf;
                playerBoundingRight = player.lastX + playerWidthHalf;
            }
            if (player.y > player.lastY) {
                // lastY is up & y is down
                playerBoundingTop = player.lastY - playerHeightHalf;
                playerBoundingBottom = player.y + playerHeightHalf;
            } else {
                // y is up & lastY is down
                playerBoundingTop = player.y - playerHeightHalf;
                playerBoundingBottom = player.lastY + playerHeightHalf;
            }

            var ballBoundingLeft, ballBoundingTop, ballBoundingRight, ballBoundingBottom;
            if (ball.x > ball.lastX) {
                // lastX is left & x is right
                ballBoundingLeft = ball.lastX - ballWidthHalf;
                ballBoundingRight = ball.x + ballWidthHalf;
            } else {
                // x is left & lastX is right
                ballBoundingLeft = ball.x - ballWidthHalf;
                ballBoundingRight = ball.lastX + ballWidthHalf;
            }
            if (ball.y > ball.lastY) {
                // lastY is up & y is down
                ballBoundingTop = ball.lastY - ballHeightHalf;
                ballBoundingBottom = ball.y + ballHeightHalf;
            } else {
                // y is up & lastY is down
                ballBoundingTop = ball.y - ballHeightHalf;
                ballBoundingBottom = ball.lastY + ballHeightHalf;
            }

            var isBallLeftOfPlayer = ballBoundingRight < playerBoundingLeft;
            var isBallRightOfPlayer = ballBoundingLeft > playerBoundingRight;
            var isBallOverPlayer = ballBoundingBottom < playerBoundingTop;
            var isBallUnderPlayer = ballBoundingTop > playerBoundingBottom;

            if (!(isBallLeftOfPlayer || isBallRightOfPlayer || isBallOverPlayer || isBallUnderPlayer)) {

                var lastBallLeft = ball.lastX - ballWidthHalf;
                var lastBallRight = ball.lastX + ballWidthHalf;
                var lastBallTop = ball.lastY - ballHeightHalf;
                var lastBallBottom = ball.lastY + ballHeightHalf;

                var lastPlayerLeft = player.lastX - playerWidthHalf;
                var lastPlayerRight = player.lastX + playerWidthHalf;
                var lastPlayerTop = player.lastY - playerHeightHalf;
                var lastPlayerBottom = player.lastY + playerHeightHalf;

                var wasBallLeftOfPlayer = lastBallRight < lastPlayerLeft;
                var wasBallRightOfPlayer = lastBallLeft > lastPlayerRight;
                var wasBallOverPlayer = lastBallBottom < lastPlayerTop;
                var wasBallUnderPlayer = lastBallTop > lastPlayerBottom;

                if (wasBallOverPlayer) {
                    if (ball.forceY > 0) {
                        ball.forceY *= -1;
                        this.paddleHitFn();
                    }
                    ball.y = player.y - playerHeightHalf - 2 * ballHeightHalf;

                } else if (wasBallUnderPlayer) {
                    if (ball.forceY < 0) {
                        ball.forceY *= -1;
                        this.paddleHitFn();
                    }
                    ball.y = player.y + playerHeightHalf + 2 * ballHeightHalf;

                } else if (wasBallLeftOfPlayer) {
                    if (ball.forceX > 0) {
                        ball.forceX *= -1;
                        this.paddleHitFn();
                    }
                    ball.x = player.x - playerWidthHalf - 2 * ballWidthHalf;

                } else if (wasBallRightOfPlayer) {
                    if (ball.forceX < 0) {
                        ball.forceX *= -1;
                        this.paddleHitFn();
                    }
                    ball.x = player.x + playerWidthHalf + 2 * ballWidthHalf;
                }

                var ballLeft = ball.x - ballWidthHalf;
                var ballRight = ball.x + ballWidthHalf;
                var ballTop = ball.y - ballHeightHalf;
                var ballBottom = ball.y + ballHeightHalf;

                // var playerLeft = player.x - playerWidthHalf;
                // var playerRight = player.x + playerWidthHalf;
                // var playerTop = player.y - playerHeightHalf;
                // var playerBottom = player.y + playerHeightHalf;

                // var isNowBallLeftOfPlayer = ballRight < playerLeft;
                // var isNowBallRightOfPlayer = ballLeft > playerRight;
                // var isNowBallOverPlayer = ballBottom < playerTop;
                // var isNowBallUnderPlayer = ballTop > playerBottom;
                //
                // if (!(isNowBallLeftOfPlayer || isNowBallRightOfPlayer || isNowBallOverPlayer ||
                // isNowBallUnderPlayer)) { console.log('EERRRRRRRROOEEER'); }

                // recheck if ball is not inside scenery otherwise move player and ball
                this.scenery.forEach(function (element) {

                    if (ballRight > element.getCornerX() && ballLeft < element.getEndX() &&
                        ballBottom > element.getCornerY() && ballTop < element.getEndY()) {

                        if (ball.x - ballWidthHalf < this.cornerX)
                            ball.x = this.cornerX + ballWidthHalf;
                        if (ball.x + ballWidthHalf > this.endX)
                            ball.x = this.endX - ballWidthHalf;
                        if (ball.y - ballHeightHalf < this.cornerY)
                            ball.y = this.cornerY + ballHeightHalf;
                        if (ball.y + ballHeightHalf > this.endY)
                            ball.y = this.endY - ballHeightHalf;

                        if (wasBallOverPlayer) {
                            player.y = ball.y + ballHeightHalf + playerHeightHalf + 1;

                        } else if (wasBallUnderPlayer) {
                            player.y = ball.y - ballHeightHalf - playerHeightHalf - 1;

                        } else if (wasBallLeftOfPlayer) {
                            player.x = ball.x + ballWidthHalf + playerWidthHalf + 1;

                        } else if (wasBallRightOfPlayer) {
                            player.x = ball.x - ballWidthHalf - playerWidthHalf - 1;
                        }
                    }

                }, this);
            }
        }, this);
    };

    World.prototype.checkCollisions = function () {
        this.obstacles.forEach(function (element) {
            for (var i = this.balls.length - 1; i >= 0; i--) {
                var ball = this.balls[i];
                var widthHalf = ball.getWidthHalf();
                var heightHalf = ball.getHeightHalf();
                if (ball.x + widthHalf > element.getCornerX() && ball.x - widthHalf < element.getEndX() &&
                    ball.y + heightHalf > element.getCornerY() && ball.y - heightHalf < element.getEndY()) {

                    this.removeBall(ball, i, this.balls);
                }
            }
        }, this);

        this.scenery.concat(this.obstacles).forEach(function (element) {
            this.balls.forEach(function (ball) {
                var widthHalf = ball.getWidthHalf();
                //noinspection JSSuspiciousNameCombination
                var heightHalf = widthHalf;
                if (ball.x + widthHalf > element.getCornerX() && ball.x - widthHalf < element.getEndX() &&
                    ball.y + heightHalf > element.getCornerY() && ball.y - heightHalf < element.getEndY()) {

                    if (ball.x - widthHalf < this.cornerX)
                        ball.x = this.cornerX + widthHalf;
                    if (ball.x + widthHalf > this.endX)
                        ball.x = this.endX - widthHalf;
                    if (ball.y - heightHalf < this.cornerY)
                        ball.y = this.cornerY + heightHalf;
                    if (ball.y + heightHalf > this.endY)
                        ball.y = this.endY - heightHalf;

                    if (element.getWidth() > element.getHeight()) {
                        ball.forceY *= -1;
                    } else {
                        ball.forceX *= -1;
                    }
                }
            }, this);

            var player = this.player;

            var widthHalf = player.getWidthHalf();
            var heightHalf = player.getHeightHalf();
            if (player.x + widthHalf > element.getCornerX() && player.x - widthHalf < element.getEndX() &&
                player.y + heightHalf > element.getCornerY() && player.y - heightHalf < element.getEndY()) {

                var elemHeightHalf = element.getHeightHalf();
                var elemWidthHalf = element.getWidthHalf();
                var b4_y = element.y + elemHeightHalf;
                var b1_y = element.y - elemHeightHalf;
                var b4_x = element.x - elemWidthHalf;
                var b1_x = b4_x;
                var b2_x = element.x + elemWidthHalf;
                var b3_x = b2_x;
                var b2_y = b1_y;
                var b3_y = b4_y;

                var p;

                // Now compare them to know the side of collision
                if (player.lastX + widthHalf <= element.x - elemWidthHalf &&
                    player.x + widthHalf > element.x - elemWidthHalf) {

                    // Collision on right side of player
                    p = Vectors.getIntersectionPoint(player.lastX + widthHalf, player.lastY, player.x + widthHalf,
                        player.y, b1_x, b1_y, b4_x, b4_y);
                    player.x = p.x - widthHalf;
                    player.forceX = 0;

                } else if (player.lastX - widthHalf >= element.x + elemWidthHalf &&
                    player.x - widthHalf < element.x + elemWidthHalf) {

                    // Collision on left side of player
                    p = Vectors.getIntersectionPoint(player.lastX - widthHalf, player.lastY, player.x - widthHalf,
                        player.y, b2_x, b2_y, b3_x, b3_y);
                    player.x = p.x + widthHalf;
                    player.forceX = 0;
                } else if (player.lastY + heightHalf <= element.y - elemHeightHalf &&
                    player.y + heightHalf > element.y - elemHeightHalf) {

                    // Collision on bottom side of player
                    p = Vectors.getIntersectionPoint(player.lastX, player.lastY + heightHalf, player.x,
                        player.y + heightHalf, b1_x, b1_y, b2_x, b2_y);
                    player.y = p.y - heightHalf;
                    player.forceY = 0;
                } else {
                    // Collision on top side of player
                    p = Vectors.getIntersectionPoint(player.lastX, player.lastY - heightHalf, player.x,
                        player.y - heightHalf, b3_x, b3_y, b4_x, b4_y);
                    player.y = p.y + heightHalf;
                    player.forceY = 0;
                }
            }
        }, this);
    };

    World.prototype.removeBall = function (ball, index, ballArray) {
        ball.remove();
        ballArray.splice(index, 1);

        // if (this.balls.length <= 0)
            this.gameOverFn();
    };

    World.prototype.preDestroy = function () {

        function remove(entity) {
            entity.remove();
        }

        this.scenery.forEach(remove);
        this.obstacles.forEach(remove);
        this.balls.forEach(remove);
        remove(this.player);
    };

    return World;
})(Math, Object, H5.Vectors, G.UI);