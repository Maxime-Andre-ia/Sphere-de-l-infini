// 1. On importe TOUTES nos scènes
import selection from "./js/selection.js";
import niveau1 from "./js/niveau1.js";
import niveau2 from "./js/niveau2.js";
import niveau3 from "./js/niveau3.js";
import GameOver from "./js/gameOver.js";

// 2. On configure le jeu
var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true 
    }
  },
  // 3. On déclare nos 4 scènes dans l'ordre (la première de la liste est celle qui se lance au démarrage)
  scene: [ niveau1, niveau2, niveau3, GameOver] 
};

// 4. On lance le jeu
new Phaser.Game(config);