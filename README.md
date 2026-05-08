# 🦖 Chrome Dinosaur Game - Projet TP 202

Ce projet est une version améliorée du célèbre jeu du dinosaure de Chrome, intégrant un système de météo dynamique en temps réel, des effets sonores et des mécaniques de jeu avancées (saut, baisse).

## 🚀 Comment lancer le jeu

Pour profiter pleinement du jeu (notamment pour les sons et les images qui peuvent être bloqués en ouverture directe de fichier), il est recommandé d'utiliser un serveur local.

### Via Terminal (Recommandé)
Si vous avez Node.js installé, lancez cette commande à la racine du projet :
```powershell
npx http-server -p 8080
```
Puis ouvrez votre navigateur à l'adresse : `http://localhost:8080`

### Via Explorateur
Faites un clic droit sur `index.html` > **Ouvrir avec** > **Votre navigateur**.

---

## 📂 Structure du Projet

*   `index.html` : Structure de base, canvas du jeu et contrôles météo.
*   `dino.js` : Cerveau du jeu (logique, physique, météo, boucle de rendu).
*   `son.js` : Gestionnaire audio (musique, sons de saut, game over).
*   `dino.css` : Style visuel de la page et des boutons.
*   `img/` : Dossier contenant tous les sprites (Dino, cactus, oiseaux, soleil, pluie).
*   `sounds/` : Fichiers audio (.m4a, .wav).

---

## 🛠️ Détails du Code

### 1. `index.html` (La Structure)
Le fichier définit un élément `<canvas id="board">` où tout le jeu est dessiné. Il inclut également une section `.weather-controls` qui contient les boutons pour forcer manuellement les thèmes météo.
*   **Scripts** : Les fichiers `son.js` et `dino.js` sont chargés avec l'attribut `defer` pour s'assurer que le HTML est prêt avant l'exécution du code.

### 2. `dino.js` (La Logique)
C'est le fichier le plus complexe. Voici ses composants clés :
*   **Boucle `update()`** : Utilise `requestAnimationFrame` pour s'exécuter 60 fois par seconde. Elle gère la gravité, le déplacement des obstacles et la détection de collisions.
*   **Système de Météo Dynamique** :
    *   `getLocation()` & `fetchWeather()` : Récupèrent la position GPS de l'utilisateur et interrogent l'API *Open-Meteo* pour connaître le temps qu'il fait.
    *   `updateTheme()` : Change la couleur du ciel et du sol selon l'heure (Jour/Nuit) ou la météo (Pluie/Orage).
*   **Animation du Dinosaure** : Alterne entre `dino-run1.png` et `dino-run2.png` toutes les 10 frames pour simuler la course.
*   **Obstacles (`placeCactus`)** : Génère aléatoirement des petits cactus, des grands cactus ou des oiseaux à différentes hauteurs.

### 3. `son.js` (L'Audio)
Gère l'ambiance sonore :
*   **AudioContext** : Utilisé pour générer des sons synthétiques (comme le bip du score ou le saut) sans avoir besoin de fichiers lourds.
*   **Musique de fond** : Un fichier audio chargé et mis en boucle via `musicJeu.loop = true`.
*   **Gestion des restrictions** : Comme les navigateurs bloquent le son automatique, une fonction `audioCtx.resume()` est appelée dès la première interaction de l'utilisateur.

---

## 🎮 Commandes de Jeu

*   **ESPACE / FLÈCHE HAUT** : Sauter.
*   **FLÈCHE BAS** : Se baisser (Ducking) pour passer sous les oiseaux de niveau moyen.
    *   *Note : Maintenez la touche pour rester baissé.*
*   **CLIC SUR LE BOUTON RESET** : Recommencer après un Game Over.

---

## ✨ Fonctionnalités Premium
*   **Mode Nuit** : Affichage d'une lune et d'étoiles animées qui défilent avec le score.
*   **Météo Réelle** : Si vous autorisez la géolocalisation, le ciel du jeu s'adaptera à la météo actuelle de votre ville !
*   **Animations Fluides** : Transition de saut parabolique et animation de course synchronisée.

---
**Auteur** : Projet réalisé dans le cadre du TP 202.
