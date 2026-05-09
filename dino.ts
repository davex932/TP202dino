
// Interfaces
interface Theme {
    skyColor: string;
    groundColor: string;
    textColor: string;
    name: string;
}

interface Themes {
    [key: string]: Theme;
}

interface Cactus {
    img: HTMLImageElement | null;
    x: number;
    y: number;
    width: number | null;
    height: number;
    type?: string;
}

interface Dino {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface WeatherData {
    weathercode: number;
    [key: string]: any;
}

interface PlayerScore {
    name: string;
    score: number;
}

// These are defined in son.ts (global scope)
// No need to declare them here as TS sees them in the same project

// board
let board: HTMLCanvasElement;
const boardWidth: number = 1000;
const boardHeight: number = 350;
let context: CanvasRenderingContext2D;

// dino
const dinoWidth: number = 88;
const dinoHeight: number = 94;
const dinoX: number = 50;
const dinoY: number = boardHeight - dinoHeight;
let dinoImg: HTMLImageElement;
let dinoRun1Img: HTMLImageElement;
let dinoRun2Img: HTMLImageElement;

let dino: Dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight
}

// Ducking
let isDucking: boolean = false;
const dinoDuckHeight: number = 60;
const dinoNormalHeight: number = 94;

// cactus
let cactusArray: Cactus[] = [];

let cactus1Width: number = 34;
let cactus2Width: number = 69;
let cactus3Width: number = 102;

const cactusHeight: number = 70;
const cactusX: number = 1000;
const cactusY: number = boardHeight - cactusHeight;

let cactus1Img: HTMLImageElement;
let cactus2Img: HTMLImageElement;
let cactus3Img: HTMLImageElement;

let bigCactus1Width: number = 50;
let bigCactus2Width: number = 98;
let bigCactus3Width: number = 150;
const bigCactusHeight: number = 98;
const bigCactusY: number = boardHeight - bigCactusHeight;

let bigCactus1Img: HTMLImageElement;
let bigCactus2Img: HTMLImageElement;
let bigCactus3Img: HTMLImageElement;

const birdWidth: number = 84;
const birdHeight: number = 60;

let bird1Img: HTMLImageElement;
let bird2Img: HTMLImageElement;

let gameOverImg: HTMLImageElement;
let resetImg: HTMLImageElement;

//weather images
let sunImg: HTMLImageElement;
let rainCloudImg: HTMLImageElement;
let rainCloudV1Img: HTMLImageElement;
let rainDrops1Img: HTMLImageElement;
let rainDrops2Img: HTMLImageElement;
let rainDrops3Img: HTMLImageElement;
let rainDrops4Img: HTMLImageElement;
let rainFrame: number = 0;

// physics
let velocityX: number = -8; // cactus moving left speed
let velocityY: number = 0;
const gravity: number = 0.4;

let gameOver: boolean = false;
let score: number = 0;

// Scoring and screens
let currentPlayerName: string = "Joueur";
let nameIsConfigured: boolean = false;
let topScoresToDisplay: PlayerScore[] = [];

type ScreenType = "gameOver" | "nameEntry" | "scores";
let currentScreen: ScreenType = "gameOver";
let playerNameInput: string = "";
let lastScore: number = 0;

// Time-based theme system
let currentTheme: Theme | null = null;

const themes: Themes = {
    day: {
        skyColor: "#87CEEB",      // Bleu ciel
        groundColor: "#1a1a1a",  // Noir (bordure)
        textColor: "black",
        name: "day"
    },
    sunset: {
        skyColor: "#FF6B35",      // Orange/Rouge coucher de soleil
        groundColor: "#4a1a1a",  // Rouge foncé
        textColor: "#2d1b1b",
        name: "sunset"
    },
    night: {
        skyColor: "#1a2e",      // Bleu nuit
        groundColor: "#0f0f0f",   // Noir profond
        textColor: "#e0e0e0",     // Blanc cassé
        name: "night"
    },
    rain: {
        skyColor: "#4a5568",      // Gris bleuté
        groundColor: "#2d3748",   // Gris foncé
        textColor: "#e2e8f0",     // Blanc
        name: "rain"
    },
    storm: {
        skyColor: "#1a202c",      // Gris très foncé
        groundColor: "#171923",   // Presque noir
        textColor: "#f7fafc",     // Blanc
        name: "storm"
    },
};

