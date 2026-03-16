import * as fct from "/src/js/fonctions.js";

export default class niveau1 extends Phaser.Scene {
  constructor() {
    super({ key: "niveau1" });
  }
  
  preload() {
    this.load.image("img_item", "src/assets/star.png"); 
    
    // -- PRÉPARATION POUR TILED --
    // L'image qui contient tous les blocs de tes copains
    this.load.image("img_tileset", "src/assets/tileset.png"); 
    // Les 4 fichiers JSON exportés depuis Tiled (noms temporaires)
    this.load.tilemapTiledJSON("map1", "src/assets/map1.json");
    this.load.tilemapTiledJSON("map2", "src/assets/map2.json");
    this.load.tilemapTiledJSON("map3", "src/assets/map3.json");
    this.load.tilemapTiledJSON("map4", "src/assets/map4.json");
    this.load.image("img_piece", "src/assets/coin.png"); // Mets le bon nom de fichier
    this.load.image("img_missile", "src/assets/missile.png"); // Remplace par ton nom de fichier
  }
  
  create() {
    // --- 1. LE FOND (En premier pour qu'il soit tout derrière) ---
    this.ciel = this.add.tileSprite(400, 300, 800, 600, "img_ciel");
    this.ciel.setScrollFactor(0);
    
    // --- 2. LE JOUEUR (Doit être créé avant les maps pour les collisions) ---
    this.player = this.physics.add.sprite(100, 450, "img_perso");
    this.player.setCollideWorldBounds(false); 
    
    // --- 3. SYSTÈME DE CHUNKS (Remplace ton ancienne plateforme géante) ---
    this.listeMaps = ["map1", "map2", "map3", "map4"]; // Les noms temporaires de tes maps
    this.prochainX = 0; // Le point de départ du premier bloc
    // On crée un tableau vide qui va mémoriser les morceaux de carte affichés à l'écran
    this.chunksActifs = [];
    // On génère 2 morceaux d'avance pour que le joueur ait un sol en commençant
    // (Assure-toi d'avoir bien mis la fonction ajouterChunk() plus bas dans ton code !)
    this.ajouterChunk();
    
    // --- 4. LES CONTRÔLES ---
    this.clavier = this.input.keyboard.createCursorKeys();
    
    // --- 5. LA CAMÉRA ---
    this.cameras.main.startFollow(this.player);
    
    // --- 6. VARIABLES DE GRAVITÉ ---
    this.isGravityInverted = false; 
    this.puissanceJetpack = -250;
    
    // --- 7. L'ITEM D'INVERSION ---
    // (Pour l'instant on le laisse à x=800 pour que tu puisses le tester vite au démarrage)
    this.itemInversion = this.physics.add.sprite(800, 300, "img_porte1"); 
    this.itemInversion.body.allowGravity = false;
    this.physics.add.overlap(this.player, this.itemInversion, this.inverserGravite, null, this);

    // --- LES SCORES ET L'INTERFACE (UI) ---
    this.scorePieces = 0;
    this.scoreDistance = 0;

    // On crée les textes en haut à gauche. 
    // setScrollFactor(0) est MAGIQUE : le texte va suivre la caméra !
    this.textePieces = this.add.text(16, 16, "Pièces : 0", { fontSize: '24px', fill: '#FFD700' }).setScrollFactor(0);
    this.texteDistance = this.add.text(16, 50, "Distance : 0 m", { fontSize: '24px', fill: '#FFFFFF' }).setScrollFactor(0);

    // --- LE GROUPE DE PIÈCES ---
    // On crée un groupe physique sans gravité pour que les pièces flottent
    this.groupePieces = this.physics.add.group({
        allowGravity: false
    });

    // On dit à Phaser : "Si le joueur touche une pièce du groupe, lance la fonction collecterPiece"
    this.physics.add.overlap(this.player, this.groupePieces, this.collecterPiece, null, this);

    // --- DICTIONNAIRE DES MOTIFS DE PIÈCES ---
    this.motifsPieces = [
        // Motif 1 : Le Bloc (comme sur la droite de ton image)
        [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ],
        
        // Motif 2 : La Flèche vers la droite (comme sur la gauche de ton image)
        [
            [0, 0, 0, 1, 0],
            [0, 0, 1, 1, 0],
            [1, 1, 1, 1, 1],
            [0, 0, 1, 1, 0],
            [0, 0, 0, 1, 0]
        ],

        // Motif 3 : Le Cœur
        [
            [0, 1, 0, 1, 0],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0]
        ]
    ];
    // --- LE GROUPE DE MISSILES ---
    this.groupeMissiles = this.physics.add.group({
        allowGravity: false // Les missiles volent tout droit
    });

