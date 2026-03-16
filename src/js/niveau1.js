import * as fct from "/src/js/fonctions.js";

export default class niveau1 extends Phaser.Scene {
  constructor() {
    super({ key: "niveau1" });
  }
  
  preload() {
    // --- CHARGEMENT DES ASSETS CLASSIQUES ---
    this.load.image("img_item", "src/assets/star.png"); // L'item pour inverser la gravité
    this.load.image("img_piece", "src/assets/coin.png"); // L'image d'une seule pièce
    this.load.image("img_alerte", "src/assets/warning.png"); // Le panneau d'alerte du missile
    
    // --- CHARGEMENT DU MISSILE ANIMÉ (Spritesheet) ---
    // Au lieu d'une simple image, on découpe l'image du missile pour pouvoir l'animer.
    // ATTENTION : Pense bien à remplacer 32 et 16 par la vraie taille (largeur et hauteur)
    // d'un seul de tes missiles sur ton image "missile.png" !
    this.load.spritesheet("img_missile", "src/assets/missile.png", { 
        frameWidth: 32, 
        frameHeight: 16 
    });

    // --- PRÉPARATION POUR TILED (La map de tes copains) ---
    // 1. L'image qui contient tous les blocs de tes copains (le "tileset")
    this.load.image("img_tileset", "src/assets/tileset.png"); 
    
    // 2. Les fichiers JSON exportés depuis Tiled (noms temporaires, à changer quand tu les auras)
    this.load.tilemapTiledJSON("map1", "src/assets/map1.json");
    this.load.tilemapTiledJSON("map2", "src/assets/map2.json");
    this.load.tilemapTiledJSON("map3", "src/assets/map3.json");
    this.load.tilemapTiledJSON("map4", "src/assets/map4.json");
  }
  
  create() {
    // --- 1. LE FOND INFINI ---
    // On crée un TileSprite de la taille de l'écran (800x600) qu'on place en tout premier 
    // pour qu'il soit derrière tout le reste.
    this.ciel = this.add.tileSprite(400, 300, 800, 600, "img_ciel");
    
    // TRÈS IMPORTANT : setScrollFactor(0) "colle" le ciel à la caméra. 
    // Le rectangle du ciel ne bouge pas quand le joueur avance, c'est la texture à l'intérieur qui défilera.
    this.ciel.setScrollFactor(0);
    
    // --- 2. LE JOUEUR ---
    // On crée le joueur avant les maps pour que les collisions puissent s'appliquer correctement.
    this.player = this.physics.add.sprite(100, 450, "img_perso");
    
    // On enlève les limites du monde (sinon il va taper le bord droit de l'écran et s'arrêter !)
    this.player.setCollideWorldBounds(false); 
    
    // --- 3. DICTIONNAIRE DES MOTIFS DE PIÈCES ---
    // On utilise des grilles (matrices) avec des 0 et des 1 (0 = vide, 1 = pièce)
    this.motifsPieces = [
        [ // Motif 1 : Le Bloc (comme sur la droite de ton image)
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ],
        [ // Motif 2 : La Flèche vers la droite (comme sur la gauche de ton image)
            [0, 0, 0, 1, 0],
            [0, 0, 1, 1, 0],
            [1, 1, 1, 1, 1],
            [0, 0, 1, 1, 0],
            [0, 0, 0, 1, 0]
        ],
        [ // Motif 3 : Le Cœur
            [0, 1, 0, 1, 0],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0]
        ]
    ];

    // --- 4. GROUPES PHYSIQUES (Pièces et Missiles) ---
    // Groupe pour les pièces (allowGravity: false pour qu'elles flottent en l'air)
    this.groupePieces = this.physics.add.group({ allowGravity: false });
    // Si le joueur touche une pièce, on lance la fonction collecterPiece
    this.physics.add.overlap(this.player, this.groupePieces, this.collecterPiece, null, this);

    // Groupe pour les missiles (ils volent tout droit, donc pas de gravité)
    this.groupeMissiles = this.physics.add.group({ allowGravity: false });
    // Si le joueur touche un missile, c'est le Game Over !
    this.physics.add.overlap(this.player, this.groupeMissiles, this.toucherMissile, null, this);

