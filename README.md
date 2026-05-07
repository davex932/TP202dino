# Documentation du Jeu Chrome Dino (Clone) - dino.js

Ce document explique en détail le fonctionnement du code JavaScript du jeu de dinosaure contenu dans le fichier `dino.js`.

## Sommaire
1. [Configuration et Variables Globales](#1-configuration-et-variables-globales)
2. [Initialisation (window.onload)](#2-initialisation-windowonload)
3. [La Boucle de Jeu (update)](#3-la-boucle-de-jeu-update)
4. [Gestion du Dinosaure et des Sauts](#4-gestion-du-dinosaure-et-des-sauts)
5. [Système d'Obstacles (Cactus et Oiseaux)](#5-système-dobstacles-cactus-et-oiseaux)
6. [Collisions et Fin de Jeu](#6-collisions-et-fin-de-jeu)

---

## 1. Configuration et Variables Globales

Le code commence par définir les constantes et les variables d'état du jeu :

- **Le Canvas (Board)** : Définit la taille de la zone de jeu (`1000x350`).
- **Le Dinosaure** : Contient ses dimensions, sa position initiale et les objets `Image` pour ses animations (course et mort).
- **Obstacles** : Des arrays et des variables stockent les images et les dimensions des différents types de cactus (petits et grands) et des oiseaux.
- **Physique** :
    - `velocityX` : Vitesse de défilement vers la gauche (-8).
    - `velocityY` : Vitesse verticale actuelle du dinosaure.
    - `gravity` : Force qui ramène le dinosaure au sol (0.4).
- **État du Jeu** : `gameOver` (booléen) et `score` (entier).

---

## 2. Initialisation (window.onload)

Cette fonction s'exécute dès que la page est chargée :

- Elle récupère l'élément Canvas HTML et prépare le contexte de dessin `2d`.
- Elle crée et définit la source (`src`) de toutes les images nécessaires (Dino, Cactus, Oiseaux, Game Over, Reset).
- Elle lance la boucle de jeu avec `requestAnimationFrame(update)`.
- Elle configure un intervalle (`setInterval`) pour générer un nouvel obstacle toutes les 1.5 secondes.
- Elle ajoute les "listeners" pour le clavier (saut) et la souris (clic sur le bouton reset).

---

## 3. La Boucle de Jeu (update)

C'est le cœur du jeu. Elle s'exécute environ 60 fois par seconde.

1. **Nettoyage** : Efface le canvas précédent avec `clearRect`.
2. **Gravité** : Applique la gravité à `velocityY` et met à jour la position `y` du dinosaure.
3. **Animation du Dino** : 
    - Si le dino est en l'air, il affiche l'image fixe.
    - S'il est au sol, il alterne entre `dino-run1` et `dino-run2` en fonction du score pour simuler la course.
4. **Gestion des Obstacles** : Parcourt le tableau `cactusArray`, déplace chaque obstacle et le dessine.
5. **Score** : Incrémente le score et l'affiche en haut à gauche.

---

## 4. Gestion du Dinosaure et des Sauts

- **`moveDino(e)`** : Détecte l'appui sur "Espace" ou "Flèche Haut". Si le dino est au sol (`dino.y == dinoY`), on lui donne une impulsion négative (`velocityY = -12`).
- **Saut Variable (`stopJump`)** : Si le joueur relâche la touche avant la fin du saut, la vitesse ascensionnelle est réduite. Cela permet de faire des petits sauts en tapotant ou des grands sauts en maintenant la touche.
- **`resetGame()`** : Remet toutes les variables à zéro pour recommencer une partie.

---

## 5. Système d'Obstacles (Cactus et Oiseaux)

La fonction `placeCactus()` utilise le hasard (`Math.random()`) pour choisir quel type d'obstacle ajouter :

- **Cactus** : Choisit entre 3 tailles de petits cactus et 3 tailles de grands cactus.
- **Oiseaux** : Apparaissent à deux hauteurs différentes (nécessitant soit un saut, soit de rester au sol). Ils possèdent une animation de battement d'ailes intégrée dans la boucle `update`.

---

## 6. Collisions et Fin de Jeu

- **`detectCollision(a, b)`** : Algorithme classique "AABB" qui vérifie si les rectangles du dinosaure et d'un obstacle se chevauchent.
- **Game Over** : Si une collision est détectée :
    - `gameOver` devient `true`.
    - L'image du dinosaure change pour la version "mort".
    - Le texte "GAME OVER" et l'icône de réinitialisation sont dessinés au centre du canvas.
