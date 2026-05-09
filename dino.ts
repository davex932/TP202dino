
// Définition des interfaces TypeScript pour typer les objets du jeu
interface Dino {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Cactus {
    img: HTMLImageElement | null;
    x: number;
    y: number;
    width: number;
    height: number;
    type?: string; // Optionnel pour les oiseaux
}

interface PlayerScore {
    name: string;
    score: number;
}

// Variables globales avec types
let board: HTMLCanvasElement;
let boardWidth: number = 1000;
let boardHeight: number = 350;
let context: CanvasRenderingContext2D;

// Dino
let dinoWidth: number = 88;
let dinoHeight: number = 94;
let dinoX: number = 50;
let dinoY: number = boardHeight - dinoHeight;
let dinoImg: HTMLImageElement;
let dinoRun1Img: HTMLImageElement;
let dinoRun2Img: HTMLImageElement;

let dino: Dino = {
    x: dinoX,
    y: dinoY,
    width: dinoWidth,
    height: dinoHeight
};

// Cactus
let cactusArray: Cactus[] = [];

let cactus1Width: number = 34;
let cactus2Width: number = 69;
let cactus3Width: number = 102;

let cactusHeight: number = 70;
let cactusX: number = 1000;
let cactusY: number = boardHeight - cactusHeight;

let cactus1Img: HTMLImageElement;
let cactus2Img: HTMLImageElement;
let cactus3Img: HTMLImageElement;

let bigCactus1Width: number = 50;
let bigCactus2Width: number = 98;
let bigCactus3Width: number = 150;
let bigCactusHeight: number = 98;
let bigCactusY: number = boardHeight - bigCactusHeight;

let bigCactus1Img: HTMLImageElement;
let bigCactus2Img: HTMLImageElement;
let bigCactus3Img: HTMLImageElement;

let birdWidth: number = 84;
let birdHeight: number = 60;

let bird1Img: HTMLImageElement;
let bird2Img: HTMLImageElement;

let gameOverImg: HTMLImageElement;
let resetImg: HTMLImageElement;

// Physics
let velocityX: number = -8; // Vitesse de déplacement des cactus vers la gauche
let velocityY: number = 0;
let gravity: number = 0.4;

let gameOver: boolean = false;
let score: number = 0;

// Nouvelles variables pour les scores avec types
let playerScores: PlayerScore[] = []; // Array temporaire pour stocker les scores récupérés
let currentPlayerName: string = "Joueur"; // Nom du joueur actuel
let nameIsConfigured: boolean = false; // Vrai si un nom est déjà enregistré
let topScoresToDisplay: PlayerScore[] = []; // Top 3 scores à afficher

// Variables pour la gestion des écrans
type ScreenType = "gameOver" | "nameEntry" | "scores";
let currentScreen: ScreenType = "gameOver"; // Quel écran afficher après game over
let playerNameInput: string = ""; // Texte saisi par le joueur pour entrer son nom
let lastScore: number = 0; // Score de la dernière partie

window.onload = function() {
    board = document.getElementById("board") as HTMLCanvasElement;
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d")!; //used for drawing on the board

    // Récupérer le nom du joueur stocké (pas de demande au démarrage)
    const storedPlayerName: string | null = localStorage.getItem("currentPlayerName");
    if (storedPlayerName) {
        currentPlayerName = storedPlayerName;
        nameIsConfigured = true;
    }

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

function resetGame(): void {
    dino.y = dinoY;
    dinoImg.src = "./img/dino.png";
    cactusArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0;
    currentScreen = "gameOver"; // Réinitialiser l'écran
    playerNameInput = ""; // Réinitialiser la saisie du nom
}

function resetGameOnClick(e: MouseEvent): void {
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

        if (cactus.img) {
            context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);
        }

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            lastScore = score;
            currentScreen = "gameOver";
            dinoImg.src = "./img/dino-dead.png";
            dinoImg.onload = function() {
                context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
            }
            context.drawImage(gameOverImg, boardWidth / 2 - 191, boardHeight / 2 - 30, 382, 21);
            context.drawImage(resetImg, boardWidth / 2 - 36, boardHeight / 2 + 10, 72, 64);
            break;
        }
    }

    //score
    context.fillStyle="black";
    context.font="20px courier";
    score++;
    context.fillText(score.toString(), 5, 20);

    // Afficher le nom du joueur en haut à droite
    context.textAlign = "right";
    context.fillText(`Joueur: ${currentPlayerName}`, boardWidth - 10, 20);
    context.textAlign = "left";

    // Afficher l'écran approprié si le jeu est terminé
    if (gameOver) {
        if (currentScreen === "gameOver") {
            drawGameOverScreen();
        } else if (currentScreen === "nameEntry") {
            drawNameEntryScreen();
        } else if (currentScreen === "scores") {
            drawScoresScreen();
        }
    }
}