    // --- 5. SYSTÈME DE CHUNKS (Génération aléatoire infinie) ---
    this.listeMaps = ["map1", "map2", "map3", "map4"]; // Les noms des fichiers chargés dans le preload
    this.prochainX = 0; // Le point de départ (en X) du tout premier bloc de la map
    
    // On crée un tableau vide qui va mémoriser les morceaux de carte affichés à l'écran pour pouvoir les détruire
    this.chunksActifs = [];
    
    // On génère 2 morceaux d'avance pour que le joueur ait un sol en commençant
    this.ajouterChunk();
    this.ajouterChunk();
    
    // --- 6. LES CONTRÔLES ET LA CAMÉRA ---
    this.clavier = this.input.keyboard.createCursorKeys();
    
    // La caméra va suivre automatiquement ton joueur dans sa course vers la droite
    this.cameras.main.startFollow(this.player);
    
    // --- 7. LA GRAVITÉ ET L'ITEM D'INVERSION ---
    this.isGravityInverted = false; // Par défaut, la gravité est normale
    this.puissanceJetpack = -250;   // Force vers le haut quand on appuie sur la flèche (ou espace)
    
    // L'item flotte en l'air à x=800 pour tester l'inversion de gravité au début du niveau
    this.itemInversion = this.physics.add.sprite(800, 300, "img_porte1"); 
    this.itemInversion.body.allowGravity = false;
    this.physics.add.overlap(this.player, this.itemInversion, this.inverserGravite, null, this);

    // --- 8. LES SCORES ET L'INTERFACE (UI) ---
    this.scorePieces = 0;
    this.scoreDistance = 0;
    
    // On crée les textes en haut à gauche. setScrollFactor(0) est magique : 
    // Le texte va rester collé à l'écran même si la caméra avance !
    this.textePieces = this.add.text(16, 16, "Pièces : 0", { fontSize: '24px', fill: '#FFD700' }).setScrollFactor(0);
    this.texteDistance = this.add.text(16, 50, "Distance : 0 m", { fontSize: '24px', fill: '#FFFFFF' }).setScrollFactor(0);

    // --- 9. ANIMATIONS ---
    // Création de l'animation du missile à partir de la spritesheet
    this.anims.create({
        key: "anim_missile_vole",
        frames: this.anims.generateFrameNumbers("img_missile", { start: 0, end: 3 }),
        frameRate: 15, // Vitesse de clignotement (15 images par seconde)
        repeat: -1     // -1 veut dire que ça tourne en boucle à l'infini
    });

