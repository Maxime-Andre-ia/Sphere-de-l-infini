import * as fct from "/src/js/fonctions.js";

export default class niveau1 extends Phaser.Scene {
  constructor() {
    super({ key: "niveau1" });
  }
  
  preload() {
    // =========================================================================
    // 1. CHARGEMENT DES ASSETS (On utilise UNIQUEMENT tes vrais fichiers)
    // =========================================================================
    
    // --- ON REMPLACE LES ANCIENS ASSETS PAR CEUX DE TES POTES ---
    // Comme on n'a plus l'image "dude.png", on utilise le coffre en guise de personnage pour tester !
    this.load.image("img_perso", "src/assets/coffrec.png"); 
    // On remplace le ciel classique par un des décors de ton équipe
    this.load.image("img_ciel", "src/assets/decors2d.png"); 
    
    // Les objets interactifs
    this.load.image("img_item", "src/assets/image_inversiond.png"); // L'item pour inverser la gravité
    this.load.image("img_piece", "src/assets/coind.png"); // L'image d'une pièce à ramasser
    this.load.image("img_alerte", "src/assets/feu_mortelm.png"); // L'alerte avant l'arrivée du missile
    this.load.image("img_missile", "src/assets/laser_mortm.png"); // Le missile (remplacé par un laser)

    // --- LES TILESETS POUR LA MAP (Les briques de construction) ---
    // Ce sont les images qui ont été utilisées dans le logiciel Tiled pour dessiner les niveaux
    this.load.image("img_bout_laser", "src/assets/bout_laserm.png");
    this.load.image("img_level_tileset", "src/assets/level_tileset.png");
    this.load.image("img_laser4", "src/assets/laser4.png");

    // =========================================================================
    // 3. CHARGEMENT DES MAPS JSON DE TES POTES (Les plans de construction)
    // =========================================================================
    this.load.tilemapTiledJSON("map_mathis", "src/assets/map_mathis.json");
    this.load.tilemapTiledJSON("map_quentin", "src/assets/lab1.json");

    // --- SONS --- 
    // Ils feront des erreurs 404 dans la console si tu ne les as pas dans ton dossier, 
    // mais ça ne fait pas planter le jeu !
    this.load.audio("sin_missile", "src/assets/bruitmissile.wav"); 
    this.load.audio("sin_piece", "src/assets/bruitpiece.wav");
  } 
  