function moveDino(e: KeyboardEvent): void {
    if (gameOver) {
        // Écran Game Over: ESPACE pour continuer
        if (currentScreen === "gameOver" && (e.code === "Space" || e.code === "ArrowUp")) {
            // Si le joueur a déjà un nom, aller directement aux scores
            if (nameIsConfigured) {
                saveScore(currentPlayerName, lastScore);
                currentScreen = "scores";
            } else {
                // Sinon demander son nom
                currentScreen = "nameEntry";
                playerNameInput = "";
            }
            e.preventDefault();
            return;
        }

        // Écran de saisie du nom
        if (currentScreen === "nameEntry") {
            // ENTRÉE pour valider le nom
            if (e.code === "Enter") {
                if (playerNameInput.trim().length === 0) {
                    playerNameInput = "Anonyme";
                }
                currentPlayerName = playerNameInput.trim();
                localStorage.setItem("currentPlayerName", currentPlayerName);
                nameIsConfigured = true;
                
                // Sauvegarder le score
                saveScore(currentPlayerName, lastScore);
                
                // Passer à l'écran des scores
                currentScreen = "scores";
                e.preventDefault();
                return;
            }

            // Autres touches alphanumériques
            if (e.key.length === 1 && playerNameInput.length < 20) {
                playerNameInput += e.key;
                e.preventDefault();
                return;
            }

            // Backspace pour supprimer
            if (e.code === "Backspace" && playerNameInput.length > 0) {
                playerNameInput = playerNameInput.slice(0, -1);
                e.preventDefault();
                return;
            }
        }

        // Écran des scores: ESPACE pour recommencer
        if (currentScreen === "scores" && (e.code === "Space" || e.code === "ArrowUp")) {
            resetGame();
            e.preventDefault();
            return;
        }

        return;
    }

    if ((e.code === "Space" || e.code === "ArrowUp") && dino.y === dinoY) {
        //jump
        velocityY = -12;
    }
    else if (e.code === "ArrowDown" && dino.y === dinoY) {
        //duck
    }
}

function stopJump(e: KeyboardEvent): void {
    if (e.code === "Space" || e.code === "ArrowUp") {
        if (velocityY < -5) {
            velocityY = -5;
        }
    }
}

