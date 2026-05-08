// ==============================
// son.js — Sons du jeu Dinosaure
// Auteur : Serena Meli Dountio
// ==============================

// Les 3 sons
let musicJeu     = new Audio("sounds/musique.m4a");
let sonDebut     = new Audio("sounds/start.m4a");
let sonGameOver  = new Audio("sounds/gameover.wav");

// Musique en boucle pendant le jeu
musicJeu.loop = true;
musicJeu.volume = 0.5;

// Son de saut (généré sans fichier)
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function sonSaut() {
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

// Son score (généré sans fichier)
function sonScore() {
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(900, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}