  create() {
    // =========================================================================
    // 2. CRÉATION DU MONDE ET DES OBJETS (S'exécute 1 seule fois au début)
    // =========================================================================
    
    // --- 1. LE FOND INFINI ---
    // setScrollFactor(0) "colle" l'image à la caméra pour qu'elle suive le joueur. 
    this.ciel = this.add.tileSprite(400, 300, 800, 600, "img_ciel");
    this.ciel.setScrollFactor(0);
    
    // --- 2. LE JOUEUR ---
    // On crée le joueur (le coffre pour l'instant) avec la physique activée
    this.player = this.physics.add.sprite(100, 450, "img_perso");
    // On enlève les limites du monde (sinon il va taper le bord droit de l'écran et s'arrêter)
    this.player.setCollideWorldBounds(false); 
    
    // --- 3. DICTIONNAIRE DES MOTIFS DE PIÈCES ---
    // On utilise des grilles (matrices) avec des 0 et des 1 (0 = vide, 1 = pièce)
    this.motifsPieces = [
        [ // Motif 1 : Le Bloc rectangulaire
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ]
    ];

    // --- 4. GROUPES PHYSIQUES (Pièces et Missiles) ---
    // Groupe pour les pièces (allowGravity: false pour qu'elles flottent en l'air sans tomber)
    this.groupePieces = this.physics.add.group({ allowGravity: false });
    // Si le joueur touche une pièce, on appelle la fonction collecterPiece
    this.physics.add.overlap(this.player, this.groupePieces, this.collecterPiece, null, this);

    // Groupe pour les missiles
    this.groupeMissiles = this.physics.add.group({ allowGravity: false });
    // Si le joueur touche un missile, on appelle la fonction toucherMissile (Game Over)
    this.physics.add.overlap(this.player, this.groupeMissiles, this.toucherMissile, null, this);

    // --- 5. SYSTÈME DE CHUNKS (Génération aléatoire infinie) ---
    // On force la map de Quentin pour nos tests actuels
    this.listeMaps = ["map_quentin"]; 
    this.prochainX = 0; // Le point de départ (en X) du tout premier bloc de la map
    
    // Tableau qui mémorise les morceaux de carte affichés pour pouvoir les détruire plus tard
    this.chunksActifs = [];
    
    // On génère 2 morceaux d'avance pour que le joueur ait un sol en commençant
    this.ajouterChunk();
    this.ajouterChunk();
    
    // --- 6. LES CONTRÔLES ET LA CAMÉRA ---
    // On active les flèches du clavier
    this.clavier = this.input.keyboard.createCursorKeys();
    // La caméra va suivre notre joueur tout au long du niveau
    this.cameras.main.startFollow(this.player); 
    
    // --- 7. LA GRAVITÉ ET L'ITEM D'INVERSION ---
    this.isGravityInverted = false; // Par défaut, la gravité est normale
    this.puissanceJetpack = -250;   // Force de la poussée du jetpack
    
    // L'item flotte en l'air à x=800 pour tester l'inversion
    this.itemInversion = this.physics.add.sprite(800, 300, "img_item"); 
    this.itemInversion.body.allowGravity = false;
    this.physics.add.overlap(this.player, this.itemInversion, this.inverserGravite, null, this);

    // --- 8. LES SCORES ET L'INTERFACE (UI) ---
    this.scorePieces = 0;
    this.scoreDistance = 0;
    
    // setScrollFactor(0) permet au texte de rester collé à l'écran, comme l'ATH d'un jeu
    this.textePieces = this.add.text(16, 16, "Pièces : 0", { fontSize: '24px', fill: '#FFD700' }).setScrollFactor(0);
    this.texteDistance = this.add.text(16, 50, "Distance : 0 m", { fontSize: '24px', fill: '#FFFFFF' }).setScrollFactor(0);

    // --- 9. TIMERS ET SONS ---
    // Ce timer lance l'attaque de missile toutes les 10 secondes (10000 millisecondes)
    this.time.addEvent({
        delay: 10000,
        callback: this.preparerMissile,
        callbackScope: this,
        loop: true
    });

    // On prépare les sons (sans les jouer tout de suite)
    this.missileSound = this.sound.add("sin_missile", { volume: 0.5 });
    this.pieceSound = this.sound.add("sin_piece", { volume: 0.5 });

    // --- 10. VARIABLE DE FIN DE JEU ---
    // Permet de savoir si on doit bloquer les actions du joueur
    this.isGameOver = false;
  }
  
  update() {
    // =========================================================================
    // 3. BOUCLE DE JEU (S'exécute en boucle, 60 fois par seconde)
    // =========================================================================

    // Si le jeu est fini, on bloque l'exécution de tout ce qui suit avec "return" !
    if (this.isGameOver === true) return; 
    
    // --- 1. COURSE AUTOMATIQUE ET CIEL ---
    // Le joueur avance tout seul à 200 pixels/seconde vers la droite
    this.player.setVelocityX(200); 
    // Effet de profondeur (Parallax) : le ciel défile un peu plus lentement que la caméra
    this.ciel.tilePositionX = this.cameras.main.scrollX * 0.3;

    // --- 2. GESTION DU JETPACK ---
    if (this.clavier.up.isDown) {
      if (this.isGravityInverted === false) {
        // Normal : Le jetpack pousse vers le HAUT (vitesse négative)
        this.player.setVelocityY(this.puissanceJetpack); 
      } else {
        // Inversé : Le jetpack pousse vers le BAS (vitesse positive)
        this.player.setVelocityY(-this.puissanceJetpack); 
      }
    }

    // --- 3. GÉNÉRATION INFINIE ---
    // Si la fin de la route approche (à moins de 800 pixels devant), on rajoute un bout de map
    if (this.prochainX < this.player.x + 800) {
        this.ajouterChunk();
    }

    // --- 4. LE GRAND NETTOYAGE (Optimisation mémoire pour ne pas faire ramer le PC) ---
    
    // A) Nettoyage des anciennes cartes (Chunks)
    if (this.chunksActifs.length > 0) {
        let plusVieuxChunk = this.chunksActifs[0];
        // Si la fin de ce bout de map est passée à 800 pixels DERRIÈRE le joueur...
        if (plusVieuxChunk.finX < this.player.x - 800) {
            // On détruit tous les calques visuels qu'il contenait
            plusVieuxChunk.calquesVisuels.forEach(calque => {
                if(calque) calque.destroy();
            });
            plusVieuxChunk.mapData.destroy(); // On détruit les données
            this.chunksActifs.shift(); // On le retire de notre liste
        }
    }
    
    // B) Nettoyage des pièces ratées qui sont sorties de l'écran à gauche
    this.groupePieces.getChildren().forEach(piece => {
        if (piece.x < this.player.x - 800) piece.destroy(); 
    });

    // C) Nettoyage des missiles qui sont sortis de l'écran à gauche
    this.groupeMissiles.getChildren().forEach(missile => {
        if (missile.x < this.cameras.main.scrollX - 100) missile.destroy();
    });

    // --- 5. CALCUL DE LA DISTANCE ---
    // On soustrait 100 (le point de départ), et on divise par 100 (100 px = 1 mètre environ)
    this.scoreDistance = Math.floor((this.player.x - 100) / 100);
    this.texteDistance.setText("Distance : " + this.scoreDistance + " m");
  }

