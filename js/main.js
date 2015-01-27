// get viewport
var viewport = {
    width  : $(window).width(),
    height : $(window).height()
};

var hitAudio = new Audio('audio/hit.wav');
var levelAudio = new Audio('audio/level.wav');
var bounceAudio = new Audio('audio/bounce.wav');

// initial settings
var CANVAS_WIDTH = viewport.width;
var CANVAS_HEIGHT = viewport.width / 1.7;
var UNIT = viewport.width / 5;
var canvasElement = $("<canvas width='" + CANVAS_WIDTH + 
                      "' height='" + CANVAS_HEIGHT + "'>Your browser does not support the HTML5 canvas tag.</canvas>");
var canvas = canvasElement.get(0).getContext("2d");
var FPS = 60;
var count = FPS/3;
var start = false;
var changeX;
var changeY;
var speed = UNIT/30;
var distance;
var fail = false;
var gameover;
var life = 5;
var score = 0;
var level = 0;
var bricks = new Array();
var brickNum = 25;
var displacement = new Array();
var newGame = true;
var ballBrickDistanceY;
var ballBrickDistanceX;
var scoreA = false;
// var brokenBricks = 0;
var leftBricks;
$(document).ready(function(){
	$("#life").text(life);
	$("#score").text(score);
	canvasElement.appendTo('.content'); // create canvas in body
	setInterval(function() {
 		update();
 		draw();
	}, 1000/FPS); // set FPS 
});
// 
var board = {
	color: "#979797",
	x: CANVAS_WIDTH/2,
	y: CANVAS_HEIGHT,
	w: UNIT,
	h: UNIT/10,
	draw: function() {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x-this.w/2, this.y-this.h, this.w, this.h);
	}
}

var ball = {
	r: UNIT/10,
	x: board.x,
	y: board.y-board.h-UNIT/10,
	draw: function() {
		canvas.fillStyle = "#8F8F8F";
		canvas.beginPath();
		canvas.arc(this.x, this.y, this.r, 0, 2*Math.PI, true);
		canvas.closePath();
		canvas.fill();
	}
}

function getPositions() {
	for (var i=0; i<brickNum/6;i++) {
		displacement[i] = Math.floor(Math.random()*4)*(3*UNIT/16);
	}
}

function brick(temX, temY, temColor) {
	this.color = temColor,
	this.w = UNIT/2,
	this.h = UNIT/5,
	this.x = temX,
	this.y = temY,
	this.draw = function() {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x-this.w/2, this.y-this.h/2, this.w, this.h);
	};
}

function update() {
	if (newGame) {
		level += 1;
		levelAudio.play();
		getPositions();
		setBricks();
		newGame = false;
		$("#level").text(level);
	}
	moveBoard();
	checkBoard();
	moveBall();
	checkBall();
	checkScores();
	checkLevel();
}

