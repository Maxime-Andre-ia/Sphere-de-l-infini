========================================
  JETPACK RUNNER
  Informations du projet
========================================
 
--- DESCRIPTION DU JEU ---
 
On a développé le jeu Jetpack Runner ,un jeu de type "endless runner" développé avec le framework
Phaser 3 en JavaScript. Le joueur avance automatiquement dans un monde généré
aléatoirement et doit survivre le plus longtemps possible en évitant les obstacles
mortels et les missiles, tout en collectant des pièces.
 
 
--- ÉQUIPE DE DÉVELOPPEMENT ---
 
Projet réalisé en groupe de 4 étudiants :
  - Quentin   (design map)
  - Maxime   (code)
  - Mathis    (design map)
  - Mathieu  (code)
 
 
--- LANCEMENT DU JEU ---
 
Prérequis :
  - Visual Studio Code installé
  - Extension "Live Server" installée dans VSCode
 
Étapes pour lancer le jeu :
  1. Ouvrir le dossier du projet dans Visual Studio Code
  2. Ouvrir le fichier niveau1.js
  3. Cliquer sur "Go Live" en bas à droite de VSCode
  4. Le jeu s'ouvre automatiquement dans le navigateur par défaut
 
Important : J'ai pu observer que le jeu ne fonctionne pas en ouvrant 
            directement index.html
            dans le navigateur (double-clic), car Phaser nécessite un serveur HTTP
            local pour charger les assets (images, sons, tilemaps).
 
 
--- CONTRÔLES ---
 
  Touche HAUT (flèche)  →  Activer le jetpack (monter)
  Relâcher la touche    →  Désactiver le jetpack (retomber)
 
 
--- MÉCANIQUES DE JEU ---
 
  - Le joueur avance automatiquement, de plus en plus vite avec la distance
  - Des missiles sont tirés toutes les 10 secondes depuis la droite de l'écran
  - Un item d'inversion de gravité peut être collecté (effet de 5 secondes)
  - Des pièces sont disposées dans les niveaux à collecter
  - Le contact avec un obstacle mortel ou un missile = Game Over
 
 
--- STRUCTURE DU PROJET ---
 
  index.html          →  Point d'entrée du jeu
  src/                →  Code source JavaScript (scènes Phaser)
  assets/             →  Images, sons et tilemaps du jeu
    images/           →  Sprites et tilesets
    sounds/           →  Effets sonores
    tilemaps/         →  Fichiers de maps Tiled (.json)
 
 
--- MAPS DISPONIBLES ---
 
Le monde est généré aléatoirement en enchaînant 4 maps distinctes :
  - map_quentin     →  Ambiance laser / sci-fi
  - map_hassoul     →  Ambiance donjon
  - map_mathis      →  Ambiance industrielle (nombreux tilesets)
  - map_ahhh        →  Ambiance décalée / humoristique
 
Chaque map possède ses propres tilesets, calques visuels et zones mortelles.
 
 
--- CONDITIONS DE DÉVELOPPEMENT ---
 
  - Développé avec Phaser 3 (framework JavaScript de jeu 2D)
  - Maps créées avec l'éditeur Tiled Map Editor
  - Aucune dépendance externe autre que Phaser 3
  - Testé sur Google Chrome et Firefox
 
=======================================