// Weather data storage
let currentWeather: WeatherData | null = null;
let forcedWeatherTheme: Theme | null = null; // Pour simulation manuelle

// Simulation functions (appelées par les boutons HTML)
function forceWeatherTheme(themeName: string): void {
    if (themes[themeName]) {
        forcedWeatherTheme = themes[themeName]!;
        currentTheme = forcedWeatherTheme;
        updateTheme();
        console.log("Weather forced to:", themeName);
    }
}

function restoreAutoWeather(): void {
    forcedWeatherTheme = null;
    updateTheme(); // Retourne à la météo réelle ou heure
    console.log("Weather restored to auto mode");
}

// Default location (Yaoundé, Cameroon)
const DEFAULT_LAT: number = 3.8480;
const DEFAULT_LON: number = 11.5021;

function getLocation(): Promise<{lat: number, lon: number}> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.log("Geolocation not supported, using default location");
            resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                console.log("Geolocation error:", error.message);
                console.log("Using default location");
                resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
            }
        );
    });
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
        const url: string = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response: Response = await fetch(url);
        const data: any = await response.json();
        
        currentWeather = data.current_weather;
        console.log("Weather:", currentWeather);
        return currentWeather;
    } catch (error) {
        console.error("Weather fetch error:", error);
        return null;
    }
}

function getWeatherTheme(): Theme | null {
    if (!currentWeather) return null;
    
    const code: number = currentWeather.weathercode;
    
    // WMO Weather interpretation codes (WW)
    // 0 = Clear sky
    // 1, 2, 3 = Partly cloudy
    // 45, 48 = Fog
    // 51-55 = Drizzle
    // 61-65 = Rain
    // 71-77 = Snow
    // 80-82 = Rain showers
    // 95-99 = Thunderstorm
    
    if (code >= 95) return themes["storm"] || null;           // Orage
    if (code >= 80 || code >= 61) return themes["rain"] || null;  // Pluie
    
    return null; // Pas de météo spéciale, utiliser heure
}

function getTimeTheme(): Theme {
    const hour: number = new Date().getHours();
    // Nuit : 20h - 6h
    // Coucher de soleil : 18h - 20h
    // Jour : 6h - 18h
    if (hour >= 20 || hour < 6) {
        return themes["night"]!;
    } else if (hour >= 18 && hour < 20) {
        return themes["sunset"]!;
    } else {
        return themes["day"]!;
    }
}

function updateTheme(): void {
    // Priorité : Forcé > Météo réelle > Heure
    if (forcedWeatherTheme) {
        currentTheme = forcedWeatherTheme;
    } else {
        const weatherTheme: Theme | null = getWeatherTheme();
        const timeTheme: Theme = getTimeTheme();
        // Si météo spéciale (pluie, orage, neige), l'utiliser
        // Sinon, utiliser le thème basé sur l'heure
        currentTheme = weatherTheme || timeTheme;
    }
    
    if (currentTheme && board) {
        board.style.backgroundColor = currentTheme.skyColor;
        board.style.borderBottomColor = currentTheme.groundColor;
    }
}

window.onload = async function() {
    board = document.getElementById("board") as HTMLCanvasElement;
    board.height = boardHeight;
    board.width = boardWidth;

    // Initialize theme with time (fallback)
    updateTheme();
    
    // Get location and weather
    try {
        console.log("Getting location...");
        const location = await getLocation();
        console.log("Location:", location.lat, location.lon);
        
        console.log("Fetching weather...");
        await fetchWeather(location.lat, location.lon);
        
    // Update theme with weather priority
    updateTheme();
    if (currentTheme) console.log("Theme updated to:", currentTheme.name);

    } catch (error) {
        console.error("Weather initialization error:", error);
    }

    // --- SÉCURITÉ : DEMANDE DU NOM (Toujours exécutée) ---
    const storedPlayerName: string | null = localStorage.getItem("currentPlayerName");
    if (storedPlayerName) {
        currentPlayerName = storedPlayerName;
        nameIsConfigured = true;
    }

    // Force TOUJOURS l'arrêt au démarrage
    gameOver = true;
    currentScreen = "nameEntry";
    // ----------------------------------------------------

    context = board.getContext("2d")!; //used for drawing on the board

    // draw initial dinosaur
    dinoImg = new Image();
    dinoImg.src = "./img/dino.png";
    dinoImg.onload = function() {
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    };

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

    // Load weather images
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
    setInterval(placeCactus, 1500); //1500 milliseconds = 1.5 seconds
    
    // Play start sound once (might be blocked until interaction)
    sonDebut.play().catch(e => console.log("Audio autoplay blocked, will start on interaction"));

    document.addEventListener("keydown", (e: KeyboardEvent) => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        moveDino(e);
    });
    document.addEventListener("keyup", stopJump);
    board.addEventListener("click", (e: MouseEvent) => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        resetGameOnClick(e);
    });
}