    // --- 10. LE DÉCLENCHEUR D'ATTAQUE DE MISSILES (Timer) ---
    // On crée un événement qui se répète en boucle (loop: true)
    // Ici, il lance la fonction preparerMissile toutes les 10 secondes (10000 ms)
    this.time.addEvent({
        delay: 10000,
        callback: this.preparerMissile,
        callbackScope: this,
        loop: true
    });
  }
  
  update() {
    // --- 1. COURSE AUTOMATIQUE ET CIEL ---
    // À chaque frame, on force le joueur à avancer à 200 pixels/seconde vers la droite
    this.player.setVelocityX(200); 
    
    // L'image du ciel défile en fonction de la position de la caméra.
    // Le " * 0.3 " crée un effet de profondeur (le ciel bouge plus doucement que le joueur)
    this.ciel.tilePositionX = this.cameras.main.scrollX * 0.3;

    // --- 2. GESTION DU JETPACK ---
    if (this.clavier.up.isDown) {
      if (this.isGravityInverted === false) {
        // CAS NORMAL : Le jetpack pousse vers le HAUT (vitesse négative)
        this.player.setVelocityY(this.puissanceJetpack); 
      } else {
        // CAS INVERSÉ : Le jetpack pousse vers le BAS (vitesse positive)
        this.player.setVelocityY(-this.puissanceJetpack); 
      }
    }

    // --- 3. GÉNÉRATION INFINIE ---
    // Si le bord du dernier chunk construit (this.prochainX) est à moins de 800 pixels 
    // devant le joueur, on rajoute vite un nouveau bloc devant lui !
    if (this.prochainX < this.player.x + 800) {
        this.ajouterChunk();
    }

    // --- 4. LE GRAND NETTOYAGE (Pour éviter que le jeu ne rame !) ---
    
    // A) Nettoyage des cartes (Chunks)
    if (this.chunksActifs.length > 0) {
        // On regarde le tout premier chunk de la liste (le plus vieux, tout à gauche)
        let plusVieuxChunk = this.chunksActifs[0];
        
        // Si la fin de ce chunk est passée à 800 pixels DERRIÈRE le joueur...
        if (plusVieuxChunk.finX < this.player.x - 800) {
            // On le détruit dans le jeu
            plusVieuxChunk.calqueVisuel.destroy();
            plusVieuxChunk.mapData.destroy();
            // Puis on le retire définitivement de notre liste mémoire
            this.chunksActifs.shift(); 
        }
    }
    
    // B) Nettoyage des pièces ratées
    // On parcourt toutes les pièces qui existent encore sur la map
    this.groupePieces.getChildren().forEach(piece => {
        // Si la pièce est à plus de 800 pixels derrière le joueur, on la supprime
        if (piece.x < this.player.x - 800) piece.destroy(); 
    });

    // C) Nettoyage des missiles ratés
    this.groupeMissiles.getChildren().forEach(missile => {
        // Si le missile sort de l'écran par la gauche, on le supprime
        if (missile.x < this.cameras.main.scrollX - 100) missile.destroy();
    });

    // --- 5. CALCUL DE LA DISTANCE ---
    // On prend la position X actuelle, on soustrait 100 (le point de départ), 
    // et on divise par 100 pour que 100 pixels = 1 mètre.
    // Math.floor permet d'arrondir à l'entier inférieur (ex: 12.8 devient 12).
    this.scoreDistance = Math.floor((this.player.x - 100) / 100);
    this.texteDistance.setText("Distance : " + this.scoreDistance + " m");
  }
  
  // =========================================================================
  // ========================== VOS FONCTIONNALITÉS ==========================
  // =========================================================================

  inverserGravite(player, item) {
    // 1. On fait disparaître l'item car il a été ramassé
    item.disableBody(true, true);
    
    // 2. On change notre variable d'état pour les contrôles du Jetpack
    this.isGravityInverted = true;
    
    // 3. On retourne visuellement le sprite (il a la tête en bas !)
    this.player.setFlipY(true);
    
    // 4. LE SECRET DE LA PHYSIQUE :
    // La gravité globale du monde est de 300 (vers le bas).
    // On donne au joueur une gravité propre de -600 (vers le haut).
    // Bilan pour le joueur : 300 - 600 = -300. Le joueur tombe vers le plafond !
    this.player.setGravityY(-600);
    
    // 5. LE CHRONOMÈTRE (Timer de 5 secondes)
    this.time.delayedCall(5000, () => {
      // Tout ce qui est ici s'exécutera au bout de 5000 millisecondes
      this.isGravityInverted = false;
      this.player.setFlipY(false); // On remet la tête à l'endroit
      this.player.setGravityY(0);  // Il reprend la gravité globale du monde
    }, [], this);
  }

  
  ajouterChunk() {
    // 1. On choisit une map au hasard dans notre liste
    let mapAleatoire = Phaser.Math.RND.pick(this.listeMaps);
    let map = this.make.tilemap({ key: mapAleatoire });
    
    // 2. On lie l'image du tileset (Demander aux copains le nom exact du tileset dans Tiled !)
    let tileset = map.addTilesetImage("nom_du_tileset_dans_tiled", "img_tileset");
    
    // 3. On crée le calque physique et on le décale à la position "prochainX"
    let calqueSol = map.createLayer("nom_du_calque", tileset, this.prochainX, 0);

    // 4. On active les collisions sur ce calque
    calqueSol.setCollisionByExclusion(-1, true);
    this.physics.add.collider(this.player, calqueSol);

    // 5. On l'ajoute dans notre tableau pour pouvoir le détruire plus tard quand il sera loin derrière
    this.chunksActifs.push({
        mapData: map,          
        calqueVisuel: calqueSol, 
        finX: this.prochainX + map.widthInPixels 
    });

    // 6. APPARITION DU MOTIF DE PIÈCES AU MILIEU DU CHUNK
    // On tire au sort une hauteur entre 100 et 400 (pour éviter de rentrer dans le sol)
    let hauteurAleatoire = Phaser.Math.Between(100, 400);
    // On appelle notre fonction en plaçant le motif à this.prochainX + 300 pixels
    this.genererMotifPieces(this.prochainX + 300, hauteurAleatoire);

    // 7. TRÈS IMPORTANT : On met à jour le point de départ pour le futur bloc
    this.prochainX += map.widthInPixels; 
  }

  genererMotifPieces(xBase, yBase) {
    // 1. On choisit un motif au hasard dans notre dictionnaire (Cœur, flèche...)
    let motifChoisi = Phaser.Math.RND.pick(this.motifsPieces);
    
    // 2. On définit l'écart en pixels entre chaque pièce
    let espacement = 35; 

    // 3. On lit la grille ligne par ligne (Y), et colonne par colonne (X)
    for (let ligne = 0; ligne < motifChoisi.length; ligne++) {
        for (let col = 0; col < motifChoisi[ligne].length; col++) {
            
            // Si la case de la matrice contient un "1", on crée une pièce à cet endroit
            if (motifChoisi[ligne][col] === 1) {
                // On calcule la position finale en fonction de la case
                let posX = xBase + (col * espacement);
                let posY = yBase + (ligne * espacement);
                
                // On l'ajoute physiquement au groupe de pièces
                this.groupePieces.create(posX, posY, "img_piece");
            }
        }
    }
  }

  collecterPiece(player, piece) {
    // On désactive la pièce physiquement et visuellement
    piece.disableBody(true, true);
    
    // On augmente le score et on met à jour le texte
    this.scorePieces += 1;
    this.textePieces.setText("Pièces : " + this.scorePieces);
  }

  preparerMissile() {
    // 1. On cible la hauteur actuelle du joueur (Là où le missile arrivera !)
    let cibleY = this.player.y;
    
    // 2. On crée l'image d'alerte tout à droite de l'écran (X = 750)
    // setScrollFactor(0) permet qu'elle suive le joueur pendant qu'elle clignote
    let alerte = this.add.image(750, cibleY, "img_alerte").setScrollFactor(0);

    // 3. On fait clignoter l'alerte avec un "Tween" (une animation de transition)
    this.tweens.add({
        targets: alerte,
        alpha: 0,          // L'opacité passe de 100% à 0%
        duration: 200,     // En 200 millisecondes
        ease: 'Linear',
        yoyo: true,        // Puis ça revient à 100%
        repeat: 5,         // Ça clignote 5 fois
        onComplete: () => {
            // 4. Une fois le clignotement fini, on détruit l'alerte
            alerte.destroy();
            // Et on lance VRAIMENT le missile à cette même hauteur cibleY !
            this.lancerMissile(cibleY);
        }
    });
  }

  lancerMissile(yPosition) {
    // Le missile apparaît juste en dehors de l'écran, à droite de la caméra
    let spawnX = this.cameras.main.scrollX + 850;
    
    // On crée le missile physiquement
    let missile = this.groupeMissiles.create(spawnX, yPosition, "img_missile");
    
    // On lui donne une grosse vitesse vers la gauche (négative)
    missile.setVelocityX(-400); 
    
    // Et on lance son animation de flammes !
    missile.anims.play("anim_missile_vole", true);
  }

  toucherMissile(player, missile) {
    // 1. On met le jeu en pause (arrête la physique instantanément)
    this.physics.pause();
    
    // 2. On colore le joueur en rouge pour montrer qu'il a pris un coup
    this.player.setTint(0xff0000);
    
    // 3. On arrête l'animation du joueur
    this.player.anims.stop();
    
    // Pour l'instant on se contente de l'afficher dans la console
    console.log("BOUM ! Game Over. Distance : " + this.scoreDistance + " m");
    
    // Plus tard : tu pourras rajouter du code ici pour recharger la scène (this.scene.restart())
    // ou afficher un écran de Game Over.
  }
}