  // =========================================================================
  // 4. VOS FONCTIONNALITÉS PERSONNALISÉES
  // =========================================================================

  inverserGravite(player, item) {
    item.disableBody(true, true); // Fait disparaître l'item
    this.isGravityInverted = true;
    this.player.setFlipY(true); // Met le sprite visuellement la tête en bas
    this.player.setGravityY(-600); // Inverse la physique : le joueur tombe vers le plafond
    
    // Chronomètre de 5 secondes (5000 ms) pour revenir à la normale
    this.time.delayedCall(5000, () => {
      this.isGravityInverted = false;
      this.player.setFlipY(false); // Remet le sprite à l'endroit
      this.player.setGravityY(0);  // Rétablit la gravité normale
    }, [], this);
  }

  ajouterChunk() {
    // 1. On tire au sort une map dans la liste (ici, que celle de Quentin)
    let mapAleatoire = Phaser.Math.RND.pick(this.listeMaps);
    let map = this.make.tilemap({ key: mapAleatoire });
    
    // 2. LIAISON DES IMAGES (Le lien entre le mot de passe Tiled et l'image du preload)
    let ts_leveltileset = map.addTilesetImage("level_tileset", "img_level_tileset");
    let ts_boutlaser = map.addTilesetImage("bout laser", "img_bout_laser");
    let ts_laser4 = map.addTilesetImage("laser4", "img_laser4");

    // On regroupe toutes ces images dans un tableau
    let tousLesTilesets = [ts_leveltileset, ts_boutlaser, ts_laser4];

    // 3. CRÉATION DES CALQUES (En utilisant les noms exacts définis dans Tiled)
    let calqueFond = map.createLayer("Background", tousLesTilesets, this.prochainX, 0);
    let calqueSol = map.createLayer("Obstacle_pas_mortel", tousLesTilesets, this.prochainX, 0);
    let calqueMortel = map.createLayer("Background_mortel", tousLesTilesets, this.prochainX, 0);

    // 4. GESTION DES COLLISIONS
    if(calqueSol) {
        // Active les collisions sur tout ce qui n'est pas "vide" (-1)
        calqueSol.setCollisionByExclusion(-1, true);
        this.physics.add.collider(this.player, calqueSol); // Le joueur se cogne/marche dessus
    }
    
    if(calqueMortel) {
        calqueMortel.setCollisionByExclusion(-1, true);
        // Au lieu de "collider", on utilise "overlap" pour déclencher la fonction Game Over
        this.physics.add.overlap(this.player, calqueMortel, this.toucherMissile, null, this);
    }

    // 5. SAUVEGARDE POUR LE NETTOYAGE
    this.chunksActifs.push({
        mapData: map,          
        calquesVisuels: [calqueFond, calqueSol, calqueMortel], // On garde la trace des 3 calques
        finX: this.prochainX + map.widthInPixels // Le pixel exact où finit ce bout de map
    });

    // 6. APPARITION DES PIÈCES
    // On génère des pièces à une hauteur aléatoire au milieu de ce nouveau chunk
    let hauteurAleatoire = Phaser.Math.Between(100, 400);
    this.genererMotifPieces(this.prochainX + 300, hauteurAleatoire);

    // 7. On avance notre curseur pour savoir où créer le prochain chunk !
    this.prochainX += map.widthInPixels; 
  }

