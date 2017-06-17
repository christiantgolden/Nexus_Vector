/*TODO: 
	Design Start Screen
	Design Pause Screen (started, needs more work)
	Design Death Screen
	Design Menu Button/Menu
*/

//set up canvas
var canvas = document.getElementById("myCanvas");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
var ctx = canvas.getContext("2d");

var gamePaused = false;
var speed = 7;
var heroCollision = false;
var score = 0;
var tiltLevel;
var mwRange = (canvas.width * canvas.height) * 0.0004;
var barWidth = canvas.width / 3;
var barHeight = canvas.height * 0.02;
var barDecrement = canvas.width * 0.001;
var laserWidth = 10;
var red = 50;
var redder = true;

function randColor() {
    'use strict';
    return Math.floor(Math.random() * 255);
}

//draw life/stamina/laser bars
//laser vars
var laserEnergyBar = {
	width: barWidth,
	height: barHeight,
	x: 0,
	y: 0
};

var staminaBar = {
	width: barWidth,
	height: barHeight,
	x: 0,
	y: laserEnergyBar.y + laserEnergyBar.height
};

var lifeBar = {
	width: barWidth,
	height: barHeight,
	x: 0,
	y: staminaBar.y + staminaBar.height
};

var magBar = {
    width: barWidth,
    height: barHeight,
    x: 0,
    y: lifeBar.y + lifeBar.height
};

//draw laser energy bar
function drawLEB() {
    'use strict';
	ctx.beginPath();
	ctx.rect(laserEnergyBar.x, laserEnergyBar.y, laserEnergyBar.width, laserEnergyBar.height);
	ctx.fillStyle = "rgba(255,100,10,0.4)";
	ctx.fill();
	ctx.closePath();
}

//draw stamina energy bar
function drawSEB() {
    'use strict';
	ctx.beginPath();
	ctx.rect(staminaBar.x, staminaBar.y, staminaBar.width, staminaBar.height);
	ctx.fillStyle = "rgba(100,10,255,0.4)";
	ctx.fill();
	ctx.closePath();
}
//draw life bar
function drawLB() {
    'use strict';
	ctx.beginPath();
	ctx.rect(lifeBar.x, lifeBar.y, lifeBar.width, lifeBar.height);
	ctx.fillStyle = "rgba(10,255,100,0.4)";
	ctx.fill();
	ctx.closePath();
}

function drawMB() {
    'use strict';
    ctx.beginPath();
    ctx.rect(magBar.x, magBar.y, magBar.width, magBar.height);
    ctx.fillStyle = "rgba(255,255,0,0.4)";
    ctx.fill();
    ctx.closePath();
}

//condensed
function drawBars() {
    'use strict';
	drawLEB();
	drawSEB();
	drawLB();
    drawMB();
}

//event listeners
//events
var evt = {
	right: false,
	left: false,
	down: false,
	shift: false,
	space: false,
	touch: false,
    rightTouch: false,
    leftTouch: false,
	tiltRight: false,
	tiltLeft: false
};

function keyDownHandler(e) {
    'use strict';
    e.preventDefault();
    if (e.keyCode === 39) {
        evt.right = true;
        e.stopPropagation();
    } else if (e.keyCode === 37) {
        evt.left = true;
    } else if (e.keyCode === 32) {
        evt.space = true;
    } else if (e.keyCode === 40) {
        evt.down = true;
    } else if (e.keyCode === 16) {
		evt.shift = true;
    } else if (e.keyCode === 80) {
		if (gamePaused === false) {
			gamePaused = true;
		} else {
			gamePaused = false;
		}
    }
}
function keyUpHandler(e) {
    'use strict';
    e.preventDefault();
    if (e.keyCode === 39) {
        evt.right = false;
    } else if (e.keyCode === 37) {
        evt.left = false;
    } else if (e.keyCode === 32) {
        evt.space = false;
    } else if (e.keyCode === 40) {
        evt.down = false;
    } else if (e.keyCode === 16) {
		evt.shift = false;
    }
}