function resetGame(): void {
    dino.y = dinoY;
    dinoImg.src = "./img/dino.png";
    cactusArray = [];
    score = 0;
    gameOver = false;
    musicJeu.currentTime = 0;
    musicJeu.play();    
    velocityY = 0;
    currentScreen = "gameOver"; // Réinitialiser l'écran
    playerNameInput = ""; // Réinitialiser la saisie du nom
}

function resetGameOnClick(e: MouseEvent): void {
    if (gameOver) {
        let rect: DOMRect = board.getBoundingClientRect();
        let mouseX: number = e.clientX - rect.left;
        let mouseY: number = e.clientY - rect.top;

        let resetX: number = boardWidth / 2 - 36;
        let resetY: number = boardHeight / 2 + 10;
        let resetW: number = 72;
        let resetH: number = 64;

        if (mouseX >= resetX && mouseX <= resetX + resetW &&
            mouseY >= resetY && mouseY <= resetY + resetH) {
            resetGame();
        }

        // Zone pour changer de nom (bas de l'écran des scores)
        if (currentScreen === "scores" && 
            mouseY > boardHeight / 2 + 130 && mouseY < boardHeight / 2 + 160) {
            currentScreen = "nameEntry";
            nameIsConfigured = false;
        }
    }
}

function drawWeather(): void {
    if (!currentTheme) return;
    
    // Animation des gouttes de pluie (toutes les 8 frames)
    rainFrame = Math.floor(score / 8) % 4;
    let currentRainDrops: HTMLImageElement;
    switch(rainFrame) {
        case 0: currentRainDrops = rainDrops1Img; break;
        case 1: currentRainDrops = rainDrops2Img; break;
        case 2: currentRainDrops = rainDrops3Img; break;
        case 3: currentRainDrops = rainDrops4Img; break;
        default: currentRainDrops = rainDrops1Img;
    }
    
    const themeName: string = currentTheme.name;
    
    // Affichage selon la météo
    if (themeName === "rain" || themeName === "storm") {
        // Nuage de pluie (transparent pour rain, plus opaque pour storm)
        let cloudOpacity: number = themeName === "storm" ? 0.9 : 0.6;
        context.globalAlpha = cloudOpacity;
        context.drawImage(rainCloudV1Img, boardWidth - 200, 20, 180, 100);
        context.globalAlpha = 1.0;
        
        // Gouttes de pluie animées (commence plus haut à y=20)
        context.drawImage(currentRainDrops, 0, 20, boardWidth, boardHeight - 20);
        
    } else if (themeName === "day" || themeName === "sunset") {
        // Soleil avec taille et opacité variables
        let sunSize: number, sunOpacity: number, sunY: number;
        
        if (themeName === "day") {
            sunSize = 80;
            sunOpacity = 1.0;
            sunY = 30;
        } else { // sunset
            sunSize = 100; // Plus gros au coucher
            sunOpacity = 0.7; // Plus tamisé
            sunY = 80; // Plus bas
        }
        
        context.globalAlpha = sunOpacity;
        context.drawImage(sunImg, boardWidth - sunSize - 20, sunY, sunSize, sunSize);
        context.globalAlpha = 1.0;
    } else if (themeName === "night") {
        // Dessiner une lune (cercle blanc)
        context.fillStyle = "white";
        context.beginPath();
        context.arc(boardWidth - 50, 40, 20, 0, Math.PI * 2);
        context.fill();
        
        // Ajouter quelques étoiles aléatoires basées sur le score
        context.fillStyle = "white";
        for (let i = 0; i < 10; i++) {
            let x: number = (i * 113 + score) % boardWidth;
            let y: number = (i * 77) % 150;
            context.fillRect(x, y, 2, 2);
        }
    }
}

