// Sons du jeu Dinosaure - Serena Meli Dountio

let musicJeu    = new Audio("sounds/musique.m4a");
let sonDebut    = new Audio("sounds/start.m4a");
let sonGameOver = new Audio("sounds/gameover.wav");

musicJeu.loop   = true;
musicJeu.volume = 0.5;

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function sonSaut() {
    let osc  = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

function sonScorePoint() {
    let osc  = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 900;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}
