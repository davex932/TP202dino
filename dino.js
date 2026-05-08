
//board
let board;
let boardWidth = 1000;
let boardHeight = 350;
let context;

//dino
let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
let dinoImg;
let dinoRun1Img;
let dinoRun2Img;

let dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight
}

//cactus
let cactusArray = [];

let cactus1Width = 34;
let cactus2Width = 69;
let cactus3Width = 102;

let cactusHeight = 70;
let cactusX = 1000;
let cactusY = boardHeight - cactusHeight;

let cactus1Img;
let cactus2Img;
let cactus3Img;

let bigCactus1Width = 50;
let bigCactus2Width = 98;
let bigCactus3Width = 150;
let bigCactusHeight = 98;
let bigCactusY = boardHeight - bigCactusHeight;

let bigCactus1Img;
let bigCactus2Img;
let bigCactus3Img;

let birdWidth = 84;
let birdHeight = 60;

let bird1Img;
let bird2Img;

let gameOverImg;
let resetImg;

//physics
let velocityX = -8; //cactus moving left speed
let velocityY = 0;
let gravity = .4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d"); //used for drawing on the board

    //draw initial dinosaur
    // context.fillStyle="green";
    // context.fillRect(dino.x, dino.y, dino.width, dino.height);

    dinoImg = new Image();
    dinoImg.src = "./img/dino.png";
    dinoImg.onload = function() {
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    }

    dinoRun1Img = new Image();
    dinoRun1Img.src = "./img/dino-run1.png";

    dinoRun2Img = new Image();
    dinoRun2Img.src = "./img/dino-run2.png";

    cactus1Img = new Image();
    cactus1Img.src = "./img/cactus1.png";

    cactus2Img = new Image();
    cactus2Img.src = "./img/cactus2.png";

    cactus3Img = new Image();
    cactus3Img.src = "./img/cactus3.png";

    bigCactus1Img = new Image();
    bigCactus1Img.src = "./img/big-cactus1.png";

    bigCactus2Img = new Image();
    bigCactus2Img.src = "./img/big-cactus2.png";

    bigCactus3Img = new Image();
    bigCactus3Img.src = "./img/big-cactus3.png";

    bird1Img = new Image();
    bird1Img.src = "./img/bird1.png";

    bird2Img = new Image();
    bird2Img.src = "./img/bird2.png";

    gameOverImg = new Image();
    gameOverImg.src = "./img/game-over.png";

    resetImg = new Image();
    resetImg.src = "./img/reset.png";

    requestAnimationFrame(update);
    setInterval(placeCactus, 1500); //1500 milliseconds = 1.5 seconds
    document.addEventListener("keydown", moveDino);
    document.addEventListener("keyup", stopJump);
    board.addEventListener("click", resetGameOnClick);
}

function resetGame() {
    dino.y = dinoY;
    dinoImg.src = "./img/dino.png";
    cactusArray = [];
    score = 0;
    gameOver = false;
    musicJeu.currentTime = 0;
    musicJeu.play();    
    velocityY = 0;
}

function resetGameOnClick(e) {
    if (gameOver) {
        let rect = board.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        let resetX = boardWidth / 2 - 36;
        let resetY = boardHeight / 2 + 10;
        let resetW = 72;
        let resetH = 64;

        if (mouseX >= resetX && mouseX <= resetX + resetW &&
            mouseY >= resetY && mouseY <= resetY + resetH) {
            resetGame();
        }
    }
}

function update() {
    requestAnimationFrame(update);
    sonDebut.play();

    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //dino
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY); //apply gravity to current dino.y, making sure it doesn't exceed the ground
    
    // Animation de course
    let currentDinoImg = dinoImg;
    if (!gameOver) {
        if (dino.y < dinoY) {
            // Optionnel : vous pourriez utiliser dino-jump.png ici si vous voulez
            currentDinoImg = dinoImg; 
        } else {
            // Alterne toutes les 10 frames environ
            if (Math.floor(score / 10) % 2 == 0) {
                currentDinoImg = dinoRun1Img;
            } else {
                currentDinoImg = dinoRun2Img;
            }
        }
    } else {
        currentDinoImg = dinoImg; // dino-dead est déjà géré par dinoImg.src dans la collision
    }

    context.drawImage(currentDinoImg, dino.x, dino.y, dino.width, dino.height);

    //cactus
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;

        if (cactus.type === "bird") {
            if (Math.floor(score / 15) % 2 === 0) {
                cactus.img = bird1Img;
            } else {
                cactus.img = bird2Img;
            }
        }

        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            sonGameOver.play();
            musicJeu.pause();        
    dinoImg.src = "./img/dino-dead.png";
            dinoImg.onload = function() {
                context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
            }
            context.drawImage(gameOverImg, boardWidth / 2 - 191, boardHeight / 2 - 30, 382, 21);
            context.drawImage(resetImg, boardWidth / 2 - 36, boardHeight / 2 + 10, 72, 64);
        }
    }

    //score
    context.fillStyle="black";
    context.font="20px courier";
    score++;
    if (score == 1) musicJeu.play();
    if (score % 100 === 0) sonScore();
    context.fillText(score, 5, 20);
}

function moveDino(e) {
    if (gameOver) {
        if (e.code == "Space" || e.code == "ArrowUp") {
            resetGame();
        }
        return;
    }

    if ((e.code == "Space" || e.code == "ArrowUp") && dino.y == dinoY) {
        //jump
        velocityY = -12;
        sonSaut();
    }
    else if (e.code == "ArrowDown" && dino.y == dinoY) {
        //duck
    }

}

function stopJump(e) {
    if (e.code == "Space" || e.code == "ArrowUp") {
        if (velocityY < -5) {
            velocityY = -5;
        }
    }
}

function placeCactus() {
    if (gameOver) {
        return;
    }

    //place cactus
    let cactus = {
        img : null,
        x : cactusX,
        y : cactusY,
        width : null,
        height: cactusHeight
    }

    let placeCactusChance = Math.random(); //0 - 0.9999...

    if (placeCactusChance > .90) { 
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .80) { 
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .70) { 
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .55) { // big cactus
        cactus.img = bigCactus3Img;
        cactus.width = bigCactus3Width;
        cactus.height = bigCactusHeight;
        cactus.y = bigCactusY;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .40) { // big cactus
        cactus.img = bigCactus2Img;
        cactus.width = bigCactus2Width;
        cactus.height = bigCactusHeight;
        cactus.y = bigCactusY;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .25) { // big cactus
        cactus.img = bigCactus1Img;
        cactus.width = bigCactus1Width;
        cactus.height = bigCactusHeight;
        cactus.y = bigCactusY;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .10) { // bird
        cactus.img = bird1Img;
        cactus.type = "bird";
        cactus.width = birdWidth;
        cactus.height = birdHeight;
        
        let birdPositions = [boardHeight - 160, boardHeight - 80];
        cactus.y = birdPositions[Math.floor(Math.random() * birdPositions.length)];
        
        cactusArray.push(cactus);
    }

    if (cactusArray.length > 5) {
        cactusArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