function handleStart(event) {
    'use strict';
    event.preventDefault();
    if (event.changedTouches) {
		evt.touch = true;
        if (event.touches[0].pageX > canvas.width / 2) {
            event.preventDefault();
            evt.rightTouch = true;
            evt.leftTouch = false;
        } else if (event.touches[0].pageX <= canvas.width / 2) {
            event.preventDefault();
            evt.leftTouch = true;
            evt.rightTouch = false;
        }
    }
}

function handleEnd(event) {
    'use strict';
    event.preventDefault();
    if (event.changedTouches) {
        event.preventDefault();
		evt.touch = false;
        evt.rightTouch = false;
        evt.leftTouch = false;
    }
}

//the following accelerometer function should work for most cases
function handleOrientation(event) {
    'use strict';
    event.preventDefault();
    if (event.gamma > 3) {
		evt.tiltLeft = false;
		evt.tiltRight = true;
    } else if (event.gamma < -3) {
		evt.tiltRight = false;
		evt.tiltLeft = true;
    } else if (event.gamma >= -3 && event.gamma <= 3) {
		evt.tiltRight = false;
		evt.tiltLeft = false;
    }
    tiltLevel = event.gamma;
}

//if the above doesn't work, this should.
function handleMotion(event) {
    'use strict';
    event.preventDefault();
    if (event.acceleration.x > 5) {
        evt.tiltLeft = false;
        evt.tiltRight = true;
    } else if (event.acceleration.x < -5) {
        evt.tiltRight = false;
        evt.tiltLeft = true;
    } else {
        evt.tiltRight = false;
        evt.tiltLeft = false;
    }
}


document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//check for browser accelerometer compatibility
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", handleOrientation, false);
} else if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", handleMotion, false);
}

window.addEventListener("touchstart", handleStart, false);
window.addEventListener("touchend", handleEnd, false);

function Ship(orientation, width, height, tipX, tipY) {
    'use strict';
	this.width = width;
	this.height = height;
	this.tipX = tipX;
	this.tipY = tipY;
	this.rightX = this.tipX + this.width / 2;
	this.leftX = this.tipX - this.width / 2;
	if (orientation === "up") {
		this.rightY = this.tipY + this.height;
		this.leftY = this.tipY + this.height;
	} else {
		this.rightY = this.tipY - this.height;
		this.leftY = this.tipY - this.height;
	}
}

var hero = new Ship("up", 20, 40, canvas.width / 2, canvas.height - 50);
var badguy = new Ship("down", 20, 40, canvas.width / 2, 40);

var dust = {
	width: 20,
	height: 20,
	xList: [],
	yList: [],
	x: 0,
	y: 0
};

var randGreen = 0;
var randRed = 0;
var randBlue = 0;

function drawHero() {
    'use strict';
    var i;
	for (i = 0; i <= dust.xList.length; i += 1) {
        if (dust.xList[i] + dust.width > hero.leftX && dust.xList[i] < hero.rightX &&
                dust.yList[i] + dust.height > hero.tipY && dust.yList[i] < hero.leftY) {
            //heroCollision = true;
            delete dust.xList[i];
            delete dust.yList[i];
            score += 1;
            lifeBar.x -= barDecrement * 5;
        }
    }
    
    /*** replace with code for collision with actual enemies/enemy bullets*****/
    /*if (heroCollision) {
		if (lifeBar.x > -lifeBar.width) {
	        lifeBar.x -= 10;
		}
    }*/
    if (heroCollision === false) {
	    hero.leftX = hero.tipX - 10;
	    hero.rightX = hero.tipX + 10;
	    hero.width = hero.rightX - hero.leftX;
	    ctx.beginPath();
	    ctx.moveTo(hero.tipX, hero.tipY);
	    ctx.lineTo(hero.leftX, hero.leftY);
	    ctx.lineTo(hero.rightX, hero.rightY);
	    ctx.fillStyle = 'rgb(' + randColor() + ',' + randColor() + ',' + randColor() + ')';
	    ctx.fill();

	    ctx.beginPath();
	    ctx.moveTo(hero.tipX, hero.tipY + 8);
	    ctx.lineTo(hero.leftX + 4, hero.leftY - 3);
	    ctx.lineTo(hero.rightX - 4, hero.rightY - 3);
	    ctx.fillStyle = "#000";
	    ctx.fill();
    }
    heroCollision = false;
}