function update(): void {
    requestAnimationFrame(update);

    if (gameOver) {
        // Nettoyer l'écran pour les menus de fin
        context.clearRect(0, 0, board.width, board.height);
        
        // Afficher l'écran approprié
        if (currentScreen === "nameEntry") {
            console.log("État: Saisie du nom");
            drawNameEntryScreen();
        } else if (currentScreen === "scores") {
            console.log("État: Tableau des scores");
            drawScoresScreen();
        } else {
            console.log("État inconnu, retour aux scores");
            currentScreen = "scores";
            drawScoresScreen();
        }
        return;
    }
    context.clearRect(0, 0, board.width, board.height);
    
    // Draw weather effects
    drawWeather();

    // dino
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY); //apply gravity to current dino.y, making sure it doesn't exceed the ground
    
    // Animation de course
    let currentDinoImg: HTMLImageElement = dinoImg;
    
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

    context.drawImage(currentDinoImg, dino.x, dino.y, dino.width, dino.height);

    // cactus
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus: Cactus = cactusArray[i]!;
        cactus.x += velocityX;

        if (cactus.type === "bird") {
            if (Math.floor(score / 15) % 2 === 0) {
                cactus.img = bird1Img;
            } else {
                cactus.img = bird2Img;
            }
        }

        if (cactus.img) {
            context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width!, cactus.height);
        }

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            lastScore = score;
            sonGameOver.play();
            musicJeu.pause();

            // Si le nom est déjà configuré, on affiche direct les scores
            // Sinon on demande le nom
            if (nameIsConfigured) {
                saveScore(currentPlayerName, lastScore);
                currentScreen = "scores";
            } else {
                currentScreen = "nameEntry";
            }

            dinoImg.src = "./img/dino-dead.png";
        }
    }

    // score
    context.fillStyle = currentTheme ? currentTheme.textColor : "black";
    context.font="20px courier";
    score++;
    if (score == 1) musicJeu.play();
    if (score % 100 === 0) sonScore();
    context.fillText(score.toString(), 5, 20);

    // Afficher le nom du joueur en haut à droite
    context.textAlign = "right";
    context.fillText(`Joueur: ${currentPlayerName}`, boardWidth - 10, 20);
    context.textAlign = "left";
}

function moveDino(e: KeyboardEvent): void {
    if (gameOver) {
        // Écran de saisie du nom : on utilise maintenant un input HTML réel
        if (currentScreen === "nameEntry") {
            // On laisse l'input HTML gérer les touches
            return;
        }

        // Écran des scores: ESPACE pour recommencer
        if (currentScreen === "scores" && (e.code === "Space" || e.code === "ArrowUp")) {
            resetGame();
            e.preventDefault();
            return;
        }

        if (e.code === "Space" || e.code === "ArrowUp") {
            resetGame();
        }
        return;
    }

    if ((e.code === "Space" || e.code === "ArrowUp") && dino.y === dinoY) {
        //jump
        velocityY = -12;
        sonSaut();
    }
    else if (e.code == "ArrowDown" && dino.y == dinoY) {
        //duck
    }

    if (e.code == "ArrowDown" && dino.y == dinoY) {
        isDucking = true;
        dino.height = dinoDuckHeight;
        dino.y = boardHeight - dinoDuckHeight;
    }

    if (e.code == "ArrowUp" || e.code == "Space") {
        if (isDucking) {
            isDucking = false;
            dino.height = dinoNormalHeight;
            dino.y = dinoY;
        }
    }

}

function stopJump(e: KeyboardEvent): void {
    if (e.code == "Space" || e.code == "ArrowUp") {
        if (velocityY < -5) {
            velocityY = -5;
        }
    }
    if (e.code == "ArrowDown") {
        isDucking = false;
        dino.height = dinoNormalHeight;
        dino.y = dinoY;
    }
}

