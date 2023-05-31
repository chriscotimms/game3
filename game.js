const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let x = canvas.width / 2;
let y = canvas.height - 30;

let dx = -2;
let dy = -2;

const ballRadius = 10;
let colCh = "#43aa91";

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;


const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;


var bricks = [];
for (let c = 0; c < brickColumnCount; c+=1) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r+=1) {
        bricks[c][r] = {x:0, y:0};
    }
}


function drawBricks(){
    for (let c = 0; c < brickColumnCount; c+=1) {
        for (let r = 0; r < brickRowCount; r+=1) {
            const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX,brickY,brickWidth, brickHeight);
            ctx.fillstyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }
    }
}


function colChange() {
    colCh = '#'+(Math.random()*0xFFFFFF<<0).toString(16); 
}
colChange();

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = colCh;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}


function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    x += dx;
    y += dy;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        colChange();
    }

    if (y + dy < ballRadius){
        dy = -dy;
        colChange();
    } else if (y + dy > canvas.height - ballRadius) {

        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy; 
        } else {
        alert("GAME OVER!");
        document.location.reload();
        clearInterval(interval);
        }
    }

    if (rightPressed) {
        paddleX = Math.min(paddleX + 7, canvas.width - paddleWidth);
    } else if (leftPressed) {
        paddleX = Math.max(paddleX -7, 0)
    }

}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight"){
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft"){
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight"){
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft"){
        leftPressed = false;
    }
}

const interval = setInterval(draw, 10);