function drawEnemy() {
    'use strict';
    if (red < 150 && redder === true) {
        red += 10;
    } else if (red > 49) {
        redder = false;
        red -= 10;
    } else {
        redder = true;
    }
    
    badguy.leftY = badguy.tipY - badguy.height;
    badguy.rightY = badguy.tipY - badguy.height;
    badguy.leftX = badguy.tipX - 10;
    badguy.rightX = badguy.tipX + 10;
    badguy.width = badguy.rightX - badguy.leftX;
    ctx.beginPath();
    ctx.moveTo(badguy.tipX, badguy.tipY);
    ctx.lineTo(badguy.leftX, badguy.leftY);
    ctx.lineTo(badguy.rightX, badguy.rightY);
    ctx.fillStyle = 'rgb(' + red + ',0,0)';
    ctx.fill();
}


//stars
var star = {
	size: 2,
	xList: [],
	yList: [],
	x: 0,
	y: 0
};

//laser
var laser = {
	width: laserWidth,
	height: canvas.height - 10,
	x: hero.tipX - (laserWidth / 2),
	y: canvas.height - 10
};

//magwave - will eventually be used alternatingly with laser. Use to attract dust
//as opposed to destroying drones.
var magWave = {
    x: hero.tipX,
    y: canvas.height - hero.height * 2,
    radius: 0,
    startAngle: 0,
    endAngle: 2 * Math.PI
};

//generate xy lists for stardust
function genDustXY() {
    'use strict';
    var i;
    if (Math.floor(Math.random() * 50) === 1) {
		dust.x = Math.floor(Math.random() * (canvas.width - dust.width) + 1);
		dust.y = Math.floor(Math.random() * -canvas.height - dust.height);
        if ((evt.space === false && evt.rightTouch === false) || laser.x < dust.x ||
                laser.x > dust.x + dust.width || laserEnergyBar.x <= -laserEnergyBar.width) {
            dust.xList[dust.xList.length] = dust.x;
            dust.yList[dust.yList.length] = dust.y;
        }
    }
}
//draw stardust
function drawDust() {
    'use strict';
    var i;
	genDustXY();
	for (i = 0; i < dust.yList.length; i += 1) {
	    if (dust.yList[i] >= canvas.height) {
			dust.yList.splice(i, 1);
			dust.xList.splice(i, 1);
	    } else {
			ctx.beginPath();
			ctx.rect(dust.xList[i], dust.yList[i], dust.width, dust.height);
			ctx.fillStyle = 'rgb(' + randColor() + ',' + randColor() + ',' + randColor() + ')';
			ctx.fill();
			ctx.closePath();
	    }
	}
}

function genStarXY() {
    'use strict';
    if (Math.floor(Math.random() * 3) === 1) {
		star.x = Math.floor(Math.random() * -canvas.width) + Math.floor(Math.random() * canvas.width * 2);
		star.y = Math.floor(Math.random() * -canvas.height) + Math.floor(Math.random() * canvas.height);
		star.xList[star.xList.length] = star.x;
		star.yList[star.yList.length] = star.y;
    }
}

function drawStars() {
    'use strict';
	genStarXY();
    var i, randTwinkle;
    for (i = 0; i < star.yList.length; i += 1) {
		star.size = Math.floor(Math.random() * 4);
		randTwinkle = randColor();
		ctx.beginPath();
		ctx.rect(star.xList[i], star.yList[i], star.size, star.size);
		ctx.fillStyle = 'rgb(' + randTwinkle + ',' + randTwinkle + ',' + randTwinkle + ')';
		ctx.fill();
		ctx.closePath();
    }
}