    // Collision : Si le joueur touche un missile, c'est le Game Over !
    this.physics.add.overlap(this.player, this.groupeMissiles, this.toucherMissile, null, this);

    // --- LE DÉCLENCHEUR D'ATTAQUE ---
    // On crée un événement qui se répète en boucle (loop: true)
    // Ici, il lance la fonction preparerMissile toutes les 4 secondes (4000 ms)
    this.time.addEvent({
        delay: 10000,
        callback: this.preparerMissile,
        callbackScope: this,
        loop: true
    });
  }
  
  update() {
    // 1. Course automatique et animation du ciel
    this.player.setVelocityX(200); 
    this.ciel.tilePositionX = this.cameras.main.scrollX * 0.3;

    // 2. Gestion du Jetpack (Gravité normale ou inversée)
    if (this.clavier.up.isDown) {
      if (this.isGravityInverted === false) {
        this.player.setVelocityY(this.puissanceJetpack); 
      } else {
        this.player.setVelocityY(-this.puissanceJetpack); 
      }
    }

    // 3. Génération infinie (Création devant)
    // Si le bord du dernier chunk est à moins de 800 pixels devant nous, on en crée un nouveau
    if (this.prochainX < this.player.x + 800) {
        this.ajouterChunk();
    }

    // --- 4. LE NETTOYAGE (Destruction derrière) ---
    // Nettoyage des cartes (Chunks)
    if (this.chunksActifs.length > 0) {
        let plusVieuxChunk = this.chunksActifs[0];

        if (plusVieuxChunk.finX < this.player.x - 800) {
            plusVieuxChunk.calqueVisuel.destroy();
            plusVieuxChunk.mapData.destroy();
            this.chunksActifs.shift(); 
            console.log("Un vieux morceau de carte a été détruit !");
        }
    }
    
    // Nettoyage des pièces ratées (Nouveau !)
    // On parcourt toutes les pièces qui existent encore sur la carte
    this.groupePieces.getChildren().forEach(piece => {
        // Si la pièce est à plus de 800 pixels derrière le joueur...
        if (piece.x < this.player.x - 800) {
            piece.destroy(); // On la supprime pour libérer de la mémoire
        }
    });

    // Nettoyage des missiles ratés
    this.groupeMissiles.getChildren().forEach(missile => {
        // Si le missile sort de l'écran par la gauche
        if (missile.x < this.cameras.main.scrollX - 100) {
            missile.destroy();
        }
    });

    // --- 5. CALCUL DE LA DISTANCE ---
    // Math.floor permet d'arrondir à l'entier inférieur (pas de virgules)
    this.scoreDistance = Math.floor((this.player.x - 100) / 100);
    this.texteDistance.setText("Distance : " + this.scoreDistance + " m");
  }
  
  // --- 6. LA FONCTION D'INVERSION ---
  inverserGravite(player, item) {
    item.disableBody(true, true);
    this.isGravityInverted = true;
    this.player.setFlipY(true);
    this.player.setGravityY(-600);
    
    this.time.delayedCall(5000, () => {
      this.isGravityInverted = false;
      this.player.setFlipY(false);
      this.player.setGravityY(0);
      console.log("Fin de l'inversion : retour à la normale !");
    }, [], this);
  }
  ajouterChunk() {
    let mapAleatoire = Phaser.Math.RND.pick(this.listeMaps);
    let map = this.make.tilemap({ key: mapAleatoire });
    let tileset = map.addTilesetImage("nom_du_tileset_dans_tiled", "img_tileset");
    let calqueSol = map.createLayer("nom_du_calque", tileset, this.prochainX, 0);

    calqueSol.setCollisionByExclusion(-1, true);
    this.physics.add.collider(this.player, calqueSol);

    // --- NOUVEAU : ON MÉMORISE LE MORCEAU ---
    // On l'ajoute dans notre tableau pour pouvoir le détruire plus tard
    this.chunksActifs.push({
        mapData: map,          // Les données de la carte
        calqueVisuel: calqueSol, // L'image affichée à l'écran
        finX: this.prochainX + map.widthInPixels // L'endroit précis où se termine ce morceau
    });

    this.prochainX += map.widthInPixels; 
    
    
    // On crée une petite ligne de 3 pièces d'affilée pour que ce soit satisfaisant à ramasser
    // --- APPARITION DU MOTIF DE PIÈCES ---
    // On tire au sort une hauteur. 
    // Attention : On limite un peu la hauteur max (400 au lieu de 500) 
    // pour éviter que le bas d'un grand motif (comme le bloc) ne rentre dans le sol !
    let hauteurAleatoire = Phaser.Math.Between(100, 400);
    
    // On appelle notre fonction en plaçant le motif vers le milieu du nouveau chunk
    this.genererMotifPieces(this.prochainX + 300, hauteurAleatoire);
  }
  collecterPiece(player, piece) {
    // 1. On fait disparaître la pièce
    piece.disableBody(true, true);
    
    // 2. On augmente le score
    this.scorePieces += 1;
    
    // 3. On met à jour le texte à l'écran
    this.textePieces.setText("Pièces : " + this.scorePieces);
  }

  genererMotifPieces(xBase, yBase) {
    // 1. On choisit un motif au hasard dans notre liste
    let motifChoisi = Phaser.Math.RND.pick(this.motifsPieces);
    
    // 2. On définit l'écart en pixels entre chaque pièce
    let espacement = 35; 

    // 3. On lit la grille ligne par ligne, et colonne par colonne
    for (let ligne = 0; ligne < motifChoisi.length; ligne++) {
        for (let col = 0; col < motifChoisi[ligne].length; col++) {
            
            // Si la case contient un "1", on crée une pièce à cet endroit
            if (motifChoisi[ligne][col] === 1) {
                
                // On calcule la position exacte
                let posX = xBase + (col * espacement);
                let posY = yBase + (ligne * espacement);
                
                // On ajoute la pièce au groupe
                this.groupePieces.create(posX, posY, "img_piece");
            }
        }
    }
  }
  
  preparerMissile() {
    // On cible la hauteur actuelle du joueur
    let cibleY = this.player.y;
    
    // Le missile apparaît juste en dehors de l'écran, à droite.
    // this.cameras.main.scrollX nous donne la position gauche de la caméra
    // On ajoute 800 (largeur de l'écran) + 50 pour qu'il apparaisse hors-champ
    let spawnX = this.cameras.main.scrollX + 850;

    // On crée le missile
    let missile = this.groupeMissiles.create(spawnX, cibleY, "img_missile");
    
    // On lui donne une vitesse vers la gauche (négative)
    // Comme ton joueur avance à 200 vers la droite, si le missile va à -300 vers la gauche,
    // il va se rapprocher très vite !
    missile.setVelocityX(-300);
  }

  toucherMissile(player, missile) {
    // 1. On met le jeu en pause (arrête la physique)
    this.physics.pause();
    
    // 2. On colore le joueur en rouge pour montrer qu'il a pris un coup
    this.player.setTint(0xff0000);
    
    // 3. On arrête l'animation du joueur
    this.player.anims.stop();
    
    console.log("BOUM ! Game Over. Distance : " + this.scoreDistance + " m");
    
    // (Plus tard, on pourra rajouter ici le code pour relancer le niveau ou afficher un menu)
  }
}