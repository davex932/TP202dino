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

//weather images
let sunImg;
let rainCloudImg;
let rainCloudV1Img;
let rainDrops1Img;
let rainDrops2Img;
let rainDrops3Img;
let rainDrops4Img;
let rainFrame = 0;

//physics
let velocityX = -8;
let velocityY = 0;
let gravity = .4;

let gameOver = false;
let score = 0;

// duck
let isDucking = false;
let dinoDuckHeight = 60;
let dinoNormalHeight = 94;

// Time-based theme system
let currentTheme = null;

const themes = {
    day: {
        skyColor: "#87CEEB",
        groundColor: "#1a1a1a",
        textColor: "black",
        name: "day"
    },
    sunset: {
        skyColor: "#FF6B35",
        groundColor: "#4a1a1a",
        textColor: "#2d1b1b",
        name: "sunset"
    },
    night: {
        skyColor: "#1a1a2e",
        groundColor: "#0f0f0f",
        textColor: "#e0e0e0",
        name: "night"
    },
    rain: {
        skyColor: "#4a5568",
        groundColor: "#2d3748",
        textColor: "#e2e8f0",
        name: "rain"
    },
    storm: {
        skyColor: "#1a202c",
        groundColor: "#171923",
        textColor: "#f7fafc",
        name: "storm"
    },
};

let currentWeather = null;
let forcedWeatherTheme = null;

function forceWeatherTheme(themeName) {
    if (themes[themeName]) {
        forcedWeatherTheme = themes[themeName];
        currentTheme = forcedWeatherTheme;
        updateTheme();
    }
}

function restoreAutoWeather() {
    forcedWeatherTheme = null;
    updateTheme();
}

const DEFAULT_LAT = 3.8480;
const DEFAULT_LON = 11.5021;

function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
            },
            (error) => {
                resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
            }
        );
    });
}

async function fetchWeather(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response = await fetch(url);
        const data = await response.json();
        currentWeather = data.current_weather;
        return currentWeather;
    } catch (error) {
        return null;
    }
}

function getWeatherTheme() {
    if (!currentWeather) return null;
    const code = currentWeather.weathercode;
    if (code >= 95) return themes.storm;
    if (code >= 80 || code >= 61) return themes.rain;
    return null;
}

function getTimeTheme() {
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 6) return themes.night;
    else if (hour >= 18 && hour < 20) return themes.sunset;
    else return themes.day;
}

function updateTheme() {
    if (forcedWeatherTheme) {
        currentTheme = forcedWeatherTheme;
    } else {
        const weatherTheme = getWeatherTheme();
        const timeTheme = getTimeTheme();
        currentTheme = weatherTheme || timeTheme;
    }
    board.style.backgroundColor = currentTheme.skyColor;
    board.style.borderBottomColor = currentTheme.groundColor;
}

window.onload = async function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    updateTheme();

    try {
        const location = await getLocation();
        await fetchWeather(location.lat, location.lon);
        updateTheme();
    } catch (error) {
        console.error("Weather error:", error);
    }

    context = board.getContext("2d");

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

    sunImg = new Image();
    sunImg.src = "./img/sun.png";

    rainCloudImg = new Image();
    rainCloudImg.src = "./img/rain.png";

    rainCloudV1Img = new Image();
    rainCloudV1Img.src = "./img/rain (1).png";

    rainDrops1Img = new Image();
    rainDrops1Img.src = "./img/rain_drops-01.png";

    rainDrops2Img = new Image();
    rainDrops2Img.src = "./img/rain_drops-02.png";

    rainDrops3Img = new Image();
    rainDrops3Img.src = "./img/rain_drops-03.png";

    rainDrops4Img = new Image();
    rainDrops4Img.src = "./img/rain_drops-04.png";

    requestAnimationFrame(update);
    setInterval(placeCactus, 1500);
    document.addEventListener("keydown", moveDino);
    document.addEventListener("keyup", stopJump);
    board.addEventListener("click", resetGameOnClick);

    // ✅ Son de démarrage ICI (une seule fois)
    sonDebut.play();
}