//my added drawLaser function
function drawLaser() {
    'use strict';
    var i;
	ctx.beginPath();
	ctx.rect(laser.x, 0, laser.width, laser.height);
	ctx.fillStyle = 'rgb(' + randColor() + ',' + randColor() + ',' + randColor() + ')';
	ctx.fill();
	ctx.closePath();
	for (i = 0; i < dust.xList.length; i += 1) {
	    if (laser.x >= dust.xList[i] && laser.x <= dust.xList[i] + dust.width && dust.yList[i] > 0 &&
                dust.yList[i] < laser.y && (evt.space || evt.rightTouch)) {
			dust.yList.splice(i, 1);
			dust.xList.splice(i, 1);
			score += 1;
	    }
	}
}

function drawMagWave() {
    'use strict';
    var i;
    ctx.beginPath();
    ctx.arc(magWave.x, magWave.y, magWave.radius, magWave.startAngle, magWave.endAngle);
    ctx.strokeStyle = 'rgb(' + randColor() + ',' + randColor() + ',' + randColor() + ')';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
}

//Scrolling Title
var titleX = canvas.width;
function drawTitle() {
    'use strict';
    ctx.font = "62px Courier New";
    ctx.fillStyle = 'rgb(' + randColor() + ',' + randColor() + ',' + randColor() + ')';
    ctx.textAlign = "start";
    ctx.fillText("Nexus Vector", titleX, canvas.height / 2);
    if (titleX > -444) {
        titleX -= 1;
    } else {
        titleX = canvas.width;
    }
}

//controls/stats
function drawHelps() {
    'use strict';
    ctx.font = "20px Courier New";
    ctx.fillStyle = "rgb(200,200,200)";
    ctx.textAlign = "start";
    ctx.fillText("Move\t\t\t\t:<-/-> or Tilt", 0, magBar.y + magBar.height * 2);
    ctx.fillText("Shoot\t\t\t:Space/Touch Right", 0, magBar.y + magBar.height * 3);
    ctx.fillText("Boost\t\t\t:Shift/Strong Tilt", 0, magBar.y + magBar.height * 4);
    ctx.fillText("MagWave\t:Down/Touch Left", 0, magBar.y + magBar.height * 5);
}

function drawScore() {
    'use strict';
    ctx.font = "22px Courier New";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.textAlign = "end";
    ctx.fillText("SD: " + score, canvas.width - 12, 22);
}