function draw() {
	canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	if (!gameover) {	
		board.draw();
		ball.draw();
		drawBricks();
	} else {
		canvas.fillStyle = "#000";
    	canvas.fillText("GAME OVER!", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
	}
}

function checkLevel() {
	leftBricks = false;
	for (var i=0; i<brickNum;i++) {
		if (bricks[i].x>=0 && bricks[i].x<=CANVAS_WIDTH && bricks[i].y>=0 && bricks[i].y<=CANVAS_HEIGHT) {
			leftBricks = true;
		}
	}
	if (!leftBricks) {
// 	if (brokenBricks == brickNum) {
		newGame = true;
		life++;
		brickNum += 6;
// 		brokenBricks = 0;
		start = false;
	}
}

function checkScores() {
	if (scoreA) {
		score += 10;
// 		brokenBricks += 1;
	}
	$("#score").text(score);
	scoreA = false;
}

function setBricks() {
	var r = 0;
	var c = 0;
	for (var i=0; i<brickNum;i++) {
		if (c*UNIT>CANVAS_WIDTH-UNIT/4) {
			r += 1;
			c = 0;
		}
		bricks[i] = new brick(UNIT/4+c*UNIT+displacement[r],r*UNIT/5+UNIT/10,"#979797");
		c++;
	}
}

function drawBricks() {
	for (var i=0; i<brickNum;i++) {
		bricks[i].draw();
	}
}

function moveBoard() {
	if (keydown.left) {
		board.x -= UNIT/40;
	} else if (keydown.right) {
		board.x += UNIT/40;
	}
}

function checkBoard() {
	if (board.x<UNIT/2) {
		board.x = UNIT/2;
	} else if (board.x>CANVAS_WIDTH-UNIT/2) {
		board.x = CANVAS_WIDTH-UNIT/2;
	}
}

function moveBall() {
	if(!start) {
		if (keydown.up) {
			keydown.space = true;
		} 
		if (keydown.space) {
			start = true;
			changeX = Math.random()-0.5;
			if (changeX>0) {
				changeX = UNIT/(Math.floor(Math.random()*200)+50);
			} else {
				changeX = -UNIT/(Math.floor(Math.random()*200)+50);
			}
			changeY = -Math.sqrt(Math.pow(speed,2)-Math.pow(changeX,2));
		}
		ball.x = board.x;
		ball.y = board.y-board.h-UNIT/10;
	} else {
		ball.x += changeX;
		ball.y += changeY;
	}
}

function checkBall() {
	if (start) {
		
		// check bricks
		for (var i=0; i<brickNum;i++) {
			ballBrickDistanceY = ball.y - bricks[i].y;
			ballBrickDistanceX = ball.x - bricks[i].x;
			if (ballBrickDistanceY>0) {
				if (ballBrickDistanceY-bricks[i].h/2<ball.r && Math.abs(ballBrickDistanceX)-bricks[i].w/2<ball.r) {
					ball.y = bricks[i].y + ball.r + bricks[i].h/2;
					hitAudio.play();
					bricks[i].x = -UNIT;
					bricks[i].y = -UNIT;
					changeY *= -1;
					scoreA = true;
				}
			} else {
				if (-ballBrickDistanceY-bricks[i].h/2<ball.r && Math.abs(ballBrickDistanceX)-bricks[i].w/2<ball.r) {
					ball.y = bricks[i].y - bricks[i].h/2 - ball.r;
					bricks[i].x = -UNIT;
					bricks[i].y = -UNIT;
					changeY *= -1;
					hitAudio.play();
					scoreA = true;
				}
			}
		}
		
		// check left and right
		if (ball.x<=ball.r) {
			ball.x = ball.r;
			changeX *= -1;
			bounceAudio.play();
		} else if (ball.x>=CANVAS_WIDTH-ball.r) {
			ball.x=CANVAS_WIDTH-ball.r
			changeX *= -1;
			bounceAudio.play();
		}
		
		// check up and down
		if (ball.y<=ball.r) {
			ball.y = ball.r;
			changeY *= -1;
			bounceAudio.play();
		} else if (ball.y>CANVAS_HEIGHT-ball.r-board.h && !fail) {
			distance = ball.x-board.x; // note that distance may be less than 0
			if (Math.abs(distance)<=board.w/2) {
				ball.y = CANVAS_HEIGHT-ball.r-board.h;
				changeX = 0.9*speed * 2*distance/board.w;
				changeY = -Math.sqrt(Math.pow(speed,2) - Math.pow(changeX,2));
				bounceAudio.play();
			} else {
				fail = true;
			}
		}
		
		if (fail) {
			if(count>0) {
				count--;
			} else {
				if (life>0) {
					life--;
					$("#life").text(life);
				} else {
					gameover = true;
				}
				count = FPS/3;
				fail = false;
				start = false;
			}
		}
	}
}

$(document).ready(function(){
	$("#left").on("vmousedown",function(){
		keydown.left = true;
	});
	$("#left").on("vmouseup",function(){
		keydown.left = false;
	});
	$("#up").on("vmousedown",function(){
		keydown.space = true;
	});
	$("#up").on("vmouseup",function(){
		keydown.space = false;
	});
	$("#right").on("vmousedown",function(){
		keydown.right = true;
	});
	$("#right").on("vmouseup",function(){
		keydown.right = false;
	});
});