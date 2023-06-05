function getRandom() {
    return Math.random()+1;
  }
  getRandom();


//// establish audio engine
var AudioContext = window.AudioContext ||
window.webkitAudioContext;

const context = new AudioContext();
const masterVolume = context.createGain();
masterVolume.connect(context.destination);
masterVolume.gain.value = .2;






var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 10;
var x = canvas.width / 2;
var y = canvas.height - 30;
var dx = getRandom()/1.5;
var dy = getRandom()*-1;
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width - paddleWidth) / 2;
var rightPressed = false;
var leftPressed = false;
var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
let score = 0;


var bricks = [];
for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}


document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);




function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function colChange() {
    colCh = '#'+(Math.random()*0xFFFFFF<<0).toString(16); 
}
colChange();

function collisionDetection() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    colChange();
                    score+=1;
                    if (score === brickRowCount * brickColumnCount) {
                        alert("YOU WIN!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawScore(){
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${score}`, 8, 20);
}

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
function drawBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                var brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                var brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function calDistance() {
    const bX = (Math.floor((x / (canvas.width - ballRadius)) * 12)+1)-1;
    const bY = ((((Math.floor((y / (canvas.height - ballRadius)) *4)+1))*-1) + 4);
    const pDl = (Math.floor((paddleX / (canvas.width - (paddleWidth / 2))) * 14)+1)-1;
    const distanceY = (Math.floor((canvas.height - y) - ballRadius)) / canvas.height;
    soundTiming = Math.floor((Math.pow(distanceY, 2) * 2000) + 100);
       
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();
    calDistance(); 
    

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        colChange();
    }
    if (y + dy < ballRadius) {
        dy = -dy;
        colChange();
    }
    else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            if (y = y - paddleHeight) {
                dy = -dy;
                colChange();
            }
        }
        else {
            alert("GAME OVER");
            document.location.reload();
        
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    }
    else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
}

draw();



/////////////synth 
let attackTime = 0.01;
let sustainLevel = 0.125;
let releaseTime = 0.125;

let isPlaying = false;


function noteLoop() {
    if (isPlaying) {
        playSynth();
        //nextNote();
        window.setTimeout(function() {
            noteLoop();
        }, soundTiming)
    };
}


function playSynth() {
    if (!isPlaying){
        isPlaying = true;
        noteLoop();
    };
    const osc = context.createOscillator();
    const noteGain = context.createGain();
    noteGain.gain.setValueAtTime(0, 0);
    noteGain.gain.linearRampToValueAtTime(sustainLevel, context.currentTime + attackTime);
    noteGain.gain.setValueAtTime(sustainLevel, context.currentTime + 0.125 - releaseTime);
    noteGain.gain.linearRampToValueAtTime(0, context.currentTime + 0.125);

    osc.type = "sine";
    osc.frequency.setValueAtTime(240, 0);
    osc.start(0);
    osc.stop((context.currentTime)+0.125);
    
    osc.connect(noteGain);
    noteGain.connect(masterVolume);
    delete osc;
  };



  function stopSynth() {
    isPlaying = false;
    masterVolume.gain.value = 0;
    osc.connect(noteGain);
    noteGain.connect(masterVolume);
    delete osc;
  };








window.addEventListener("DOMContentLoaded", (event) => {
    const startButton = document.getElementById("start-button");
    const stopButton = document.getElementById("stop-button");
    if (startButton) {
        startButton.addEventListener("click", playSynth, false);
    }
    if (startButton) {
        stopButton.addEventListener("click", stopSynth, false);
    }
})