function draw() {
    'use strict';
	if (!gamePaused) {
        var i;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawScore();
	    drawTitle();
	    drawStars();
        
	    if ((evt.space || evt.rightTouch) && laserEnergyBar.x > -laserEnergyBar.width) {
            drawLaser();
	    }
        
	    drawDust();
	    drawBars();
	    drawHero();
        if (badguy.tipX > hero.tipX && badguy.tipY < hero.tipY) {
            badguy.tipX -= 4;
            badguy.tipY += 4;
        } else if (badguy.tipX < hero.tipX && badguy.tipY < hero.tipY) {
            badguy.tipX += 4;
            badguy.tipY += 4;
        } else if (badguy.tipY > canvas.height + badguy.height) {
            badguy = new Ship("down", 20, 40, Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * -canvas.height));
        } else {
            badguy.tipY += 4;
        }
        drawEnemy();
        

        
        if (evt.down || evt.leftTouch) {
            if (magWave.radius < hero.width) {
                magWave.radius += 0.5;
            } else {
                magWave.radius = 0;
            }
            if (magBar.x > -magBar.width) {
                drawMagWave();
                magBar.x -= barDecrement;
            }
        } else {
            magWave.radius = 0;
            if (magBar.x < 0) {
                magBar.x += barDecrement;
            }
        }
        
	    for (i = 0; i < dust.yList.length; i += 1) {
            if (((evt.space === false && evt.rightTouch === false) || laser.x < dust.xList[i] ||
                 laser.x > dust.xList[i] + dust.width || laserEnergyBar.x <= -laserEnergyBar.width)) {
                if ((evt.down || evt.leftTouch) && dust.xList[i] > magWave.x &&
                            dust.xList[i] < (magWave.x + mwRange) &&
                            dust.yList[i] < magWave.y &&
                            dust.yList[i] > (magWave.y - mwRange) &&
                            magBar.x > -magBar.width) {
                    dust.xList[i] -= 3;
                    dust.yList[i] += 3;
                } else if ((evt.down || evt.leftTouch) && dust.xList[i] > magWave.x &&
                            dust.xList[i] < (magWave.x + mwRange) &&
                            dust.yList[i] > magWave.y && magBar.x > -magBar.width) {
                    dust.xList[i] -= 3;
                    dust.yList[i] -= 3;
                } else if ((evt.down || evt.leftTouch) && dust.xList[i] < magWave.x &&
                           dust.xList[i] > (magWave.x - mwRange) &&
                           dust.yList[i] < magWave.y &&
                           dust.yList[i] > (magWave.y - mwRange) &&
                            magBar.x > -magBar.width) {
                    dust.xList[i] += 3;
                    dust.yList[i] += 3;
                } else if ((evt.down || evt.leftTouch) && dust.xList[i] < magWave.x &&
                           dust.xList[i] > (magWave.x - mwRange) &&
                           dust.yList[i] > magWave.y && magBar.x > -magBar.width) {
                    dust.xList[i] += 3;
                    dust.yList[i] -= 3;
                } else {
                    dust.yList[i] += Math.floor(Math.random() * 5 + 3);
                    dust.xList[i] += Math.floor(Math.random() * -5 + 3);
                }
                
                if ((evt.down || evt.leftTouch) && dust.xList[i] <= magWave.x + 3 &&
                        dust.xList[i] >= magWave.x - magWave.radius / 2 &&
                        dust.xList[i] <= magWave.x + magWave.radius / 2 &&
                        dust.yList[i] >= magWave.y - magWave.radius / 2 &&
                        dust.yList[i] <= magWave.y + magWave.radius / 2) {
                    dust.xList.splice(i, 1);
                    dust.yList.splice(i, 1);
                    if (magBar.x > -magBar.width) {
                        score += 1;
                    } else if (hero.tipX > dust.xList[i] && hero.tipX < (dust.xList[i] + dust.width) &&
                              hero.tipY < dust.yList[i]) {
                        lifeBar.x -= barDecrement * 5;
                    }
                }
            }
	    }

	    if ((evt.space || evt.rightTouch) && laserEnergyBar.x >= -laserEnergyBar.width) {
			laserEnergyBar.x -= barDecrement;
	    } else if (evt.space === false && evt.rightTouch === false && laserEnergyBar.x < 0) {
			laserEnergyBar.x += barDecrement;
	    }

	    for (i = 0; i < star.xList.length; i += 1) {
			if (star.yList[i] < canvas.height) {
			    star.yList[i] += 1;
			} else {
			    star.yList.splice(i, 1);
			    star.xList.splice(i, 1);
			}
	    }

	    if ((evt.right || evt.tiltRight) && hero.leftX < canvas.width) {/* &&
                evt.down === false) {*/
	        laser.x += speed;
			hero.tipX += speed;
            magWave.x += speed;
	    } else if ((evt.right || evt.tiltRight) && hero.leftX >= canvas.width) {/* &&
                   evt.down === false) {*/
            laser.x -= canvas.width + hero.width;
			hero.tipX -= canvas.width + hero.width;
            magWave.x -= canvas.width + hero.width;
	    } else if ((evt.left || evt.tiltLeft) && hero.rightX > 0) {
	        laser.x -= speed;
			hero.tipX -= speed;
            magWave.x -= speed;
	    } else if ((evt.left || evt.tiltLeft) && hero.rightX <= 0) {
            laser.x += canvas.width + hero.width;
			hero.tipX += canvas.width + hero.width;
            magWave.x += canvas.width + hero.width;
	    }

	    if ((evt.shift || tiltLevel > 5 || tiltLevel < -5) &&
                staminaBar.x > -staminaBar.width &&
                (evt.left || evt.right)) {
			staminaBar.x -= barDecrement;
			speed = 10;
	    } else {
			speed = 7;
	    }
	    if (evt.shift === false && staminaBar.x < 0) {
			staminaBar.x += barDecrement;
	    }
    } else {
        drawHelps();
    }
    window.requestAnimationFrame(draw);
}
draw();