function placeCactus(): void {
    if (gameOver) {
        return;
    }

    //place cactus
    let cactus: Cactus = {
        img: null,
        x: cactusX,
        y: cactusY,
        width: 0,
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

function detectCollision(a: Dino, b: Cactus): boolean {
    return a.x < b.x + (b.width || 0) &&   // a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   // a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  // a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    // a's bottom left corner passes b's top left corner
}

/**
 * Sauvegarde le score du joueur dans localStorage.
 * @param playerName Le nom du joueur saisi.
 * @param currentScore Le score actuel de la partie.
 */
function saveScore(playerName: string, currentScore: number): void {
    try {
        // Récupérer les scores existants depuis localStorage
        const storedScores: string | null = localStorage.getItem("dinoScores");
        let scores: PlayerScore[] = storedScores ? JSON.parse(storedScores) : [];

        // Ajouter le nouveau score
        scores.push({ name: playerName, score: currentScore });

        // Sauvegarder dans localStorage
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
        // Récupérer les scores depuis localStorage
        const storedScores: string | null = localStorage.getItem("dinoScores");
        let scores: PlayerScore[] = storedScores ? JSON.parse(storedScores) : [];

        // Trier par score décroissant
        scores.sort((a: PlayerScore, b: PlayerScore) => b.score - a.score);

        // Retourner seulement les 3 premiers
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
    // Arrière-plan semi-transparent
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, boardWidth, boardHeight);

    // Titre "GAME OVER"
    context.fillStyle = "red";
    context.font = "bold 60px courier";
    context.textAlign = "center";
    context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2 - 60);

    // Score
    context.fillStyle = "white";
    context.font = "30px courier";
    context.fillText(`Score: ${lastScore}`, boardWidth / 2, boardHeight / 2 + 20);

    // Instructions
    context.fillStyle = "yellow";
    context.font = "20px courier";
    context.fillText("Appuyez sur ESPACE pour continuer", boardWidth / 2, boardHeight / 2 + 80);

    context.textAlign = "left";
}

/**
 * Dessine l'écran de saisie du nom du joueur.
 */
function drawNameEntryScreen(): void {
    // Arrière-plan semi-transparent
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fillRect(0, 0, boardWidth, boardHeight);

    // Cadre blanc pour la saisie
    context.fillStyle = "white";
    context.fillRect(boardWidth / 2 - 350, boardHeight / 2 - 100, 700, 200);

    // Bordure noire
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeRect(boardWidth / 2 - 350, boardHeight / 2 - 100, 700, 200);

    // Titre
    context.fillStyle = "black";
    context.font = "bold 28px courier";
    context.textAlign = "center";
    context.fillText("Enregistrer votre nom", boardWidth / 2, boardHeight / 2 - 50);

    // Champ de saisie
    context.fillStyle = "lightgray";
    context.fillRect(boardWidth / 2 - 250, boardHeight / 2 - 10, 500, 50);
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.strokeRect(boardWidth / 2 - 250, boardHeight / 2 - 10, 500, 50);

    // Texte saisi
    context.fillStyle = "black";
    context.font = "24px courier";
    context.textAlign = "left";
    context.fillText(playerNameInput, boardWidth / 2 - 240, boardHeight / 2 + 25);

    // Instructions
    context.fillStyle = "darkblue";
    context.font = "16px courier";
    context.textAlign = "center";
    context.fillText("Tapez votre nom et appuyez sur ENTRÉE", boardWidth / 2, boardHeight / 2 + 100);

    context.textAlign = "left";
}

/**
 * Dessine l'écran des scores sur le canvas.
 */
function drawScoresScreen(): void {
    // Arrière-plan semi-transparent
    context.fillStyle = "rgba(255, 255, 255, 0.98)";
    context.fillRect(boardWidth / 2 - 350, boardHeight / 2 - 180, 700, 380);

    // Bordure
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeRect(boardWidth / 2 - 350, boardHeight / 2 - 180, 700, 380);

    // Titre
    context.fillStyle = "black";
    context.font = "bold 32px courier";
    context.textAlign = "center";
    context.fillText("🏆 Meilleurs Scores", boardWidth / 2, boardHeight / 2 - 140);

    // Votre score actuel (en surbrillance jaune)
    context.fillStyle = "yellow";
    context.fillRect(boardWidth / 2 - 320, boardHeight / 2 - 100, 640, 50);
    context.strokeStyle = "gold";
    context.lineWidth = 2;
    context.strokeRect(boardWidth / 2 - 320, boardHeight / 2 - 100, 640, 50);
    
    context.fillStyle = "black";
    context.font = "bold 22px courier";
    context.fillText(`📊 Votre score: ${lastScore} | Joueur: ${currentPlayerName}`, boardWidth / 2, boardHeight / 2 - 65);

    // Ligne séparatrice
    context.strokeStyle = "gray";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(boardWidth / 2 - 320, boardHeight / 2 - 40);
    context.lineTo(boardWidth / 2 + 320, boardHeight / 2 - 40);
    context.stroke();

    // Titre top 3
    context.fillStyle = "darkblue";
    context.font = "bold 20px courier";
    context.fillText("Top 3 de tous les jeux:", boardWidth / 2, boardHeight / 2 + 5);

    // Afficher les top 3 scores
    context.font = "18px courier";
    topScoresToDisplay = getTopScores();
    if (topScoresToDisplay.length === 0) {
        context.fillStyle = "gray";
        context.fillText("Pas encore de scores enregistrés", boardWidth / 2, boardHeight / 2 + 45);
    } else {
        topScoresToDisplay.forEach((entry: PlayerScore, index: number) => {
            const yPos: number = boardHeight / 2 + 35 + (index + 1) * 35;
            
            // Mettre en évidence le score actuel
            if (entry.name === currentPlayerName && entry.score === lastScore) {
                context.fillStyle = "lightblue";
                context.fillRect(boardWidth / 2 - 280, yPos - 20, 560, 28);
            }
            
            // Médailles pour les 3 premiers
            let medal = "";
            if (index === 0) medal = "🥇";
            else if (index === 1) medal = "🥈";
            else if (index === 2) medal = "🥉";
            
            context.fillStyle = "black";
            context.fillText(`${medal} ${index + 1}. ${entry.name}: ${entry.score}`, boardWidth / 2 - 100, yPos);
        });
    }

    // Instructions
    context.font = "16px courier";
    context.fillStyle = "darkblue";
    context.textAlign = "center";
    context.fillText("Appuyez sur ESPACE pour recommencer une nouvelle partie", boardWidth / 2, boardHeight / 2 + 170);

    context.textAlign = "left";
}