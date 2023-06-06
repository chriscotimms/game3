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
masterVolume.gain.value = .4;






var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 10;
var x = canvas.width / 2;
var y = canvas.height - 30;
var dx = getRandom()/1;
var dy = getRandom()*-2;
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
var bX = 0;
var curFreq = 240;
var paddlePos = paddleX;
var paddleDifference = curFreq;
var soundTiming = 1000;
var paddleComp = 0;


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
        const myTimeout = setTimeout(assessPaddle, 20);
    
    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
        const myTimeout = setTimeout(assessPaddle, 20);
    
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
                        stopSynth();
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
    bX = (x / (canvas.width - ballRadius));
    const bY = ((((Math.floor((y / (canvas.height - ballRadius)) *2)+1))*-1) + 2);
    paddlePos = ((paddleX) / (canvas.width - paddleWidth* 0.996));
    const distanceY = (Math.floor((canvas.height - y) - ballRadius)) / canvas.height;
    soundTiming = Math.floor((Math.pow(distanceY, 1.75) * 1500) + 100);
};

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
            stopSynth();
        
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 5;
    }
    else if (leftPressed && paddleX > 0) {
        paddleX -= 5;
    }
   
    x += dx;
    y += dy;
    requestAnimationFrame(draw);
    
};




/////////////synth 
let attackTime = 0.01;
let sustainLevel = 0.125;
let releaseTime = 0.125;


let isPlaying = false;

function noteToFreq(note) {
    let a = 440; //frequency of A (coomon value is 440Hz)
    return (a / 32) * (2 ** ((note - 9) / 12));
}



function noteLoop() {
    if (isPlaying) {
       
        curFreq = noteToFreq(64);
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
        draw();
    };

    const osc = context.createOscillator();
    const noteGain = context.createGain();
    noteGain.gain.setValueAtTime(0, 0);
    noteGain.gain.linearRampToValueAtTime(sustainLevel, context.currentTime + attackTime);
    noteGain.gain.setValueAtTime(sustainLevel, context.currentTime + 0.125 - releaseTime);
    noteGain.gain.linearRampToValueAtTime(0, context.currentTime + 0.125);

    osc.type = "sine";
    osc.frequency.setValueAtTime(curFreq, 0);
    osc.start(0);
    osc.stop((context.currentTime)+0.125);
    
    osc.connect(noteGain);
    noteGain.connect(masterVolume);
    delete osc;
  };

  function stopSynth() {
    isPlaying = false;
    masterVolume.gain.value = 0;
    osc.stop();
    osc2.stop();
    osc.connect(noteGain);
    noteGain.connect(masterVolume);
    osc2.connect(noteGain2);
    noteGain2.connect(masterVolume);
    delete osc;
    delete osc2;
    
  };



  function assessPaddle () {
    //compensation for anticipating direction of sound = length of paddleWidth
    if (dx > 0){
        paddleComp = -(paddleWidth/2);
    } else {
        paddleComp = (paddleWidth/2);
    }
    console.log(paddleComp);
    paddleDifference = paddlePos - bX;
    paddleDifference = curFreq + ((paddleDifference * 500) + paddleComp);
    const osc2 = context.createOscillator();
    const noteGain2 = context.createGain();
    noteGain2.gain.setValueAtTime(0, 0);
    noteGain2.gain.linearRampToValueAtTime(sustainLevel, context.currentTime + attackTime);
    noteGain2.gain.setValueAtTime(sustainLevel, context.currentTime + 0.5 - (releaseTime * 4));
    noteGain2.gain.linearRampToValueAtTime(0, context.currentTime + 0.125);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(paddleDifference, 0);
    osc2.start(0);
    osc2.stop((context.currentTime)+0.5);
    osc2.connect(noteGain2);
    noteGain2.connect(masterVolume);

}






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