function placeCactus(): void {
    if (gameOver) {
        return;
    }

    // place cactus
    let cactus: Cactus = {
        img : null,
        x : cactusX,
        y : cactusY,
        width : null,
        height: cactusHeight
    }

    let placeCactusChance: number = Math.random(); //0 - 0.9999...

    let birdPositions: number[] = [
        boardHeight - 200,  // Haut (on passe dessous)
        boardHeight - 130,  // Milieu (duck obligatoire)
        boardHeight - 80    // Bas (saut obligatoire)
    ];

    if (placeCactusChance > 0.90) { 
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    } else if (placeCactusChance > 0.80) { 
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    } else if (placeCactusChance > 0.70) { 
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    } else if (placeCactusChance > 0.55) { // big cactus
        cactus.img = bigCactus3Img;
        cactus.width = bigCactus3Width;
        cactus.height = bigCactusHeight;
        cactus.y = bigCactusY;
        cactusArray.push(cactus);
    } else if (placeCactusChance > 0.40) { // big cactus
        cactus.img = bigCactus2Img;
        cactus.width = bigCactus2Width;
        cactus.height = bigCactusHeight;
        cactus.y = bigCactusY;
        cactusArray.push(cactus);
    } else if (placeCactusChance > 0.25) { // big cactus
        cactus.img = bigCactus1Img;
        cactus.width = bigCactus1Width;
        cactus.height = bigCactusHeight;
        cactus.y = bigCactusY;
        cactusArray.push(cactus);
    } else if (placeCactusChance > 0.10) { // bird
        cactus.img = bird1Img;
        cactus.type = "bird";
        cactus.width = birdWidth;
        cactus.height = birdHeight;
        
        cactus.y = birdPositions[Math.floor(Math.random() * birdPositions.length)]!;
        
        cactusArray.push(cactus);
    }

    if (cactusArray.length > 5) {
        cactusArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

function detectCollision(a: Dino, b: Cactus): boolean {
    let margin: number = 5;
    return a.x < b.x + (b.width || 0) - margin &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x + margin &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height - margin &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y + margin;    //a's bottom left corner passes b's top left corner

    context.textAlign = "left";
}

/**
 * Sauvegarde le score du joueur dans localStorage.
 */
function saveScore(playerName: string, currentScore: number): void {
    try {
        const storedScores: string | null = localStorage.getItem("dinoScores");
        let scores: PlayerScore[] = storedScores ? JSON.parse(storedScores) : [];
        scores.push({ name: playerName, score: currentScore });
        localStorage.setItem("dinoScores", JSON.stringify(scores));
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du score :", error);
    }
}

/**
 * Récupère les 3 meilleurs scores depuis localStorage.
 */
function getTopScores(): PlayerScore[] {
    try {
        const storedScores: string | null = localStorage.getItem("dinoScores");
        let scores: PlayerScore[] = storedScores ? JSON.parse(storedScores) : [];
        scores.sort((a: PlayerScore, b: PlayerScore) => b.score - a.score);
        return scores.slice(0, 3);
    } catch (error) {
        console.error("Erreur lors de la récupération des scores :", error);
        return [];
    }
}

/**
 * Dessine l'écran "Game Over" sur le canvas.
 */
function drawGameOverScreen(): void {
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, boardWidth, boardHeight);

    context.fillStyle = "red";
    context.font = "bold 60px courier";
    context.textAlign = "center";
    context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2 - 60);

    context.fillStyle = "white";
    context.font = "30px courier";
    context.fillText("Score: " + lastScore, boardWidth / 2, boardHeight / 2 + 20);

    context.fillStyle = "yellow";
    context.font = "20px courier";
    context.fillText("Appuyez sur ESPACE pour continuer", boardWidth / 2, boardHeight / 2 + 80);
    context.textAlign = "left";
}

function drawNameEntryScreen(): void {
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fillRect(0, 0, boardWidth, boardHeight);

    // Cadre blanc
    context.fillStyle = "white";
    context.fillRect(boardWidth / 2 - 350, boardHeight / 2 - 90, 700, 180);

    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeRect(boardWidth / 2 - 350, boardHeight / 2 - 90, 700, 180);

    context.fillStyle = "black";
    context.font = "bold 24px courier";
    context.textAlign = "center";
    context.fillText("Enregistrer votre nom", boardWidth / 2, boardHeight / 2 - 50);

    // Créer ou récupérer l'input HTML réel s'il n'existe pas encore
    let nameInput = document.getElementById("nameInput") as HTMLInputElement;
    if (!nameInput) {
        nameInput = document.createElement("input");
        nameInput.id = "nameInput";
        nameInput.type = "text";
        nameInput.maxLength = 15;
        nameInput.placeholder = "Votre nom...";
        nameInput.value = nameIsConfigured ? currentPlayerName : ""; // Pré-remplir si déjà connu
        nameInput.style.position = "absolute";
        
        // Positionnement précis par-dessus le canvas
        const rect = board.getBoundingClientRect();
        nameInput.style.left = (rect.left + rect.width / 2 - 125) + "px";
        nameInput.style.top = (rect.top + rect.height / 2 - 15) + "px";
        nameInput.style.width = "250px";
        nameInput.style.height = "30px";
        nameInput.style.fontSize = "20px";
        nameInput.style.textAlign = "center";
        nameInput.style.zIndex = "1000";
        
        document.body.appendChild(nameInput);
        nameInput.focus();

        // Gérer la validation par la touche Entrée
        nameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const val = nameInput.value.trim();
                if (val.length > 0) {
                    currentPlayerName = val;
                    localStorage.setItem("currentPlayerName", currentPlayerName);
                    nameIsConfigured = true;
                    nameInput.remove(); // Supprimer l'input
                    
                    if (score === 0) {
                        // Si on est au début, on lance le jeu directement
                        resetGame();
                    } else {
                        // Si on vient de perdre, on montre les scores
                        saveScore(currentPlayerName, lastScore);
                        currentScreen = "scores";
                    }
                }
            }
        });
    }

    context.fillStyle = "darkblue";
    context.font = "16px courier";
    context.textAlign = "center";
    context.fillText("Appuyez sur ENTRÉE pour valider", boardWidth / 2, boardHeight / 2 + 70);
    context.textAlign = "left";
}