function resetGame() {
    dino.y = dinoY;
    dino.height = dinoNormalHeight;
    isDucking = false;
    dinoImg.src = "./img/dino.png";
    cactusArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0;
    // ✅ Musique repart au reset
    musicJeu.currentTime = 0;
    musicJeu.play();
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

function drawWeather() {
    if (!currentTheme) return;

    rainFrame = Math.floor(score / 8) % 4;
    let currentRainDrops;
    switch(rainFrame) {
        case 0: currentRainDrops = rainDrops1Img; break;
        case 1: currentRainDrops = rainDrops2Img; break;
        case 2: currentRainDrops = rainDrops3Img; break;
        case 3: currentRainDrops = rainDrops4Img; break;
    }

    const themeName = currentTheme.name;

    if (themeName === "rain" || themeName === "storm") {
        let cloudOpacity = themeName === "storm" ? 0.9 : 0.6;
        context.globalAlpha = cloudOpacity;
        context.drawImage(rainCloudV1Img, boardWidth - 200, 20, 180, 100);
        context.globalAlpha = 1.0;
        context.drawImage(currentRainDrops, 0, 20, boardWidth, boardHeight - 20);
    } else if (themeName === "day" || themeName === "sunset") {
        let sunSize, sunOpacity, sunY;
        if (themeName === "day") {
            sunSize = 80; sunOpacity = 1.0; sunY = 30;
        } else {
            sunSize = 100; sunOpacity = 0.7; sunY = 80;
        }
        context.globalAlpha = sunOpacity;
        context.drawImage(sunImg, boardWidth - sunSize - 20, sunY, sunSize, sunSize);
        context.globalAlpha = 1.0;
    }
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);
    drawWeather();

    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY);

    let currentDinoImg = dinoImg;
    if (dino.y < dinoY) {
        currentDinoImg = dinoImg;
    } else {
        if (Math.floor(score / 10) % 2 == 0) {
            currentDinoImg = dinoRun1Img;
        } else {
            currentDinoImg = dinoRun2Img;
        }
    }

    context.drawImage(currentDinoImg, dino.x, dino.y, dino.width, dino.height);

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
            // ✅ Arrêt des sons + son game over (une seule fois)
            sonDebut.pause();
            sonDebut.currentTime = 0;
            musicJeu.pause();
            musicJeu.currentTime = 0;
            sonGameOver.play();

            dinoImg.src = "./img/dino-dead.png";
            dinoImg.onload = function() {
                context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
            }
            context.drawImage(gameOverImg, boardWidth / 2 - 191, boardHeight / 2 - 30, 382, 21);
            context.drawImage(resetImg, boardWidth / 2 - 36, boardHeight / 2 + 10, 72, 64);
        }
    }

    context.fillStyle = currentTheme ? currentTheme.textColor : "black";
    context.font = "20px courier";
    score++;
    // ✅ Musique démarre au premier score
    if (score == 1) musicJeu.play();
    // ✅ Son score tous les 100 points
    if (score % 100 === 0) sonScorePoint();
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
        velocityY = -12;
        // ✅ Son saut
        sonSaut();
    }

    if (e.code == "ArrowDown" && dino.y == dinoY) {
        isDucking = true;
        dino.height = dinoDuckHeight;
        dino.y = boardHeight - dinoDuckHeight;
    }

    if (e.code == "ArrowUp") {
        isDucking = false;
        dino.height = dinoNormalHeight;
        dino.y = dinoY;
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
    if (gameOver) return;

    let cactus = {
        img : null,
        x : cactusX,
        y : cactusY,
        width : null,
        height: cactusHeight
    }

    let placeCactusChance = Math.random();

    let birdPositions = [
        boardHeight - 160,
        boardHeight - 80,
        boardHeight - 50
    ];

    if (placeCactusChance > .90) {
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    } else if (placeCactusChance > .80) {
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    } else if (placeCactusChance > .70) {
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    } else if (placeCactusChance > .55) {
        cactus.img = bigCactus3Img;
        cactus.width = bigCactus3Width;
        cactus.height = bigCactusHeight;
        cactus.y = bigCactusY;
        cactusArray.push(cactus);
    } else if (placeCactusChance > .40) {
        cactus.img = bigCactus2Img;
        cactus.width = bigCactus2Width;
        cactus.height = bigCactusHeight;
        cactus.y = bigCactusY;
        cactusArray.push(cactus);
    } else if (placeCactusChance > .25) {
        cactus.img = bigCactus1Img;
        cactus.width = bigCactus1Width;
        cactus.height = bigCactusHeight;
        cactus.y = bigCactusY;
        cactusArray.push(cactus);
    } else if (placeCactusChance > .10) {
        cactus.img = bird1Img;
        cactus.type = "bird";
        cactus.width = birdWidth;
        cactus.height = birdHeight;
        cactus.y = birdPositions[Math.floor(Math.random() * birdPositions.length)];
        cactusArray.push(cactus);
    }

    if (cactusArray.length > 5) {
        cactusArray.shift();
    }
}

function detectCollision(a, b) {
    let margin = 5;
    return a.x < b.x + b.width - margin &&
           a.x + a.width > b.x + margin &&
           a.y < b.y + b.height - margin &&
           a.y + a.height > b.y + margin;
}