  genererMotifPieces(xBase, yBase) {
    // Choisit un motif de pièces au hasard dans notre dictionnaire (dans le create)
    let motifChoisi = Phaser.Math.RND.pick(this.motifsPieces);
    let espacement = 35; // L'écart entre chaque pièce

    // Lecture de la grille : Ligne par ligne, et Colonne par colonne
    for (let ligne = 0; ligne < motifChoisi.length; ligne++) {
        for (let col = 0; col < motifChoisi[ligne].length; col++) {
            if (motifChoisi[ligne][col] === 1) { // Si on trouve un 1, on crée une pièce
                let posX = xBase + (col * espacement);
                let posY = yBase + (ligne * espacement);
                this.groupePieces.create(posX, posY, "img_piece");
            }
        }
    }
  }

  collecterPiece(player, piece) {
    piece.disableBody(true, true); // Désactive la physique et rend la pièce invisible
    this.scorePieces += 1;
    this.textePieces.setText("Pièces : " + this.scorePieces);
    // this.pieceSound.play(); // Désactivé si tu n'as pas le fichier son
  }

  preparerMissile() {
    let cibleY = this.player.y; // On cible la hauteur actuelle du joueur
    // this.missileSound.play(); // Désactivé si tu n'as pas le fichier son
    
    // Fait apparaître un panneau danger accroché à l'écran (ScrollFactor 0)
    let alerte = this.add.image(750, cibleY, "img_alerte").setScrollFactor(0);

    // Tween = Animation automatique gérée par Phaser
    this.tweens.add({
        targets: alerte,
        alpha: 0,          // Va de l'opacité 1 (visible) à 0 (invisible)
        duration: 200,     // En 0.2 secondes
        ease: 'Linear',
        yoyo: true,        // Et revient à l'état initial (clignotement)
        repeat: 5,         // Répète ça 5 fois
        onComplete: () => {
            alerte.destroy(); // Quand le clignotement est fini, on détruit l'alerte
            this.lancerMissile(cibleY); // Et BOUM, on tire le missile
        }
    });
  }

  lancerMissile(yPosition) {
    // Le missile apparaît juste en dehors de l'écran, à droite de la caméra
    let spawnX = this.cameras.main.scrollX + 850;
    let missile = this.groupeMissiles.create(spawnX, yPosition, "img_missile");
    missile.setVelocityX(-400); // Il fonce vers la gauche !
  }

  toucherMissile(player, obstacle) {
    // 1. On indique que le jeu est fini pour stopper le update()
    this.isGameOver = true;

    // 2. On fige toute la physique du jeu
    this.physics.pause();
    this.player.setTint(0xff0000); // On colorie le joueur en rouge

    // 3. On arrête les événements de temps (fini l'apparition de nouveaux missiles)
    this.time.removeAllEvents();
    
    // 4. On affiche l'écran de fin
    this.afficherGameOver();
  }

  afficherGameOver() {
    // 1. Un fond noir semi-transparent pour assombrir le jeu
    let fondSombre = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setScrollFactor(0);

    // 2. Le gros titre rouge
    this.add.text(400, 150, "GAME OVER", { 
        fontSize: '64px', 
        fill: '#ff0000', 
        fontStyle: 'bold' 
    }).setOrigin(0.5).setScrollFactor(0); 

    // 3. Le récapitulatif des scores
    this.add.text(400, 250, "Distance : " + this.scoreDistance + " m", { 
        fontSize: '32px', 
        fill: '#ffffff' 
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(400, 320, "Pièces : " + this.scorePieces, { 
        fontSize: '32px', 
        fill: '#FFD700' 
    }).setOrigin(0.5).setScrollFactor(0);

    // 4. LE BOUTON REJOUER
    let boutonRejouer = this.add.text(400, 450, " REJOUER ", { 
        fontSize: '40px', 
        fill: '#ffffff', 
        backgroundColor: '#4a4a4a', 
        padding: { x: 20, y: 10 }   
    })
    .setOrigin(0.5)
    .setScrollFactor(0) // Le bouton reste bien collé au milieu de l'écran
    .setInteractive({ useHandCursor: true }); // Transforme la souris en "main" quand on survole

    // Action au clic : redémarre la scène de zéro
    boutonRejouer.on('pointerdown', () => {
        this.scene.restart(); 
    });
  }
}