/**
 * Dessine l'écran des scores sur le canvas.
 */
function drawScoresScreen(): void {
    console.log("Affichage de la table des scores...");
    // Nettoyage complet forcé
    context.clearRect(0, 0, boardWidth, boardHeight);
    
    // Arrière-plan semi-transparent (hauteur 320 au lieu de 380)
    context.fillStyle = "rgba(255, 255, 255, 0.98)";
    context.fillRect(boardWidth / 2 - 350, 15, 700, 320);

    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeRect(boardWidth / 2 - 350, boardHeight / 2 - 160, 700, 320);

    context.fillStyle = "black";
    context.font = "bold 28px courier";
    context.textAlign = "center";
    context.fillText("🏆 Meilleurs Scores", boardWidth / 2, boardHeight / 2 - 125);

    context.fillStyle = "yellow";
    context.fillRect(boardWidth / 2 - 320, boardHeight / 2 - 100, 640, 40);
    context.strokeStyle = "gold";
    context.lineWidth = 2;
    context.strokeRect(boardWidth / 2 - 320, boardHeight / 2 - 100, 640, 40);
    
    context.fillStyle = "black";
    context.font = "bold 18px courier";
    context.fillText("📊 Votre score: " + lastScore + " | Joueur: " + currentPlayerName, boardWidth / 2, boardHeight / 2 - 72);

    context.strokeStyle = "gray";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(boardWidth / 2 - 320, boardHeight / 2 - 50);
    context.lineTo(boardWidth / 2 + 320, boardHeight / 2 - 50);
    context.stroke();

    context.fillStyle = "darkblue";
    context.font = "bold 18px courier";
    context.fillText("Top 3 de tous les jeux:", boardWidth / 2, boardHeight / 2 - 25);

    context.font = "18px courier";
    topScoresToDisplay = getTopScores();
    if (topScoresToDisplay.length === 0) {
        context.fillStyle = "gray";
        context.fillText("Pas encore de scores enregistrés", boardWidth / 2, boardHeight / 2 + 10);
    } else {
        topScoresToDisplay.forEach((entry: PlayerScore, index: number) => {
            const yPos: number = boardHeight / 2 + 10 + (index * 30);
            
            if (entry.name === currentPlayerName && entry.score === lastScore) {
                context.fillStyle = "lightblue";
                context.fillRect(boardWidth / 2 - 280, yPos - 20, 560, 25);
            }
            
            let medal = "";
            if (index === 0) medal = "🥇";
            else if (index === 1) medal = "🥈";
            else if (index === 2) medal = "🥉";
            
            context.fillStyle = "black";
            context.fillText(medal + " " + (index + 1) + ". " + entry.name + ": " + entry.score, boardWidth / 2, yPos);
        });
    }

    context.font = "14px courier";
    context.fillStyle = "darkblue";
    context.textAlign = "center";
    context.fillText("Appuyez sur ESPACE pour recommencer", boardWidth / 2, boardHeight / 2 + 120);
    
    context.fillStyle = "red";
    context.font = "bold 14px courier";
    context.fillText("[ Cliquer ici pour changer de nom ]", boardWidth / 2, boardHeight / 2 + 145);
    context.textAlign = "left";
}
